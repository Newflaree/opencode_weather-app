import { loadConfig } from "./src/storage.ts";
import type { Config } from "./src/types.ts";
import { renderMenu, ask, closeRL } from "./src/menu.ts";
import * as actions from "./src/weather.ts";
import { green, red } from "./src/colors.ts";

async function main(): Promise<void> {
  let config: Config = await loadConfig();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    renderMenu(config);
    const opt = await ask("  Selecciona una opción: ");
    switch (opt) {
      case "1":
        await actions.actionDefault(config);
        break;
      case "2":
        await actions.actionAll(config);
        break;
      case "3":
        config = await actions.actionAdd(config);
        break;
      case "4":
        config = await actions.actionDelete(config);
        break;
      case "5":
        config = await actions.actionSetDefault(config);
        break;
      case "6":
        await actions.actionForecast7(config);
        break;
      case "8":
        config = await actions.actionSettings(config);
        break;
      case "9":
        console.log(green("  ¡Hasta luego!"));
        closeRL();
        return;
      default:
        console.log(red("  Opción no válida."));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});