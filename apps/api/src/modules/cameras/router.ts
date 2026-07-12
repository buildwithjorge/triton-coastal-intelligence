/**
 * Module: apps/api/src/modules/cameras/router.ts
 * Purpose: Serves camera intelligence cards using backend-generated mock live data.
 */

import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const camerasRouter = Router();

camerasRouter.get("/", async (_req, res) => {
	const county = typeof _req.query.county === "string" ? _req.query.county : undefined;
	const beaches = await prisma.beach.findMany({
		where: county ? { county } : undefined,
		orderBy: [{ county: "asc" }, { lat: "desc" }]
	});

	const items = beaches.map((beach, index) => ({
		cameraId: `CAM-${String(index + 1).padStart(3, "0")}`,
		beachId: beach.id,
		beachName: beach.name,
		county: beach.county,
		streamUrl: `https://embed.windy.com/embed2.html?lat=${beach.lat}&lon=${beach.lng}&zoom=12&level=surface&overlay=satellite&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&detailLat=${beach.lat}&detailLon=${beach.lng}&metricWind=kt&metricTemp=%C2%B0F&radarRange=-1`,
		provider: "Windy Coastal Live",
		live: true,
		health: beach.severity === "Severe" ? "warning" : "online",
		classification: {
			severity: beach.severity,
			confidence: Math.max(61, Math.min(97, 58 + Math.round(beach.tsi / 2))),
			updatedAt: new Date().toISOString()
		}
	}));

	res.json({ items });
});
