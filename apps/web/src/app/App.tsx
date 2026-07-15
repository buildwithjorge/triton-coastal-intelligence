/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { platformMaturity, type Beach } from "@triton/shared";
import { useEffect, useMemo, useState } from "react";
import { CountyCommandDashboard } from "../components/county/CountyCommandDashboard";
import { LiveIntelligenceFeed } from "../components/feed/LiveIntelligenceFeed";
import { ForecastingCenter } from "../components/forecast/ForecastingCenter";
import { RegionalOperationsMap } from "../components/map/RegionalOperationsMap";
import { FieldObserverApp } from "../components/observer/FieldObserverApp";
import { IntelligenceReportView } from "../components/reports/IntelligenceReportView";
import { BeachCameraIntelligence } from "../components/cameras/BeachCameraIntelligence";
import { BeachIntelligencePanel } from "../components/tsi/BeachIntelligencePanel";
import { getBeachDetail, getBeaches, getLiveBeachIntelligence, getProviderHealth, syncBeachIntelligence } from "../lib/api";
import type { BeachDetailResponse, LiveBeachIntelligenceResponse, ProviderHealthResponse } from "../types/api";

type ModuleTab = "operations" | "forecast" | "observer" | "county" | "cameras" | "reports";

export function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>("operations");
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
  const [providerHealth, setProviderHealth] = useState<ProviderHealthResponse["providers"]>([]);
  const [liveBeach, setLiveBeach] = useState<LiveBeachIntelligenceResponse | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

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

  useEffect(() => {
    getProviderHealth()
      .then((payload) => {
        setProviderHealth(payload.providers);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

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

  useEffect(() => {
    if (!selectedBeachId) {
      setLiveBeach(null);
      return;
    }

    getLiveBeachIntelligence(selectedBeachId)
      .then((payload) => {
        setLiveBeach(payload);
      })
      .catch(() => {
        setLiveBeach(null);
      });
  }, [selectedBeachId]);

  // Derived metric for the header card:
  // count beaches currently in Heavy or Severe state.
  const severeCount = useMemo(
    () => beaches.filter((beach) => beach.severity === "Severe" || beach.severity === "Heavy").length,
    [beaches]
  );

  return (
    <main className="min-h-screen px-3 py-4 text-ice lg:px-5">
      <section className="mx-auto grid max-w-[1680px] gap-4 xl:grid-cols-[290px_1fr]">
        <aside className="panel rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-teal/50 bg-navy/80 text-xl">T</div>
            <div>
              <h1 className="font-display text-4xl leading-none tracking-[0.16em]">TRITON</h1>
              <p className="text-[11px] uppercase tracking-[0.28em] text-teal">Coastal Intelligence</p>
            </div>
          </div>

          <p className="mt-8 text-lg leading-7 text-ice/90">Real-time intelligence. Cleaner coasts. Smarter decisions.</p>
          <p className="mt-3 text-sm text-steel">Florida's operations platform for monitoring, forecasting, and response coordination.</p>

          <div className="mt-8 space-y-3">
            {[
              ["Real-time Data", "Live feeds, forecasts and alerts"],
              ["Operational Insights", "Actionable county and beach intelligence"],
              ["Mission Control", "Assets, teams, and deployment status"],
              ["Data Driven Decisions", "Economics and procurement-grade reports"]
            ].map(([title, subtitle]) => (
              <article key={title} className="rounded-lg border border-border bg-panel-hi/55 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-ice">{title}</p>
                <p className="mt-1 text-xs text-steel">{subtitle}</p>
              </article>
            ))}
          </div>
        </aside>

        <section className="panel rounded-2xl p-3 lg:p-4">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-panel-hi/60 p-2 lg:p-3">
            <nav className="flex flex-wrap gap-1.5">
              {[
                ["operations", "Dashboard"],
                ["forecast", "Forecast"],
                ["observer", "Observer"],
                ["county", "County"],
                ["cameras", "Cameras"],
                ["reports", "Reports"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value as ModuleTab)}
                  className={`rounded-md border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] ${
                    activeTab === value ? "border-teal bg-teal/20 text-teal" : "border-transparent bg-navy/40 text-steel hover:border-border"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="grid grid-cols-2 gap-2">
              <article className="rounded-md border border-border bg-navy/50 px-3 py-1.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-steel">Beaches Online</p>
                <p className="font-display text-3xl leading-none">{beaches.length}</p>
              </article>
              <article className="rounded-md border border-border bg-navy/50 px-3 py-1.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-steel">Severe Alerts</p>
                <p className="font-display text-3xl leading-none text-red">{severeCount}</p>
              </article>
            </div>
          </header>

          <section className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(platformMaturity).map(([product, status]) => (
              <article key={product} className="rounded-xl border border-border bg-panel-hi/55 p-3">
                <h2 className="text-sm font-semibold text-ice">{product.replace("™", "")}</h2>
                <p className="mt-1 text-xs text-teal">{status}</p>
              </article>
            ))}
          </section>

          <section className="mb-3 grid gap-2 md:grid-cols-3">
            {providerHealth.map((provider) => (
              <article key={provider.provider} className="rounded-xl border border-border bg-panel-hi/55 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-steel">{provider.provider.replaceAll("_", " ")}</p>
                <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${provider.status === "online" ? "text-green" : "text-amber"}`}>
                  {provider.status}
                </p>
                <p className="text-xs text-steel">{provider.detail}</p>
              </article>
            ))}
          </section>

          {error ? <p className="mb-3 rounded-md border border-red/30 bg-red/10 p-2 text-sm text-red">{error}</p> : null}

          {mapLoading ? (
            <div className="rounded-xl border border-border bg-panel-hi/50 p-5 text-sm text-steel">Loading regional operations data...</div>
          ) : activeTab === "forecast" ? (
            <ForecastingCenter beachId={selectedBeachId} />
          ) : activeTab === "observer" ? (
            <FieldObserverApp
              beaches={beaches}
              defaultBeachId={selectedBeachId}
              onSubmitted={async (beachId) => {
                const [nextDetail, nextLive] = await Promise.all([getBeachDetail(beachId), getLiveBeachIntelligence(beachId)]);
                setSelectedBeachId(beachId);
                setSelectedBeachDetail(nextDetail);
                setLiveBeach(nextLive);
              }}
            />
          ) : activeTab === "county" ? (
            <CountyCommandDashboard />
          ) : activeTab === "cameras" ? (
            <BeachCameraIntelligence />
          ) : activeTab === "reports" ? (
            <IntelligenceReportView beaches={beaches} selectedBeachId={selectedBeachId} />
          ) : (
            <>
              <div className="grid gap-3 xl:grid-cols-[1.28fr_1fr_0.7fr]">
                <RegionalOperationsMap
                  beaches={beaches}
                  selectedBeachId={selectedBeachId}
                  onBeachSelect={setSelectedBeachId}
                  selectedCounty={selectedCounty}
                  onCountyChange={setSelectedCounty}
                />

                <div className="space-y-3">
                  <BeachIntelligencePanel detail={selectedBeachDetail} loading={detailLoading} />
                  {liveBeach ? (
                    <section className="rounded-xl border border-border bg-panel-hi/55 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-teal">Live External Intelligence</p>
                          <h3 className="text-base font-semibold">{liveBeach.beachName}</h3>
                        </div>
                        <button
                          type="button"
                          className="rounded-md border border-teal bg-teal/20 px-3 py-1 text-xs uppercase tracking-[0.13em] text-teal disabled:opacity-60"
                          disabled={syncing || !selectedBeachId}
                          onClick={async () => {
                            if (!selectedBeachId) return;
                            setSyncing(true);
                            try {
                              await syncBeachIntelligence(selectedBeachId);
                              const [nextDetail, nextLive] = await Promise.all([
                                getBeachDetail(selectedBeachId),
                                getLiveBeachIntelligence(selectedBeachId)
                              ]);
                              setSelectedBeachDetail(nextDetail);
                              setLiveBeach(nextLive);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Sync failed");
                            } finally {
                              setSyncing(false);
                            }
                          }}
                        >
                          {syncing ? "Syncing..." : "Sync Now"}
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
                        <div className="rounded-md border border-border bg-navy/55 px-3 py-2 text-xs">Wind: {liveBeach.synthesized.windDirection} {liveBeach.synthesized.windSpeedKts} kt</div>
                        <div className="rounded-md border border-border bg-navy/55 px-3 py-2 text-xs">Wave: {liveBeach.synthesized.waveHeightM.toFixed(1)} m</div>
                        <div className="rounded-md border border-border bg-navy/55 px-3 py-2 text-xs">Tide: {liveBeach.synthesized.tideState}</div>
                        <div className="rounded-md border border-border bg-navy/55 px-3 py-2 text-xs">Confidence: {liveBeach.synthesized.confidence}%</div>
                      </div>
                    </section>
                  ) : null}
                </div>

                <LiveIntelligenceFeed />
              </div>

              <section className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                <article className="rounded-xl border border-border bg-panel-hi/55 p-3">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-steel">Total Biomass Removed</p>
                  <p className="font-display text-4xl leading-none">12,842</p>
                  <p className="text-xs text-green">+18% vs last month</p>
                </article>
                <article className="rounded-xl border border-border bg-panel-hi/55 p-3">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-steel">Cleanup Operations</p>
                  <p className="font-display text-4xl leading-none">47</p>
                  <p className="text-xs text-steel">Active across 8 counties</p>
                </article>
                <article className="rounded-xl border border-border bg-panel-hi/55 p-3">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-steel">Economic Impact</p>
                  <p className="font-display text-4xl leading-none">$2.4M</p>
                  <p className="text-xs text-steel">Estimated monthly value</p>
                </article>
                <article className="rounded-xl border border-border bg-panel-hi/55 p-3">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-steel">Products Generated</p>
                  <p className="font-display text-4xl leading-none">8</p>
                  <p className="text-xs text-steel">Active product streams</p>
                </article>
                <article className="rounded-xl border border-border bg-panel-hi/55 p-3">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-steel">CO2 Sequestered</p>
                  <p className="font-display text-4xl leading-none">1,245</p>
                  <p className="text-xs text-steel">Tons this month</p>
                </article>
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
