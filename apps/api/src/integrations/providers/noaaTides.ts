/**
 * Module: apps/api/src/integrations/providers/noaaTides.ts
 * Purpose: Pulls recent NOAA Tides & Currents data and infers current tide state.
 */

import { env } from "../../config/env";
import type { MarineSnapshot, TideState } from "../types";

type NoaaTideResponse = {
  data?: Array<{ t: string; v: string; s: string }>;
  error?: { message: string };
};

function inferTideState(values: number[]): TideState {
  if (values.length < 3) return "High";
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const prev2 = values[values.length - 3];

  if (last > prev && prev > prev2) return "Rising";
  if (last < prev && prev < prev2) return "Falling";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  if (range <= 0.08) return "High";
  return Math.abs(last - max) < Math.abs(last - min) ? "High" : "Low";
}

export async function fetchNoaaTideSnapshot(stationId: string): Promise<MarineSnapshot> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.requestTimeoutMs);

  try {
    const url = new URL(env.noaaTidesBaseUrl);
    url.searchParams.set("product", "water_level");
    url.searchParams.set("application", "triton-coastal-intelligence");
    url.searchParams.set("date", "recent");
    url.searchParams.set("datum", "MLLW");
    url.searchParams.set("station", stationId);
    url.searchParams.set("time_zone", "gmt");
    url.searchParams.set("units", "metric");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`NOAA tides request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as NoaaTideResponse;
    if (payload.error) {
      throw new Error(payload.error.message);
    }

    const parsed = (payload.data ?? [])
      .map((row) => Number(row.v))
      .filter((value) => Number.isFinite(value));

    const tideState = inferTideState(parsed);

    return {
      provider: "NOAA_TIDES_AND_CURRENTS",
      capturedAt: new Date().toISOString(),
      tideState,
      confidence: parsed.length >= 8 ? 86 : 72,
      raw: {
        stationId,
        points: payload.data?.length ?? 0
      }
    };
  } finally {
    clearTimeout(timer);
  }
}
