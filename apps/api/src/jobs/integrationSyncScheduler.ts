/**
 * Module: apps/api/src/jobs/integrationSyncScheduler.ts
 * Purpose: Runs periodic provider sync to keep beach intelligence fresh.
 */

import { env } from "../config/env";
import { syncAllBeaches } from "../integrations/service";

let running = false;

async function runSyncCycle() {
  if (running) {
    return;
  }

  running = true;
  const startedAt = Date.now();

  try {
    const summary = await syncAllBeaches(Math.max(1, Math.min(23, env.integrationSyncLimit)));
    const elapsedMs = Date.now() - startedAt;
    console.log(
      `[scheduler] provider sync completed in ${elapsedMs}ms (ok=${summary.succeeded}, failed=${summary.failed}, total=${summary.total})`
    );
  } catch (error) {
    console.error("[scheduler] provider sync failed", error);
  } finally {
    running = false;
  }
}

export function startIntegrationSyncScheduler() {
  if (!env.integrationSyncEnabled) {
    console.log("[scheduler] provider sync disabled (INTEGRATION_SYNC_ENABLED=false)");
    return () => {};
  }

  if (env.integrationSyncRunOnStartup) {
    void runSyncCycle();
  }

  const intervalMs = Math.max(60_000, env.integrationSyncIntervalMs);
  const timer = setInterval(() => {
    void runSyncCycle();
  }, intervalMs);

  console.log(`[scheduler] provider sync active every ${intervalMs}ms`);

  return () => {
    clearInterval(timer);
    console.log("[scheduler] provider sync stopped");
  };
}
