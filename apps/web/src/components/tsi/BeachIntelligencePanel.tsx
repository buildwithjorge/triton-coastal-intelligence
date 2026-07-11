/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { severityColors, type Beach } from "@triton/shared";
import { Area, AreaChart, CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BeachDetailResponse } from "../../types/api";
import { TsiArcGauge } from "../common/TsiArcGauge";

type Props = {
	detail: BeachDetailResponse | null;
	loading: boolean;
};

const monthLabel: Record<number, string> = {
	1: "Jan",
	2: "Feb",
	3: "Mar",
	4: "Apr",
	5: "May",
	6: "Jun",
	7: "Jul",
	8: "Aug",
	9: "Sep",
	10: "Oct",
	11: "Nov",
	12: "Dec"
};

function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="panel rounded-lg px-3 py-2">
			<p className="text-[10px] uppercase tracking-[0.18em] text-steel">{label}</p>
			<p className="mt-1 font-mono text-sm text-ice">{value}</p>
		</div>
	);
}

export function BeachIntelligencePanel({ detail, loading }: Props) {
	if (loading) {
		return (
			<section className="panel h-full rounded-2xl p-4">
				<div className="flex items-center gap-3">
					<span className="live-dot" />
					<p className="text-xs uppercase tracking-[0.2em] text-teal">Loading beach intelligence</p>
				</div>
			</section>
		);
	}

	if (!detail) {
		return (
			<section className="panel h-full rounded-2xl p-4">
				<p className="text-xs uppercase tracking-[0.2em] text-steel">Select a beach marker to load intelligence.</p>
			</section>
		);
	}

	const { beach, history7d, seasonal12m, forecasts, observations } = detail;
	const forecast24h = forecasts.find((item) => item.horizon === "24h");
	const radarData = (forecast24h?.drivers ?? []).map((driver) => ({ signal: driver.label, weight: driver.weight }));

	return (
		<section className="panel rounded-2xl p-4">
			<div className="mb-3 flex items-start justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-teal">Beach Intelligence</p>
					<h2 className="text-xl font-semibold">{beach.name}</h2>
					<p className="text-sm text-steel">{beach.county} County</p>
				</div>
				<div className="rounded-md border border-border bg-panel-hi/70 px-3 py-2">
					<p className="font-mono text-xs uppercase tracking-[0.12em]" style={{ color: severityColors[beach.severity as Beach["severity"]] }}>
						{beach.severity}
					</p>
				</div>
			</div>

			<div className="grid gap-4 xl:grid-cols-[260px_1fr]">
				<div className="panel rounded-xl p-3">
					<TsiArcGauge tsi={beach.tsi} severity={beach.severity} size={220} />
					<div className="mt-2 grid grid-cols-2 gap-2">
						<Stat label="Wind" value={`${beach.wind.direction} ${beach.wind.speed} kt`} />
						<Stat label="Wave" value={`${beach.waveHeight.toFixed(1)} m`} />
						<Stat label="Tide" value={beach.tide} />
						<Stat label="Cleanup" value={beach.cleanupStatus} />
					</div>
				</div>

				<div className="grid gap-4">
					<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
						<Stat label="Trend 7D" value={`${beach.trend7d > 0 ? "+" : ""}${beach.trend7d}`} />
						<Stat label="Biomass" value={`${beach.biomassEstTons.toFixed(1)} tons`} />
						<Stat label="Cleanup Cost" value={`$${beach.cleanupCostEst.toLocaleString()}`} />
						<Stat label="Product Value" value={`$${beach.productValueEst.toLocaleString()}`} />
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<div className="panel rounded-xl p-3">
							<p className="mb-2 text-xs uppercase tracking-[0.16em] text-steel">7-Day TSI Trend</p>
							<div className="h-44">
								<ResponsiveContainer>
									<LineChart data={history7d.map((p) => ({ date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), tsi: p.tsi }))}>
										<CartesianGrid stroke="rgba(74,122,155,0.2)" />
										<XAxis dataKey="date" stroke="#4a7a9b" fontSize={11} />
										<YAxis stroke="#4a7a9b" domain={[0, 100]} fontSize={11} />
										<Tooltip />
										<Line type="monotone" dataKey="tsi" stroke="#00d4b8" strokeWidth={2.5} dot={{ r: 3 }} />
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>

						<div className="panel rounded-xl p-3">
							<p className="mb-2 text-xs uppercase tracking-[0.16em] text-steel">12-Month Seasonal Pattern</p>
							<div className="h-44">
								<ResponsiveContainer>
									<AreaChart data={seasonal12m.map((p) => ({ month: monthLabel[p.month] ?? String(p.month), tsi: p.avgTsi }))}>
										<CartesianGrid stroke="rgba(74,122,155,0.2)" />
										<XAxis dataKey="month" stroke="#4a7a9b" fontSize={11} />
										<YAxis stroke="#4a7a9b" domain={[0, 100]} fontSize={11} />
										<Tooltip />
										<Area type="monotone" dataKey="tsi" stroke="#f5a623" fill="rgba(245,166,35,0.32)" />
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<div className="panel rounded-xl p-3">
							<p className="mb-2 text-xs uppercase tracking-[0.16em] text-steel">Forecast Drivers (24h)</p>
							<div className="h-44">
								<ResponsiveContainer>
									<RadarChart data={radarData} outerRadius={80}>
										<PolarGrid stroke="rgba(74,122,155,0.25)" />
										<PolarAngleAxis dataKey="signal" tick={{ fill: "#9ac0d8", fontSize: 10 }} />
										<Radar name="Signal" dataKey="weight" stroke="#00d4b8" fill="#00d4b8" fillOpacity={0.35} />
									</RadarChart>
								</ResponsiveContainer>
							</div>
						</div>

						<div className="panel rounded-xl p-3">
							<p className="mb-2 text-xs uppercase tracking-[0.16em] text-steel">Latest Field Observations</p>
							<div className="space-y-2 overflow-auto pr-1" style={{ maxHeight: 176 }}>
								{observations.slice(0, 4).map((observation) => (
									<article key={observation.id} className="rounded-md border border-border bg-panel-hi/60 p-2">
										<div className="flex justify-between gap-2">
											<p className="font-mono text-xs text-ice">{observation.observerName}</p>
											<p className="font-mono text-[10px] text-steel">{new Date(observation.submittedAt).toLocaleString()}</p>
										</div>
										<p className="mt-1 text-xs text-steel">{observation.notes}</p>
									</article>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
