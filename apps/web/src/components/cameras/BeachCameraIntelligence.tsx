/**
 * Module: apps/web/src/components/cameras/BeachCameraIntelligence.tsx
 * Purpose: Provides a live camera center for all beaches with primary viewer and rapid switching.
 */

import { useEffect, useMemo, useState } from "react";
import { getCameraFeeds } from "../../lib/api";
import type { CameraFeedItem } from "../../types/api";

export function BeachCameraIntelligence() {
	const [feeds, setFeeds] = useState<CameraFeedItem[]>([]);
	const [activeBeachId, setActiveBeachId] = useState<number | null>(null);
	const [query, setQuery] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);

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
		if (!term) return feeds;
		return feeds.filter((item) => item.beachName.toLowerCase().includes(term) || item.county.toLowerCase().includes(term));
	}, [feeds, query]);

	const active = filtered.find((item) => item.beachId === activeBeachId) ?? filtered[0];

	if (loading) {
		return <section className="panel rounded-2xl p-4 text-sm text-steel">Loading beach camera feeds...</section>;
	}

	return (
		<section className="panel rounded-2xl p-4">
			<div className="mb-3 flex flex-wrap items-end justify-between gap-2">
				<div>
					<p className="text-xs uppercase tracking-[0.16em] text-teal">Beach Camera Center</p>
					<h3 className="text-lg font-semibold">Live Camera Feed Coverage</h3>
					<p className="text-xs text-steel">{feeds.length} beaches connected</p>
				</div>

				<input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search beach or county"
					className="w-full rounded-md border border-border bg-panel-hi/60 px-3 py-2 text-sm text-ice md:w-72"
				/>
			</div>

			{active ? (
				<article className="mb-3 overflow-hidden rounded-xl border border-border bg-panel-hi/45">
					<div className="flex items-center justify-between border-b border-border px-3 py-2">
						<div>
							<p className="text-sm font-semibold text-ice">{active.beachName}</p>
							<p className="text-xs text-steel">{active.county} County | {active.provider}</p>
						</div>
						<span className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.13em] ${active.health === "online" ? "border-green/30 bg-green/10 text-green" : "border-amber/35 bg-amber/10 text-amber"}`}>
							{active.live ? "Live" : "Offline"}
						</span>
					</div>

					<iframe
						src={active.streamUrl}
						title={`Live camera ${active.beachName}`}
						className="h-[380px] w-full"
						loading="lazy"
						referrerPolicy="no-referrer"
					/>
				</article>
			) : (
				<p className="mb-3 text-sm text-steel">No camera feeds found.</p>
			)}

			<div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
				{filtered.map((item) => (
					<button
						key={item.cameraId}
						type="button"
						onClick={() => setActiveBeachId(item.beachId)}
						className={`rounded-lg border p-3 text-left transition ${active?.beachId === item.beachId ? "border-teal bg-teal/10" : "border-border bg-panel-hi/45 hover:border-teal/35"}`}
					>
						<p className="text-sm font-medium text-ice">{item.beachName}</p>
						<p className="text-xs text-steel">{item.county} County</p>
						<p className="mt-1 text-[11px] text-steel">Severity: {item.classification.severity} | Confidence: {item.classification.confidence}%</p>
					</button>
				))}
			</div>
		</section>
	);
}
