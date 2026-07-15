import { blobPath, hashSeed, pathProgressForHorizon, pointAlongPolyline, projectLonLat, ribbonPath } from "./geo";
import type { HorizonDay, LandfallForecast, SargassumPatch } from "./types";

type Props = {
  patches: SargassumPatch[];
  forecasts: LandfallForecast[];
  selectedHorizon: HorizonDay;
};

const width = 980;
const height = 520;

function confidenceColor(confidence: LandfallForecast["confidence"]): string {
  if (confidence === "high") return "var(--teal)";
  if (confidence === "medium") return "var(--amber)";
  return "var(--mist)";
}

function massRadius(massTons: number | null): number {
  if (massTons === null) return 9;
  const normalized = Math.min(1, massTons / 50000);
  return 8 + normalized * 9;
}

function arrivalText(minDay: number, maxDay: number): string {
  if (maxDay >= 999) return "D+30+";
  if (minDay === maxDay) return `D+${minDay}`;
  return `D+${minDay}-${maxDay}`;
}

export function PatchMap({ patches, forecasts, selectedHorizon }: Props) {
  const patchById = new Map(patches.map((patch) => [patch.id, patch]));

  return (
    <section className="rounded-xl border border-border bg-panel-hi/55 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-steel">PatchMap Basin View</p>
          <h3 className="text-base font-semibold">Observed mats and projected landfall cones</h3>
        </div>
        <p className="font-mono text-xs text-steel">Lon -100..20 | Lat -5..35</p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-lg border border-border bg-[var(--abyss)]/80">
        <defs>
          {forecasts.map((forecast, index) => {
            const color = confidenceColor(forecast.confidence);
            return (
              <linearGradient key={`cone-gradient-${index}`} id={`cone-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.45" />
              </linearGradient>
            );
          })}
        </defs>

        <rect x="0" y="0" width={width} height={height} fill="transparent" />

        {Array.from({ length: 11 }).map((_, idx) => {
          const x = (idx / 10) * width;
          return <line key={`v-${idx}`} x1={x} y1={0} x2={x} y2={height} stroke="var(--line)" strokeOpacity="0.25" strokeWidth="1" />;
        })}
        {Array.from({ length: 9 }).map((_, idx) => {
          const y = (idx / 8) * height;
          return <line key={`h-${idx}`} x1={0} y1={y} x2={width} y2={y} stroke="var(--line)" strokeOpacity="0.2" strokeWidth="1" />;
        })}

        <path d="M 136 92 L 170 95 L 188 115 L 196 143 L 191 168 L 175 181 L 164 206 L 171 229 L 190 248" fill="none" stroke="var(--chart-line)" strokeOpacity="0.6" strokeWidth="2" />
        <path d="M 188 248 L 216 261 L 248 272 L 280 281 L 307 294 L 326 318 L 334 344 L 340 366" fill="none" stroke="var(--chart-line)" strokeOpacity="0.6" strokeWidth="2" />
        <path d="M 350 172 L 380 163 L 417 159 L 458 168 L 501 188 L 532 212" fill="none" stroke="var(--chart-line)" strokeOpacity="0.45" strokeWidth="2" />

        {forecasts.map((forecast, index) => {
          if (!forecast.waypoints || forecast.waypoints.length < 2) return null;

          const points = forecast.waypoints.map(([lon, lat]) => projectLonLat(lon, lat, width, height));
          const ribbon = ribbonPath(points, 4, 22);
          const color = confidenceColor(forecast.confidence);
          const position = pointAlongPolyline(points, pathProgressForHorizon(selectedHorizon, forecast.arrivalDayMax));
          const endPoint = points[points.length - 1];
          const dayMarkerA = pointAlongPolyline(points, 0.5);

          return (
            <g key={`cone-${forecast.patchId}-${index}`}>
              <path d={ribbon} fill={`url(#cone-gradient-${index})`} stroke="none" />
              <path d={points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} fill="none" stroke={color} strokeOpacity="0.9" strokeDasharray="8 8" strokeWidth="1.4" />
              <text x={dayMarkerA.x + 8} y={dayMarkerA.y - 8} fill="var(--foam)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                ~D+7
              </text>
              <text x={endPoint.x + 8} y={endPoint.y - 10} fill="var(--foam)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                {arrivalText(forecast.arrivalDayMin, forecast.arrivalDayMax)}
              </text>
              <path d={`M ${endPoint.x + 4} ${endPoint.y - 14} L ${endPoint.x + 4} ${endPoint.y + 1}`} stroke="var(--foam)" strokeWidth="1.2" />
              <path d={`M ${endPoint.x + 4} ${endPoint.y - 14} L ${endPoint.x + 17} ${endPoint.y - 9} L ${endPoint.x + 4} ${endPoint.y - 4} Z`} fill={color} />
              <circle cx={position.x} cy={position.y} r="5" fill="var(--foam)" stroke={color} strokeWidth="2" />
            </g>
          );
        })}

        {patches.map((patch) => {
          const projected = projectLonLat(patch.lon, patch.lat, width, height);
          const radius = massRadius(patch.massTons);
          const blob = blobPath(projected.x, projected.y, radius, hashSeed(patch.id));

          return (
            <g key={patch.id}>
              <path d={blob} fill="var(--seaweed)" fillOpacity="0.8" stroke="var(--foam)" strokeOpacity="0.38" strokeWidth="1" />
              <text x={projected.x + radius + 3} y={projected.y - radius} fill="var(--foam)" fontSize="10" fontFamily="Inter, sans-serif">
                {patch.label}
              </text>
            </g>
          );
        })}

        <g transform="translate(30 34)">
          <circle cx="0" cy="0" r="16" fill="none" stroke="var(--chart-line)" strokeWidth="1" />
          <path d="M 0 -12 L 4 -1 L 0 2 L -4 -1 Z" fill="var(--teal)" />
          <text x="-3" y="20" fill="var(--foam)" fontSize="10" fontFamily="JetBrains Mono, monospace">N</text>
        </g>

        <g transform="translate(34 490)">
          <line x1="0" y1="0" x2="120" y2="0" stroke="var(--foam)" strokeWidth="2" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="var(--foam)" strokeWidth="2" />
          <line x1="120" y1="-5" x2="120" y2="5" stroke="var(--foam)" strokeWidth="2" />
          <text x="42" y="-8" fill="var(--foam)" fontSize="10" fontFamily="JetBrains Mono, monospace">~250 km</text>
        </g>
      </svg>
    </section>
  );
}
