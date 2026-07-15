import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function labelForDay(day) {
    return day === 0 ? "NOW" : `+${day}D`;
}
export function HorizonControl({ selected, onChange, horizons }) {
    return (_jsxs("section", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.14em] text-steel", children: "Forecast Horizon" }), _jsx("div", { className: "mt-2 grid grid-cols-5 gap-1.5", children: horizons.map((horizon) => {
                    const active = selected === horizon;
                    return (_jsx("button", { type: "button", onClick: () => onChange(horizon), className: `rounded-md border px-2 py-2 text-[11px] font-medium uppercase tracking-[0.13em] ${active ? "border-teal bg-teal/20 text-teal" : "border-border bg-navy/45 text-steel hover:border-teal/35"}`, children: labelForDay(horizon) }, horizon));
                }) }), _jsx("p", { className: "mt-2 text-xs text-steel", children: "User-driven snapshot only. No autonomous animation." })] }));
}
