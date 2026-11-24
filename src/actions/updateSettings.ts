import type { Config } from "../types/Config.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { error } from "../presentation/output.ts";
import { green } from "../utils/colors.ts";

export async function updateSettings(config: Config): Promise<Config> {
  const next: Config = { ...config, unit: config.unit === "c" ? "f" : "c" };
  await saveSettings(next.unit);
  console.log(green(`  Unidad cambiada a ${next.unit === "c" ? "°C" : "°F"}`));
  return next;
}