import { getBeaches } from "../../lib/api";
const mockPatches = [
    {
        id: "patch-a",
        label: "Central Atlantic Mat A",
        lon: -58,
        lat: 18,
        massTons: 42000,
        lastObserved: "2026-07-10",
        source: "MOCK"
    },
    {
        id: "patch-b",
        label: "Windward Drift Cluster",
        lon: -67,
        lat: 15,
        massTons: 29500,
        lastObserved: "2026-07-11",
        source: "MOCK"
    },
    {
        id: "patch-c",
        label: "Sargasso Fringe",
        lon: -52,
        lat: 27,
        massTons: null,
        lastObserved: "2026-07-09",
        source: "MOCK"
    },
    {
        id: "patch-d",
        label: "Lesser Antilles Belt",
        lon: -61,
        lat: 12,
        massTons: 18800,
        lastObserved: "2026-07-11",
        source: "MOCK"
    },
    {
        id: "patch-e",
        label: "Western Caribbean Stream",
        lon: -78,
        lat: 16,
        massTons: 15400,
        lastObserved: "2026-07-10",
        source: "MOCK"
    }
];
const forecastTemplates = [
    {
        patchId: "patch-a",
        targetLabel: "SE Florida (Palm Beach / Broward / Miami-Dade)",
        targetBeachNames: ["Jupiter Beach", "Deerfield Beach", "Miami Beach (South)"],
        waypoints: [
            [-58, 18],
            [-63, 20],
            [-69, 22],
            [-74, 24],
            [-79, 26],
            [-80.2, 26.8]
        ],
        arrivalDayMin: 9,
        arrivalDayMax: 16,
        confidence: "medium"
    },
    {
        patchId: "patch-b",
        targetLabel: "Northern Lesser Antilles",
        targetBeachNames: [],
        waypoints: [
            [-67, 15],
            [-65, 15.5],
            [-63.5, 16.2],
            [-62.7, 16.6]
        ],
        arrivalDayMin: 6,
        arrivalDayMax: 10,
        confidence: "high"
    },
    {
        patchId: "patch-c",
        targetLabel: "Open Atlantic recirculation",
        waypoints: null,
        arrivalDayMin: 30,
        arrivalDayMax: 999,
        confidence: "low"
    },
    {
        patchId: "patch-d",
        targetLabel: "Puerto Rico / USVI corridor",
        targetBeachNames: [],
        waypoints: [
            [-61, 12],
            [-63.5, 14],
            [-65.7, 16.2],
            [-66.2, 18.1]
        ],
        arrivalDayMin: 7,
        arrivalDayMax: 12,
        confidence: "medium"
    },
    {
        patchId: "patch-e",
        targetLabel: "Yucatan Channel",
        targetBeachNames: [],
        waypoints: [
            [-78, 16],
            [-82, 18],
            [-85, 20],
            [-86, 22]
        ],
        arrivalDayMin: 10,
        arrivalDayMax: 18,
        confidence: "low"
    }
];
function resolveCoverageBeachIds(beachByName, names) {
    if (!names || names.length === 0)
        return undefined;
    const ids = names
        .map((name) => beachByName.get(name))
        .filter((id) => typeof id === "number");
    return ids.length > 0 ? ids : undefined;
}
export class MockForecastProvider {
    async getDataset() {
        let coverageBeachIds = new Set();
        let beachByName = new Map();
        try {
            const beaches = await getBeaches();
            coverageBeachIds = new Set(beaches.map((beach) => beach.id));
            beachByName = new Map(beaches.map((beach) => [beach.name, beach.id]));
        }
        catch {
            coverageBeachIds = new Set();
            beachByName = new Map();
        }
        const forecasts = forecastTemplates.map((template) => {
            const targetBeachIds = resolveCoverageBeachIds(beachByName, template.targetBeachNames);
            const isCoverageArea = (targetBeachIds ?? []).some((beachId) => coverageBeachIds.has(beachId));
            return {
                patchId: template.patchId,
                targetLabel: template.targetLabel,
                targetBeachIds,
                waypoints: template.waypoints,
                arrivalDayMin: template.arrivalDayMin,
                arrivalDayMax: template.arrivalDayMax,
                confidence: template.confidence,
                isCoverageArea
            };
        });
        return {
            patches: mockPatches,
            forecasts
        };
    }
}
