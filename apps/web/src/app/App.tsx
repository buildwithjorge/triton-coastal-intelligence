/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { platformMaturity, type Beach } from "@triton/shared";
import { useEffect, useMemo, useState } from "react";
import { RegionalOperationsMap } from "../components/map/RegionalOperationsMap";
import { BeachIntelligencePanel } from "../components/tsi/BeachIntelligencePanel";
import { getBeachDetail, getBeaches } from "../lib/api";
import type { BeachDetailResponse } from "../types/api";

export function App() {
  // Tracks the active county filter for the regional map.
  // "All" means no county filter is applied.
  const [selectedCounty, setSelectedCounty] = useState<string>("All");

  // Holds the current beach collection returned by the API
  // after applying the county filter.
  const [beaches, setBeaches] = useState<Beach[]>([]);

  // Stores the currently selected beach ID from the map,
  // used to load the right-side intelligence panel data.
  const [selectedBeachId, setSelectedBeachId] = useState<number | undefined>(undefined);

  // Stores the expanded payload for the selected beach
  // (forecasts, history, seasonal data, observations, etc.).
  const [selectedBeachDetail, setSelectedBeachDetail] = useState<BeachDetailResponse | null>(null);

  // Loading state for the map/data list request.
  // True while we fetch beaches for the selected county.
  const [mapLoading, setMapLoading] = useState<boolean>(true);

  // Loading state for the selected beach detail request.
  // True while the detail panel data is being refreshed.
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Stores API/network errors that should be visible to operators.
  const [error, setError] = useState<string | null>(null);

  // Effect 1: refresh beach list whenever county filter changes.
  // This drives the left-side map markers and resets selected beach.
  useEffect(() => {
    // Local cancellation flag to avoid setting state
    // if this effect is cleaned up before the request resolves.
    let active = true;

    // Enter loading state and clear previous errors before fetch.
    setMapLoading(true);
    setError(null);

    // Fetch beaches for current county filter.
    getBeaches(selectedCounty === "All" ? undefined : selectedCounty)
      .then((rows) => {
        // Ignore stale async resolution after cleanup/unmount.
        if (!active) return;

        // Update map dataset with filtered beaches.
        setBeaches(rows);

        // Auto-select first beach so detail panel has immediate data.
        const nextId = rows[0]?.id;
        setSelectedBeachId(nextId);
      })
      .catch((err: Error) => {
        // Ignore stale async resolution after cleanup/unmount.
        if (!active) return;

        // Surface request error in UI alert region.
        setError(err.message);
      })
      .finally(() => {
        // Ignore stale async resolution after cleanup/unmount.
        if (!active) return;

        // End map loading state when request completes.
        setMapLoading(false);
      });

    // Cleanup marks this effect instance inactive.
    return () => {
      active = false;
    };
  }, [selectedCounty]);

  // Effect 2: refresh detail panel whenever selected beach changes.
  useEffect(() => {
    // If no beach is selected, clear detail panel and stop.
    if (!selectedBeachId) {
      setSelectedBeachDetail(null);
      return;
    }

    // Local cancellation flag to prevent stale state writes.
    let active = true;

    // Enter detail loading state before fetch.
    setDetailLoading(true);

    // Fetch full intelligence payload for selected beach.
    getBeachDetail(selectedBeachId)
      .then((detail) => {
        // Ignore stale async resolution after cleanup/unmount.
        if (!active) return;

        // Hydrate right panel with freshest detail data.
        setSelectedBeachDetail(detail);
      })
      .catch((err: Error) => {
        // Ignore stale async resolution after cleanup/unmount.
        if (!active) return;

        // Surface request error in UI alert region.
        setError(err.message);
      })
      .finally(() => {
        // Ignore stale async resolution after cleanup/unmount.
        if (!active) return;

        // End detail loading state when request completes.
        setDetailLoading(false);
      });

    // Cleanup marks this effect instance inactive.
    return () => {
      active = false;
    };
  }, [selectedBeachId]);

  // Derived metric for the header card:
  // count beaches currently in Heavy or Severe state.
  const severeCount = useMemo(
    () => beaches.filter((beach) => beach.severity === "Severe" || beach.severity === "Heavy").length,
    [beaches]
  );

  return (
    // App shell with dark operations styling.
    <main className="min-h-screen text-ice">
      {/* Main content width constraint for desktop command-center layout. */}
      <section className="mx-auto max-w-[1560px] px-4 py-5 lg:px-6">
        {/* Top header: platform identity + at-a-glance KPI cards + maturity labels. */}
        <header className="mb-4 rounded-2xl border border-border bg-panel/70 p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {/* Hard-coded operational status label per product framing requirements. */}
              <p className="text-xs uppercase tracking-[0.24em] text-teal">Operational</p>
              <h1 className="text-2xl font-semibold lg:text-3xl">Triton Coastal Intelligence</h1>
              <p className="text-sm text-steel">Florida's Coastal Intelligence Platform</p>
            </div>
            {/* High-level live metrics visible at first glance. */}
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

          {/* Product maturity matrix rendered from shared constants to avoid drift. */}
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(platformMaturity).map(([product, status]) => (
              <article key={product} className="panel rounded-lg px-3 py-2">
                <h2 className="text-sm font-medium text-ice">{product}</h2>
                <p className="mt-1 font-mono text-xs text-teal">{status}</p>
              </article>
            ))}
          </div>
        </header>

        {/* Shared error banner for list/detail fetch failures. */}
        {error ? <p className="mb-3 rounded-md border border-red/30 bg-red/10 p-2 text-sm text-red">{error}</p> : null}

        {/* Main content switch:
            - loading placeholder while beach list is requested
            - two-column operations layout once data is available */}
        {mapLoading ? (
          <div className="panel rounded-2xl p-5">
            <p className="text-sm text-steel">Loading regional operations data...</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
            {/* Left: interactive regional map with county filter and beach selection. */}
            <RegionalOperationsMap
              beaches={beaches}
              selectedBeachId={selectedBeachId}
              onBeachSelect={setSelectedBeachId}
              selectedCounty={selectedCounty}
              onCountyChange={setSelectedCounty}
            />

            {/* Right: selected beach intelligence panel (gauge, trends, observations). */}
            <BeachIntelligencePanel detail={selectedBeachDetail} loading={detailLoading} />
          </div>
        )}
      </section>
    </main>
  );
}
