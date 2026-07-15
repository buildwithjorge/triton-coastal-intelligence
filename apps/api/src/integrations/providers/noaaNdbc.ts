/**
 * Module: apps/api/src/integrations/providers/noaaNdbc.ts
 * Purpose: Reads NOAA NDBC buoy realtime text feed for wind and wave conditions.
 */

import { env } from "../../config/env";
import type { MarineSnapshot } from "../types";

const MPS_TO_KTS = 1.943844;

function parseNdbcText(raw: string) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 3) {
    throw new Error("NDBC response did not include enough rows");
  }

  const headers = lines[0].replace(/^#/, "").split(/\s+/);
  const values = lines[2].split(/\s+/);
  const map = new Map<string, string>();

  headers.forEach((header, index) => {
    map.set(header, values[index] ?? "");
  });

  const windDirDeg = Number(map.get("WDIR"));
  const windSpeedMps = Number(map.get("WSPD"));
  const waveHeightM = Number(map.get("WVHT"));

  return {
    windDirectionDeg: Number.isFinite(windDirDeg) ? windDirDeg : undefined,
    windSpeedKts: Number.isFinite(windSpeedMps) ? Number((windSpeedMps * MPS_TO_KTS).toFixed(1)) : undefined,
    waveHeightM: Number.isFinite(waveHeightM) ? waveHeightM : undefined
  };
}

export async function fetchNdbcSnapshot(stationId: string): Promise<MarineSnapshot> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.requestTimeoutMs);

  try {
    const url = `${env.noaaNdbcBaseUrl}/${stationId}.txt`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`NDBC request failed with status ${response.status}`);
    }

    const text = await response.text();
    const parsed = parseNdbcText(text);

    return {
      provider: "NOAA_NDBC",
      capturedAt: new Date().toISOString(),
      windSpeedKts: parsed.windSpeedKts,
      windDirectionDeg: parsed.windDirectionDeg,
      waveHeightM: parsed.waveHeightM,
      confidence: parsed.waveHeightM !== undefined ? 88 : 74,
      raw: {
        stationId
      }
    };
  } finally {
    clearTimeout(timer);
  }
}
