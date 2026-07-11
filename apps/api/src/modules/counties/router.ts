/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { counties, type County } from "@triton/shared";
import { Router } from "express";
import { toBeach } from "../../lib/mappers";
import { prisma } from "../../lib/prisma";

export const countiesRouter = Router();

countiesRouter.get("/", async (_req, res) => {
	const beachRows = await prisma.beach.findMany();

	const rollups = counties.map((county) => {
		const scoped = beachRows.filter((beach) => beach.county === county);
		const beachCount = scoped.length;
		const avgTsi = beachCount === 0 ? 0 : Number((scoped.reduce((acc, beach) => acc + beach.tsi, 0) / beachCount).toFixed(1));
		const highSeverityCount = scoped.filter((beach) => beach.severity === "Heavy" || beach.severity === "Severe").length;
		const totalBiomassTons = Number(scoped.reduce((acc, beach) => acc + beach.biomassEstTons, 0).toFixed(1));
		const totalCleanupCostEst = Math.round(scoped.reduce((acc, beach) => acc + beach.cleanupCostEst, 0));
		const totalRecoverableProductValue = Math.round(scoped.reduce((acc, beach) => acc + beach.productValueEst, 0));
		const totalCrewDeployed = scoped.reduce((acc, beach) => acc + beach.crewDeployed, 0);

		return {
			county,
			beachCount,
			avgTsi,
			highSeverityCount,
			totalBiomassTons,
			totalCleanupCostEst,
			totalRecoverableProductValue,
			totalCrewDeployed
		};
	});

	res.json(rollups);
});

countiesRouter.get("/:name/beaches", async (req, res) => {
	const countyName = req.params.name;
	const normalized = decodeURIComponent(countyName) as County;
	if (!counties.includes(normalized)) {
		return res.status(404).json({ error: "County not found" });
	}

	const beaches = await prisma.beach.findMany({
		where: { county: normalized },
		orderBy: { lat: "desc" }
	});

	res.json(beaches.map(toBeach));
});
