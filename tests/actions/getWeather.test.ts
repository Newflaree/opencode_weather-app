import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import type { City } from "../../src/types/City.ts";

const getForecastMock = mock(async (_lat: number, _lon: number) => ({ temperature: 22, time: "t" }));
mock.module("../../src/api/weather.ts", () => ({
  getForecast: getForecastMock,
  getDailyForecast: async () => [],
  describeWeather: (c: number) => String(c),
}));

mock.module("../../src/presentation/spinner.ts", () => ({
  withSpinner: async (_msg: string, fn: () => Promise<any>) => fn(),
}));

const { getDefaultWeather } = await import("../../src/actions/getWeather.ts");

describe("getDefaultWeather", () => {
  beforeEach(() => {
    getForecastMock.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("no default city logs error", async () => {
    const config: Config = { cities: [], defaultId: null, unit: "c" };
    await getDefaultWeather(config);
    expect(getForecastMock).not.toHaveBeenCalled();
  });

  test("fetches forecast for default city", async () => {
    const city: City = { id: "a", name: "Bogotá", latitude: 1, longitude: 2 };
    const config: Config = { cities: [city], defaultId: "a", unit: "c" };
    await getDefaultWeather(config);
    expect(getForecastMock).toHaveBeenCalledWith(1, 2);
  });
});