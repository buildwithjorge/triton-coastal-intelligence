import { severityFromTsi, type CleanupStatus, type Severity } from "@triton/shared";
import type { Beach as PrismaBeach, FeedEvent as PrismaFeedEvent, Forecast as PrismaForecast, Observation as PrismaObservation } from "@prisma/client";

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
    drivers: forecast.drivers as { label: string; weight: number }[]
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
