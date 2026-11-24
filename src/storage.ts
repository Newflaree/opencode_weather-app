import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Config } from "./types.ts";

const BASE_DIR = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
const DIR = join(BASE_DIR, "weather-cli");
const FILE = join(DIR, "config.json");

const DEFAULT_CONFIG: Config = { cities: [], defaultId: null, unit: "c" };

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(FILE);
  if (!(await file.exists())) return { ...DEFAULT_CONFIG, cities: [] };
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as Config;
    return {
      cities: parsed.cities ?? [],
      defaultId: parsed.defaultId ?? null,
      unit: parsed.unit ?? "c",
    };
  } catch {
    return { ...DEFAULT_CONFIG, cities: [] };
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await Bun.write(FILE, JSON.stringify(config, null, 2));
}