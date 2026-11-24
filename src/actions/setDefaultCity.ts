import type { Config } from "../types/Config.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { ask } from "../presentation/input.ts";
import { error } from "../presentation/output.ts";
import { green } from "../utils/colors.ts";
import { cityLabel } from "../utils/format.ts";

export async function setDefaultCity(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    error("  No hay ciudades guardadas.");
    return config;
  }
  config.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
  const idxStr = await ask("  Número de ciudad por defecto: ");
  const idx = Number(idxStr) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= config.cities.length) {
    error("  Opción inválida.");
    return config;
  }
  const chosen = config.cities[idx]!;
  const next: Config = { ...config, defaultId: chosen.id };
  await saveCities(next.cities, next.defaultId);
  console.log(green(`  Ciudad por defecto: ${chosen.name}`));
  return next;
}