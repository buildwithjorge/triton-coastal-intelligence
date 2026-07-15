import type { HorizonDay } from "./types";

export type Point = { x: number; y: number };

export type ProjectionBounds = {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
};

export const defaultBounds: ProjectionBounds = {
  minLon: -100,
  maxLon: 20,
  minLat: -5,
  maxLat: 35
};

export function projectLonLat(lon: number, lat: number, width: number, height: number, bounds = defaultBounds): Point {
  const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
  const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
  return { x, y };
}

export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function blobPath(cx: number, cy: number, baseRadius: number, seed: number): string {
  const points: Point[] = [];
  const vertices = 9;

  for (let i = 0; i < vertices; i += 1) {
    const angle = (Math.PI * 2 * i) / vertices;
    const wobble = 0.78 + (((seed + i * 71) % 100) / 100) * 0.48;
    const radius = baseRadius * wobble;
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    });
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ") + " Z";
}

function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function normal(a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

export function pointAlongPolyline(points: Point[], ratio: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const clampedRatio = Math.max(0, Math.min(1, ratio));
  const segments = points.slice(1).map((point, index) => ({
    start: points[index],
    end: point,
    len: distance(points[index], point)
  }));
  const total = segments.reduce((acc, segment) => acc + segment.len, 0);
  const target = total * clampedRatio;

  let walked = 0;
  for (const segment of segments) {
    if (walked + segment.len >= target) {
      const local = segment.len === 0 ? 0 : (target - walked) / segment.len;
      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * local,
        y: segment.start.y + (segment.end.y - segment.start.y) * local
      };
    }
    walked += segment.len;
  }

  return points[points.length - 1];
}

export function ribbonPath(points: Point[], startWidth: number, endWidth: number): string {
  if (points.length < 2) return "";

  const left: Point[] = [];
  const right: Point[] = [];

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const edgeNormal = normal(prev, next);
    const t = i / (points.length - 1);
    const width = startWidth + (endWidth - startWidth) * t;

    left.push({
      x: point.x + edgeNormal.x * width,
      y: point.y + edgeNormal.y * width
    });
    right.push({
      x: point.x - edgeNormal.x * width,
      y: point.y - edgeNormal.y * width
    });
  }

  const polygon = [...left, ...right.reverse()];
  return polygon
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ") + " Z";
}

export function pathProgressForHorizon(horizon: HorizonDay, arrivalMax: number): number {
  if (arrivalMax <= 0) return 0;
  return Math.max(0, Math.min(1, horizon / arrivalMax));
}
