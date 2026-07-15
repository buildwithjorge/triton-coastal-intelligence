/**
 * Module: apps/web/vite.config.ts
 * Purpose: Configures Vite development server and build behavior for the web app.
 */
import { defineConfig } from "vite";
export default defineConfig({
    resolve: {
        // Keep TS/TSX as source-of-truth when parallel JS files exist.
        extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"]
    },
    server: {
        port: 5173,
        proxy: {
            "/api": "http://localhost:4000",
            "/health": "http://localhost:4000",
            "/uploads": "http://localhost:4000"
        }
    }
});
