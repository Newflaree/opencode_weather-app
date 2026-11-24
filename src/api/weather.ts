import type { Forecast, DailyForecast } from "../types/Weather.ts";
import { API_FORECAST } from "../utils/constants.ts";

export async function getForecast(latitude: number, longitude: number): Promise<Forecast> {
  const url = `${API_FORECAST}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast falló: ${res.status}`);
  const data = (await res.json()) as { current: { temperature_2m: number; time: string } };
  return { temperature: data.current.temperature_2m, time: data.current.time };
}

export async function getDailyForecast(latitude: number, longitude: number): Promise<DailyForecast[]> {
  const url =
    `${API_FORECAST}?latitude=${latitude}&longitude=${longitude}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pronóstico falló: ${res.status}`);
  const data = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };
  const { time, weather_code, temperature_2m_max, temperature_2m_min } = data.daily;
  return time.map((date, i) => ({
    date,
    code: weather_code[i] ?? 0,
    max: temperature_2m_max[i] ?? 0,
    min: temperature_2m_min[i] ?? 0,
  }));
}

export function describeWeather(code: number): string {
  if (code === 0) return "☀️ Despejado";
  if (code >= 1 && code <= 3) return "⛅ Parcialmente nublado";
  if (code === 45 || code === 48) return "🌫️ Niebla";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️ Lluvia";
  if (code >= 71 && code <= 77) return "🌨️ Nieve";
  if (code >= 95 && code <= 99) return "⛈️ Tormenta";
  return "🌡️ Variable";
}