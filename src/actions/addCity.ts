import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import { geocodeCity } from "../api/geocoding.ts";
import { getForecast } from "../api/weather.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { ask } from "../presentation/input.ts";
import { withSpinner } from "../presentation/spinner.ts";
import { error, success } from "../presentation/output.ts";
import { red, green } from "../utils/colors.ts";
import { toDisplay, cityLabel } from "../utils/format.ts";

export async function addCity(config: Config): Promise<Config> {
  const name = await ask("  Nombre de la ciudad: ");
  if (!name) {
    error("  Nombre vacío.");
    return config;
  }
  const results = await withSpinner("Buscando ciudad…", () => geocodeCity(name));
  if (results.length === 0) {
    error("  Ciudad no encontrada.");
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
    error("  Opción inválida.");
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
  await saveCities(next.cities, next.defaultId);
  const forecast = await withSpinner("Obteniendo clima…", () =>
    getForecast(city.latitude, city.longitude),
  );
  console.log(green(`  ${cityLabel(city)} agregada. Clima actual: ${toDisplay(forecast.temperature, next.unit)}`));
  if (isFirst) console.log(green("  Establecida como ciudad por defecto."));
  return next;
}