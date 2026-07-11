import type { CleanupStatus, Severity } from "../constants/severity";
import type { County, EventLevel, ForecastHorizon } from "../constants/platform";

export interface Beach {
  id: number;
  name: string;
  shortName: string;
  county: County;
  lat: number;
  lng: number;
  tsi: number;
  severity: Severity;
  trend7d: number;
  wind: { speed: number; direction: string };
  waveHeight: number;
  tide: "Rising" | "Falling" | "High" | "Low";
  crewDeployed: number;
  biomassEstTons: number;
  cleanupCostEst: number;
  recoverableBiomassTons: number;
  productValueEst: number;
  lastObservedAt: string;
  cleanupStatus: CleanupStatus;
}

export interface BeachHistoryPoint {
  beachId: number;
  date: string;
  tsi: number;
}

export interface BeachSeasonalPoint {
  beachId: number;
  month: number;
  avgTsi: number;
}

export interface Forecast {
  beachId: number;
  horizon: ForecastHorizon;
  arrivalProbability: number;
  expectedSeverity: Severity;
  expectedAccumulationTons: number;
  confidence: number;
  drivers: { label: string; weight: number }[];
}

export interface Observation {
  id: string;
  beachId: number;
  submittedAt: string;
  observerName: string;
  severity: Severity;
  notes: string;
  hasPhoto: boolean;
  photoUrl?: string;
  lat: number;
  lng: number;
}

export interface FeedEvent {
  id: string;
  timestamp: string;
  category:
    | "Drone Survey"
    | "Cleanup Dispatch"
    | "Wind Shift"
    | "Offshore Patch"
    | "Forecast Update"
    | "Field Observation";
  level: EventLevel;
  beachId?: number;
  beachName?: string;
  county?: County;
  title: string;
  description: string;
}

export interface CountyRollup {
  county: County;
  beachCount: number;
  avgTsi: number;
  highSeverityCount: number;
  totalBiomassTons: number;
  totalCleanupCostEst: number;
  totalRecoverableProductValue: number;
  totalCrewDeployed: number;
}

export interface AnalyticsRankingRow {
  beachId: number;
  beachName: string;
  county: County;
  tsi: number;
  severity: Severity;
  arrivalProbability24h: number;
}

export interface EconomicsRollup {
  totalBiomassTons: number;
  totalCleanupCostEst: number;
  totalRecoverableBiomassTons: number;
  totalProductValueEst: number;
  netCost: number;
}
