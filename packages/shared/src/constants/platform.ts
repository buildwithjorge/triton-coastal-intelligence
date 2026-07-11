export const platformMaturity = {
  "Triton COS (Coastal Operating System)": "Operational",
  "FSIN (Florida Sargassum Intelligence Network)": "Operational",
  "Coastal Guardian Net System": "Pilot Deployment Program",
  "SpinDryer™ (mobile biomass dewatering)": "Patent Pending · Field Evaluation"
} as const;

export const counties = ["Palm Beach", "Broward", "Miami-Dade"] as const;

export type County = (typeof counties)[number];

export const forecastHorizons = ["24h", "48h", "72h", "7d", "14d"] as const;

export type ForecastHorizon = (typeof forecastHorizons)[number];

export const eventLevels = ["Critical", "Warning", "Info"] as const;

export type EventLevel = (typeof eventLevels)[number];

export const procurementThreshold = {
  floridaSoleSource90DayUsd: 49500,
  citation: "Fla. Stat. §125.35"
} as const;

export const contractTiers = [
  {
    tier: 1,
    name: "Intelligence",
    monthlyPrice: 1500,
    seasonPrice: 4500,
    deliverables: [
      "Daily TSI scoring and severity updates",
      "24h to 14d forecast access with confidence breakdown",
      "County-level monthly intelligence briefings"
    ],
    idealFor: "Municipal teams building data-driven situational awareness"
  },
  {
    tier: 2,
    name: "Intelligence + Intercept",
    monthlyPrice: 3900,
    seasonPrice: 11700,
    deliverables: [
      "Everything in Intelligence",
      "Observer network workflow and live operational feed",
      "Targeted intercept playbooks for high-risk windows"
    ],
    idealFor: "Cities requiring active planning and rapid response coordination"
  },
  {
    tier: 3,
    name: "Full Operations",
    monthlyPrice: {
      min: 6900,
      max: 10900
    },
    seasonPrice: {
      min: 20700,
      max: 32700
    },
    deliverables: [
      "Everything in Intelligence + Intercept",
      "Integrated drone and beach camera operational coverage",
      "Regional command reporting and executive procurement packet"
    ],
    idealFor: "Counties and municipalities requiring full mission operations support"
  }
] as const;

export const volumeBundlePricing = [
  { minBeaches: 1, maxBeaches: 3, ratePerBeachMonthly: 1500 },
  { minBeaches: 4, maxBeaches: 8, ratePerBeachMonthly: 1200 },
  { minBeaches: 9, maxBeaches: 15, ratePerBeachMonthly: 950 },
  { minBeaches: 16, maxBeaches: 23, ratePerBeachMonthly: 750 }
] as const;
