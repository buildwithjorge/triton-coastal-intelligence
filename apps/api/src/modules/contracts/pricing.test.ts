import test from "node:test";
import assert from "node:assert/strict";
import { contractTiers, procurementThreshold } from "@triton/shared";

function maxSeasonPrice(seasonPrice: number | { min: number; max: number }): number {
  return typeof seasonPrice === "number" ? seasonPrice : seasonPrice.max;
}

test("all individual municipality 90-day contract tiers are under Florida threshold", () => {
  const threshold = procurementThreshold.floridaSoleSource90DayUsd;

  for (const tier of contractTiers) {
    const price = maxSeasonPrice(tier.seasonPrice);
    assert.ok(
      price < threshold,
      `Tier ${tier.tier} (${tier.name}) exceeds threshold: ${price} >= ${threshold}`
    );
  }
});
