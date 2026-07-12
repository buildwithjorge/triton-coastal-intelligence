/**
 * Module: apps/api/src/config/env.ts
 * Purpose: Centralizes runtime configuration for the API and provider integrations.
 */

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

const useExternalDb = process.env.TRITON_USE_EXTERNAL_DB === "true";
const configuredDbUrl = process.env.DATABASE_URL;
const wantsPostgres =
  typeof configuredDbUrl === "string" &&
  (configuredDbUrl.startsWith("postgresql://") || configuredDbUrl.startsWith("postgres://"));

if (!useExternalDb && (!configuredDbUrl || wantsPostgres)) {
  const candidates = [
    path.resolve(process.cwd(), "apps/api/prisma/dev.db"),
    path.resolve(process.cwd(), "prisma/dev.db")
  ];
  const selected = candidates.find((candidate) => fs.existsSync(path.dirname(candidate))) ?? candidates[0];
  process.env.DATABASE_URL = `file:${selected.replace(/\\/g, "/")}`;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  databaseUrl: process.env.DATABASE_URL ?? "",
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 12000),
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  integrationSyncEnabled: process.env.INTEGRATION_SYNC_ENABLED === "true",
  integrationSyncIntervalMs: Number(process.env.INTEGRATION_SYNC_INTERVAL_MS ?? 900000),
  integrationSyncLimit: Number(process.env.INTEGRATION_SYNC_LIMIT ?? 23),
  integrationSyncRunOnStartup: process.env.INTEGRATION_SYNC_RUN_ON_STARTUP === "true",
  noaaTidesBaseUrl: process.env.NOAA_TIDES_BASE_URL ?? "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
  noaaNdbcBaseUrl: process.env.NOAA_NDBC_BASE_URL ?? "https://www.ndbc.noaa.gov/data/realtime2",
  openMeteoMarineBaseUrl: process.env.OPEN_METEO_MARINE_BASE_URL ?? "https://marine-api.open-meteo.com/v1/marine"
};
