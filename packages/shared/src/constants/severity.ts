/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

export const severityOrder = ["Low", "Moderate", "Heavy", "Severe"] as const;

export type Severity = (typeof severityOrder)[number];

export const severityLabels: Record<Severity, string> = {
  Low: "Minimal / Low",
  Moderate: "Light / Moderate",
  Heavy: "Moderate / Heavy",
  Severe: "Severe"
};

export const severityColors: Record<Severity, string> = {
  Low: "#00e676",
  Moderate: "#f5a623",
  Heavy: "#ff6b2b",
  Severe: "#ff3b5c"
};

export const tsiThresholds = {
  lowMax: 25,
  moderateMax: 50,
  heavyMax: 75,
  severeMax: 100
} as const;

export function severityFromTsi(tsi: number): Severity {
  if (tsi <= tsiThresholds.lowMax) return "Low";
  if (tsi <= tsiThresholds.moderateMax) return "Moderate";
  if (tsi <= tsiThresholds.heavyMax) return "Heavy";
  return "Severe";
}

export const cleanupStatusOrder = ["Clear", "Monitoring", "Scheduled", "Active", "Emergency"] as const;

export type CleanupStatus = (typeof cleanupStatusOrder)[number];
