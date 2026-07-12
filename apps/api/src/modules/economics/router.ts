/**
 * Module: apps/api/src/modules/economics/router.ts
 * Purpose: Exposes biomass/cost economics metrics for beaches and the full fleet.
 */

import { contractTiers } from "@triton/shared";
import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const economicsRouter = Router();

economicsRouter.get("/", async (_req, res) => {
	const beaches = await prisma.beach.findMany();
	const totalCleanupCost = Math.round(beaches.reduce((acc, beach) => acc + beach.cleanupCostEst, 0));
	const totalProductValue = Math.round(beaches.reduce((acc, beach) => acc + beach.productValueEst, 0));
	const totalBiomass = Number(beaches.reduce((acc, beach) => acc + beach.biomassEstTons, 0).toFixed(1));
	const netCost = totalCleanupCost - totalProductValue;

	const proactiveMonthly = typeof contractTiers[2].monthlyPrice === "number" ? contractTiers[2].monthlyPrice : contractTiers[2].monthlyPrice.min;

	return res.json({
		fleet: {
			totalBiomassTons: totalBiomass,
			totalCleanupCost,
			totalProductValue,
			netCost
		},
		seasonComparison: {
			reactiveSeasonSpendEst: totalCleanupCost,
			proactiveSeasonSpendEst: proactiveMonthly * 3,
			estimatedSavings: Math.max(0, totalCleanupCost - proactiveMonthly * 3)
		}
	});
});

economicsRouter.get("/beaches/:id", async (req, res) => {
	const beachId = Number(req.params.id);
	if (!Number.isFinite(beachId)) {
		return res.status(400).json({ error: "Invalid beach id" });
	}

	const beach = await prisma.beach.findUnique({ where: { id: beachId } });
	if (!beach) {
		return res.status(404).json({ error: "Beach not found" });
	}

	return res.json({
		beachId: beach.id,
		beachName: beach.name,
		biomassEstTons: beach.biomassEstTons,
		cleanupCostEst: beach.cleanupCostEst,
		recoverableBiomassTons: beach.recoverableBiomassTons,
		productValueEst: beach.productValueEst,
		netCost: Math.round(beach.cleanupCostEst - beach.productValueEst)
	});
});
