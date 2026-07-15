# Triton Coastal Intelligence

![Triton Coastal Intelligence](docs/images/triton-banner.svg)

Florida's Coastal Intelligence Platform for municipal coastal operations teams across Southeast Florida.

![Monorepo](https://img.shields.io/badge/Monorepo-NPM%20Workspaces-0a1e3d?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-149eca?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-f5a623?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-4b9f4a?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-1f1f1f?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![PostGIS Ready](https://img.shields.io/badge/PostGIS-Ready-005f73?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma&logoColor=white)
![Status](https://img.shields.io/badge/Platform_Status-Operational-00d4b8?style=for-the-badge)

## Executive Summary

Triton Coastal Intelligence delivers prediction, tracking, and economic quantification of sargassum impact from Jupiter to Key Biscayne. The platform is designed for procurement review, public works operations, and county-level command decision support.

Operational coverage in the seed dataset:

- 23 monitored beaches
- 3 counties: Palm Beach, Broward, Miami-Dade
- Multi-horizon forecast intelligence: 24h, 48h, 72h, 7d, 14d
- County rollups, rankings, live intelligence feed, and municipal reporting workflows

## Product Maturity Labels (Compliance-Critical)

These statuses are hard-coded and treated as single-source procurement references:

| Product | Status |
| --- | --- |
| Triton COS (Coastal Operating System) | Operational |
| FSIN (Florida Sargassum Intelligence Network) | Operational |
| Coastal Guardian Net System | Pilot Deployment Program |
| SpinDryer (mobile biomass dewatering) | Patent Pending · Field Evaluation |

## System Architecture

![System Architecture](docs/images/system-architecture.svg)

The architecture is intentionally modular so data providers (e.g., telemetry, CV classifiers, map rendering engines) can evolve without rewriting core product flows.

## User Documentation

- Complete operator guide: `docs/platform-user-guide.md`
- Virtual tour script: `docs/virtual-tour.md`

## Monorepo Layout

| Path | Purpose |
| --- | --- |
| `apps/web` | React + Vite operational console (map, intelligence panels, analytics) |
| `apps/api` | Node.js + Express REST API with Prisma data access |
| `packages/shared` | Shared domain constants, thresholds, and entity contracts |
| `docs` | Architecture docs and visual assets |

## Core Platform Modules

1. Regional Coastal Operations Map
2. Beach Intelligence (TSI)
3. Forecasting Center
4. Live Intelligence Feed
5. Field Observer App (mobile-first)
6. Drone Operations Center
7. Beach Camera Intelligence
8. County Command Dashboard
9. Hotel & Resort Dashboard
10. Historical Analytics
11. Alert Center
12. Regional Forecast Rankings
13. Contract & Pricing Module
14. Biomass Economics Engine

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (PostGIS extension recommended)

### Environment

Copy `.env.example` to `.env` and set values for your environment:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/triton"
JWT_SECRET="change-me"
PORT=4000
VITE_API_BASE_URL="http://localhost:4000"
REQUEST_TIMEOUT_MS=12000
UPLOAD_DIR="uploads"
INTEGRATION_SYNC_ENABLED=false
INTEGRATION_SYNC_INTERVAL_MS=900000
INTEGRATION_SYNC_LIMIT=23
INTEGRATION_SYNC_RUN_ON_STARTUP=false
```

### Install + Run

```bash
npm install
npm run db:seed
npm run dev:api
npm run dev
```

### Build

```bash
npm run build
```

## API Surface

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/beaches` | List all beaches with current intelligence state |
| GET | `/api/beaches/:id` | Beach detail including forecasts, trends, and observations |
| GET | `/api/beaches/:id/forecast` | Multi-horizon forecast for one beach |
| GET | `/api/counties` | County rollup metrics |
| GET | `/api/counties/:name/beaches` | Beaches in a county |
| GET | `/api/feed` | Live intelligence feed (paginated) |
| POST | `/api/observations` | Submit a field observation |
| POST | `/api/observations/photos` | Upload an observation image and receive hosted URL |
| GET | `/api/observations?beachId=` | Observation list by beach |
| GET | `/api/alerts` | Active alert stream |
| GET | `/api/contracts/tiers` | Contract and bundle pricing definitions |
| GET | `/api/analytics/rankings` | Beaches ranked by 24h forecast arrival probability |
| GET | `/api/analytics/economics` | Fleet-wide biomass economics rollup |

## Automation Notes

- Set `INTEGRATION_SYNC_ENABLED=true` to activate periodic provider sync in the API process.
- `INTEGRATION_SYNC_INTERVAL_MS` controls sync cadence (minimum 60 seconds).
- `INTEGRATION_SYNC_RUN_ON_STARTUP=true` performs an immediate sync when API starts.
- Observation photo uploads are stored under `UPLOAD_DIR/observations` and served from `/uploads/observations/*`.

## Design System Principles

- Dark, dense, data-forward operational interface
- Single-source severity mapping: Low, Moderate, Heavy, Severe
- Signature TSI Arc Gauge used for beach-level score communication
- Glassmorphism panel styling with teal-tinted borders
- Motion used for operational signal emphasis, not decorative noise

## Procurement Notes

- Contract and pricing logic includes sole-source threshold guardrails for Florida municipal workflows.
- The 90-day individual municipality contract presentation must remain below the $49,500 threshold (Fla. Stat. §125.35), validated by tests.

## Repository Status

This repository is under active development with staged implementation milestones. The current direction is production-grade delivery quality for municipal and county procurement-facing operations.

---

Build with love by Jorge Pimentel, CTO Triton Coastal.
