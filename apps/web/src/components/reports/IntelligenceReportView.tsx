/**
 * Module: apps/web/src/components/reports/IntelligenceReportView.tsx
 * Purpose: Displays regional and beach-level report payloads from report endpoints.
 */

import type { Beach } from "@triton/shared";
import { useEffect, useState } from "react";
import { getBeachReport, getRegionReport } from "../../lib/api";
import type { BeachReportResponse, RegionReportResponse } from "../../types/api";

type Props = {
	beaches: Beach[];
	selectedBeachId?: number;
};

export function IntelligenceReportView({ beaches, selectedBeachId }: Props) {
	const [regionReport, setRegionReport] = useState<RegionReportResponse | null>(null);
	const [beachReport, setBeachReport] = useState<BeachReportResponse | null>(null);

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

	return (
		<section className="panel rounded-2xl p-4">
			<p className="text-xs uppercase tracking-[0.18em] text-teal">Intelligence Reports</p>
			<h3 className="mb-3 text-lg font-semibold">Printable Regional and Beach Reports</h3>

			{regionReport ? (
				<article className="rounded-lg border border-border bg-panel-hi/60 p-3">
					<p className="text-sm uppercase tracking-[0.16em] text-steel">Regional Report</p>
					<p className="mt-1 text-base font-semibold text-ice">{regionReport.title}</p>
					<p className="text-xs text-steel">Generated: {new Date(regionReport.generatedAt).toLocaleString()}</p>
					<p className="mt-2 text-sm text-ice">
						{regionReport.summary.beachesMonitored} beaches | Avg TSI {regionReport.summary.avgTsi.toFixed(1)} | Heavy/Severe {regionReport.summary.heavyOrSevere}
					</p>
				</article>
			) : (
				<p className="text-sm text-steel">Loading regional report...</p>
			)}

			<div className="mt-3">
				<label className="mb-1 block text-xs uppercase tracking-[0.15em] text-steel">Beach Report Target</label>
				<p className="text-sm text-steel">{selectedBeachId ? `Using selected beach #${selectedBeachId}` : "Select a beach in Operations tab"}</p>
			</div>

			{beachReport ? (
				<article className="mt-3 rounded-lg border border-border bg-panel-hi/60 p-3">
					<p className="text-sm font-semibold text-ice">{beachReport.beach.name}</p>
					<p className="text-xs text-steel">
						{beachReport.beach.county} | TSI {beachReport.beach.tsi.toFixed(1)} | {beachReport.beach.severity}
					</p>
					<p className="mt-2 text-xs uppercase tracking-[0.14em] text-steel">Forecast Outlook</p>
					<ul className="mt-1 space-y-1 text-sm text-ice">
						{beachReport.forecasts.map((forecast) => (
							<li key={forecast.horizon}>
								{forecast.horizon}: {forecast.probability}% ({forecast.expectedSeverity}, {forecast.confidence}% confidence)
							</li>
						))}
					</ul>
					<p className="mt-2 text-xs uppercase tracking-[0.14em] text-steel">Recent Field Observations</p>
					<ul className="mt-1 space-y-1 text-sm text-ice">
						{beachReport.observations.slice(0, 4).map((observation) => (
							<li key={observation.id}>
								{observation.observerName}: {observation.severity} - {observation.notes}
							</li>
						))}
					</ul>
				</article>
			) : (
				<p className="mt-2 text-sm text-steel">Beach report will load when a beach is selected.</p>
			)}

			<p className="mt-3 text-xs text-steel">Beaches available: {beaches.length}</p>
		</section>
	);
}
