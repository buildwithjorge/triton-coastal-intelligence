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
