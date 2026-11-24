import { describe, test, expect, beforeEach } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const tmp = mkdtempSync(join(tmpdir(), "weather-cities-"));
process.env.XDG_CONFIG_HOME = tmp;

const { loadCities, saveCities } = await import("../../src/storage/citiesStorage.ts");

describe("citiesStorage", () => {
  const dir = join(tmp, "weather-cli");

  beforeEach(async () => {
    // reset files
    try {
      const { rmSync } = await import("node:fs");
      rmSync(dir, { recursive: true, force: true });
    } catch {}
  });

  test("loadCities returns empty when no files", async () => {
    const data = await loadCities();
    expect(data).toEqual({ cities: [], defaultId: null });
  });

  test("saveCities + loadCities round-trip", async () => {
    const cities = [{ id: "1", name: "Bogotá", latitude: 4.7, longitude: -74.1 }];
    await saveCities(cities as any, "1");
    const data = await loadCities();
    expect(data.cities).toEqual(cities);
    expect(data.defaultId).toBe("1");
  });

  test("corrupt cities.json returns empty", async () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "cities.json"), "{not json");
    const data = await loadCities();
    expect(data).toEqual({ cities: [], defaultId: null });
  });

  test("migrates legacy config.json", async () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "config.json"),
      JSON.stringify({ cities: [{ id: "2", name: "Lima" }], defaultId: "2", unit: "f" }),
    );
    const data = await loadCities();
    expect(data.cities).toEqual([{ id: "2", name: "Lima" }] as any);
    expect(data.defaultId).toBe("2");
    // cities.json should have been written
    const { readFileSync } = await import("node:fs");
    const written = JSON.parse(readFileSync(join(dir, "cities.json"), "utf8"));
    expect(written.defaultId).toBe("2");
  });

  test("corrupt legacy returns empty", async () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "config.json"), "{bad");
    const data = await loadCities();
    expect(data).toEqual({ cities: [], defaultId: null });
  });
});