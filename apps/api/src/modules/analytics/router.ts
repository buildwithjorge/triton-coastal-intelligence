/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const analyticsRouter = Router();

analyticsRouter.get("/rankings", async (_req, res) => {
	const forecast24h = await prisma.forecast.findMany({
		where: { horizon: "24h" },
		orderBy: [{ arrivalProbability: "desc" }, { beachId: "asc" }],
		include: {
			beach: {
				select: {
					id: true,
					name: true,
					county: true,
					tsi: true,
					severity: true
				}
			}
		}
	});

	res.json(
		forecast24h.map((row) => ({
			beachId: row.beach.id,
			beachName: row.beach.name,
			county: row.beach.county,
			tsi: row.beach.tsi,
			severity: row.beach.severity,
			arrivalProbability24h: row.arrivalProbability
		}))
	);
});

analyticsRouter.get("/economics", async (_req, res) => {
	const beaches = await prisma.beach.findMany();
	const totalBiomassTons = Number(beaches.reduce((acc, beach) => acc + beach.biomassEstTons, 0).toFixed(1));
	const totalCleanupCostEst = Math.round(beaches.reduce((acc, beach) => acc + beach.cleanupCostEst, 0));
	const totalRecoverableBiomassTons = Number(beaches.reduce((acc, beach) => acc + beach.recoverableBiomassTons, 0).toFixed(1));
	const totalProductValueEst = Math.round(beaches.reduce((acc, beach) => acc + beach.productValueEst, 0));
	const netCost = totalCleanupCostEst - totalProductValueEst;

	res.json({
		totalBiomassTons,
		totalCleanupCostEst,
		totalRecoverableBiomassTons,
		totalProductValueEst,
		netCost
	});
});
