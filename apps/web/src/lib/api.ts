/**
 * Module: 
 * Purpose: Implements part of the Triton Coastal Intelligence application.
 */

import type { Beach } from "@triton/shared";
import type {
  BeachDetailResponse,
  CameraFeedResponse,
  BeachReportResponse,
  CountyRollupResponse,
  ForecastDriverTopResponse,
  ForecastListItem,
  FeedListResponse,
  LiveBeachIntelligenceResponse,
  ObservationCreatePayload,
  ObservationPhotoUploadResponse,
  ProviderHealthResponse,
  RegionReportResponse,
  SyncBeachResponse
} from "../types/api";

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

export function getProviderHealth() {
  return fetchJson<ProviderHealthResponse>("/api/integrations/providers");
}

export function getLiveBeachIntelligence(id: number) {
  return fetchJson<LiveBeachIntelligenceResponse>(`/api/integrations/beaches/${id}/live`);
}

export async function syncBeachIntelligence(id: number) {
  const response = await fetch(`${API_BASE}/api/integrations/sync/beaches/${id}`, {
    method: "POST"
  });
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: /api/integrations/sync/beaches/${id}`);
  }

  return (await response.json()) as SyncBeachResponse;
}

export function getForecasts(beachId?: number) {
  const query = beachId ? `?beachId=${beachId}` : "";
  return fetchJson<ForecastListItem[]>(`/api/forecast${query}`);
}

export function getForecastDrivers(beachId: number) {
  return fetchJson<ForecastDriverTopResponse>(`/api/forecast/drivers/top?beachId=${beachId}`);
}

export function getCountyRollups() {
  return fetchJson<CountyRollupResponse[]>("/api/counties");
}

export async function createObservation(payload: ObservationCreatePayload) {
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

export async function uploadObservationPhoto(fileName: string, dataUrl: string) {
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

  return (await response.json()) as ObservationPhotoUploadResponse;
}

export function getRegionReport() {
  return fetchJson<RegionReportResponse>("/api/reports/region");
}

export function getBeachReport(id: number) {
  return fetchJson<BeachReportResponse>(`/api/reports/beaches/${id}`);
}

export function getFeed(page = 1, pageSize = 20) {
  return fetchJson<FeedListResponse>(`/api/feed?page=${page}&pageSize=${pageSize}`);
}

export function getCameraFeeds(county?: string) {
  const query = county ? `?county=${encodeURIComponent(county)}` : "";
  return fetchJson<CameraFeedResponse>(`/api/cameras${query}`);
}
