import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Module: apps/web/src/components/forecast/ForecastingCenter.tsx
 * Purpose: Displays multi-horizon forecast probability and explainability drivers.
 */
import { useEffect, useMemo, useState } from "react";
import { getForecastDrivers, getForecasts } from "../../lib/api";
export function ForecastingCenter({ beachId }) {
    const [rows, setRows] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!beachId) {
            setRows([]);
            setDrivers([]);
            return;
        }
        setLoading(true);
        Promise.all([getForecasts(beachId), getForecastDrivers(beachId)])
            .then(([forecastRows, driverRows]) => {
            setRows(forecastRows);
            setDrivers(driverRows.drivers);
        })
            .finally(() => setLoading(false));
    }, [beachId]);
    const grouped = useMemo(() => [...rows].sort((a, b) => b.arrivalProbability - a.arrivalProbability), [rows]);
    if (!beachId) {
        return _jsx("section", { className: "panel rounded-2xl p-4 text-sm text-steel", children: "Select a beach to view forecast intelligence." });
    }
    if (loading) {
        return _jsx("section", { className: "panel rounded-2xl p-4 text-sm text-steel", children: "Loading forecast center..." });
    }
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-teal", children: "Forecasting Center" }), _jsx("h3", { className: "mb-3 text-lg font-semibold", children: "24h to 14d Arrival Intelligence" }), _jsx("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-5", children: grouped.map((row) => (_jsxs("article", { className: "rounded-lg border border-border bg-panel-hi/60 p-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-steel", children: row.horizon }), _jsxs("p", { className: "mt-1 font-display text-4xl leading-none text-ice", children: [row.arrivalProbability, "%"] }), _jsx("div", { className: "mt-2 h-2 rounded-full bg-navy/60", children: _jsx("div", { className: "h-full rounded-full bg-teal", style: { width: `${row.arrivalProbability}%` } }) }), _jsxs("p", { className: "mt-2 text-xs text-steel", children: ["Severity: ", row.expectedSeverity] }), _jsxs("p", { className: "text-xs text-steel", children: ["Accumulation: ", row.expectedAccumulationTons.toFixed(1), " tons"] }), _jsxs("p", { className: "text-xs text-steel", children: ["Confidence: ", row.confidence, "%"] })] }, `${row.beachId}-${row.horizon}`))) }), _jsxs("div", { className: "mt-4 rounded-lg border border-border bg-panel-hi/60 p-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-steel", children: "Top Forecast Drivers" }), _jsx("ul", { className: "mt-2 space-y-1 text-sm text-ice", children: drivers.slice(0, 6).map((driver, index) => (_jsxs("li", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { children: driver.label }), _jsxs("span", { className: "font-mono text-teal", children: [driver.weight, "% (", driver.horizon, ")"] })] }, `${driver.label}-${index}`))) })] })] }));
}
