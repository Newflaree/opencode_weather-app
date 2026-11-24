import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import type { City } from "../../src/types/City.ts";

const askQueue: string[] = [];
const askMock = mock(async (_prompt: string) => askQueue.shift() ?? "");
mock.module("../../src/presentation/input.ts", () => ({ ask: askMock, closeRL: () => {} }));

const getDailyForecastMock = mock(async (_lat: number, _lon: number) => [
  { date: "2026-01-01", code: 0, max: 25, min: 15 },
]);
mock.module("../../src/api/weather.ts", () => ({
  getForecast: async () => ({ temperature: 20, time: "t" }),
  getDailyForecast: getDailyForecastMock,
  describeWeather: (c: number) => (c === 0 ? "☀️ Despejado" : "🌡️ Variable"),
}));

mock.module("../../src/presentation/spinner.ts", () => ({
  withSpinner: async (_msg: string, fn: () => Promise<any>) => fn(),
}));

const { getForecast7 } = await import("../../src/actions/getForecast.ts");

describe("getForecast7", () => {
  let config: Config;

  beforeEach(() => {
    const cities: City[] = [{ id: "a", name: "Bogotá", latitude: 1, longitude: 2 }];
    config = { cities, defaultId: "a", unit: "c" };
    askQueue.length = 0;
    askMock.mockClear();
    getDailyForecastMock.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("empty list logs error and does not fetch", async () => {
    config.cities = [];
    await getForecast7(config);
    expect(getDailyForecastMock).not.toHaveBeenCalled();
  });

  test("invalid index returns without fetching", async () => {
    askQueue.push("99");
    await getForecast7(config);
    expect(getDailyForecastMock).not.toHaveBeenCalled();
  });

  test("valid selection fetches daily forecast", async () => {
    askQueue.push("1");
    await getForecast7(config);
    expect(getDailyForecastMock).toHaveBeenCalled();
  });
});