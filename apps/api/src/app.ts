/**
 * Module: apps/api/src/app.ts
 * Purpose: Composes middleware and module routers into the API application.
 */

import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "./config/env";
import { alertsRouter } from "./modules/alerts/router";
import { analyticsRouter } from "./modules/analytics/router";
import { beachesRouter } from "./modules/beaches/router";
import { contractsRouter } from "./modules/contracts/router";
import { countiesRouter } from "./modules/counties/router";
import { economicsRouter } from "./modules/economics/router";
import { feedRouter } from "./modules/feed/router";
import { forecastRouter } from "./modules/forecast/router";
import { integrationsRouter } from "./modules/integrations/router";
import { observationsRouter } from "./modules/observations/router";
import { reportsRouter } from "./modules/reports/router";
import { dronesRouter } from "./modules/drones/router";
import { camerasRouter } from "./modules/cameras/router";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.uploadDir)));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "triton-api" });
  });

  app.use("/api/beaches", beachesRouter);
  app.use("/api/counties", countiesRouter);
  app.use("/api/feed", feedRouter);
  app.use("/api/observations", observationsRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/contracts", contractsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/forecast", forecastRouter);
  app.use("/api/economics", economicsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/drones", dronesRouter);
  app.use("/api/cameras", camerasRouter);
  app.use("/api/integrations", integrationsRouter);

  return app;
}
