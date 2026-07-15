import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Module: apps/web/src/components/forecast/SargassumSirMap.tsx
 * Purpose: Hosts NOAA SIR access in-platform with a reliable external fallback.
 */
const NOAA_SIR_URL = "https://cwcgom.aoml.noaa.gov/SIR/";
export function SargassumSirMap() {
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsxs("div", { className: "mb-3 flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.16em] text-teal", children: "NOAA SIR" }), _jsx("h3", { className: "text-lg font-semibold", children: "Sargassum Inundation Report Map" }), _jsx("p", { className: "text-xs text-steel", children: "NOAA serves this page with SAMEORIGIN framing restrictions, so in-app embedding may be blocked by the browser." })] }), _jsx("a", { href: NOAA_SIR_URL, target: "_blank", rel: "noreferrer noopener", className: "rounded-md border border-teal bg-teal/20 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-teal", children: "Open NOAA SIR" })] }), _jsx("div", { className: "rounded-xl border border-border bg-panel-hi/45 p-3", children: _jsx("iframe", { src: NOAA_SIR_URL, title: "NOAA Sargassum Inundation Report", className: "h-[72vh] min-h-[560px] w-full rounded-lg border border-border", loading: "lazy", referrerPolicy: "no-referrer" }) }), _jsx("p", { className: "mt-2 text-xs text-steel", children: "If the frame stays blank, use the \"Open NOAA SIR\" button above. That is expected behavior when NOAA frame protections are enforced." })] }));
}
