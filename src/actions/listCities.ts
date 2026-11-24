import type { Config } from "../types/Config.ts";
import { getForecast } from "../api/weather.ts";
import { withSpinner } from "../presentation/spinner.ts";
import { error } from "../presentation/output.ts";
import { toDisplay, cityLabel } from "../utils/format.ts";

export async function getAllWeather(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    error("  No hay ciudades guardadas.");
    return;
  }
  for (const city of config.cities) {
    await withSpinner(`Obteniendo clima de ${city.name}…`, async () => {
      const forecast = await getForecast(city.latitude, city.longitude);
      console.log(`  ${cityLabel(city)}: ${toDisplay(forecast.temperature, config.unit)}`);
    });
  }
}