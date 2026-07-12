/**
 * Module: apps/api/src/modules/reports/router.ts
 * Purpose: Produces report payloads for printable regional and beach intelligence views.
 */

import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const reportsRouter = Router();

reportsRouter.get("/region", async (_req, res) => {
	const [beaches, forecasts24h, feed] = await Promise.all([
		prisma.beach.findMany({ orderBy: [{ county: "asc" }, { tsi: "desc" }] }),
		prisma.forecast.findMany({ where: { horizon: "24h" }, orderBy: { arrivalProbability: "desc" }, take: 10, include: { beach: true } }),
		prisma.feedEvent.findMany({ orderBy: { timestamp: "desc" }, take: 20 })
	]);

	const avgTsi = beaches.length === 0 ? 0 : Number((beaches.reduce((acc, beach) => acc + beach.tsi, 0) / beaches.length).toFixed(1));

	res.json({
		title: "Southeast Florida Coastal Intelligence Report",
		subtitle: "Jupiter to Key Biscayne",
		generatedAt: new Date().toISOString(),
		summary: {
			beachesMonitored: beaches.length,
			avgTsi,
			heavyOrSevere: beaches.filter((beach) => beach.severity === "Heavy" || beach.severity === "Severe").length,
			totalCleanupCostEst: Math.round(beaches.reduce((acc, beach) => acc + beach.cleanupCostEst, 0))
		},
		topRisk24h: forecasts24h.map((row) => ({
			beachId: row.beachId,
			beachName: row.beach.name,
			county: row.beach.county,
			probability: row.arrivalProbability,
			expectedSeverity: row.expectedSeverity
		})),
		recentEvents: feed.map((event) => ({
			id: event.id,
			category: event.category,
			level: event.level,
			title: event.title,
			timestamp: event.timestamp.toISOString()
		}))
	});
});

reportsRouter.get("/beaches/:id", async (req, res) => {
	const beachId = Number(req.params.id);
	if (!Number.isFinite(beachId)) {
		return res.status(400).json({ error: "Invalid beach id" });
	}

	const beach = await prisma.beach.findUnique({ where: { id: beachId } });
	if (!beach) {
		return res.status(404).json({ error: "Beach not found" });
	}

	const [forecasts, history, observations] = await Promise.all([
		prisma.forecast.findMany({ where: { beachId }, orderBy: { horizon: "asc" } }),
		prisma.beachHistoryPoint.findMany({ where: { beachId }, orderBy: { date: "asc" }, take: 7 }),
		prisma.observation.findMany({ where: { beachId }, orderBy: { submittedAt: "desc" }, take: 8 })
	]);

	return res.json({
		title: `${beach.name} Intelligence Report`,
		generatedAt: new Date().toISOString(),
		beach: {
			id: beach.id,
			name: beach.name,
			county: beach.county,
			tsi: beach.tsi,
			severity: beach.severity,
			cleanupStatus: beach.cleanupStatus,
			crewDeployed: beach.crewDeployed
		},
		forecasts: forecasts.map((row) => ({
			horizon: row.horizon,
			probability: row.arrivalProbability,
			expectedSeverity: row.expectedSeverity,
			confidence: row.confidence
		})),
		history: history.map((row) => ({
			date: row.date.toISOString(),
			tsi: row.tsi
		})),
		observations: observations.map((row) => ({
			id: row.id,
			submittedAt: row.submittedAt.toISOString(),
			severity: row.severity,
			observerName: row.observerName,
			notes: row.notes
		}))
	});
});
