import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Module: apps/web/src/components/map/RegionalOperationsMap.tsx
 * Purpose: Renders a real geospatial map using live tile layers for Florida operations.
 */
import { counties, severityColors } from "@triton/shared";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
const floridaBounds = [
    [24.3, -87.8],
    [31.2, -79.8]
];
const REMOTE_TILES_DISABLED = import.meta.env.VITE_ENABLE_REMOTE_TILES === "false";
const tileProviders = [
    {
        name: "OpenStreetMap",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap contributors"
    },
    {
        name: "CARTO Dark",
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
    }
];
function FitToBeaches({ beaches }) {
    const map = useMap();
    useEffect(() => {
        if (beaches.length === 0) {
            map.fitBounds(floridaBounds, { padding: [20, 20] });
            return;
        }
        const bounds = beaches.map((beach) => [beach.lat, beach.lng]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }, [map, beaches]);
    return null;
}
export function RegionalOperationsMap({ beaches, selectedBeachId, selectedCounty, onCountyChange, onBeachSelect }) {
    const [providerIndex, setProviderIndex] = useState(0);
    const [hasLoadedTile, setHasLoadedTile] = useState(false);
    const [showTileFailureHint, setShowTileFailureHint] = useState(false);
    const visibleBeaches = useMemo(() => (selectedCounty === "All" ? beaches : beaches.filter((beach) => beach.county === selectedCounty)), [beaches, selectedCounty]);
    const activeProvider = tileProviders[Math.min(providerIndex, tileProviders.length - 1)];
    const providerExhausted = providerIndex >= tileProviders.length - 1;
    useEffect(() => {
        if (REMOTE_TILES_DISABLED || hasLoadedTile) {
            setShowTileFailureHint(false);
            return;
        }
        const timer = window.setTimeout(() => {
            setShowTileFailureHint(true);
        }, 3500);
        return () => window.clearTimeout(timer);
    }, [hasLoadedTile]);
    return (_jsxs("section", { className: "panel rounded-2xl p-4", children: [_jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-teal", children: "Regional Coastal Operations Map" }), _jsx("h2", { className: "text-xl font-semibold", children: "Jupiter to Key Biscayne Live Coverage" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => onCountyChange("All"), className: `rounded-md border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${selectedCounty === "All" ? "border-teal bg-teal/20 text-teal" : "border-border bg-panel-hi/70 text-steel"}`, children: "All" }), counties.map((county) => (_jsx("button", { onClick: () => onCountyChange(county), className: `rounded-md border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${selectedCounty === county ? "border-teal bg-teal/20 text-teal" : "border-border bg-panel-hi/70 text-steel"}`, children: county }, county)))] })] }), _jsx("div", { className: "overflow-hidden rounded-xl border border-border", children: _jsxs(MapContainer, { center: [27.7, -81.7], zoom: 6, style: { height: "600px", width: "100%", background: "#0b1626" }, maxZoom: 14, minZoom: 5, children: [REMOTE_TILES_DISABLED ? null : (_jsx(TileLayer, { url: activeProvider.url, attribution: activeProvider.attribution, eventHandlers: {
                                tileload: () => {
                                    setHasLoadedTile(true);
                                },
                                tileerror: () => {
                                    setProviderIndex((current) => Math.min(current + 1, tileProviders.length - 1));
                                }
                            } }, activeProvider.url)), _jsx(FitToBeaches, { beaches: visibleBeaches }), visibleBeaches.map((beach) => {
                            const isSelected = beach.id === selectedBeachId;
                            const isElevated = beach.severity === "Heavy" || beach.severity === "Severe";
                            return (_jsxs(Fragment, { children: [isElevated ? (_jsx(Circle, { center: [beach.lat, beach.lng], radius: 900, pathOptions: {
                                            color: severityColors[beach.severity],
                                            fillColor: severityColors[beach.severity],
                                            fillOpacity: 0.14,
                                            weight: 1.2
                                        } })) : null, _jsx(CircleMarker, { center: [beach.lat, beach.lng], radius: isSelected ? 10 : 7, pathOptions: {
                                            color: isSelected ? "#e8f2ff" : "rgba(232,242,255,0.5)",
                                            weight: isSelected ? 2 : 1,
                                            fillColor: severityColors[beach.severity],
                                            fillOpacity: 0.95
                                        }, eventHandlers: {
                                            click: () => onBeachSelect(beach.id)
                                        }, children: _jsx(Tooltip, { direction: "top", offset: [0, -4], opacity: 0.95, children: _jsxs("div", { className: "font-mono text-xs", children: [_jsx("p", { children: beach.shortName.toUpperCase() }), _jsxs("p", { children: ["TSI ", beach.tsi] }), _jsx("p", { children: beach.severity })] }) }) })] }, beach.id));
                        })] }) }), REMOTE_TILES_DISABLED ? (_jsx("p", { className: "mt-2 text-xs text-steel", children: "Basemap offline mode enabled by VITE_ENABLE_REMOTE_TILES=false." })) : (providerExhausted && !hasLoadedTile) || (showTileFailureHint && !hasLoadedTile) ? (_jsx("p", { className: "mt-2 text-xs text-steel", children: "Unable to load internet map tiles from available providers. Markers and map controls remain operational." })) : providerIndex > 0 ? (_jsxs("p", { className: "mt-2 text-xs text-steel", children: ["Primary map tiles were unavailable. Switched to ", activeProvider.name, "."] })) : null, _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2 text-xs text-steel md:grid-cols-4", children: [_jsx("span", { className: "font-mono text-green", children: "LOW" }), _jsx("span", { className: "font-mono text-amber", children: "MODERATE" }), _jsx("span", { className: "font-mono text-orange", children: "HEAVY" }), _jsx("span", { className: "font-mono text-red", children: "SEVERE" })] })] }));
}
