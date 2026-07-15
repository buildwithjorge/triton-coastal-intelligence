import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { HorizonControl } from "./HorizonControl";
import { LandfallForecastList } from "./LandfallForecastList";
import { MockForecastProvider } from "./mockProvider";
import { PatchLegend } from "./PatchLegend";
import { PatchList } from "./PatchList";
import { PatchMap } from "./PatchMap";
import { horizonDays } from "./types";
const emptyDataset = {
    patches: [],
    forecasts: []
};
export function LandfallForecastPage({ onOpenBeachDashboard }) {
    const provider = useMemo(() => {
        // TODO(sargassum-live-feed): see Phase 3.
        return new MockForecastProvider();
    }, []);
    const [dataset, setDataset] = useState(emptyDataset);
    const [loading, setLoading] = useState(true);
    const [selectedHorizon, setSelectedHorizon] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true);
        provider
            .getDataset()
            .then((payload) => {
            if (!active)
                return;
            setDataset(payload);
        })
            .finally(() => {
            if (!active)
                return;
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [provider]);
    if (loading) {
        return _jsx("section", { className: "rounded-xl border border-border bg-panel-hi/55 p-4 text-sm text-steel", children: "Loading landfall forecast module..." });
    }
    return (_jsxs("section", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber/30 bg-amber/10 px-3 py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.15em] text-amber", children: "Sargassum Landfall Forecast" }), _jsx("h2", { className: "text-lg font-semibold text-ice", children: "Basin-scale patch trajectory and landfall timing" })] }), _jsx("span", { className: "rounded-md border border-amber/35 bg-amber/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.13em] text-amber", children: "Forecast model is illustrative" })] }), _jsxs("div", { className: "grid gap-3 xl:grid-cols-[280px_1fr_340px]", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(HorizonControl, { selected: selectedHorizon, onChange: setSelectedHorizon, horizons: horizonDays }), _jsx(PatchList, { patches: dataset.patches }), _jsx(PatchLegend, {})] }), _jsx(PatchMap, { patches: dataset.patches, forecasts: dataset.forecasts, selectedHorizon: selectedHorizon }), _jsx(LandfallForecastList, { forecasts: dataset.forecasts, patches: dataset.patches, onOpenBeachDashboard: onOpenBeachDashboard })] })] }));
}
