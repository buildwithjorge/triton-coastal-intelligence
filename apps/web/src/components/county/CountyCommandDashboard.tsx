/**
 * Module: apps/web/src/components/county/CountyCommandDashboard.tsx
 * Purpose: Surfaces county-level KPIs for municipal command decision support.
 */

import { useEffect, useState } from "react";
import { getCountyRollups } from "../../lib/api";
import type { CountyRollupResponse } from "../../types/api";

export function CountyCommandDashboard() {
	const [rows, setRows] = useState<CountyRollupResponse[]>([]);

	useEffect(() => {
		getCountyRollups().then(setRows);
	}, []);

	return (
		<section className="panel rounded-2xl p-4">
			<p className="text-xs uppercase tracking-[0.18em] text-teal">County Command Dashboard</p>
			<h3 className="mb-3 text-lg font-semibold">Cross-County Operational Posture</h3>

			<div className="overflow-x-auto">
				<table className="w-full min-w-[760px] text-left text-sm">
					<thead className="text-xs uppercase tracking-[0.13em] text-steel">
						<tr>
							<th className="pb-2">County</th>
							<th className="pb-2">Beaches</th>
							<th className="pb-2">Avg TSI</th>
							<th className="pb-2">Heavy/Severe</th>
							<th className="pb-2">Biomass (tons)</th>
							<th className="pb-2">Cleanup Cost</th>
							<th className="pb-2">Value Recovery</th>
							<th className="pb-2">Crew</th>
						</tr>
					</thead>
					<tbody className="text-ice">
						{rows.map((row) => (
							<tr key={row.county} className="border-t border-border/80">
								<td className="py-2 font-medium">{row.county}</td>
								<td className="py-2">{row.beachCount}</td>
								<td className="py-2">{row.avgTsi.toFixed(1)}</td>
								<td className="py-2">{row.highSeverityCount}</td>
								<td className="py-2">{row.totalBiomassTons.toFixed(1)}</td>
								<td className="py-2">${Math.round(row.totalCleanupCostEst).toLocaleString()}</td>
								<td className="py-2">${Math.round(row.totalRecoverableProductValue).toLocaleString()}</td>
								<td className="py-2">{row.totalCrewDeployed}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
