/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const alertsRouter = Router();

alertsRouter.get("/", async (_req, res) => {
	const alerts = await prisma.alert.findMany({
		orderBy: { timestamp: "desc" },
		include: {
			beach: { select: { name: true } }
		}
	});

	res.json(
		alerts.map((alert) => ({
			id: alert.id,
			level: alert.level,
			beachId: alert.beachId ?? undefined,
			beachName: alert.beach?.name,
			county: alert.county,
			recommendedAction: alert.recommendedAction,
			message: alert.message,
			timestamp: alert.timestamp.toISOString()
		}))
	);
});
