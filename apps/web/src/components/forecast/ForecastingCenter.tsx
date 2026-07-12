/**
 * Module: apps/web/src/components/forecast/ForecastingCenter.tsx
 * Purpose: Displays multi-horizon forecast probability and explainability drivers.
 */

import { useEffect, useMemo, useState } from "react";
import { getForecastDrivers, getForecasts } from "../../lib/api";
import type { ForecastDriverTopResponse, ForecastListItem } from "../../types/api";

type Props = {
	beachId?: number;
};

export function ForecastingCenter({ beachId }: Props) {
	const [rows, setRows] = useState<ForecastListItem[]>([]);
	const [drivers, setDrivers] = useState<ForecastDriverTopResponse["drivers"]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!beachId) {
			setRows([]);
			setDrivers([]);
			return;
		}

		setLoading(true);
		Promise.all([getForecasts(beachId), getForecastDrivers(beachId)])
			.then(([forecastRows, driverRows]) => {
				setRows(forecastRows);
				setDrivers(driverRows.drivers);
			})
			.finally(() => setLoading(false));
	}, [beachId]);

	const grouped = useMemo(() => [...rows].sort((a, b) => b.arrivalProbability - a.arrivalProbability), [rows]);

	if (!beachId) {
		return <section className="panel rounded-2xl p-4 text-sm text-steel">Select a beach to view forecast intelligence.</section>;
	}

	if (loading) {
		return <section className="panel rounded-2xl p-4 text-sm text-steel">Loading forecast center...</section>;
	}

	return (
		<section className="panel rounded-2xl p-4">
			<p className="text-xs uppercase tracking-[0.18em] text-teal">Forecasting Center</p>
			<h3 className="mb-3 text-lg font-semibold">24h to 14d Arrival Intelligence</h3>

			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
				{grouped.map((row) => (
					<article key={`${row.beachId}-${row.horizon}`} className="rounded-lg border border-border bg-panel-hi/60 p-3">
						<p className="text-xs uppercase tracking-[0.16em] text-steel">{row.horizon}</p>
						<p className="mt-1 font-display text-4xl leading-none text-ice">{row.arrivalProbability}%</p>
						<div className="mt-2 h-2 rounded-full bg-navy/60">
							<div className="h-full rounded-full bg-teal" style={{ width: `${row.arrivalProbability}%` }} />
						</div>
						<p className="mt-2 text-xs text-steel">Severity: {row.expectedSeverity}</p>
						<p className="text-xs text-steel">Accumulation: {row.expectedAccumulationTons.toFixed(1)} tons</p>
						<p className="text-xs text-steel">Confidence: {row.confidence}%</p>
					</article>
				))}
			</div>

			<div className="mt-4 rounded-lg border border-border bg-panel-hi/60 p-3">
				<p className="text-xs uppercase tracking-[0.16em] text-steel">Top Forecast Drivers</p>
				<ul className="mt-2 space-y-1 text-sm text-ice">
					{drivers.slice(0, 6).map((driver, index) => (
						<li key={`${driver.label}-${index}`} className="flex items-center justify-between gap-2">
							<span>{driver.label}</span>
							<span className="font-mono text-teal">{driver.weight}% ({driver.horizon})</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
