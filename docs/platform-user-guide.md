# Triton Coastal Intelligence Platform User Guide

This guide explains how to operate Triton Coastal Intelligence end to end: what each module does, why it matters, and how to use it for faster and better coastal decisions.

## 1. Who This Is For

- County and city operations leaders
- Public works and coastal management teams
- Field observers and beach response crews
- Procurement and reporting stakeholders

## 2. Core Value

Triton combines forecast intelligence, real-time operations context, and economic impact data in one operating console.

Benefits:

- Faster response prioritization across beaches and counties
- Better resource allocation (crews, equipment, camera checks, and observations)
- Stronger justification for budget and contract decisions
- Shared operational picture from field to command

## 3. Quick Start (Operator)

1. Open the web app and confirm the API is reachable.
2. Use the top navigation to choose your workflow:
- Dashboard
- Forecast
- Observer
- County
- Cameras
- Reports
3. In Dashboard view:
- Filter by county
- Select beach markers on the map
- Review Beach Intelligence panel and Live Feed
4. Use the new controls in header:
- Theme toggle: switch between Dark and Light mode
- Fullscreen toggle: expand the app to full display mode

## 4. Complete Functional Tour (Current Features)

### 4.1 Global Header Controls

- Tab navigation
- Beaches Online and Severe Alerts counters
- Theme toggle (Dark/Light)
- Fullscreen toggle (enter/exit fullscreen)

Operational benefit:

- Keeps decision context and operator controls visible while switching workflows.

### 4.2 Operations Dashboard

Primary components:

- Regional Coastal Operations Map
- Beach Intelligence panel (TSI and charts)
- Live External Intelligence panel with sync action
- Live Intelligence Feed + Asset Deployment panel

How to use:

1. Choose county filter (All, Palm Beach, Broward, Miami-Dade).
2. Click a beach marker to load detailed intelligence.
3. Review severity, trend, economics, and observation snippets.
4. Use Sync Now to refresh provider-backed intelligence for selected beach.

Operational benefit:

- Converts regional noise into beach-level action priorities.

### 4.3 Forecasting Center

Data shown:

- Multi-horizon probability windows (24h, 48h, 72h, 7d, 14d)
- Expected severity and accumulation
- Confidence
- Top forecast drivers

How to use:

1. Select target beach in Dashboard first.
2. Open Forecast tab.
3. Compare horizons to plan near-term vs medium-term response posture.

Operational benefit:

- Helps avoid reactive-only operations by planning ahead on confidence-weighted risk.

### 4.4 Field Observer App

Capabilities:

- Submit observations with severity and notes
- Attach photos (file upload or URL fallback)
- Auto-geo from selected beach
- Pushes data into feed and beach intelligence updates

How to use:

1. Choose beach.
2. Enter observer name, severity, and structured notes.
3. Optionally attach photo.
4. Submit and verify success message.

Operational benefit:

- Brings field truth into command decisions in near real time.

### 4.5 County Command Dashboard

Data shown per county:

- Beach count
- Average TSI
- Heavy/Severe count
- Biomass tons
- Cleanup cost estimate
- Recoverable value estimate
- Crew deployed

Operational benefit:

- Gives leadership-level view for allocation across jurisdictions.

### 4.6 Beach Camera Intelligence

Capabilities:

- Search by beach or county
- Select active camera feed
- View severity classification and confidence metadata

Operational benefit:

- Rapid visual confirmation before dispatching crews.

### 4.7 Intelligence Reports

Report types:

- Regional report summary
- Beach-specific report for selected beach
- Forecast and recent observation details

Operational benefit:

- Ready-to-brief information for internal and stakeholder reporting.

### 4.8 Live Feed and Asset Status

Capabilities:

- Auto-refreshing activity feed
- Critical item count
- Asset deployment status card

Operational benefit:

- Keeps operators synced to current events and deployment posture.

## 5. API Capabilities (Complete Endpoint Map)

### 5.1 Health and Static

- GET /health
- Static uploads at /uploads/*

### 5.2 Beaches and Intelligence

- GET /api/beaches
- GET /api/beaches?county=
- GET /api/beaches/:id
- GET /api/beaches/:id/forecast

### 5.3 Forecast and Explainability

- GET /api/forecast
- GET /api/forecast?beachId=
- GET /api/forecast?horizon=
- GET /api/forecast/drivers/top?beachId=

### 5.4 Counties

- GET /api/counties
- GET /api/counties/:name/beaches

### 5.5 Feed, Alerts, Reports

- GET /api/feed?page=&pageSize=
- GET /api/alerts
- GET /api/reports/region
- GET /api/reports/beaches/:id

### 5.6 Observations and Photos

- GET /api/observations?beachId=
- POST /api/observations
- POST /api/observations/photos

### 5.7 Integrations

- GET /api/integrations/providers
- GET /api/integrations/beaches/:id/live
- POST /api/integrations/sync/beaches/:id
- POST /api/integrations/sync/all?limit=

### 5.8 Economics, Analytics, Contracts, Drones, Cameras

- GET /api/economics
- GET /api/economics/beaches/:id
- GET /api/analytics/rankings
- GET /api/analytics/economics
- GET /api/contracts/tiers
- GET /api/drones/fleet
- GET /api/drones/missions
- GET /api/cameras

## 6. Virtual Tour (15-Minute Guided Run)

### Minute 0-2: Situation Awareness

1. Open Dashboard.
2. Check Beaches Online and Severe Alerts.
3. Enter fullscreen if in operations room display mode.

### Minute 2-5: Geographic Triage

1. Filter county.
2. Click top severity beach markers.
3. Review Beach Intelligence trend and latest observations.

### Minute 5-8: Forecast Planning

1. Open Forecast tab.
2. Review 24h and 48h probabilities first.
3. Use driver insights to explain expected escalation.

### Minute 8-11: Field Coordination

1. Open Observer tab.
2. Submit one field observation from active beach.
3. Return to Dashboard and confirm data refresh behavior.

### Minute 11-13: Visual Verification

1. Open Cameras tab.
2. Search county and inspect active feeds.
3. Compare classification confidence with forecast confidence.

### Minute 13-15: Reporting and Brief-out

1. Open Reports tab.
2. Capture regional and beach report findings.
3. Share recommended actions with county/city stakeholders.

## 7. Feature Availability Matrix

### Live in UI

- Dashboard map and beach selection
- Beach Intelligence panel
- Forecasting Center
- Field Observer submissions + photo upload
- County dashboard
- Camera intelligence center
- Reports view
- Theme toggle and fullscreen toggle

### Live in API (direct integration ready)

- Alerts, contracts, economics, analytics, drones, cameras, integrations, feed, reports, observations

### Staged/placeholder web modules (not currently wired in active nav)

- Alert Center component
- Historical Analytics component
- Contract Pricing Module component
- Drone Operations Center component
- Biomass Economics Engine component
- Hotel & Resort Dashboard component
- Landfall module components
- NOAA SIR embed component

## 8. Recommended Operating Rhythm

- Every 30 minutes: review feed and severe count
- Every 2-4 hours: refresh forecast priorities and county rollups
- At shift change: export report highlights and top 3 action items

## 9. Troubleshooting

- Feed unavailable: verify API server is running and /api/feed returns 200.
- Blank external iframe content (NOAA/camera provider edge cases): open external link fallback.
- Fullscreen denied: browser or OS policy may block fullscreen requests until user interaction.
- Theme not persisting: ensure browser local storage is enabled.

## 10. Configuration Notes

- VITE_API_BASE_URL controls web-to-API base URL.
- INTEGRATION_SYNC_ENABLED toggles scheduler sync in API runtime.
- INTEGRATION_SYNC_RUN_ON_STARTUP controls startup sync behavior.
- UPLOAD_DIR controls observation photo storage root.

## 11. Success Metrics to Track

- Time from detection to dispatch decision
- Number of severe beaches stabilized within 24h
- Cleanup cost vs recoverable value trend
- Observation coverage per county per day
- Forecast confidence alignment with observed outcomes
