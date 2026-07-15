import { useEffect, useMemo, useState } from "react";
import { HorizonControl } from "./HorizonControl";
import { LandfallForecastList } from "./LandfallForecastList";
import { MockForecastProvider } from "./mockProvider";
import { PatchLegend } from "./PatchLegend";
import { PatchList } from "./PatchList";
import { PatchMap } from "./PatchMap";
import type { SargassumForecastProvider } from "./provider";
import { horizonDays, type HorizonDay, type SargassumForecastDataset } from "./types";

type Props = {
  onOpenBeachDashboard: (beachId: number) => void;
};

const emptyDataset: SargassumForecastDataset = {
  patches: [],
  forecasts: []
};

export function LandfallForecastPage({ onOpenBeachDashboard }: Props) {
  const provider: SargassumForecastProvider = useMemo(() => {
    // TODO(sargassum-live-feed): see Phase 3.
    return new MockForecastProvider();
  }, []);

  const [dataset, setDataset] = useState<SargassumForecastDataset>(emptyDataset);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedHorizon, setSelectedHorizon] = useState<HorizonDay>(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    provider
      .getDataset()
      .then((payload) => {
        if (!active) return;
        setDataset(payload);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [provider]);

  if (loading) {
    return <section className="rounded-xl border border-border bg-panel-hi/55 p-4 text-sm text-steel">Loading landfall forecast module...</section>;
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber/30 bg-amber/10 px-3 py-2">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-amber">Sargassum Landfall Forecast</p>
          <h2 className="text-lg font-semibold text-ice">Basin-scale patch trajectory and landfall timing</h2>
        </div>
        <span className="rounded-md border border-amber/35 bg-amber/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.13em] text-amber">
          Forecast model is illustrative
        </span>
      </div>

      <div className="grid gap-3 xl:grid-cols-[280px_1fr_340px]">
        <div className="space-y-3">
          <HorizonControl selected={selectedHorizon} onChange={setSelectedHorizon} horizons={horizonDays} />
          <PatchList patches={dataset.patches} />
          <PatchLegend />
        </div>

        <PatchMap patches={dataset.patches} forecasts={dataset.forecasts} selectedHorizon={selectedHorizon} />

        <LandfallForecastList
          forecasts={dataset.forecasts}
          patches={dataset.patches}
          onOpenBeachDashboard={onOpenBeachDashboard}
        />
      </div>
    </section>
  );
}
