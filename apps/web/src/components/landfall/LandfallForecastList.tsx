import type { LandfallForecast, SargassumPatch } from "./types";

type Props = {
  forecasts: LandfallForecast[];
  patches: SargassumPatch[];
  onOpenBeachDashboard: (beachId: number) => void;
};

function confidenceStyles(confidence: LandfallForecast["confidence"]): string {
  if (confidence === "high") return "border-teal/35 bg-teal/10 text-teal";
  if (confidence === "medium") return "border-amber/35 bg-amber/10 text-amber";
  return "border-[var(--mist)]/35 bg-[var(--mist)]/10 text-[var(--mist)]";
}

function arrivalLabel(minDay: number, maxDay: number): string {
  if (maxDay >= 999) return "D+30 uncertain";
  if (minDay === maxDay) return `D+${minDay}`;
  return `D+${minDay} to D+${maxDay}`;
}

export function LandfallForecastList({ forecasts, patches, onOpenBeachDashboard }: Props) {
  const patchById = new Map(patches.map((patch) => [patch.id, patch]));
  const sorted = [...forecasts].sort((a, b) => a.arrivalDayMin - b.arrivalDayMin);

  return (
    <section className="rounded-xl border border-border bg-panel-hi/55 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-steel">Landfall Forecast</p>
        <p className="font-mono text-[11px] text-teal">Soonest first</p>
      </div>

      <div className="mt-2 space-y-2">
        {sorted.map((forecast) => {
          const patch = patchById.get(forecast.patchId);
          return (
            <article key={`${forecast.patchId}-${forecast.targetLabel}`} className="rounded-lg border border-border bg-navy/45 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ice">{forecast.targetLabel}</p>
                  <p className="text-xs text-steel">{patch?.label ?? "Unknown patch source"}</p>
                </div>
                <span className={`rounded border px-2 py-0.5 font-mono text-[11px] uppercase ${confidenceStyles(forecast.confidence)}`}>
                  {forecast.confidence}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-ice/90">
                <div className="rounded-md border border-border bg-panel-hi/45 px-2 py-1.5">Arrival: {arrivalLabel(forecast.arrivalDayMin, forecast.arrivalDayMax)}</div>
                <div className="rounded-md border border-border bg-panel-hi/45 px-2 py-1.5">Mass: {patch?.massTons ? `${Math.round(patch.massTons).toLocaleString()} t` : "Diffuse"}</div>
              </div>

              {forecast.isCoverageArea ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="inline-flex rounded border border-teal/35 bg-teal/10 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-teal">
                    Includes monitored beaches
                  </p>
                  {forecast.targetBeachIds?.[0] ? (
                    <button
                      type="button"
                      onClick={() => onOpenBeachDashboard(forecast.targetBeachIds?.[0] ?? 0)}
                      className="rounded-md border border-teal bg-teal/15 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-teal hover:bg-teal/20"
                    >
                      Open beach dashboard
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 inline-flex rounded border border-border px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-steel">
                  Outside current beach coverage
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
