import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function massLabel(massTons) {
    if (massTons === null)
        return "Diffuse";
    return `${Math.round(massTons).toLocaleString()} t`;
}
export function PatchList({ patches }) {
    return (_jsxs("section", { className: "rounded-xl border border-border bg-panel-hi/55 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.14em] text-steel", children: "Active Patches" }), _jsxs("p", { className: "font-mono text-[11px] text-teal", children: [patches.length, " tracked"] })] }), _jsx("div", { className: "mt-2 space-y-2", children: patches.map((patch) => (_jsxs("article", { className: "rounded-lg border border-border bg-navy/45 p-2.5", children: [_jsx("p", { className: "text-xs font-medium text-ice", children: patch.label }), _jsxs("p", { className: "mt-1 font-mono text-[11px] text-steel", children: [patch.lat.toFixed(1), "N | ", Math.abs(patch.lon).toFixed(1), "W"] }), _jsxs("div", { className: "mt-1 flex items-center justify-between gap-2 font-mono text-[11px] text-ice/85", children: [_jsxs("span", { children: ["Mass: ", massLabel(patch.massTons)] }), _jsx("span", { children: patch.source })] }), _jsxs("p", { className: "mt-1 text-[11px] text-steel", children: ["Observed: ", patch.lastObserved] })] }, patch.id))) })] }));
}
