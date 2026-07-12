/**
 * Module: apps/api/prisma/seed.ts
 * Purpose: Seeds a realistic operational dataset for Triton Coastal Intelligence.
 *
 * This script creates the complete regional baseline used by the UI and API:
 * - 23 beaches from Jupiter to Virginia Key
 * - 7-day history and 12-month seasonal baselines
 * - Forecasts, observations, feed events, and alerts
 *
 * The values are deterministic enough for repeatable demos/tests while still
 * looking realistic for municipal operations workflows.
 */

import { PrismaClient } from "@prisma/client";
import { contractTiers, counties, forecastHorizons, severityFromTsi, type County, type ForecastHorizon, type Severity } from "@triton/shared";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
// Load root-level environment variables for DATABASE_URL and related settings.
dotenv.config({ path: path.resolve(currentDir, "../../../.env") });
dotenv.config();

const prisma = new PrismaClient();

// Minimal source record used to derive all related seeded entities.
type SeedBeach = {
	name: string;
	shortName: string;
	county: County;
	lat: number;
	lng: number;
	tsi: number;
};

// Canonical beach list in north-to-south order with an intentional
// severity gradient (lower Palm Beach, peak Broward, taper Miami-Dade).
const beaches: SeedBeach[] = [
	{ name: "Jupiter Beach", shortName: "Jupiter", county: "Palm Beach", lat: 26.9342, lng: -80.0729, tsi: 18 },
	{ name: "Juno Beach", shortName: "Juno", county: "Palm Beach", lat: 26.8798, lng: -80.0559, tsi: 21 },
	{ name: "Riviera Beach", shortName: "Riviera", county: "Palm Beach", lat: 26.7862, lng: -80.0342, tsi: 24 },
	{ name: "Palm Beach", shortName: "Palm Beach", county: "Palm Beach", lat: 26.7153, lng: -80.0364, tsi: 29 },
	{ name: "Lake Worth Beach", shortName: "Lake Worth", county: "Palm Beach", lat: 26.6159, lng: -80.0351, tsi: 34 },
	{ name: "Lantana Beach", shortName: "Lantana", county: "Palm Beach", lat: 26.5845, lng: -80.0388, tsi: 36 },
	{ name: "Boynton Beach", shortName: "Boynton", county: "Palm Beach", lat: 26.5268, lng: -80.0542, tsi: 40 },
	{ name: "Delray Beach", shortName: "Delray", county: "Palm Beach", lat: 26.4519, lng: -80.0586, tsi: 43 },
	{ name: "Boca Raton Beach", shortName: "Boca Raton", county: "Palm Beach", lat: 26.3464, lng: -80.0728, tsi: 47 },
	{ name: "Deerfield Beach", shortName: "Deerfield", county: "Broward", lat: 26.3184, lng: -80.0701, tsi: 56 },
	{ name: "Pompano Beach", shortName: "Pompano", county: "Broward", lat: 26.2379, lng: -80.0905, tsi: 60 },
	{ name: "Lauderdale-by-the-Sea", shortName: "LBTS", county: "Broward", lat: 26.1901, lng: -80.0953, tsi: 66 },
	{ name: "Fort Lauderdale Beach", shortName: "Ft Lauderdale", county: "Broward", lat: 26.1224, lng: -80.1031, tsi: 71 },
	{ name: "Dania Beach", shortName: "Dania", county: "Broward", lat: 26.0547, lng: -80.1101, tsi: 74 },
	{ name: "Hollywood Beach", shortName: "Hollywood", county: "Broward", lat: 26.0112, lng: -80.1175, tsi: 82 },
	{ name: "Hallandale Beach", shortName: "Hallandale", county: "Broward", lat: 25.9862, lng: -80.1187, tsi: 78 },
	{ name: "Sunny Isles Beach", shortName: "Sunny Isles", county: "Miami-Dade", lat: 25.9343, lng: -80.1212, tsi: 68 },
	{ name: "Bal Harbour", shortName: "Bal Harbour", county: "Miami-Dade", lat: 25.8918, lng: -80.1224, tsi: 62 },
	{ name: "Surfside", shortName: "Surfside", county: "Miami-Dade", lat: 25.8771, lng: -80.1218, tsi: 59 },
	{ name: "Miami Beach (North)", shortName: "MB North", county: "Miami-Dade", lat: 25.8472, lng: -80.1203, tsi: 54 },
	{ name: "Miami Beach (South)", shortName: "MB South", county: "Miami-Dade", lat: 25.7825, lng: -80.1317, tsi: 49 },
	{ name: "Key Biscayne", shortName: "Key Biscayne", county: "Miami-Dade", lat: 25.6931, lng: -80.1579, tsi: 38 },
	{ name: "Virginia Key", shortName: "Virginia Key", county: "Miami-Dade", lat: 25.7367, lng: -80.1575, tsi: 44 }
];

// Small lookup pools used to rotate operational conditions across beaches.
const windDirections = ["NNE", "NE", "ENE", "E", "ESE", "SE"];
const tides = ["Rising", "Falling", "High", "Low"] as const;
const cleanupStatuses = ["Clear", "Monitoring", "Scheduled", "Active", "Emergency"] as const;
const feedCategories = ["Drone Survey", "Cleanup Dispatch", "Wind Shift", "Offshore Patch", "Forecast Update", "Field Observation"] as const;

// Utility guardrail used throughout seeding to keep generated values
// within realistic ranges expected by the app and charts.
function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

// Seasonal factor model:
// - Peak months (May-Sep) increase baseline severity
// - Shoulder months (Apr/Oct) slightly elevated
// - Winter trough (Dec-Feb) reduced pressure
function monthSeasonFactor(month: number): number {
	if (month >= 5 && month <= 9) return 1.22;
	if (month === 4 || month === 10) return 1.05;
	if (month >= 12 || month <= 2) return 0.7;
	return 0.88;
}

// Horizon multipliers simulate rising uncertainty/arrival pressure over time.
function forecastBoost(horizon: ForecastHorizon): number {
	switch (horizon) {
		case "24h":
			return 1;
		case "48h":
			return 1.05;
		case "72h":
			return 1.1;
		case "7d":
			return 1.14;
		case "14d":
			return 1.2;
		default:
			return 1;
	}
}

// Driver-weight generator for forecast explainability views.
// We model each driver as a bounded function of current TSI.
function driverWeights(baseTsi: number) {
	const wind = clamp(55 + Math.round(baseTsi * 0.45), 40, 97);
	const offshore = clamp(48 + Math.round(baseTsi * 0.5), 35, 98);
	const seasonal = clamp(52 + Math.round(baseTsi * 0.38), 30, 96);
	const tide = clamp(35 + Math.round(baseTsi * 0.32), 20, 90);
	return [
		{ label: "NE/E wind persistence", weight: wind },
		{ label: "Offshore patch proximity", weight: offshore },
		{ label: "Seasonal historical pattern", weight: seasonal },
		{ label: "Tidal transport state", weight: tide }
	];
}

// Maps operational severity to feed/alert urgency levels.
function levelForSeverity(severity: Severity): "Critical" | "Warning" | "Info" {
	if (severity === "Severe") return "Critical";
	if (severity === "Heavy") return "Warning";
	return "Info";
}

async function main() {
	console.log("Seeding Triton Coastal Intelligence dataset...");

 // Clear dependent tables first so re-seeding remains idempotent.
	await prisma.alert.deleteMany();
	await prisma.feedEvent.deleteMany();
	await prisma.observation.deleteMany();
	await prisma.forecast.deleteMany();
	await prisma.beachSeasonalPoint.deleteMany();
	await prisma.beachHistoryPoint.deleteMany();
	await prisma.beach.deleteMany();

	const now = new Date();
 // Retained for future cross-entity linking/debugging needs.
	const beachByName = new Map<string, { id: number; tsi: number; county: County; lat: number; lng: number }>();

 // Seed each beach and all associated child entities in one pass.
	for (let i = 0; i < beaches.length; i += 1) {
		const beach = beaches[i];

  // Derive current-state operational fields from TSI.
		const severity = severityFromTsi(beach.tsi);
		const trend7d = clamp(Math.round((beach.tsi - 45) / 7), -10, 12);
		const waveHeight = Number((0.7 + beach.tsi / 40).toFixed(1));
		const windSpeed = Number((8 + beach.tsi / 6).toFixed(1));
		const biomassEstTons = Number((24 + beach.tsi * 3.9).toFixed(1));
		const recoverableBiomassTons = Number((biomassEstTons * 0.46).toFixed(1));
		const cleanupCostEst = Math.round(biomassEstTons * 930);
		const productValueEst = Math.round(recoverableBiomassTons * 540);
		const crewDeployed = clamp(Math.round(beach.tsi / 12), 1, 10);

	// Persist core beach record used across map, intelligence, and analytics views.
		const created = await prisma.beach.create({
			data: {
				name: beach.name,
				shortName: beach.shortName,
				county: beach.county,
				lat: beach.lat,
				lng: beach.lng,
				tsi: beach.tsi,
				severity,
				trend7d,
				windSpeed,
				windDirection: windDirections[i % windDirections.length],
				waveHeight,
				tide: tides[i % tides.length],
				crewDeployed,
				biomassEstTons,
				cleanupCostEst,
				recoverableBiomassTons,
				productValueEst,
				lastObservedAt: new Date(now.getTime() - (i % 9) * 60 * 60 * 1000),
				cleanupStatus: cleanupStatuses[Math.min(4, Math.floor(beach.tsi / 20))]
			}
		});

		// Cache lookup for potential downstream linkage/extensions.
		beachByName.set(created.name, {
			id: created.id,
			tsi: beach.tsi,
			county: beach.county,
			lat: beach.lat,
			lng: beach.lng
		});

		// Build trailing 7-day history with mild oscillation + drift to avoid flat lines.
		const historyRows = Array.from({ length: 7 }).map((_, dayOffset) => {
			const dayIndex = 6 - dayOffset;
			const oscillation = Math.round(Math.sin((dayIndex + i) * 0.8) * 4);
			const drift = Math.round((dayIndex - 3) * 0.7);
			return {
				beachId: created.id,
				date: new Date(now.getTime() - dayIndex * 24 * 60 * 60 * 1000),
				tsi: clamp(beach.tsi - drift + oscillation, 5, 96)
			};
		});

		await prisma.beachHistoryPoint.createMany({ data: historyRows });

		// Build 12-month seasonal baseline for annual trend visualizations.
		const seasonalRows = Array.from({ length: 12 }).map((_, monthIdx) => {
			const month = monthIdx + 1;
			const factor = monthSeasonFactor(month);
			const seasonalTsi = clamp(Math.round(beach.tsi * factor + (i % 4) * 1.5 - 3), 7, 96);
			return {
				beachId: created.id,
				month,
				avgTsi: seasonalTsi
			};
		});

		await prisma.beachSeasonalPoint.createMany({ data: seasonalRows });

		// Seed all forecast horizons with explainability drivers.
		const forecastRows = forecastHorizons.map((horizon) => {
			const multiplier = forecastBoost(horizon);
			const probability = clamp(Math.round(beach.tsi * multiplier + 8), 10, 99);
			const expectedAccumulationTons = Number((probability * 1.3).toFixed(1));
			const confidence = clamp(60 + Math.round((beach.tsi / 100) * 28) - (horizon === "14d" ? 12 : 0), 45, 94);
			const expectedTsi = clamp(Math.round((beach.tsi * multiplier + 5) / 1.08), 0, 100);
			return {
				beachId: created.id,
				horizon,
				arrivalProbability: probability,
				expectedSeverity: severityFromTsi(expectedTsi),
				expectedAccumulationTons,
				confidence,
				drivers: JSON.stringify(driverWeights(beach.tsi))
			};
		});

		// Use per-row inserts for simple compatibility and explicit data shape.
		for (const row of forecastRows) {
			await prisma.forecast.create({ data: row });
		}

		// Seed observer records (the proprietary field-data moat).
		const obsCount = 3 + (i % 3);
		for (let obsIdx = 0; obsIdx < obsCount; obsIdx += 1) {
			const obsTsi = clamp(beach.tsi + obsIdx - 1, 5, 98);
			const obsSeverity = severityFromTsi(obsTsi);
			await prisma.observation.create({
				data: {
					id: `OBS-2026-${String(i * 10 + obsIdx + 101).padStart(4, "0")}`,
					beachId: created.id,
					submittedAt: new Date(now.getTime() - (obsIdx + i) * 2 * 60 * 60 * 1000),
					observerName: ["M. Alvarez", "K. Brooks", "S. Patel", "R. Hernandez"][obsIdx % 4],
					severity: obsSeverity,
					notes:
						obsSeverity === "Severe"
							? "Dense shoreline mat with active odor profile; dispatch escalation recommended."
							: obsSeverity === "Heavy"
								? "Continuous wrack line with moderate beach access impact along high-tide band."
								: "Scattered patch accumulation; monitoring advised with no immediate closure risk.",
					hasPhoto: obsIdx % 2 === 0,
					photoUrl: obsIdx % 2 === 0 ? `https://assets.triton.local/observations/${created.id}-${obsIdx}.jpg` : null,
					lat: Number((beach.lat + obsIdx * 0.0009).toFixed(6)),
					lng: Number((beach.lng - obsIdx * 0.0007).toFixed(6))
				}
			});
		}

			// Seed a primary forecast-update feed item per beach.
		await prisma.feedEvent.create({
			data: {
				id: `FEED-${created.id}-A`,
				timestamp: new Date(now.getTime() - i * 45 * 60 * 1000),
				category: "Forecast Update",
				level: levelForSeverity(severity),
				beachId: created.id,
				county: beach.county,
				title: `${beach.shortName} forecast revised`,
				description: `24h arrival probability recalibrated to ${clamp(beach.tsi + 12, 15, 96)}% using updated NE wind trajectory.`
			}
		});

		// Seed an additional operational feed item per beach with varied category.
		await prisma.feedEvent.create({
			data: {
				id: `FEED-${created.id}-B`,
				timestamp: new Date(now.getTime() - (i * 45 + 20) * 60 * 1000),
				category: feedCategories[i % feedCategories.length],
				level: levelForSeverity(severityFromTsi(clamp(beach.tsi - 6, 0, 100))),
				beachId: created.id,
				county: beach.county,
				title: `${beach.shortName} operational signal`,
				description: "Field and remote sensing inputs aligned; maintaining current deployment posture."
			}
		});

		// Only elevated beaches generate critical/emergency alert records.
		if (severity === "Heavy" || severity === "Severe") {
			await prisma.alert.create({
				data: {
					id: `ALERT-${created.id}`,
					level: severity === "Severe" ? "Emergency" : "Critical",
					beachId: created.id,
					county: beach.county,
					recommendedAction:
						severity === "Severe"
							? "Activate emergency shoreline response and issue municipal advisory."
							: "Prepare surge cleanup crew assignment within next tide window.",
					message: `${beach.name} currently rated ${severity} with elevated accumulation risk.`,
					timestamp: new Date(now.getTime() - i * 35 * 60 * 1000)
				}
			});
		}
	}

		 // Add county-level operations brief feed entries.
	const operationsSummaryFeed = counties.map((county, idx) => ({
		id: `FEED-COUNTY-${idx + 1}`,
		timestamp: new Date(now.getTime() - (idx + 1) * 50 * 60 * 1000),
		category: "Cleanup Dispatch",
		level: "Info",
		county,
		title: `${county} county operations brief posted`,
		description: "County rollup refreshed with latest TSI, biomass, and staffing metrics."
	}));

	await prisma.feedEvent.createMany({ data: operationsSummaryFeed });

	console.log(`Seed complete: ${beaches.length} beaches and ${contractTiers.length} contract tiers referenced from shared constants.`);
}

	// Standard script lifecycle: run seed, report errors, always disconnect.
main()
	.catch((error) => {
		console.error("Seed failed", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
