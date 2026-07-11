import { platformMaturity, type Beach } from "@triton/shared";
import { useEffect, useMemo, useState } from "react";
import { RegionalOperationsMap } from "../components/map/RegionalOperationsMap";
import { BeachIntelligencePanel } from "../components/tsi/BeachIntelligencePanel";
import { getBeachDetail, getBeaches } from "../lib/api";
import type { BeachDetailResponse } from "../types/api";

export function App() {
  const [selectedCounty, setSelectedCounty] = useState<string>("All");
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [selectedBeachId, setSelectedBeachId] = useState<number | undefined>(undefined);
  const [selectedBeachDetail, setSelectedBeachDetail] = useState<BeachDetailResponse | null>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setMapLoading(true);
    setError(null);

    getBeaches(selectedCounty === "All" ? undefined : selectedCounty)
      .then((rows) => {
        if (!active) return;
        setBeaches(rows);
        const nextId = rows[0]?.id;
        setSelectedBeachId(nextId);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setMapLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCounty]);

  useEffect(() => {
    if (!selectedBeachId) {
      setSelectedBeachDetail(null);
      return;
    }

    let active = true;
    setDetailLoading(true);

    getBeachDetail(selectedBeachId)
      .then((detail) => {
        if (!active) return;
        setSelectedBeachDetail(detail);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedBeachId]);

  const severeCount = useMemo(
    () => beaches.filter((beach) => beach.severity === "Severe" || beach.severity === "Heavy").length,
    [beaches]
  );

  return (
    <main className="min-h-screen text-ice">
      <section className="mx-auto max-w-[1560px] px-4 py-5 lg:px-6">
        <header className="mb-4 rounded-2xl border border-border bg-panel/70 p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-teal">Operational</p>
              <h1 className="text-2xl font-semibold lg:text-3xl">Triton Coastal Intelligence</h1>
              <p className="text-sm text-steel">Florida's Coastal Intelligence Platform</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="panel rounded-lg px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-steel">Beaches Online</p>
                <p className="font-display text-3xl leading-none text-ice">{beaches.length}</p>
              </div>
              <div className="panel rounded-lg px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-steel">Heavy/Severe</p>
                <p className="font-display text-3xl leading-none text-red">{severeCount}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(platformMaturity).map(([product, status]) => (
              <article key={product} className="panel rounded-lg px-3 py-2">
                <h2 className="text-sm font-medium text-ice">{product}</h2>
                <p className="mt-1 font-mono text-xs text-teal">{status}</p>
              </article>
            ))}
          </div>
        </header>

        {error ? <p className="mb-3 rounded-md border border-red/30 bg-red/10 p-2 text-sm text-red">{error}</p> : null}

        {mapLoading ? (
          <div className="panel rounded-2xl p-5">
            <p className="text-sm text-steel">Loading regional operations data...</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
            <RegionalOperationsMap
              beaches={beaches}
              selectedBeachId={selectedBeachId}
              onBeachSelect={setSelectedBeachId}
              selectedCounty={selectedCounty}
              onCountyChange={setSelectedCounty}
            />
            <BeachIntelligencePanel detail={selectedBeachDetail} loading={detailLoading} />
          </div>
        )}
      </section>
    </main>
  );
}
