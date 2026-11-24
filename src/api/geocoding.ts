import type { GeoResult } from "../types/Weather.ts";
import { API_GEOCODING } from "../utils/constants.ts";

export async function geocodeCity(name: string): Promise<GeoResult[]> {
  const url = `${API_GEOCODING}?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding falló: ${res.status}`);
  const data = (await res.json()) as { results?: GeoResult[] };
  return data.results ?? [];
}