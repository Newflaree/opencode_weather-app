import type { Config } from "../types/Config.ts";
import { getDailyForecast, describeWeather } from "../api/weather.ts";
import { ask } from "../presentation/input.ts";
import { withSpinner } from "../presentation/spinner.ts";
import { error } from "../presentation/output.ts";
import { toDisplay, cityLabel, formatDateLabel } from "../utils/format.ts";

export async function getForecast7(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    error("  No hay ciudades guardadas.");
    return;
  }
  config.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
  const idxStr = await ask("  Número de ciudad para el pronóstico: ");
  const idx = Number(idxStr) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= config.cities.length) {
    error("  Opción inválida.");
    return;
  }
  const city = config.cities[idx]!;
  const days = await withSpinner(`Obteniendo pronóstico de ${city.name}…`, () =>
    getDailyForecast(city.latitude, city.longitude),
  );
  console.log("");
  console.log(`  ${cityLabel(city)}`);
  for (const d of days) {
    const label = formatDateLabel(d.date);
    const desc = describeWeather(d.code);
    console.log(
      `  ${label.padEnd(14)} ${desc.padEnd(24)} ${toDisplay(d.max, config.unit)} / ${toDisplay(d.min, config.unit)}`,
    );
  }
}