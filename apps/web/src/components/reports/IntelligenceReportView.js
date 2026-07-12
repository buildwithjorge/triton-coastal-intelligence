import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getBeachReport, getRegionReport } from "../../lib/api";
export function IntelligenceReportView({ beaches, selectedBeachId }) {
    const [regionReport, setRegionReport] = useState(null);
    const [beachReport, setBeachReport] = useState(null);
    useEffect(() => {
        getRegionReport().then(setRegionReport);
    }, []);
    useEffect(() => {
        if (!selectedBeachId) {
            setBeachReport(null);
            return;
        }
        getBeachReport(selectedBeachId).then(setBeachReport);
    }, [selectedBeachId]);
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-teal", children: "Intelligence Reports" }), _jsx("h3", { className: "mb-3 text-lg font-semibold", children: "Printable Regional and Beach Reports" }), regionReport ? (_jsxs("article", { className: "rounded-lg border border-border bg-panel-hi/60 p-3", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.16em] text-steel", children: "Regional Report" }), _jsx("p", { className: "mt-1 text-base font-semibold text-ice", children: regionReport.title }), _jsxs("p", { className: "text-xs text-steel", children: ["Generated: ", new Date(regionReport.generatedAt).toLocaleString()] }), _jsxs("p", { className: "mt-2 text-sm text-ice", children: [regionReport.summary.beachesMonitored, " beaches | Avg TSI ", regionReport.summary.avgTsi.toFixed(1), " | Heavy/Severe ", regionReport.summary.heavyOrSevere] })] })) : (_jsx("p", { className: "text-sm text-steel", children: "Loading regional report..." })), _jsxs("div", { className: "mt-3", children: [_jsx("label", { className: "mb-1 block text-xs uppercase tracking-[0.15em] text-steel", children: "Beach Report Target" }), _jsx("p", { className: "text-sm text-steel", children: selectedBeachId ? `Using selected beach #${selectedBeachId}` : "Select a beach in Operations tab" })] }), beachReport ? (_jsxs("article", { className: "mt-3 rounded-lg border border-border bg-panel-hi/60 p-3", children: [_jsx("p", { className: "text-sm font-semibold text-ice", children: beachReport.beach.name }), _jsxs("p", { className: "text-xs text-steel", children: [beachReport.beach.county, " | TSI ", beachReport.beach.tsi.toFixed(1), " | ", beachReport.beach.severity] }), _jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.14em] text-steel", children: "Forecast Outlook" }), _jsx("ul", { className: "mt-1 space-y-1 text-sm text-ice", children: beachReport.forecasts.map((forecast) => (_jsxs("li", { children: [forecast.horizon, ": ", forecast.probability, "% (", forecast.expectedSeverity, ", ", forecast.confidence, "% confidence)"] }, forecast.horizon))) }), _jsx("p", { className: "mt-2 text-xs uppercase tracking-[0.14em] text-steel", children: "Recent Field Observations" }), _jsx("ul", { className: "mt-1 space-y-1 text-sm text-ice", children: beachReport.observations.slice(0, 4).map((observation) => (_jsxs("li", { children: [observation.observerName, ": ", observation.severity, " - ", observation.notes] }, observation.id))) })] })) : (_jsx("p", { className: "mt-2 text-sm text-steel", children: "Beach report will load when a beach is selected." })), _jsxs("p", { className: "mt-3 text-xs text-steel", children: ["Beaches available: ", beaches.length] })] }));
}
