export interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export async function geocodeCity(name: string): Promise<GeoResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding falló: ${res.status}`);
  const data = (await res.json()) as { results?: GeoResult[] };
  return data.results ?? [];
}

export interface Forecast {
  temperature: number;
  time: string;
}

export async function getForecast(latitude: number, longitude: number): Promise<Forecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast falló: ${res.status}`);
  const data = (await res.json()) as { current: { temperature_2m: number; time: string } };
  return { temperature: data.current.temperature_2m, time: data.current.time };
}

