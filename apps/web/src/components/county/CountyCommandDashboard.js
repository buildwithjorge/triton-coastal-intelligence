import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Module: apps/web/src/components/county/CountyCommandDashboard.tsx
 * Purpose: Surfaces county-level KPIs for municipal command decision support.
 */
import { useEffect, useState } from "react";
import { getCountyRollups } from "../../lib/api";
export function CountyCommandDashboard() {
    const [rows, setRows] = useState([]);
    useEffect(() => {
        getCountyRollups().then(setRows);
    }, []);
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-teal", children: "County Command Dashboard" }), _jsx("h3", { className: "mb-3 text-lg font-semibold", children: "Cross-County Operational Posture" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[760px] text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-[0.13em] text-steel", children: _jsxs("tr", { children: [_jsx("th", { className: "pb-2", children: "County" }), _jsx("th", { className: "pb-2", children: "Beaches" }), _jsx("th", { className: "pb-2", children: "Avg TSI" }), _jsx("th", { className: "pb-2", children: "Heavy/Severe" }), _jsx("th", { className: "pb-2", children: "Biomass (tons)" }), _jsx("th", { className: "pb-2", children: "Cleanup Cost" }), _jsx("th", { className: "pb-2", children: "Value Recovery" }), _jsx("th", { className: "pb-2", children: "Crew" })] }) }), _jsx("tbody", { className: "text-ice", children: rows.map((row) => (_jsxs("tr", { className: "border-t border-border/80", children: [_jsx("td", { className: "py-2 font-medium", children: row.county }), _jsx("td", { className: "py-2", children: row.beachCount }), _jsx("td", { className: "py-2", children: row.avgTsi.toFixed(1) }), _jsx("td", { className: "py-2", children: row.highSeverityCount }), _jsx("td", { className: "py-2", children: row.totalBiomassTons.toFixed(1) }), _jsxs("td", { className: "py-2", children: ["$", Math.round(row.totalCleanupCostEst).toLocaleString()] }), _jsxs("td", { className: "py-2", children: ["$", Math.round(row.totalRecoverableProductValue).toLocaleString()] }), _jsx("td", { className: "py-2", children: row.totalCrewDeployed })] }, row.county))) })] }) })] }));
}
