/**
 * Module: apps/api/src/integrations/providers/openMeteoMarine.ts
 * Purpose: Pulls marine conditions from Open-Meteo as a secondary provider.
 */

import { env } from "../../config/env";
import type { MarineSnapshot } from "../types";

type OpenMeteoPayload = {
  current?: {
    time?: string;
    wave_height?: number;
  };
  hourly?: {
    time?: string[];
    wave_height?: number[];
  };
};

export async function fetchOpenMeteoMarineSnapshot(lat: number, lng: number): Promise<MarineSnapshot> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.requestTimeoutMs);

  try {
    const url = new URL(env.openMeteoMarineBaseUrl);
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lng));
    url.searchParams.set("current", "wave_height");
    url.searchParams.set("hourly", "wave_height");
    url.searchParams.set("timezone", "UTC");

    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Open-Meteo request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenMeteoPayload;
    const waveCurrent = payload.current?.wave_height;
    const waveSeries = payload.hourly?.wave_height ?? [];
    const fallbackWave = waveSeries.find((value) => Number.isFinite(value));

    return {
      provider: "OPEN_METEO_MARINE",
      capturedAt: new Date().toISOString(),
      waveHeightM: Number.isFinite(waveCurrent) ? waveCurrent : fallbackWave,
      confidence: 68,
      raw: {
        lat,
        lng,
        source: "open-meteo"
      }
    };
  } finally {
    clearTimeout(timer);
  }
}
