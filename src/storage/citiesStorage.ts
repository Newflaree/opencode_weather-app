import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import { CONFIG_DIR_NAME, CITIES_FILE, LEGACY_CONFIG_FILE } from "../utils/constants.ts";

const BASE_DIR = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
const DIR = join(BASE_DIR, CONFIG_DIR_NAME);
const CITIES_PATH = join(DIR, CITIES_FILE);
const LEGACY_PATH = join(DIR, LEGACY_CONFIG_FILE);

interface CitiesData {
  cities: City[];
  defaultId: string | null;
}

export async function loadCities(): Promise<CitiesData> {
  const file = Bun.file(CITIES_PATH);
  if (await file.exists()) {
    try {
      const parsed = (await file.json()) as CitiesData;
      return { cities: parsed.cities ?? [], defaultId: parsed.defaultId ?? null };
    } catch {
      return { cities: [], defaultId: null };
    }
  }
  const legacy = Bun.file(LEGACY_PATH);
  if (await legacy.exists()) {
    try {
      const parsed = (await legacy.json()) as Config;
      const data = { cities: parsed.cities ?? [], defaultId: parsed.defaultId ?? null };
      await saveCities(data.cities, data.defaultId);
      return data;
    } catch {
      return { cities: [], defaultId: null };
    }
  }
  return { cities: [], defaultId: null };
}

export async function saveCities(cities: City[], defaultId: string | null): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await Bun.write(CITIES_PATH, JSON.stringify({ cities, defaultId }, null, 2));
}