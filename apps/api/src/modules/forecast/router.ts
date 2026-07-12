/**
 * Module: apps/api/src/modules/forecast/router.ts
 * Purpose: Provides forecast query and explainability endpoints.
 */

import { forecastHorizons } from "@triton/shared";
import { Router } from "express";
import { toForecast } from "../../lib/mappers";
import { prisma } from "../../lib/prisma";

export const forecastRouter = Router();

function parseDrivers(raw: string): Array<{ label: string; weight: number }> {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.filter((item): item is { label: string; weight: number } => {
				return (
					typeof item === "object" &&
					item !== null &&
					"label" in item &&
					"weight" in item &&
					typeof (item as { label: unknown }).label === "string" &&
					typeof (item as { weight: unknown }).weight === "number"
				);
			})
			.map((item) => ({ label: item.label, weight: item.weight }));
	} catch {
		return [];
	}
}

forecastRouter.get("/", async (req, res) => {
	const beachId = Number(req.query.beachId);
	const horizonRaw = typeof req.query.horizon === "string" ? req.query.horizon : undefined;
	const horizon = forecastHorizons.find((item) => item === horizonRaw);

	if (horizonRaw && !horizon) {
		return res.status(400).json({ error: "Invalid horizon filter" });
	}

	const rows = await prisma.forecast.findMany({
		where: {
			beachId: Number.isFinite(beachId) ? beachId : undefined,
			horizon
		},
		include: {
			beach: {
				select: {
					name: true,
					county: true
				}
			}
		},
		orderBy: [{ beachId: "asc" }, { horizon: "asc" }]
	});

	return res.json(
		rows.map((row) => ({
			...toForecast(row),
			beachName: row.beach.name,
			county: row.beach.county
		}))
	);
});

forecastRouter.get("/drivers/top", async (req, res) => {
	const beachId = Number(req.query.beachId);
	if (!Number.isFinite(beachId)) {
		return res.status(400).json({ error: "beachId query parameter is required" });
	}

	const forecasts = await prisma.forecast.findMany({
		where: { beachId },
		orderBy: { horizon: "asc" }
	});

	const ranked = forecasts
		.flatMap((forecast) =>
			parseDrivers(forecast.drivers).map((driver) => ({
				horizon: forecast.horizon,
				label: driver.label,
				weight: driver.weight
			}))
		)
		.sort((a, b) => b.weight - a.weight)
		.slice(0, 10);

	return res.json({ beachId, drivers: ranked });
});
