import type { Config } from "../types/Config.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { ask } from "../presentation/input.ts";
import { error } from "../presentation/output.ts";
import { red, green } from "../utils/colors.ts";
import { cityLabel } from "../utils/format.ts";

export async function removeCity(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    error("  No hay ciudades para eliminar.");
    return config;
  }
  config.cities.forEach((c, i) => console.log(`  ${i + 1}. ${cityLabel(c)}`));
  const idxStr = await ask("  Número de ciudad a eliminar: ");
  const idx = Number(idxStr) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= config.cities.length) {
    error("  Opción inválida.");
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
  await saveCities(next.cities, next.defaultId);
  console.log(green(`  ${removed.name} eliminada.`));
  return next;
}