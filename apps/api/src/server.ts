/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { createApp } from "./app";
import { env } from "./config/env";
import { startIntegrationSyncScheduler } from "./jobs/integrationSyncScheduler";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});

const stopScheduler = startIntegrationSyncScheduler();

function shutdown() {
  stopScheduler();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
