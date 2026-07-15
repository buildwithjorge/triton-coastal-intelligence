import type { HorizonDay } from "./types";

type Props = {
  selected: HorizonDay;
  onChange: (horizon: HorizonDay) => void;
  horizons: readonly HorizonDay[];
};

function labelForDay(day: HorizonDay): string {
  return day === 0 ? "NOW" : `+${day}D`;
}

export function HorizonControl({ selected, onChange, horizons }: Props) {
  return (
    <section className="rounded-xl border border-border bg-panel-hi/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-steel">Forecast Horizon</p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {horizons.map((horizon) => {
          const active = selected === horizon;
          return (
            <button
              key={horizon}
              type="button"
              onClick={() => onChange(horizon)}
              className={`rounded-md border px-2 py-2 text-[11px] font-medium uppercase tracking-[0.13em] ${
                active ? "border-teal bg-teal/20 text-teal" : "border-border bg-navy/45 text-steel hover:border-teal/35"
              }`}
            >
              {labelForDay(horizon)}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-steel">User-driven snapshot only. No autonomous animation.</p>
    </section>
  );
}
