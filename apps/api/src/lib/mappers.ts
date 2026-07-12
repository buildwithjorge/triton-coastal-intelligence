/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { severityFromTsi, type CleanupStatus, type Severity } from "@triton/shared";
import type { Beach as PrismaBeach, FeedEvent as PrismaFeedEvent, Forecast as PrismaForecast, Observation as PrismaObservation } from "@prisma/client";

function parseForecastDrivers(raw: string): { label: string; weight: number }[] {
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

export function toBeach(beach: PrismaBeach) {
  return {
    id: beach.id,
    name: beach.name,
    shortName: beach.shortName,
    county: beach.county,
    lat: beach.lat,
    lng: beach.lng,
    tsi: beach.tsi,
    severity: beach.severity as Severity,
    trend7d: beach.trend7d,
    wind: {
      speed: beach.windSpeed,
      direction: beach.windDirection
    },
    waveHeight: beach.waveHeight,
    tide: beach.tide,
    crewDeployed: beach.crewDeployed,
    biomassEstTons: beach.biomassEstTons,
    cleanupCostEst: beach.cleanupCostEst,
    recoverableBiomassTons: beach.recoverableBiomassTons,
    productValueEst: beach.productValueEst,
    lastObservedAt: beach.lastObservedAt.toISOString(),
    cleanupStatus: beach.cleanupStatus as CleanupStatus
  };
}

export function toForecast(forecast: PrismaForecast) {
  return {
    beachId: forecast.beachId,
    horizon: forecast.horizon,
    arrivalProbability: forecast.arrivalProbability,
    expectedSeverity: forecast.expectedSeverity,
    expectedAccumulationTons: forecast.expectedAccumulationTons,
    confidence: forecast.confidence,
    drivers: parseForecastDrivers(forecast.drivers)
  };
}

export function toObservation(observation: PrismaObservation) {
  return {
    id: observation.id,
    beachId: observation.beachId,
    submittedAt: observation.submittedAt.toISOString(),
    observerName: observation.observerName,
    severity: observation.severity,
    notes: observation.notes,
    hasPhoto: observation.hasPhoto,
    photoUrl: observation.photoUrl ?? undefined,
    lat: observation.lat,
    lng: observation.lng
  };
}

export function toFeedEvent(feedEvent: PrismaFeedEvent, beachName?: string) {
  return {
    id: feedEvent.id,
    timestamp: feedEvent.timestamp.toISOString(),
    category: feedEvent.category,
    level: feedEvent.level,
    beachId: feedEvent.beachId ?? undefined,
    beachName,
    county: feedEvent.county ?? undefined,
    title: feedEvent.title,
    description: feedEvent.description
  };
}

export function severityToTsiMidpoint(severity: Severity): number {
  if (severity === "Low") return 18;
  if (severity === "Moderate") return 38;
  if (severity === "Heavy") return 63;
  return 86;
}

export function mergeSeverityIntoTsi(currentTsi: number, observedSeverity: Severity): number {
  const target = severityToTsiMidpoint(observedSeverity);
  const blended = Math.round(currentTsi * 0.75 + target * 0.25);
  return Math.max(0, Math.min(100, blended));
}

export function deriveSeverity(tsi: number): Severity {
  return severityFromTsi(tsi);
}
