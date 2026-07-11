/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { platformMaturity } from "@triton/shared";
import { useEffect, useMemo, useState } from "react";
import { RegionalOperationsMap } from "../components/map/RegionalOperationsMap";
import { BeachIntelligencePanel } from "../components/tsi/BeachIntelligencePanel";
import { getBeachDetail, getBeaches } from "../lib/api";
export function App() {
    const [selectedCounty, setSelectedCounty] = useState("All");
    const [beaches, setBeaches] = useState([]);
    const [selectedBeachId, setSelectedBeachId] = useState(undefined);
    const [selectedBeachDetail, setSelectedBeachDetail] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        let active = true;
        setMapLoading(true);
        setError(null);
        getBeaches(selectedCounty === "All" ? undefined : selectedCounty)
            .then((rows) => {
            if (!active)
                return;
            setBeaches(rows);
            const nextId = rows[0]?.id;
            setSelectedBeachId(nextId);
        })
            .catch((err) => {
            if (!active)
                return;
            setError(err.message);
        })
            .finally(() => {
            if (!active)
                return;
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
            if (!active)
                return;
            setSelectedBeachDetail(detail);
        })
            .catch((err) => {
            if (!active)
                return;
            setError(err.message);
        })
            .finally(() => {
            if (!active)
                return;
            setDetailLoading(false);
        });
        return () => {
            active = false;
        };
    }, [selectedBeachId]);
    const severeCount = useMemo(() => beaches.filter((beach) => beach.severity === "Severe" || beach.severity === "Heavy").length, [beaches]);
    return (_jsx("main", { className: "min-h-screen text-ice", children: _jsxs("section", { className: "mx-auto max-w-[1560px] px-4 py-5 lg:px-6", children: [_jsxs("header", { className: "mb-4 rounded-2xl border border-border bg-panel/70 p-4 backdrop-blur-md", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.24em] text-teal", children: "Operational" }), _jsx("h1", { className: "text-2xl font-semibold lg:text-3xl", children: "Triton Coastal Intelligence" }), _jsx("p", { className: "text-sm text-steel", children: "Florida's Coastal Intelligence Platform" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { className: "panel rounded-lg px-3 py-2", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.16em] text-steel", children: "Beaches Online" }), _jsx("p", { className: "font-display text-3xl leading-none text-ice", children: beaches.length })] }), _jsxs("div", { className: "panel rounded-lg px-3 py-2", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.16em] text-steel", children: "Heavy/Severe" }), _jsx("p", { className: "font-display text-3xl leading-none text-red", children: severeCount })] })] })] }), _jsx("div", { className: "mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4", children: Object.entries(platformMaturity).map(([product, status]) => (_jsxs("article", { className: "panel rounded-lg px-3 py-2", children: [_jsx("h2", { className: "text-sm font-medium text-ice", children: product }), _jsx("p", { className: "mt-1 font-mono text-xs text-teal", children: status })] }, product))) })] }), error ? _jsx("p", { className: "mb-3 rounded-md border border-red/30 bg-red/10 p-2 text-sm text-red", children: error }) : null, mapLoading ? (_jsx("div", { className: "panel rounded-2xl p-5", children: _jsx("p", { className: "text-sm text-steel", children: "Loading regional operations data..." }) })) : (_jsxs("div", { className: "grid gap-4 xl:grid-cols-[1.15fr_1fr]", children: [_jsx(RegionalOperationsMap, { beaches: beaches, selectedBeachId: selectedBeachId, onBeachSelect: setSelectedBeachId, selectedCounty: selectedCounty, onCountyChange: setSelectedCounty }), _jsx(BeachIntelligencePanel, { detail: selectedBeachDetail, loading: detailLoading })] }))] }) }));
}
