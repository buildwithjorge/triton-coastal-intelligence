/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
