import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Unit } from "../types/Weather.ts";
import type { Config } from "../types/Config.ts";
import { CONFIG_DIR_NAME, SETTINGS_FILE, LEGACY_CONFIG_FILE } from "../utils/constants.ts";

const BASE_DIR = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
const DIR = join(BASE_DIR, CONFIG_DIR_NAME);
const SETTINGS_PATH = join(DIR, SETTINGS_FILE);
const LEGACY_PATH = join(DIR, LEGACY_CONFIG_FILE);

export async function loadSettings(): Promise<Unit> {
  const file = Bun.file(SETTINGS_PATH);
  if (await file.exists()) {
    try {
      const parsed = (await file.json()) as { unit?: Unit };
      return parsed.unit ?? "c";
    } catch {
      return "c";
    }
  }
  const legacy = Bun.file(LEGACY_PATH);
  if (await legacy.exists()) {
    try {
      const parsed = (await legacy.json()) as Config;
      const unit = parsed.unit ?? "c";
      await saveSettings(unit);
      return unit;
    } catch {
      return "c";
    }
  }
  return "c";
}

export async function saveSettings(unit: Unit): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await Bun.write(SETTINGS_PATH, JSON.stringify({ unit }, null, 2));
}