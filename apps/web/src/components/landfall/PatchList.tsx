import type { SargassumPatch } from "./types";

type Props = {
  patches: SargassumPatch[];
};

function massLabel(massTons: number | null): string {
  if (massTons === null) return "Diffuse";
  return `${Math.round(massTons).toLocaleString()} t`;
}

export function PatchList({ patches }: Props) {
  return (
    <section className="rounded-xl border border-border bg-panel-hi/55 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-steel">Active Patches</p>
        <p className="font-mono text-[11px] text-teal">{patches.length} tracked</p>
      </div>

      <div className="mt-2 space-y-2">
        {patches.map((patch) => (
          <article key={patch.id} className="rounded-lg border border-border bg-navy/45 p-2.5">
            <p className="text-xs font-medium text-ice">{patch.label}</p>
            <p className="mt-1 font-mono text-[11px] text-steel">{patch.lat.toFixed(1)}N | {Math.abs(patch.lon).toFixed(1)}W</p>
            <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[11px] text-ice/85">
              <span>Mass: {massLabel(patch.massTons)}</span>
              <span>{patch.source}</span>
            </div>
            <p className="mt-1 text-[11px] text-steel">Observed: {patch.lastObserved}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
