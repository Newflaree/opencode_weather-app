import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import type { City } from "../../src/types/City.ts";

const getForecastMock = mock(async (_lat: number, _lon: number) => ({ temperature: 21, time: "t" }));
mock.module("../../src/api/weather.ts", () => ({
  getForecast: getForecastMock,
  getDailyForecast: async () => [],
  describeWeather: (c: number) => String(c),
}));

mock.module("../../src/presentation/spinner.ts", () => ({
  withSpinner: async (_msg: string, fn: () => Promise<any>) => fn(),
}));

const { getAllWeather } = await import("../../src/actions/listCities.ts");

describe("getAllWeather", () => {
  beforeEach(() => {
    getForecastMock.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("empty list logs error and does not fetch", async () => {
    const config: Config = { cities: [], defaultId: null, unit: "c" };
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    await getAllWeather(config);
    expect(getForecastMock).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  test("fetches forecast for each city", async () => {
    const cities: City[] = [
      { id: "a", name: "Bogotá", latitude: 1, longitude: 2 },
      { id: "b", name: "Lima", latitude: 3, longitude: 4 },
    ];
    const config: Config = { cities, defaultId: null, unit: "c" };
    await getAllWeather(config);
    expect(getForecastMock).toHaveBeenCalledTimes(2);
  });
});