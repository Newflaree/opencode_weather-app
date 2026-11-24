import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import { yellow } from "./colors.ts";

export function toDisplay(tempC: number, unit: Config["unit"]): string {
  const value =
    unit === "f"
      ? `${(tempC * 9 / 5 + 32).toFixed(1)}°F`
      : `${tempC.toFixed(1)}°C`;
  return yellow(value);
}

export function cityLabel(city: City): string {
  const parts = [city.name];
  if (city.admin1) parts.push(city.admin1);
  if (city.country) parts.push(city.country);
  return parts.join(", ");
}

export function formatDateLabel(date: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (date === today) return "hoy";
  return new Date(`${date}T00:00:00`).toLocaleDateString("es", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}