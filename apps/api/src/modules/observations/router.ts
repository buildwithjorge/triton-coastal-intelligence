import { severityOrder, type Severity } from "@triton/shared";
import { Router } from "express";
import { z } from "zod";
import { deriveSeverity, mergeSeverityIntoTsi, toObservation } from "../../lib/mappers";
import { prisma } from "../../lib/prisma";

export const observationsRouter = Router();

const createObservationSchema = z.object({
	beachId: z.number().int().positive(),
	observerName: z.string().trim().min(2).max(80),
	severity: z.custom<Severity>((value) => typeof value === "string" && severityOrder.includes(value as Severity), {
		message: "Invalid severity"
	}),
	notes: z.string().trim().min(4).max(1000),
	hasPhoto: z.boolean().optional().default(false),
	photoUrl: z.string().url().optional(),
	lat: z.number(),
	lng: z.number()
});

observationsRouter.get("/", async (req, res) => {
	const beachId = Number(req.query.beachId);
	if (!Number.isFinite(beachId)) {
		return res.status(400).json({ error: "beachId query parameter is required" });
	}

	const observations = await prisma.observation.findMany({
		where: { beachId },
		orderBy: { submittedAt: "desc" }
	});

	res.json(observations.map(toObservation));
});

observationsRouter.post("/", async (req, res) => {
	const parsed = createObservationSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
	}

	const payload = parsed.data;
	const beach = await prisma.beach.findUnique({ where: { id: payload.beachId } });
	if (!beach) {
		return res.status(404).json({ error: "Beach not found" });
	}

	const timestamp = new Date();
	const id = `OBS-${timestamp.getUTCFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

	const observation = await prisma.observation.create({
		data: {
			id,
			beachId: payload.beachId,
			submittedAt: timestamp,
			observerName: payload.observerName,
			severity: payload.severity,
			notes: payload.notes,
			hasPhoto: payload.hasPhoto,
			photoUrl: payload.photoUrl ?? null,
			lat: payload.lat,
			lng: payload.lng
		}
	});

	const nextTsi = mergeSeverityIntoTsi(beach.tsi, payload.severity);
	await prisma.beach.update({
		where: { id: payload.beachId },
		data: {
			tsi: nextTsi,
			severity: deriveSeverity(nextTsi),
			lastObservedAt: timestamp,
			trend7d: Math.max(-15, Math.min(15, beach.trend7d + (nextTsi - beach.tsi)))
		}
	});

	await prisma.feedEvent.create({
		data: {
			id: `FEED-OBS-${observation.id}`,
			timestamp,
			category: "Field Observation",
			level: payload.severity === "Severe" ? "Critical" : payload.severity === "Heavy" ? "Warning" : "Info",
			beachId: payload.beachId,
			county: beach.county,
			title: `New field observation from ${payload.observerName}`,
			description: payload.notes
		}
	});

	return res.status(201).json(toObservation(observation));
});
