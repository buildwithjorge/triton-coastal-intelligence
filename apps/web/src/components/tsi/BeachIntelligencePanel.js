/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { severityColors } from "@triton/shared";
import { Area, AreaChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TsiArcGauge } from "../common/TsiArcGauge";
const monthLabel = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec"
};
function Stat({ label, value }) {
    return (_jsxs("div", { className: "panel rounded-lg px-3 py-2", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.18em] text-steel", children: label }), _jsx("p", { className: "mt-1 font-mono text-sm text-ice", children: value })] }));
}
export function BeachIntelligencePanel({ detail, loading }) {
    if (loading) {
        return (_jsx("section", { className: "panel h-full rounded-2xl p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "live-dot" }), _jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-teal", children: "Loading beach intelligence" })] }) }));
    }
    if (!detail) {
        return (_jsx("section", { className: "panel h-full rounded-2xl p-4", children: _jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-steel", children: "Select a beach marker to load intelligence." }) }));
    }
    const { beach, history7d, seasonal12m, forecasts, observations } = detail;
    const forecast24h = forecasts.find((item) => item.horizon === "24h");
    const radarData = (forecast24h?.drivers ?? []).map((driver) => ({ signal: driver.label, weight: driver.weight }));
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsxs("div", { className: "mb-3 flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-teal", children: "Beach Intelligence" }), _jsx("h2", { className: "text-xl font-semibold", children: beach.name }), _jsxs("p", { className: "text-sm text-steel", children: [beach.county, " County"] })] }), _jsx("div", { className: "rounded-md border border-border bg-panel-hi/70 px-3 py-2", children: _jsx("p", { className: "font-mono text-xs uppercase tracking-[0.12em]", style: { color: severityColors[beach.severity] }, children: beach.severity }) })] }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-[260px_1fr]", children: [_jsxs("div", { className: "panel rounded-xl p-3", children: [_jsx(TsiArcGauge, { tsi: beach.tsi, severity: beach.severity, size: 220 }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2", children: [_jsx(Stat, { label: "Wind", value: `${beach.wind.direction} ${beach.wind.speed} kt` }), _jsx(Stat, { label: "Wave", value: `${beach.waveHeight.toFixed(1)} m` }), _jsx(Stat, { label: "Tide", value: beach.tide }), _jsx(Stat, { label: "Cleanup", value: beach.cleanupStatus })] })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-4", children: [_jsx(Stat, { label: "Trend 7D", value: `${beach.trend7d > 0 ? "+" : ""}${beach.trend7d}` }), _jsx(Stat, { label: "Biomass", value: `${beach.biomassEstTons.toFixed(1)} tons` }), _jsx(Stat, { label: "Cleanup Cost", value: `$${beach.cleanupCostEst.toLocaleString()}` }), _jsx(Stat, { label: "Product Value", value: `$${beach.productValueEst.toLocaleString()}` })] }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("div", { className: "panel rounded-xl p-3", children: [_jsx("p", { className: "mb-2 text-xs uppercase tracking-[0.16em] text-steel", children: "7-Day TSI Trend" }), _jsx("div", { className: "h-44", children: _jsx(ResponsiveContainer, { children: _jsxs(LineChart, { data: history7d.map((p) => ({ date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), tsi: p.tsi })), children: [_jsx(CartesianGrid, { stroke: "rgba(74,122,155,0.2)" }), _jsx(XAxis, { dataKey: "date", stroke: "#4a7a9b", fontSize: 11 }), _jsx(YAxis, { stroke: "#4a7a9b", domain: [0, 100], fontSize: 11 }), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "tsi", stroke: "#00d4b8", strokeWidth: 2.5, dot: { r: 3 } })] }) }) })] }), _jsxs("div", { className: "panel rounded-xl p-3", children: [_jsx("p", { className: "mb-2 text-xs uppercase tracking-[0.16em] text-steel", children: "12-Month Seasonal Pattern" }), _jsx("div", { className: "h-44", children: _jsx(ResponsiveContainer, { children: _jsxs(AreaChart, { data: seasonal12m.map((p) => ({ month: monthLabel[p.month] ?? String(p.month), tsi: p.avgTsi })), children: [_jsx(CartesianGrid, { stroke: "rgba(74,122,155,0.2)" }), _jsx(XAxis, { dataKey: "month", stroke: "#4a7a9b", fontSize: 11 }), _jsx(YAxis, { stroke: "#4a7a9b", domain: [0, 100], fontSize: 11 }), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "tsi", stroke: "#f5a623", fill: "rgba(245,166,35,0.32)" })] }) }) })] })] }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("div", { className: "panel rounded-xl p-3", children: [_jsx("p", { className: "mb-2 text-xs uppercase tracking-[0.16em] text-steel", children: "Forecast Drivers (24h)" }), _jsx("div", { className: "h-44", children: _jsx(ResponsiveContainer, { children: _jsxs(RadarChart, { data: radarData, outerRadius: 80, children: [_jsx(PolarGrid, { stroke: "rgba(74,122,155,0.25)" }), _jsx(PolarAngleAxis, { dataKey: "signal", tick: { fill: "#9ac0d8", fontSize: 10 } }), _jsx(Radar, { name: "Signal", dataKey: "weight", stroke: "#00d4b8", fill: "#00d4b8", fillOpacity: 0.35 })] }) }) })] }), _jsxs("div", { className: "panel rounded-xl p-3", children: [_jsx("p", { className: "mb-2 text-xs uppercase tracking-[0.16em] text-steel", children: "Latest Field Observations" }), _jsx("div", { className: "space-y-2 overflow-auto pr-1", style: { maxHeight: 176 }, children: observations.slice(0, 4).map((observation) => (_jsxs("article", { className: "rounded-md border border-border bg-panel-hi/60 p-2", children: [_jsxs("div", { className: "flex justify-between gap-2", children: [_jsx("p", { className: "font-mono text-xs text-ice", children: observation.observerName }), _jsx("p", { className: "font-mono text-[10px] text-steel", children: new Date(observation.submittedAt).toLocaleString() })] }), _jsx("p", { className: "mt-1 text-xs text-steel", children: observation.notes })] }, observation.id))) })] })] })] })] })] }));
}
