/**
 * Module:
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
async function fetchJson(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
        throw new Error(`Request failed ${response.status}: ${path}`);
    }
    return response.json();
}
export function getBeaches(county) {
    const query = county ? `?county=${encodeURIComponent(county)}` : "";
    return fetchJson(`/api/beaches${query}`);
}
export function getBeachDetail(id) {
    return fetchJson(`/api/beaches/${id}`);
}
export function getProviderHealth() {
    return fetchJson("/api/integrations/providers");
}
export function getLiveBeachIntelligence(id) {
    return fetchJson(`/api/integrations/beaches/${id}/live`);
}
export async function syncBeachIntelligence(id) {
    const response = await fetch(`${API_BASE}/api/integrations/sync/beaches/${id}`, {
        method: "POST"
    });
    if (!response.ok) {
        throw new Error(`Request failed ${response.status}: /api/integrations/sync/beaches/${id}`);
    }
    return (await response.json());
}
export function getForecasts(beachId) {
    const query = beachId ? `?beachId=${beachId}` : "";
    return fetchJson(`/api/forecast${query}`);
}
export function getForecastDrivers(beachId) {
    return fetchJson(`/api/forecast/drivers/top?beachId=${beachId}`);
}
export function getCountyRollups() {
    return fetchJson("/api/counties");
}
export async function createObservation(payload) {
    const response = await fetch(`${API_BASE}/api/observations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error(`Request failed ${response.status}: /api/observations`);
    }
    return response.json();
}
export async function uploadObservationPhoto(fileName, dataUrl) {
    const response = await fetch(`${API_BASE}/api/observations/photos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fileName, dataUrl })
    });
    if (!response.ok) {
        throw new Error(`Request failed ${response.status}: /api/observations/photos`);
    }
    return (await response.json());
}
export function getRegionReport() {
    return fetchJson("/api/reports/region");
}
export function getBeachReport(id) {
    return fetchJson(`/api/reports/beaches/${id}`);
}
export function getFeed(page = 1, pageSize = 20) {
    return fetchJson(`/api/feed?page=${page}&pageSize=${pageSize}`);
}
export function getCameraFeeds(county) {
    const query = county ? `?county=${encodeURIComponent(county)}` : "";
    return fetchJson(`/api/cameras${query}`);
}
