import { Router } from "express";
import { toBeach, toForecast, toObservation } from "../../lib/mappers";
import { prisma } from "../../lib/prisma";

export const beachesRouter = Router();
const horizonOrder = ["24h", "48h", "72h", "7d", "14d"];

beachesRouter.get("/", async (req, res) => {
	const county = typeof req.query.county === "string" ? req.query.county : undefined;
	const beaches = await prisma.beach.findMany({
		where: county ? { county } : undefined,
		orderBy: [{ county: "asc" }, { lat: "desc" }]
	});

	res.json(beaches.map(toBeach));
});

beachesRouter.get("/:id", async (req, res) => {
	const beachId = Number(req.params.id);
	if (!Number.isFinite(beachId)) {
		return res.status(400).json({ error: "Invalid beach id" });
	}

	const beach = await prisma.beach.findUnique({ where: { id: beachId } });
	if (!beach) {
		return res.status(404).json({ error: "Beach not found" });
	}

	const [forecasts, history, seasonal, observations] = await Promise.all([
		prisma.forecast.findMany({ where: { beachId } }),
		prisma.beachHistoryPoint.findMany({ where: { beachId }, orderBy: { date: "asc" } }),
		prisma.beachSeasonalPoint.findMany({ where: { beachId }, orderBy: { month: "asc" } }),
		prisma.observation.findMany({ where: { beachId }, orderBy: { submittedAt: "desc" }, take: 20 })
	]);

	res.json({
		beach: toBeach(beach),
		forecasts: forecasts
			.sort((a, b) => horizonOrder.indexOf(a.horizon) - horizonOrder.indexOf(b.horizon))
			.map(toForecast),
		history7d: history.map((point) => ({
			beachId,
			date: point.date.toISOString(),
			tsi: point.tsi
		})),
		seasonal12m: seasonal.map((point) => ({
			beachId,
			month: point.month,
			avgTsi: point.avgTsi
		})),
		observations: observations.map(toObservation)
	});
});

beachesRouter.get("/:id/forecast", async (req, res) => {
	const beachId = Number(req.params.id);
	if (!Number.isFinite(beachId)) {
		return res.status(400).json({ error: "Invalid beach id" });
	}

	const forecasts = await prisma.forecast.findMany({
		where: { beachId }
	});

	res.json(forecasts.sort((a, b) => horizonOrder.indexOf(a.horizon) - horizonOrder.indexOf(b.horizon)).map(toForecast));
});
