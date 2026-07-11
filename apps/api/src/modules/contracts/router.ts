/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { contractTiers, procurementThreshold, volumeBundlePricing } from "@triton/shared";
import { Router } from "express";

export const contractsRouter = Router();

contractsRouter.get("/tiers", (_req, res) => {
	res.json({
		tiers: contractTiers,
		volumeBundlePricing,
		compliance: {
			threshold90DayUsd: procurementThreshold.floridaSoleSource90DayUsd,
			citation: procurementThreshold.citation,
			note: "All individual municipality 90-day tiers remain below the Florida sole-source threshold."
		}
	});
});
