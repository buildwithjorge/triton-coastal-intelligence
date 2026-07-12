import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Module: apps/web/src/components/cameras/BeachCameraIntelligence.tsx
 * Purpose: Provides a live camera center for all beaches with primary viewer and rapid switching.
 */
import { useEffect, useMemo, useState } from "react";
import { getCameraFeeds } from "../../lib/api";
export function BeachCameraIntelligence() {
    const [feeds, setFeeds] = useState([]);
    const [activeBeachId, setActiveBeachId] = useState(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getCameraFeeds()
            .then((payload) => {
            setFeeds(payload.items);
            setActiveBeachId(payload.items[0]?.beachId ?? null);
        })
            .finally(() => setLoading(false));
    }, []);
    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term)
            return feeds;
        return feeds.filter((item) => item.beachName.toLowerCase().includes(term) || item.county.toLowerCase().includes(term));
    }, [feeds, query]);
    const active = filtered.find((item) => item.beachId === activeBeachId) ?? filtered[0];
    if (loading) {
        return _jsx("section", { className: "panel rounded-2xl p-4 text-sm text-steel", children: "Loading beach camera feeds..." });
    }
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsxs("div", { className: "mb-3 flex flex-wrap items-end justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-teal", children: "Beach Camera Center" }), _jsx("h3", { className: "text-lg font-semibold", children: "Live Camera Feed Coverage" }), _jsxs("p", { className: "text-xs text-steel", children: [feeds.length, " beaches connected"] })] }), _jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search beach or county", className: "w-full rounded-md border border-border bg-panel-hi/60 px-3 py-2 text-sm text-ice md:w-72" })] }), active ? (_jsxs("article", { className: "mb-3 overflow-hidden rounded-xl border border-border bg-panel-hi/45", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border px-3 py-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-ice", children: active.beachName }), _jsxs("p", { className: "text-xs text-steel", children: [active.county, " County | ", active.provider] })] }), _jsx("span", { className: `rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.13em] ${active.health === "online" ? "border-green/30 bg-green/10 text-green" : "border-amber/35 bg-amber/10 text-amber"}`, children: active.live ? "Live" : "Offline" })] }), _jsx("iframe", { src: active.streamUrl, title: `Live camera ${active.beachName}`, className: "h-[380px] w-full", loading: "lazy", referrerPolicy: "no-referrer" })] })) : (_jsx("p", { className: "mb-3 text-sm text-steel", children: "No camera feeds found." })), _jsx("div", { className: "grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3", children: filtered.map((item) => (_jsxs("button", { type: "button", onClick: () => setActiveBeachId(item.beachId), className: `rounded-lg border p-3 text-left transition ${active?.beachId === item.beachId ? "border-teal bg-teal/10" : "border-border bg-panel-hi/45 hover:border-teal/35"}`, children: [_jsx("p", { className: "text-sm font-medium text-ice", children: item.beachName }), _jsxs("p", { className: "text-xs text-steel", children: [item.county, " County"] }), _jsxs("p", { className: "mt-1 text-[11px] text-steel", children: ["Severity: ", item.classification.severity, " | Confidence: ", item.classification.confidence, "%"] })] }, item.cameraId))) })] }));
}
