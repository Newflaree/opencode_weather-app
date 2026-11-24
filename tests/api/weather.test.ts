import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import {
  getForecast,
  getDailyForecast,
  describeWeather,
} from "../../src/api/weather.ts";

describe("describeWeather", () => {
  test("despejado", () => expect(describeWeather(0)).toBe("☀️ Despejado"));
  test("parcialmente nublado 1-3", () => {
    expect(describeWeather(1)).toBe("⛅ Parcialmente nublado");
    expect(describeWeather(3)).toBe("⛅ Parcialmente nublado");
  });
  test("niebla 45/48", () => {
    expect(describeWeather(45)).toBe("🌫️ Niebla");
    expect(describeWeather(48)).toBe("🌫️ Niebla");
  });
  test("lluvia 51-67 y 80-82", () => {
    expect(describeWeather(51)).toBe("🌧️ Lluvia");
    expect(describeWeather(67)).toBe("🌧️ Lluvia");
    expect(describeWeather(80)).toBe("🌧️ Lluvia");
    expect(describeWeather(82)).toBe("🌧️ Lluvia");
  });
  test("nieve 71-77", () => {
    expect(describeWeather(71)).toBe("🌨️ Nieve");
    expect(describeWeather(77)).toBe("🌨️ Nieve");
  });
  test("tormenta 95-99", () => {
    expect(describeWeather(95)).toBe("⛈️ Tormenta");
    expect(describeWeather(99)).toBe("⛈️ Tormenta");
  });
  test("variable fallback", () => {
    expect(describeWeather(100)).toBe("🌡️ Variable");
  });
});

describe("getForecast", () => {
  let originalFetch: typeof fetch;
  beforeEach(() => (originalFetch = globalThis.fetch));
  afterEach(() => (globalThis.fetch = originalFetch));

  test("returns temperature and time", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ current: { temperature_2m: 18.5, time: "2026-01-01T12:00" } }),
        { status: 200 },
      )) as unknown as typeof fetch;
    const r = await getForecast(4.7, -74.1);
    expect(r).toEqual({ temperature: 18.5, time: "2026-01-01T12:00" });
  });

  test("throws on !ok", async () => {
    globalThis.fetch = (async () =>
      new Response("", { status: 404 })) as unknown as typeof fetch;
    await expect(getForecast(0, 0)).rejects.toThrow(/Forecast falló: 404/);
  });
});

describe("getDailyForecast", () => {
  let originalFetch: typeof fetch;
  beforeEach(() => (originalFetch = globalThis.fetch));
  afterEach(() => (globalThis.fetch = originalFetch));

  test("maps arrays into DailyForecast", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          daily: {
            time: ["2026-01-01", "2026-01-02"],
            weather_code: [0, 3],
            temperature_2m_max: [25, 20],
            temperature_2m_min: [15, 10],
          },
        }),
        { status: 200 },
      )) as unknown as typeof fetch;

    const out = await getDailyForecast(0, 0);
    expect(out).toEqual([
      { date: "2026-01-01", code: 0, max: 25, min: 15 },
      { date: "2026-01-02", code: 3, max: 20, min: 10 },
    ]);
  });

  test("throws on !ok", async () => {
    globalThis.fetch = (async () =>
      new Response("", { status: 503 })) as unknown as typeof fetch;
    await expect(getDailyForecast(0, 0)).rejects.toThrow(/Pronóstico falló: 503/);
  });

  test("uses 0 for missing array entries", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          daily: {
            time: ["2026-01-01", "2026-01-02"],
            weather_code: [1],
            temperature_2m_max: [25],
            temperature_2m_min: [15],
          },
        }),
        { status: 200 },
      )) as unknown as typeof fetch;
    const out = await getDailyForecast(0, 0);
    expect(out[1]).toEqual({ date: "2026-01-02", code: 0, max: 0, min: 0 });
  });
});