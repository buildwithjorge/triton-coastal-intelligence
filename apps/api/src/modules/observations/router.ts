/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { severityOrder, type Severity } from "@triton/shared";
import { Router } from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { env } from "../../config/env";
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

const uploadPhotoSchema = z.object({
	fileName: z.string().trim().min(1).max(120),
	dataUrl: z.string().trim().min(32).max(10_000_000)
});

const mimeToExt: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/jpg": "jpg",
	"image/png": "png",
	"image/webp": "webp"
};

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

observationsRouter.post("/photos", async (req, res) => {
	const parsed = uploadPhotoSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
	}

	const { dataUrl, fileName } = parsed.data;
	const matched = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/);
	if (!matched) {
		return res.status(400).json({ error: "Invalid image data URL" });
	}

	const mime = matched[1].toLowerCase();
	const base64 = matched[2].replace(/\s+/g, "");
	const ext = mimeToExt[mime];
	if (!ext) {
		return res.status(400).json({ error: "Unsupported image type" });
	}

	const buffer = Buffer.from(base64, "base64");
	if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) {
		return res.status(400).json({ error: "Image must be between 1 byte and 5MB" });
	}

	const safeStem = path
		.basename(fileName, path.extname(fileName))
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/(^-+|-+$)/g, "")
		.slice(0, 48) || "observation";

	const storedName = `${Date.now()}-${Math.floor(Math.random() * 100000)}-${safeStem}.${ext}`;
	const photosDir = path.resolve(process.cwd(), env.uploadDir, "observations");
	await fs.mkdir(photosDir, { recursive: true });
	await fs.writeFile(path.join(photosDir, storedName), buffer);

	return res.status(201).json({
		url: `/uploads/observations/${storedName}`,
		sizeBytes: buffer.byteLength,
		mime
	});
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
