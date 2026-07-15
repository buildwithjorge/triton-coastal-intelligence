/**
 * Module: apps/web/src/components/forecast/SargassumSirMap.tsx
 * Purpose: Hosts NOAA SIR access in-platform with a reliable external fallback.
 */

const NOAA_SIR_URL = "https://cwcgom.aoml.noaa.gov/SIR/";

export function SargassumSirMap() {
  return (
    <section className="panel rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-teal">NOAA SIR</p>
          <h3 className="text-lg font-semibold">Sargassum Inundation Report Map</h3>
          <p className="text-xs text-steel">NOAA serves this page with SAMEORIGIN framing restrictions, so in-app embedding may be blocked by the browser.</p>
        </div>

        <a
          href={NOAA_SIR_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-md border border-teal bg-teal/20 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-teal"
        >
          Open NOAA SIR
        </a>
      </div>

      <div className="rounded-xl border border-border bg-panel-hi/45 p-3">
        <iframe
          src={NOAA_SIR_URL}
          title="NOAA Sargassum Inundation Report"
          className="h-[72vh] min-h-[560px] w-full rounded-lg border border-border"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <p className="mt-2 text-xs text-steel">If the frame stays blank, use the "Open NOAA SIR" button above. That is expected behavior when NOAA frame protections are enforced.</p>
    </section>
  );
}
