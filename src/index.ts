import type { Config } from "./types/Config.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import { renderMenu, handleOption, isMenuOption } from "./presentation/menu.ts";
import { ask, closeRL } from "./presentation/input.ts";
import { green, red } from "./utils/colors.ts";

async function main(): Promise<void> {
  const { cities, defaultId } = await loadCities();
  const unit = await loadSettings();
  let config: Config = { cities, defaultId, unit };

  while (true) {
    renderMenu(config);
    const opt = await ask("  Selecciona una opción: ");
    if (!isMenuOption(opt)) {
      console.log(red("  Opción no válida."));
      continue;
    }
    if (opt === "9") {
      console.log(green("  ¡Hasta luego!"));
      closeRL();
      return;
    }
    const next = await handleOption(opt, config);
    if (next) config = next;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});