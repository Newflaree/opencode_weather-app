import { describe, test, expect } from "bun:test";
import { toDisplay, cityLabel, formatDateLabel } from "../../src/utils/format.ts";
import type { City } from "../../src/types/City.ts";

const city: City = {
  id: "1",
  name: "Bogotá",
  latitude: 4.7,
  longitude: -74.1,
  country: "Colombia",
  admin1: "Cundinamarca",
};

describe("toDisplay", () => {
  test("celsius", () => {
    expect(toDisplay(20.4, "c")).toContain("20.4°C");
  });

  test("fahrenheit conversion", () => {
    expect(toDisplay(0, "f")).toContain("32.0°F");
  });

  test("rounds to one decimal", () => {
    expect(toDisplay(20.456, "c")).toContain("20.5°C");
  });
});

describe("cityLabel", () => {
  test("includes all parts", () => {
    expect(cityLabel(city)).toBe("Bogotá, Cundinamarca, Colombia");
  });

  test("only name when optional fields missing", () => {
    const minimal: City = { id: "2", name: "Madrid", latitude: 0, longitude: 0 };
    expect(cityLabel(minimal)).toBe("Madrid");
  });

  test("omits empty admin1", () => {
    const c: City = { id: "3", name: "Lima", latitude: 0, longitude: 0, country: "Perú" };
    expect(cityLabel(c)).toBe("Lima, Perú");
  });
});

describe("formatDateLabel", () => {
  test("today returns 'hoy'", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(formatDateLabel(today)).toBe("hoy");
  });

  test("other date returns a localized string", () => {
    const res = formatDateLabel("2020-01-01");
    expect(typeof res).toBe("string");
    expect(res.length).toBeGreaterThan(0);
  });
});