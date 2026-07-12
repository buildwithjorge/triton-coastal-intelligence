/**
 * Module: apps/web/src/components/map/RegionalOperationsMap.tsx
 * Purpose: Renders a real geospatial map using live tile layers for Florida operations.
 */

import { counties, severityColors, type Beach } from "@triton/shared";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";

type Props = {
	beaches: Beach[];
	selectedBeachId?: number;
	selectedCounty: string;
	onCountyChange: (county: string) => void;
	onBeachSelect: (beachId: number) => void;
};

const floridaBounds: LatLngBoundsExpression = [
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
] as const;

function FitToBeaches({ beaches }: { beaches: Beach[] }) {
	const map = useMap();

	useEffect(() => {
		if (beaches.length === 0) {
			map.fitBounds(floridaBounds, { padding: [20, 20] });
			return;
		}

		const bounds: LatLngBoundsExpression = beaches.map((beach) => [beach.lat, beach.lng] as [number, number]);
		map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
	}, [map, beaches]);

	return null;
}

export function RegionalOperationsMap({ beaches, selectedBeachId, selectedCounty, onCountyChange, onBeachSelect }: Props) {
	const [providerIndex, setProviderIndex] = useState(0);
	const [hasLoadedTile, setHasLoadedTile] = useState(false);
	const [showTileFailureHint, setShowTileFailureHint] = useState(false);
	const visibleBeaches = useMemo(
		() => (selectedCounty === "All" ? beaches : beaches.filter((beach) => beach.county === selectedCounty)),
		[beaches, selectedCounty]
	);
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

	return (
		<section className="panel rounded-2xl p-4">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-teal">Regional Coastal Operations Map</p>
					<h2 className="text-xl font-semibold">Jupiter to Key Biscayne Live Coverage</h2>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => onCountyChange("All")}
						className={`rounded-md border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${
							selectedCounty === "All" ? "border-teal bg-teal/20 text-teal" : "border-border bg-panel-hi/70 text-steel"
						}`}
					>
						All
					</button>
					{counties.map((county) => (
						<button
							key={county}
							onClick={() => onCountyChange(county)}
							className={`rounded-md border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${
								selectedCounty === county ? "border-teal bg-teal/20 text-teal" : "border-border bg-panel-hi/70 text-steel"
							}`}
						>
							{county}
						</button>
					))}
				</div>
			</div>
			<div className="overflow-hidden rounded-xl border border-border">
				<MapContainer
					center={[27.7, -81.7]}
					zoom={6}
					style={{ height: "600px", width: "100%", background: "#0b1626" }}
					maxZoom={14}
					minZoom={5}
				>
					{REMOTE_TILES_DISABLED ? null : (
						<TileLayer
							key={activeProvider.url}
							url={activeProvider.url}
							attribution={activeProvider.attribution}
							eventHandlers={{
								tileload: () => {
									setHasLoadedTile(true);
								},
								tileerror: () => {
									setProviderIndex((current) => Math.min(current + 1, tileProviders.length - 1));
								}
							}}
						/>
					)}
					<FitToBeaches beaches={visibleBeaches} />
					{visibleBeaches.map((beach) => {
						const isSelected = beach.id === selectedBeachId;
						const isElevated = beach.severity === "Heavy" || beach.severity === "Severe";

						return (
							<Fragment key={beach.id}>
								{isElevated ? (
									<Circle
										center={[beach.lat, beach.lng]}
										radius={900}
										pathOptions={{
											color: severityColors[beach.severity],
											fillColor: severityColors[beach.severity],
											fillOpacity: 0.14,
											weight: 1.2
										}}
									/>
								) : null}
								<CircleMarker
									center={[beach.lat, beach.lng]}
									radius={isSelected ? 10 : 7}
									pathOptions={{
										color: isSelected ? "#e8f2ff" : "rgba(232,242,255,0.5)",
										weight: isSelected ? 2 : 1,
										fillColor: severityColors[beach.severity],
										fillOpacity: 0.95
									}}
									eventHandlers={{
										click: () => onBeachSelect(beach.id)
									}}
								>
									<Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
										<div className="font-mono text-xs">
											<p>{beach.shortName.toUpperCase()}</p>
											<p>TSI {beach.tsi}</p>
											<p>{beach.severity}</p>
										</div>
									</Tooltip>
								</CircleMarker>
							</Fragment>
						);
					})}
				</MapContainer>
			</div>
			{REMOTE_TILES_DISABLED ? (
				<p className="mt-2 text-xs text-steel">Basemap offline mode enabled by VITE_ENABLE_REMOTE_TILES=false.</p>
			) : (providerExhausted && !hasLoadedTile) || (showTileFailureHint && !hasLoadedTile) ? (
				<p className="mt-2 text-xs text-steel">Unable to load internet map tiles from available providers. Markers and map controls remain operational.</p>
			) : providerIndex > 0 ? (
				<p className="mt-2 text-xs text-steel">Primary map tiles were unavailable. Switched to {activeProvider.name}.</p>
			) : null}
			<div className="mt-3 grid grid-cols-2 gap-2 text-xs text-steel md:grid-cols-4">
				<span className="font-mono text-green">LOW</span>
				<span className="font-mono text-amber">MODERATE</span>
				<span className="font-mono text-orange">HEAVY</span>
				<span className="font-mono text-red">SEVERE</span>
			</div>
		</section>
	);
}
