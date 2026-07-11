/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { counties, severityColors, type Beach } from "@triton/shared";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
	beaches: Beach[];
	selectedBeachId?: number;
	selectedCounty: string;
	onCountyChange: (county: string) => void;
	onBeachSelect: (beachId: number) => void;
};

type Marker = { beachId: number; x: number; y: number; tsi: number; severity: Beach["severity"]; shortName: string };

const canvasWidth = 900;
const canvasHeight = 600;

export function RegionalOperationsMap({ beaches, selectedBeachId, selectedCounty, onCountyChange, onBeachSelect }: Props) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [hoveredBeachId, setHoveredBeachId] = useState<number | undefined>(undefined);

	const visibleBeaches = useMemo(
		() => (selectedCounty === "All" ? beaches : beaches.filter((beach) => beach.county === selectedCounty)),
		[beaches, selectedCounty]
	);

	const markers = useMemo<Marker[]>(() => {
		if (visibleBeaches.length === 0) return [];
		const lats = visibleBeaches.map((beach) => beach.lat);
		const lngs = visibleBeaches.map((beach) => beach.lng);
		const minLat = Math.min(...lats) - 0.04;
		const maxLat = Math.max(...lats) + 0.04;
		const minLng = Math.min(...lngs) - 0.045;
		const maxLng = Math.max(...lngs) + 0.035;

		return visibleBeaches.map((beach) => {
			const x = 46 + ((beach.lng - minLng) / (maxLng - minLng)) * (canvasWidth - 92);
			const y = 42 + (1 - (beach.lat - minLat) / (maxLat - minLat)) * (canvasHeight - 84);
			return {
				beachId: beach.id,
				x,
				y,
				tsi: beach.tsi,
				severity: beach.severity,
				shortName: beach.shortName
			};
		});
	}, [visibleBeaches]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrame = 0;
		const render = (time: number) => {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);

			const bg = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
			bg.addColorStop(0, "#06142b");
			bg.addColorStop(1, "#0a1e3d");
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);

			ctx.strokeStyle = "rgba(0, 212, 184, 0.16)";
			ctx.lineWidth = 1;
			for (let i = 0; i < 12; i += 1) {
				const y = 50 + i * 46;
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(canvasWidth, y);
				ctx.stroke();
			}

			if (markers.length > 1) {
				const sorted = [...markers].sort((a, b) => b.y - a.y);
				ctx.beginPath();
				ctx.strokeStyle = "rgba(0,212,184,0.32)";
				ctx.lineWidth = 2.5;
				ctx.moveTo(sorted[0].x, sorted[0].y);
				sorted.slice(1).forEach((marker) => {
					ctx.lineTo(marker.x, marker.y);
				});
				ctx.stroke();
			}

			markers.forEach((marker) => {
				const isSelected = marker.beachId === selectedBeachId;
				const isHovered = marker.beachId === hoveredBeachId;
				const isElevated = marker.severity === "Heavy" || marker.severity === "Severe";

				if (isElevated) {
					const pulse = 8 + Math.sin(time / 470) * 3;
					ctx.beginPath();
					ctx.arc(marker.x, marker.y, 13 + pulse, 0, Math.PI * 2);
					ctx.fillStyle = marker.severity === "Severe" ? "rgba(255,59,92,0.14)" : "rgba(255,107,43,0.16)";
					ctx.fill();
				}

				ctx.beginPath();
				ctx.arc(marker.x, marker.y, isSelected ? 8 : isHovered ? 7 : 6, 0, Math.PI * 2);
				ctx.fillStyle = severityColors[marker.severity];
				ctx.fill();

				ctx.beginPath();
				ctx.arc(marker.x, marker.y, isSelected ? 12 : 10, 0, Math.PI * 2);
				ctx.strokeStyle = isSelected ? "rgba(232,242,255,0.95)" : "rgba(232,242,255,0.35)";
				ctx.lineWidth = 1.4;
				ctx.stroke();
			});

			const activeMarker = markers.find((m) => m.beachId === (hoveredBeachId ?? selectedBeachId));
			if (activeMarker) {
				ctx.fillStyle = "rgba(5,13,30,0.92)";
				ctx.strokeStyle = "rgba(0,212,184,0.35)";
				ctx.lineWidth = 1;
				ctx.beginPath();
				const tooltipX = activeMarker.x + 12;
				const tooltipY = activeMarker.y - 44;
				const w = 160;
				const h = 38;
				ctx.roundRect(tooltipX, tooltipY, w, h, 6);
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = "#e8f2ff";
				ctx.font = "500 12px JetBrains Mono";
				ctx.fillText(activeMarker.shortName.toUpperCase(), tooltipX + 10, tooltipY + 16);
				ctx.font = "700 12px JetBrains Mono";
				ctx.fillStyle = severityColors[activeMarker.severity];
				ctx.fillText(`TSI ${activeMarker.tsi}`, tooltipX + 10, tooltipY + 30);
			}

			animationFrame = requestAnimationFrame(render);
		};

		animationFrame = requestAnimationFrame(render);
		return () => cancelAnimationFrame(animationFrame);
	}, [markers, selectedBeachId, hoveredBeachId]);

	const getBeachAt = (x: number, y: number) => {
		return markers.find((marker) => {
			const dx = marker.x - x;
			const dy = marker.y - y;
			return Math.sqrt(dx * dx + dy * dy) <= 14;
		});
	};

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
			<canvas
				ref={canvasRef}
				width={canvasWidth}
				height={canvasHeight}
				className="w-full rounded-xl border border-border bg-panel-hi/40"
				onMouseMove={(event) => {
					const rect = event.currentTarget.getBoundingClientRect();
					const scaleX = canvasWidth / rect.width;
					const scaleY = canvasHeight / rect.height;
					const x = (event.clientX - rect.left) * scaleX;
					const y = (event.clientY - rect.top) * scaleY;
					setHoveredBeachId(getBeachAt(x, y)?.beachId);
				}}
				onMouseLeave={() => setHoveredBeachId(undefined)}
				onClick={(event) => {
					const rect = event.currentTarget.getBoundingClientRect();
					const scaleX = canvasWidth / rect.width;
					const scaleY = canvasHeight / rect.height;
					const x = (event.clientX - rect.left) * scaleX;
					const y = (event.clientY - rect.top) * scaleY;
					const selected = getBeachAt(x, y);
					if (selected) onBeachSelect(selected.beachId);
				}}
			/>
			<div className="mt-3 grid grid-cols-2 gap-2 text-xs text-steel md:grid-cols-4">
				<span className="font-mono text-green">LOW</span>
				<span className="font-mono text-amber">MODERATE</span>
				<span className="font-mono text-orange">HEAVY</span>
				<span className="font-mono text-red">SEVERE</span>
			</div>
		</section>
	);
}
