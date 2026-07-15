/**
 * Module: apps/api/src/integrations/types.ts
 * Purpose: Shared contracts for external marine/environment provider adapters.
 */

export type TideState = "Rising" | "Falling" | "High" | "Low";

export type MarineSnapshot = {
  provider: string;
  capturedAt: string;
  windSpeedKts?: number;
  windDirectionDeg?: number;
  waveHeightM?: number;
  tideState?: TideState;
  waterTempC?: number;
  confidence: number;
  raw?: unknown;
};

export type ProviderHealth = {
  provider: string;
  status: "online" | "degraded" | "offline";
  detail: string;
};

export type LiveBeachIntelligence = {
  beachId: number;
  beachName: string;
  county: string;
  lat: number;
  lng: number;
  snapshots: MarineSnapshot[];
  synthesized: {
    windSpeedKts: number;
    windDirection: string;
    waveHeightM: number;
    tideState: TideState;
    confidence: number;
  };
};
