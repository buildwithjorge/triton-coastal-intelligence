import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Module:
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */
import { platformMaturity } from "@triton/shared";
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
export function App() {
    const [activeTab, setActiveTab] = useState("operations");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Tracks the active county filter for the regional map.
    // "All" means no county filter is applied.
    const [selectedCounty, setSelectedCounty] = useState("All");
    // Holds the current beach collection returned by the API
    // after applying the county filter.
    const [beaches, setBeaches] = useState([]);
    // Stores the currently selected beach ID from the map,
    // used to load the right-side intelligence panel data.
    const [selectedBeachId, setSelectedBeachId] = useState(undefined);
    // Stores the expanded payload for the selected beach
    // (forecasts, history, seasonal data, observations, etc.).
    const [selectedBeachDetail, setSelectedBeachDetail] = useState(null);
    // Loading state for the map/data list request.
    // True while we fetch beaches for the selected county.
    const [mapLoading, setMapLoading] = useState(true);
    // Loading state for the selected beach detail request.
    // True while the detail panel data is being refreshed.
    const [detailLoading, setDetailLoading] = useState(false);
    // Stores API/network errors that should be visible to operators.
    const [error, setError] = useState(null);
    const [providerHealth, setProviderHealth] = useState([]);
    const [liveBeach, setLiveBeach] = useState(null);
    const [syncing, setSyncing] = useState(false);
    useEffect(() => {
        const saved = window.localStorage.getItem("triton-theme");
        if (saved === "light") {
            setIsDarkMode(false);
            return;
        }
        if (saved === "dark") {
            setIsDarkMode(true);
            return;
        }
        setIsDarkMode(!window.matchMedia("(prefers-color-scheme: light)").matches);
    }, []);
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
        window.localStorage.setItem("triton-theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        handleFullscreenChange();
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);
    const toggleFullscreen = async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
            else {
                await document.documentElement.requestFullscreen();
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Fullscreen is unavailable on this browser.");
        }
    };
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
            if (!active)
                return;
            // Update map dataset with filtered beaches.
            setBeaches(rows);
            // Auto-select first beach so detail panel has immediate data.
            const nextId = rows[0]?.id;
            setSelectedBeachId(nextId);
        })
            .catch((err) => {
            // Ignore stale async resolution after cleanup/unmount.
            if (!active)
                return;
            // Surface request error in UI alert region.
            setError(err.message);
        })
            .finally(() => {
            // Ignore stale async resolution after cleanup/unmount.
            if (!active)
                return;
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
            .catch((err) => {
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
            if (!active)
                return;
            // Hydrate right panel with freshest detail data.
            setSelectedBeachDetail(detail);
        })
            .catch((err) => {
            // Ignore stale async resolution after cleanup/unmount.
            if (!active)
                return;
            // Surface request error in UI alert region.
            setError(err.message);
        })
            .finally(() => {
            // Ignore stale async resolution after cleanup/unmount.
            if (!active)
                return;
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
    const severeCount = useMemo(() => beaches.filter((beach) => beach.severity === "Severe" || beach.severity === "Heavy").length, [beaches]);
    return (_jsx("main", { className: "min-h-screen px-3 py-4 text-ice lg:px-5", children: _jsxs("section", { className: "mx-auto grid max-w-[1680px] gap-4 xl:grid-cols-[290px_1fr]", children: [_jsxs("aside", { className: "panel rounded-2xl p-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "grid h-16 w-16 place-items-center rounded-full border border-teal/50 bg-navy/80 text-xl", children: "T" }), _jsxs("div", { children: [_jsx("h1", { className: "font-display text-4xl leading-none tracking-[0.16em]", children: "TRITON" }), _jsx("p", { className: "text-[11px] uppercase tracking-[0.28em] text-teal", children: "Coastal Intelligence" })] })] }), _jsx("p", { className: "mt-8 text-lg leading-7 text-ice/90", children: "Real-time intelligence. Cleaner coasts. Smarter decisions." }), _jsx("p", { className: "mt-3 text-sm text-steel", children: "Florida's operations platform for monitoring, forecasting, and response coordination." }), _jsx("div", { className: "mt-8 space-y-3", children: [
                                ["Real-time Data", "Live feeds, forecasts and alerts"],
                                ["Operational Insights", "Actionable county and beach intelligence"],
                                ["Mission Control", "Assets, teams, and deployment status"],
                                ["Data Driven Decisions", "Economics and procurement-grade reports"]
                            ].map(([title, subtitle]) => (_jsxs("article", { className: "rounded-lg border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.14em] text-ice", children: title }), _jsx("p", { className: "mt-1 text-xs text-steel", children: subtitle })] }, title))) })] }), _jsxs("section", { className: "panel rounded-2xl p-3 lg:p-4", children: [_jsxs("header", { className: "mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-panel-hi/60 p-2 lg:p-3", children: [_jsx("nav", { className: "flex flex-wrap gap-1.5", children: [
                                        ["operations", "Dashboard"],
                                        ["forecast", "Forecast"],
                                        ["observer", "Observer"],
                                        ["county", "County"],
                                        ["cameras", "Cameras"],
                                        ["reports", "Reports"]
                                    ].map(([value, label]) => (_jsx("button", { type: "button", onClick: () => setActiveTab(value), className: `rounded-md border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] ${activeTab === value ? "border-teal bg-teal/20 text-teal" : "border-transparent bg-navy/40 text-steel hover:border-border"}`, children: label }, value))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => setIsDarkMode((value) => !value), className: "rounded-md border border-border bg-navy/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ice hover:border-teal", "aria-label": isDarkMode ? "Switch to light mode" : "Switch to dark mode", title: isDarkMode ? "Switch to light mode" : "Switch to dark mode", children: isDarkMode ? "Light Mode" : "Dark Mode" }), _jsx("button", { type: "button", onClick: () => {
                                                void toggleFullscreen();
                                            }, className: "rounded-md border border-teal bg-teal/20 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-teal hover:bg-teal/30", "aria-label": isFullscreen ? "Exit fullscreen" : "Enter fullscreen", title: isFullscreen ? "Exit fullscreen" : "Enter fullscreen", children: isFullscreen ? "Exit Fullscreen" : "Fullscreen" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("article", { className: "rounded-md border border-border bg-navy/50 px-3 py-1.5", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.14em] text-steel", children: "Beaches Online" }), _jsx("p", { className: "font-display text-3xl leading-none", children: beaches.length })] }), _jsxs("article", { className: "rounded-md border border-border bg-navy/50 px-3 py-1.5", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.14em] text-steel", children: "Severe Alerts" }), _jsx("p", { className: "font-display text-3xl leading-none text-red", children: severeCount })] })] })] })] }), _jsx("section", { className: "mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4", children: Object.entries(platformMaturity).map(([product, status]) => (_jsxs("article", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("h2", { className: "text-sm font-semibold text-ice", children: product.replace("™", "") }), _jsx("p", { className: "mt-1 text-xs text-teal", children: status })] }, product))) }), _jsx("section", { className: "mb-3 grid gap-2 md:grid-cols-3", children: providerHealth.map((provider) => (_jsxs("article", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.14em] text-steel", children: provider.provider.replaceAll("_", " ") }), _jsx("p", { className: `mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${provider.status === "online" ? "text-green" : "text-amber"}`, children: provider.status }), _jsx("p", { className: "text-xs text-steel", children: provider.detail })] }, provider.provider))) }), error ? _jsx("p", { className: "mb-3 rounded-md border border-red/30 bg-red/10 p-2 text-sm text-red", children: error }) : null, mapLoading ? (_jsx("div", { className: "rounded-xl border border-border bg-panel-hi/50 p-5 text-sm text-steel", children: "Loading regional operations data..." })) : activeTab === "forecast" ? (_jsx(ForecastingCenter, { beachId: selectedBeachId })) : activeTab === "observer" ? (_jsx(FieldObserverApp, { beaches: beaches, defaultBeachId: selectedBeachId, onSubmitted: async (beachId) => {
                                const [nextDetail, nextLive] = await Promise.all([getBeachDetail(beachId), getLiveBeachIntelligence(beachId)]);
                                setSelectedBeachId(beachId);
                                setSelectedBeachDetail(nextDetail);
                                setLiveBeach(nextLive);
                            } })) : activeTab === "county" ? (_jsx(CountyCommandDashboard, {})) : activeTab === "cameras" ? (_jsx(BeachCameraIntelligence, {})) : activeTab === "reports" ? (_jsx(IntelligenceReportView, { beaches: beaches, selectedBeachId: selectedBeachId })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid gap-3 xl:grid-cols-[1.28fr_1fr_0.7fr]", children: [_jsx(RegionalOperationsMap, { beaches: beaches, selectedBeachId: selectedBeachId, onBeachSelect: setSelectedBeachId, selectedCounty: selectedCounty, onCountyChange: setSelectedCounty }), _jsxs("div", { className: "space-y-3", children: [_jsx(BeachIntelligencePanel, { detail: selectedBeachDetail, loading: detailLoading }), liveBeach ? (_jsxs("section", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.15em] text-teal", children: "Live External Intelligence" }), _jsx("h3", { className: "text-base font-semibold", children: liveBeach.beachName })] }), _jsx("button", { type: "button", className: "rounded-md border border-teal bg-teal/20 px-3 py-1 text-xs uppercase tracking-[0.13em] text-teal disabled:opacity-60", disabled: syncing || !selectedBeachId, onClick: async () => {
                                                                        if (!selectedBeachId)
                                                                            return;
                                                                        setSyncing(true);
                                                                        try {
                                                                            await syncBeachIntelligence(selectedBeachId);
                                                                            const [nextDetail, nextLive] = await Promise.all([
                                                                                getBeachDetail(selectedBeachId),
                                                                                getLiveBeachIntelligence(selectedBeachId)
                                                                            ]);
                                                                            setSelectedBeachDetail(nextDetail);
                                                                            setLiveBeach(nextLive);
                                                                        }
                                                                        catch (err) {
                                                                            setError(err instanceof Error ? err.message : "Sync failed");
                                                                        }
                                                                        finally {
                                                                            setSyncing(false);
                                                                        }
                                                                    }, children: syncing ? "Syncing..." : "Sync Now" })] }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4", children: [_jsxs("div", { className: "rounded-md border border-border bg-navy/55 px-3 py-2 text-xs", children: ["Wind: ", liveBeach.synthesized.windDirection, " ", liveBeach.synthesized.windSpeedKts, " kt"] }), _jsxs("div", { className: "rounded-md border border-border bg-navy/55 px-3 py-2 text-xs", children: ["Wave: ", liveBeach.synthesized.waveHeightM.toFixed(1), " m"] }), _jsxs("div", { className: "rounded-md border border-border bg-navy/55 px-3 py-2 text-xs", children: ["Tide: ", liveBeach.synthesized.tideState] }), _jsxs("div", { className: "rounded-md border border-border bg-navy/55 px-3 py-2 text-xs", children: ["Confidence: ", liveBeach.synthesized.confidence, "%"] })] })] })) : null] }), _jsx(LiveIntelligenceFeed, {})] }), _jsxs("section", { className: "mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5", children: [_jsxs("article", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.13em] text-steel", children: "Total Biomass Removed" }), _jsx("p", { className: "font-display text-4xl leading-none", children: "12,842" }), _jsx("p", { className: "text-xs text-green", children: "+18% vs last month" })] }), _jsxs("article", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.13em] text-steel", children: "Cleanup Operations" }), _jsx("p", { className: "font-display text-4xl leading-none", children: "47" }), _jsx("p", { className: "text-xs text-steel", children: "Active across 8 counties" })] }), _jsxs("article", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.13em] text-steel", children: "Economic Impact" }), _jsx("p", { className: "font-display text-4xl leading-none", children: "$2.4M" }), _jsx("p", { className: "text-xs text-steel", children: "Estimated monthly value" })] }), _jsxs("article", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.13em] text-steel", children: "Products Generated" }), _jsx("p", { className: "font-display text-4xl leading-none", children: "8" }), _jsx("p", { className: "text-xs text-steel", children: "Active product streams" })] }), _jsxs("article", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.13em] text-steel", children: "CO2 Sequestered" }), _jsx("p", { className: "font-display text-4xl leading-none", children: "1,245" }), _jsx("p", { className: "text-xs text-steel", children: "Tons this month" })] })] })] }))] })] }) }));
}
