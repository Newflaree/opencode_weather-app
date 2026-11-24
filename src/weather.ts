import type { City, Config } from "./types.ts";
import { geocodeCity, getForecast } from "./api.ts";
import { saveConfig } from "./storage.ts";
import { ask } from "./menu.ts";
import { green, red, yellow } from "./colors.ts";

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

export async function showWeather(city: City, unit: Config["unit"]): Promise<void> {
  const forecast = await getForecast(city.latitude, city.longitude);
  console.log(`  ${cityLabel(city)}: ${toDisplay(forecast.temperature, unit)}`);
}

export async function actionDefault(config: Config): Promise<void> {
  const city = config.cities.find((c) => c.id === config.defaultId) ?? null;
  if (!city) {
    console.log(red("  No hay ciudad por defecto. Usa la opción 5."));
    return;
  }
  await showWeather(city, config.unit);
}

export async function actionAll(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas."));
    return;
  }
  for (const city of config.cities) {
    await showWeather(city, config.unit);
  }
}

export async function actionAdd(config: Config): Promise<Config> {
  const name = await ask("  Nombre de la ciudad: ");
  if (!name) {
    console.log(red("  Nombre vacío."));
    return config;
  }
  const results = await geocodeCity(name);
  if (results.length === 0) {
    console.log(red("  Ciudad no encontrada."));
    return config;
  }
  console.log("  Coincidencias encontradas:");
  results.forEach((r, i) => {
    const label = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
    console.log(`  ${i + 1}. ${label}`);
  });
  console.log("  0. Cancelar");
  const idxStr = await ask("  Selecciona una opción: ");
  const idx = Number(idxStr);
  if (Number.isNaN(idx) || idx < 0 || idx > results.length) {
    console.log(red("  Opción inválida."));
    return config;
  }
  if (idx === 0) {
    console.log(red("  Cancelado."));
    return config;
  }
  const geo = results[idx - 1]!;
  const city: City = {
    id: crypto.randomUUID(),
    name: geo.name,
    latitude: geo.latitude,
    longitude: geo.longitude,
    country: geo.country,
    admin1: geo.admin1,
  };
  const cities = [...config.cities, city];
  let defaultId = config.defaultId;
  const isFirst = !defaultId;
  if (isFirst) defaultId = city.id;
  const next: Config = { ...config, cities, defaultId };
  await saveConfig(next);
  const forecast = await getForecast(city.latitude, city.longitude);
  console.log(green(`  ${cityLabel(city)} agregada. Clima actual: ${toDisplay(forecast.temperature, next.unit)}`));
  if (isFirst) console.log(green("  Establecida como ciudad por defecto."));
  return next;
}

export async function actionDelete(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades para eliminar."));
    return config;
  }
  config.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
  const idxStr = await ask("  Número de ciudad a eliminar: ");
  const idx = Number(idxStr) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= config.cities.length) {
    console.log(red("  Opción inválida."));
    return config;
  }
  const removed = config.cities[idx]!;
  const cities = config.cities.filter((_, i) => i !== idx);
  let defaultId = config.defaultId;
  if (defaultId === removed.id) {
    defaultId = null;
    console.log(red(`  Se eliminó la ciudad por defecto (${removed.name}). Establece una nueva con la opción 5.`));
  }
  const next: Config = { ...config, cities, defaultId };
  await saveConfig(next);
  console.log(green(`  ${removed.name} eliminada.`));
  return next;
}

export async function actionSetDefault(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas."));
    return config;
  }
  config.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
  const idxStr = await ask("  Número de ciudad por defecto: ");
  const idx = Number(idxStr) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= config.cities.length) {
    console.log(red("  Opción inválida."));
    return config;
  }
  const chosen = config.cities[idx]!;
  const next: Config = { ...config, defaultId: chosen.id };
  await saveConfig(next);
  console.log(green(`  Ciudad por defecto: ${chosen.name}`));
  return next;
}

export async function actionSettings(config: Config): Promise<Config> {
  const next: Config = { ...config, unit: config.unit === "c" ? "f" : "c" };
  await saveConfig(next);
  console.log(green(`  Unidad cambiada a ${next.unit === "c" ? "°C" : "°F"}`));
  return next;
}