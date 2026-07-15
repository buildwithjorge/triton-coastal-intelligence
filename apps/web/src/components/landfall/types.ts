export type Confidence = "high" | "medium" | "low";

export interface SargassumPatch {
  id: string;
  label: string;
  lon: number;
  lat: number;
  massTons: number | null;
  lastObserved: string;
  source: "MOCK" | "USF_SAWS" | "NOAA" | "COPERNICUS" | "CARICOOS";
}

export interface LandfallForecast {
  patchId: string;
  targetLabel: string;
  targetBeachIds?: number[];
  waypoints: [lon: number, lat: number][] | null;
  arrivalDayMin: number;
  arrivalDayMax: number;
  confidence: Confidence;
  isCoverageArea: boolean;
}

export interface SargassumForecastDataset {
  patches: SargassumPatch[];
  forecasts: LandfallForecast[];
}

export const horizonDays = [0, 3, 7, 14, 21] as const;
export type HorizonDay = (typeof horizonDays)[number];
