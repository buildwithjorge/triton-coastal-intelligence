import type { Beach } from "@triton/shared";
import type { BeachDetailResponse } from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export function getBeaches(county?: string) {
  const query = county ? `?county=${encodeURIComponent(county)}` : "";
  return fetchJson<Beach[]>(`/api/beaches${query}`);
}

export function getBeachDetail(id: number) {
  return fetchJson<BeachDetailResponse>(`/api/beaches/${id}`);
}
