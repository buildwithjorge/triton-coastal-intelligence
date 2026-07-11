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
