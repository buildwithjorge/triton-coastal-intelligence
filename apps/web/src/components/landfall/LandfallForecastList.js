import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function confidenceStyles(confidence) {
    if (confidence === "high")
        return "border-teal/35 bg-teal/10 text-teal";
    if (confidence === "medium")
        return "border-amber/35 bg-amber/10 text-amber";
    return "border-[var(--mist)]/35 bg-[var(--mist)]/10 text-[var(--mist)]";
}
function arrivalLabel(minDay, maxDay) {
    if (maxDay >= 999)
        return "D+30 uncertain";
    if (minDay === maxDay)
        return `D+${minDay}`;
    return `D+${minDay} to D+${maxDay}`;
}
export function LandfallForecastList({ forecasts, patches, onOpenBeachDashboard }) {
    const patchById = new Map(patches.map((patch) => [patch.id, patch]));
    const sorted = [...forecasts].sort((a, b) => a.arrivalDayMin - b.arrivalDayMin);
    return (_jsxs("section", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.14em] text-steel", children: "Landfall Forecast" }), _jsx("p", { className: "font-mono text-[11px] text-teal", children: "Soonest first" })] }), _jsx("div", { className: "mt-2 space-y-2", children: sorted.map((forecast) => {
                    const patch = patchById.get(forecast.patchId);
                    return (_jsxs("article", { className: "rounded-lg border border-border bg-navy/45 p-3", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-ice", children: forecast.targetLabel }), _jsx("p", { className: "text-xs text-steel", children: patch?.label ?? "Unknown patch source" })] }), _jsx("span", { className: `rounded border px-2 py-0.5 font-mono text-[11px] uppercase ${confidenceStyles(forecast.confidence)}`, children: forecast.confidence })] }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-ice/90", children: [_jsxs("div", { className: "rounded-md border border-border bg-panel-hi/45 px-2 py-1.5", children: ["Arrival: ", arrivalLabel(forecast.arrivalDayMin, forecast.arrivalDayMax)] }), _jsxs("div", { className: "rounded-md border border-border bg-panel-hi/45 px-2 py-1.5", children: ["Mass: ", patch?.massTons ? `${Math.round(patch.massTons).toLocaleString()} t` : "Diffuse"] })] }), forecast.isCoverageArea ? (_jsxs("div", { className: "mt-2 flex flex-wrap items-center justify-between gap-2", children: [_jsx("p", { className: "inline-flex rounded border border-teal/35 bg-teal/10 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-teal", children: "Includes monitored beaches" }), forecast.targetBeachIds?.[0] ? (_jsx("button", { type: "button", onClick: () => onOpenBeachDashboard(forecast.targetBeachIds?.[0] ?? 0), className: "rounded-md border border-teal bg-teal/15 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-teal hover:bg-teal/20", children: "Open beach dashboard" })) : null] })) : (_jsx("p", { className: "mt-2 inline-flex rounded border border-border px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-steel", children: "Outside current beach coverage" }))] }, `${forecast.patchId}-${forecast.targetLabel}`));
                }) })] }));
}
