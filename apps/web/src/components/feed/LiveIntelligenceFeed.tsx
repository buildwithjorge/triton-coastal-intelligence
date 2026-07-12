/**
 * Module: apps/web/src/components/feed/LiveIntelligenceFeed.tsx
 * Purpose: Renders right-rail operational activity and asset deployment status.
 */

import { useEffect, useMemo, useState } from "react";
import { getFeed } from "../../lib/api";
import type { FeedListResponse } from "../../types/api";

const levelClass: Record<"Critical" | "Warning" | "Info", string> = {
	Critical: "text-red",
	Warning: "text-amber",
	Info: "text-teal"
};

function agoText(input: string) {
	const ms = Date.now() - new Date(input).getTime();
	const minutes = Math.max(1, Math.floor(ms / 60000));
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}

export function LiveIntelligenceFeed() {
	const [feed, setFeed] = useState<FeedListResponse["items"]>([]);

	useEffect(() => {
		let active = true;

		const refresh = () => {
			getFeed(1, 8)
				.then((payload) => {
					if (!active) return;
					setFeed(payload.items);
				})
				.catch(() => {
					if (!active) return;
					setFeed([]);
				});
		};

		refresh();
		const timer = setInterval(refresh, 30000);

		return () => {
			active = false;
			clearInterval(timer);
		};
	}, []);

	const severeCount = useMemo(() => feed.filter((item) => item.level === "Critical").length, [feed]);

	return (
		<aside className="space-y-3">
			<section className="panel rounded-2xl p-3">
				<div className="mb-2 flex items-center justify-between">
					<p className="text-xs uppercase tracking-[0.15em] text-teal">Activity Feed</p>
					<span className="rounded border border-border bg-panel-hi/70 px-2 py-1 text-[10px] text-steel">{severeCount} critical</span>
				</div>

				<div className="space-y-2">
					{feed.map((item) => (
						<article key={item.id} className="rounded-lg border border-border bg-panel-hi/55 p-2">
							<div className="flex items-start justify-between gap-2">
								<p className={`text-[10px] font-medium uppercase tracking-[0.14em] ${levelClass[item.level]}`}>{item.level}</p>
								<p className="text-[10px] text-steel">{agoText(item.timestamp)}</p>
							</div>
							<p className="mt-1 text-sm text-ice">{item.title}</p>
							<p className="text-[11px] text-steel">{item.beachName ?? item.county ?? item.category}</p>
						</article>
					))}
					{feed.length === 0 ? <p className="text-xs text-steel">Feed unavailable.</p> : null}
				</div>
			</section>

			<section className="panel rounded-2xl p-3">
				<p className="text-xs uppercase tracking-[0.15em] text-teal">Asset Deployments</p>
				<article className="mt-2 rounded-lg border border-border bg-panel-hi/55 p-3">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-ice">Triton Harvester 01</p>
						<span className="rounded border border-green/35 bg-green/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.13em] text-green">Active</span>
					</div>
					<p className="text-xs text-steel">Deerfield Beach</p>
					<div className="mt-3 h-2 rounded-full bg-navy/70">
						<div className="h-full w-[75%] rounded-full bg-teal" />
					</div>
					<div className="mt-2 flex items-center justify-between text-xs text-steel">
						<span>ETA 12 min</span>
						<span>75%</span>
					</div>
				</article>
			</section>
		</aside>
	);
}
