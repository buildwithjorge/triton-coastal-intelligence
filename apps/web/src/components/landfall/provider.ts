import type { SargassumForecastDataset } from "./types";

export interface SargassumForecastProvider {
  getDataset(): Promise<SargassumForecastDataset>;
}
