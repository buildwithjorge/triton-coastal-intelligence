import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Module: apps/web/src/components/feed/LiveIntelligenceFeed.tsx
 * Purpose: Renders right-rail operational activity and asset deployment status.
 */
import { useEffect, useMemo, useState } from "react";
import { getFeed } from "../../lib/api";
const levelClass = {
    Critical: "text-red",
    Warning: "text-amber",
    Info: "text-teal"
};
function agoText(input) {
    const ms = Date.now() - new Date(input).getTime();
    const minutes = Math.max(1, Math.floor(ms / 60000));
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
export function LiveIntelligenceFeed() {
    const [feed, setFeed] = useState([]);
    useEffect(() => {
        let active = true;
        const refresh = () => {
            getFeed(1, 8)
                .then((payload) => {
                if (!active)
                    return;
                setFeed(payload.items);
            })
                .catch(() => {
                if (!active)
                    return;
                setFeed([]);
            });
        };
        refresh();
        const timer = setInterval(refresh, 30000);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);
    const severeCount = useMemo(() => feed.filter((item) => item.level === "Critical").length, [feed]);
    return (_jsxs("aside", { className: "space-y-3", children: [_jsxs("section", { className: "panel rounded-2xl p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.15em] text-teal", children: "Activity Feed" }), _jsxs("span", { className: "rounded border border-border bg-panel-hi/70 px-2 py-1 text-[10px] text-steel", children: [severeCount, " critical"] })] }), _jsxs("div", { className: "space-y-2", children: [feed.map((item) => (_jsxs("article", { className: "rounded-lg border border-border bg-panel-hi/55 p-2", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("p", { className: `text-[10px] font-medium uppercase tracking-[0.14em] ${levelClass[item.level]}`, children: item.level }), _jsx("p", { className: "text-[10px] text-steel", children: agoText(item.timestamp) })] }), _jsx("p", { className: "mt-1 text-sm text-ice", children: item.title }), _jsx("p", { className: "text-[11px] text-steel", children: item.beachName ?? item.county ?? item.category })] }, item.id))), feed.length === 0 ? _jsx("p", { className: "text-xs text-steel", children: "Feed unavailable." }) : null] })] }), _jsxs("section", { className: "panel rounded-2xl p-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.15em] text-teal", children: "Asset Deployments" }), _jsxs("article", { className: "mt-2 rounded-lg border border-border bg-panel-hi/55 p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-ice", children: "Triton Harvester 01" }), _jsx("span", { className: "rounded border border-green/35 bg-green/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.13em] text-green", children: "Active" })] }), _jsx("p", { className: "text-xs text-steel", children: "Deerfield Beach" }), _jsx("div", { className: "mt-3 h-2 rounded-full bg-navy/70", children: _jsx("div", { className: "h-full w-[75%] rounded-full bg-teal" }) }), _jsxs("div", { className: "mt-2 flex items-center justify-between text-xs text-steel", children: [_jsx("span", { children: "ETA 12 min" }), _jsx("span", { children: "75%" })] })] })] })] }));
}
