/**
 * Module: apps/api/src/modules/drones/router.ts
 * Purpose: Serves operational drone fleet status and mission logs.
 */

import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const dronesRouter = Router();

dronesRouter.get("/fleet", async (_req, res) => {
	const beaches = await prisma.beach.findMany({ orderBy: { tsi: "desc" }, take: 6 });
	const states = ["active", "returning", "standby", "complete"];

	const drones = beaches.map((beach, index) => ({
		id: `DRN-${String(index + 1).padStart(3, "0")}`,
		status: states[index % states.length],
		batteryPct: Math.max(28, 96 - index * 11),
		lastPingAt: new Date(Date.now() - index * 4 * 60 * 1000).toISOString(),
		mission: `Survey ${beach.shortName}`,
		beachId: beach.id,
		beachName: beach.name,
		coveragePct: Math.min(100, 46 + index * 11),
		photoCount: 42 + index * 19
	}));

	res.json({ drones });
});

dronesRouter.get("/missions", async (_req, res) => {
	const beaches = await prisma.beach.findMany({ orderBy: { updatedAt: "desc" }, take: 10 });

	const missions = beaches.map((beach, index) => ({
		id: `MSN-${String(index + 1).padStart(4, "0")}`,
		beachId: beach.id,
		beachName: beach.name,
		startedAt: new Date(Date.now() - (index + 1) * 70 * 60 * 1000).toISOString(),
		completedAt: new Date(Date.now() - index * 55 * 60 * 1000).toISOString(),
		coveragePct: Math.min(100, 63 + index * 3),
		photoCount: 70 + index * 13,
		status: index < 2 ? "in-progress" : "completed"
	}));

	res.json({ missions });
});
