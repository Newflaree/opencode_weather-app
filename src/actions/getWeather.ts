import type { Config } from "../types/Config.ts";
import { getForecast } from "../api/weather.ts";
import { withSpinner } from "../presentation/spinner.ts";
import { error } from "../presentation/output.ts";
import { toDisplay, cityLabel } from "../utils/format.ts";

export async function getDefaultWeather(config: Config): Promise<void> {
  const city = config.cities.find((c) => c.id === config.defaultId) ?? null;
  if (!city) {
    error("  No hay ciudad por defecto. Usa la opción 5.");
    return;
  }
  await withSpinner("Obteniendo clima…", async () => {
    const forecast = await getForecast(city.latitude, city.longitude);
    console.log(`  ${cityLabel(city)}: ${toDisplay(forecast.temperature, config.unit)}`);
  });
}