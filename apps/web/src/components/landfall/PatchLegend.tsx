export function PatchLegend() {
  return (
    <section className="rounded-xl border border-border bg-panel-hi/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-steel">Legend</p>
      <ul className="mt-2 space-y-2 text-xs text-ice/90">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--teal)]" />
          High confidence cone
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--amber)]" />
          Medium confidence cone
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--mist)]" />
          Low confidence cone
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-2 w-5 border-b border-dashed border-ice/80" />
          Dashed edges show uncertainty envelope
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-[var(--seaweed)]" />
          Patch blob size scales with estimated mass
        </li>
      </ul>
    </section>
  );
}
