import cors from "cors";
import express from "express";
import { alertsRouter } from "./modules/alerts/router";
import { analyticsRouter } from "./modules/analytics/router";
import { beachesRouter } from "./modules/beaches/router";
import { contractsRouter } from "./modules/contracts/router";
import { countiesRouter } from "./modules/counties/router";
import { feedRouter } from "./modules/feed/router";
import { observationsRouter } from "./modules/observations/router";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

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

  return app;
}
