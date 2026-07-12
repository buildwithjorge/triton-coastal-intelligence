/**
 * Module: apps/api/src/integrations/service.ts
 * Purpose: Orchestrates multi-provider live intelligence pulls and synthesis.
 */

import { severityFromTsi } from "@triton/shared";
import { prisma } from "../lib/prisma";
import { fetchNdbcSnapshot } from "./providers/noaaNdbc";
import { fetchNoaaTideSnapshot } from "./providers/noaaTides";
import { fetchOpenMeteoMarineSnapshot } from "./providers/openMeteoMarine";
import type { LiveBeachIntelligence, MarineSnapshot, ProviderHealth, TideState } from "./types";

const countyTideStation: Record<string, string> = {
  "Palm Beach": "8722670",
  Broward: "8722956",
  "Miami-Dade": "8723214"
};

const countyBuoyStation: Record<string, string> = {
  "Palm Beach": "41113",
  Broward: "41009",
  "Miami-Dade": "FMOF1"
};

type BeachConditions = {
  id: number;
  name: string;
  county: string;
  lat: number;
  lng: number;
  tsi: number;
  trend7d: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  tide: string;
};

function degToDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return directions[index];
}

function pickBestNumeric(values: Array<number | undefined>): number | undefined {
  const valid = values.filter((value): value is number => value !== undefined && Number.isFinite(value));
  if (valid.length === 0) return undefined;
  const avg = valid.reduce((acc, value) => acc + value, 0) / valid.length;
  return Number(avg.toFixed(1));
}

function pickTideState(values: Array<TideState | undefined>): TideState | undefined {
  return values.find((value): value is TideState => value !== undefined);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeNextRiskState(beach: BeachConditions, synthesized: ReturnType<typeof synthesize>) {
  const windComponent = clamp((synthesized.windSpeedKts / 24) * 24, 0, 24);
  const waveComponent = clamp((synthesized.waveHeightM / 2.8) * 34, 0, 34);
  const tideComponent = synthesized.tideState === "High" ? 17 : synthesized.tideState === "Rising" ? 14 : synthesized.tideState === "Falling" ? 10 : 6;
  const confidenceAdjustment = clamp((synthesized.confidence - 60) / 4, -6, 8);

  const rawTsi = clamp(Math.round(windComponent + waveComponent + tideComponent + confidenceAdjustment), 0, 100);
  const nextTsi = clamp(Math.round(beach.tsi * 0.55 + rawTsi * 0.45), 0, 100);

  const severity = severityFromTsi(nextTsi);
  const trend7d = clamp(beach.trend7d + (nextTsi - beach.tsi), -15, 15);

  const biomassEstTons = Number((5 + nextTsi * 0.78 + Math.max(0, synthesized.waveHeightM - 0.7) * 8).toFixed(1));
  const recoverableBiomassTons = Number((biomassEstTons * 0.62).toFixed(1));
  const cleanupCostEst = Math.round(biomassEstTons * 2850);
  const productValueEst = Math.round(recoverableBiomassTons * 480);

  return {
    tsi: nextTsi,
    severity,
    trend7d,
    biomassEstTons,
    recoverableBiomassTons,
    cleanupCostEst,
    productValueEst
  };
}

function synthesize(beach: BeachConditions, snapshots: MarineSnapshot[]) {
  const windSpeedKts = pickBestNumeric([beach.windSpeed, ...snapshots.map((snapshot) => snapshot.windSpeedKts)]) ?? beach.windSpeed;
  const directionDeg = pickBestNumeric(snapshots.map((snapshot) => snapshot.windDirectionDeg));
  const waveHeightM = pickBestNumeric([beach.waveHeight, ...snapshots.map((snapshot) => snapshot.waveHeightM)]) ?? beach.waveHeight;
  const tideState = pickTideState([beach.tide as TideState, ...snapshots.map((snapshot) => snapshot.tideState)]) ?? "High";

  const confidence = Math.round(
    snapshots.length === 0
      ? 40
      : snapshots.reduce((acc, snapshot) => acc + snapshot.confidence, 0) / snapshots.length
  );

  return {
    windSpeedKts,
    windDirection: directionDeg === undefined ? beach.windDirection : degToDirection(directionDeg),
    waveHeightM,
    tideState,
    confidence
  };
}

export async function getProviderHealth(): Promise<ProviderHealth[]> {
  const checks = await Promise.allSettled([
    fetchNoaaTideSnapshot("8723214"),
    fetchNdbcSnapshot("41009"),
    fetchOpenMeteoMarineSnapshot(25.7617, -80.1918)
  ]);

  return [
    {
      provider: "NOAA_TIDES_AND_CURRENTS",
      status: checks[0].status === "fulfilled" ? "online" : "degraded",
      detail: checks[0].status === "fulfilled" ? "Station pull succeeded" : checks[0].reason instanceof Error ? checks[0].reason.message : "Unavailable"
    },
    {
      provider: "NOAA_NDBC",
      status: checks[1].status === "fulfilled" ? "online" : "degraded",
      detail: checks[1].status === "fulfilled" ? "Buoy pull succeeded" : checks[1].reason instanceof Error ? checks[1].reason.message : "Unavailable"
    },
    {
      provider: "OPEN_METEO_MARINE",
      status: checks[2].status === "fulfilled" ? "online" : "degraded",
      detail: checks[2].status === "fulfilled" ? "Marine feed pull succeeded" : checks[2].reason instanceof Error ? checks[2].reason.message : "Unavailable"
    }
  ];
}

export async function fetchLiveBeachIntelligence(beachId: number): Promise<LiveBeachIntelligence> {
  const beach = await prisma.beach.findUnique({ where: { id: beachId } });
  if (!beach) {
    throw new Error("Beach not found");
  }

  const tideStation = countyTideStation[beach.county] ?? "8723214";
  const buoyStation = countyBuoyStation[beach.county] ?? "41009";

  const results = await Promise.allSettled([
    fetchNoaaTideSnapshot(tideStation),
    fetchNdbcSnapshot(buoyStation),
    fetchOpenMeteoMarineSnapshot(beach.lat, beach.lng)
  ]);

  const snapshots = results
    .filter((result): result is PromiseFulfilledResult<MarineSnapshot> => result.status === "fulfilled")
    .map((result) => result.value);

  const synthesized = synthesize(beach, snapshots);

  return {
    beachId: beach.id,
    beachName: beach.name,
    county: beach.county,
    lat: beach.lat,
    lng: beach.lng,
    snapshots,
    synthesized
  };
}

export async function syncBeachFromProviders(beachId: number) {
  const live = await fetchLiveBeachIntelligence(beachId);
  const beach = await prisma.beach.findUnique({ where: { id: beachId } });
  if (!beach) {
    throw new Error("Beach not found");
  }

  const risk = computeNextRiskState(beach, live.synthesized);

  const updated = await prisma.beach.update({
    where: { id: beachId },
    data: {
      tsi: risk.tsi,
      severity: risk.severity,
      trend7d: risk.trend7d,
      windSpeed: live.synthesized.windSpeedKts,
      windDirection: live.synthesized.windDirection,
      waveHeight: live.synthesized.waveHeightM,
      tide: live.synthesized.tideState,
      biomassEstTons: risk.biomassEstTons,
      recoverableBiomassTons: risk.recoverableBiomassTons,
      cleanupCostEst: risk.cleanupCostEst,
      productValueEst: risk.productValueEst,
      updatedAt: new Date()
    }
  });

  await prisma.feedEvent.create({
    data: {
      id: `FEED-SYNC-${updated.id}-${Date.now()}`,
      timestamp: new Date(),
      category: "Forecast Update",
      level: "Info",
      beachId: updated.id,
      county: updated.county,
      title: `${updated.shortName} external data synchronized`,
      description: `Live provider sync set TSI ${updated.tsi} (${updated.severity}), wind ${updated.windSpeed.toFixed(1)}kt, wave ${updated.waveHeight.toFixed(1)}m, tide ${updated.tide}.`
    }
  });

  return {
    beachId: updated.id,
    beachName: updated.name,
    updatedAt: updated.updatedAt.toISOString(),
    synthesized: live.synthesized,
    snapshots: live.snapshots
  };
}

export async function syncAllBeaches(limit?: number) {
  const beaches = await prisma.beach.findMany({ orderBy: { id: "asc" }, take: limit });
  const results: Array<{ beachId: number; beachName: string; status: "ok" | "error"; detail: string }> = [];

  for (const beach of beaches) {
    try {
      await syncBeachFromProviders(beach.id);
      results.push({
        beachId: beach.id,
        beachName: beach.name,
        status: "ok",
        detail: "Synchronized"
      });
    } catch (error) {
      results.push({
        beachId: beach.id,
        beachName: beach.name,
        status: "error",
        detail: error instanceof Error ? error.message : "Unknown sync error"
      });
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((item) => item.status === "ok").length,
    failed: results.filter((item) => item.status === "error").length,
    results
  };
}
