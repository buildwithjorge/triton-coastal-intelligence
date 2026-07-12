/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import type { Beach, Forecast, Observation } from "@triton/shared";

export type BeachDetailResponse = {
  beach: Beach;
  forecasts: Forecast[];
  history7d: { beachId: number; date: string; tsi: number }[];
  seasonal12m: { beachId: number; month: number; avgTsi: number }[];
  observations: Observation[];
};

export type CountyRollupResponse = {
  county: string;
  beachCount: number;
  avgTsi: number;
  highSeverityCount: number;
  totalBiomassTons: number;
  totalCleanupCostEst: number;
  totalRecoverableProductValue: number;
  totalCrewDeployed: number;
};

export type ProviderHealthResponse = {
  providers: Array<{
    provider: string;
    status: "online" | "degraded" | "offline";
    detail: string;
  }>;
};

export type LiveBeachIntelligenceResponse = {
  beachId: number;
  beachName: string;
  county: string;
  lat: number;
  lng: number;
  snapshots: Array<{
    provider: string;
    capturedAt: string;
    windSpeedKts?: number;
    windDirectionDeg?: number;
    waveHeightM?: number;
    tideState?: "Rising" | "Falling" | "High" | "Low";
    confidence: number;
  }>;
  synthesized: {
    windSpeedKts: number;
    windDirection: string;
    waveHeightM: number;
    tideState: "Rising" | "Falling" | "High" | "Low";
    confidence: number;
  };
};

export type SyncBeachResponse = {
  beachId: number;
  beachName: string;
  updatedAt: string;
  synthesized: {
    windSpeedKts: number;
    windDirection: string;
    waveHeightM: number;
    tideState: "Rising" | "Falling" | "High" | "Low";
    confidence: number;
  };
  snapshots: Array<{
    provider: string;
    capturedAt: string;
    confidence: number;
  }>;
};

export type ForecastListItem = {
  beachId: number;
  beachName: string;
  county: string;
  horizon: "24h" | "48h" | "72h" | "7d" | "14d";
  arrivalProbability: number;
  expectedSeverity: "Low" | "Moderate" | "Heavy" | "Severe";
  expectedAccumulationTons: number;
  confidence: number;
  drivers: Array<{ label: string; weight: number }>;
};

export type ForecastDriverTopResponse = {
  beachId: number;
  drivers: Array<{
    horizon: string;
    label: string;
    weight: number;
  }>;
};

export type ObservationCreatePayload = {
  beachId: number;
  observerName: string;
  severity: "Low" | "Moderate" | "Heavy" | "Severe";
  notes: string;
  hasPhoto?: boolean;
  photoUrl?: string;
  lat: number;
  lng: number;
};

export type ObservationPhotoUploadResponse = {
  url: string;
  sizeBytes: number;
  mime: string;
};

export type RegionReportResponse = {
  title: string;
  subtitle: string;
  generatedAt: string;
  summary: {
    beachesMonitored: number;
    avgTsi: number;
    heavyOrSevere: number;
    totalCleanupCostEst: number;
  };
  topRisk24h: Array<{
    beachId: number;
    beachName: string;
    county: string;
    probability: number;
    expectedSeverity: string;
  }>;
  recentEvents: Array<{
    id: string;
    category: string;
    level: string;
    title: string;
    timestamp: string;
  }>;
};

export type BeachReportResponse = {
  title: string;
  generatedAt: string;
  beach: {
    id: number;
    name: string;
    county: string;
    tsi: number;
    severity: string;
    cleanupStatus: string;
    crewDeployed: number;
  };
  forecasts: Array<{
    horizon: string;
    probability: number;
    expectedSeverity: string;
    confidence: number;
  }>;
  history: Array<{ date: string; tsi: number }>;
  observations: Array<{
    id: string;
    submittedAt: string;
    severity: string;
    observerName: string;
    notes: string;
  }>;
};

export type FeedListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: Array<{
    id: string;
    timestamp: string;
    category: string;
    level: "Critical" | "Warning" | "Info";
    beachId?: number;
    beachName?: string;
    county?: string;
    title: string;
    description: string;
  }>;
};

export type CameraFeedItem = {
  cameraId: string;
  beachId: number;
  beachName: string;
  county: string;
  streamUrl: string;
  provider: string;
  live: boolean;
  health: "online" | "warning" | "offline";
  classification: {
    severity: string;
    confidence: number;
    updatedAt: string;
  };
};

export type CameraFeedResponse = {
  items: CameraFeedItem[];
};
