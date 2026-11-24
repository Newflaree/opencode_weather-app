import type { Config } from "../types/Config.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import { cyan } from "../utils/colors.ts";
import { MENU_WIDTH } from "../utils/constants.ts";
import * as getWeather from "../actions/getWeather.ts";
import * as listCities from "../actions/listCities.ts";
import * as addCity from "../actions/addCity.ts";
import * as removeCity from "../actions/removeCity.ts";
import * as setDefaultCity from "../actions/setDefaultCity.ts";
import * as getForecast from "../actions/getForecast.ts";
import * as updateSettings from "../actions/updateSettings.ts";

const LINE = cyan("═".repeat(MENU_WIDTH));

export function renderMenu(config: Config): void {
  const unitLabel = config.unit === "c" ? "°C" : "°F";
  console.log("");
  console.log(LINE);
  console.log(cyan("         WEATHER CLI"));
  console.log(LINE);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log("  6. Pronóstico 7 días");
  console.log(`  8. Ajustes (${unitLabel})`);
  console.log("  9. Salir");
  console.log(LINE);
}

export function isMenuOption(value: string): value is MenuOption {
  return ["1", "2", "3", "4", "5", "6", "8", "9"].includes(value);
}

export async function handleOption(option: MenuOption, config: Config): Promise<Config | null> {
  switch (option) {
    case "1":
      await getWeather.getDefaultWeather(config);
      return config;
    case "2":
      await listCities.getAllWeather(config);
      return config;
    case "3":
      return await addCity.addCity(config);
    case "4":
      return await removeCity.removeCity(config);
    case "5":
      return await setDefaultCity.setDefaultCity(config);
    case "6":
      await getForecast.getForecast7(config);
      return config;
    case "8":
      return await updateSettings.updateSettings(config);
    case "9":
      return null;
  }
}