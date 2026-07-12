/**
 * Module: apps/api/src/modules/integrations/router.ts
 * Purpose: Exposes provider health, live beach intelligence, and sync operations.
 */

import { Router } from "express";
import { fetchLiveBeachIntelligence, getProviderHealth, syncAllBeaches, syncBeachFromProviders } from "../../integrations/service";

export const integrationsRouter = Router();

integrationsRouter.get("/providers", async (_req, res) => {
  const providers = await getProviderHealth();
  res.json({ providers });
});

integrationsRouter.get("/beaches/:id/live", async (req, res) => {
  const beachId = Number(req.params.id);
  if (!Number.isFinite(beachId)) {
    return res.status(400).json({ error: "Invalid beach id" });
  }

  try {
    const live = await fetchLiveBeachIntelligence(beachId);
    return res.json(live);
  } catch (error) {
    return res.status(404).json({ error: error instanceof Error ? error.message : "Unable to load live intelligence" });
  }
});

integrationsRouter.post("/sync/beaches/:id", async (req, res) => {
  const beachId = Number(req.params.id);
  if (!Number.isFinite(beachId)) {
    return res.status(400).json({ error: "Invalid beach id" });
  }

  try {
    const result = await syncBeachFromProviders(beachId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
  }
});

integrationsRouter.post("/sync/all", async (req, res) => {
  const limitRaw = req.query.limit;
  const limit = typeof limitRaw === "string" ? Number(limitRaw) : undefined;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(23, Number(limit))) : undefined;

  const summary = await syncAllBeaches(safeLimit);
  res.json(summary);
});
