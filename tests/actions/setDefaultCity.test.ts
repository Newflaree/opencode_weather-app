import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import type { Config } from "../../src/types/Config.ts";
import type { City } from "../../src/types/City.ts";

const askQueue: string[] = [];
const askMock = mock(async (_prompt: string) => askQueue.shift() ?? "");
mock.module("../../src/presentation/input.ts", () => ({ ask: askMock, closeRL: () => {} }));

const saveCitiesMock = mock(async () => {});
mock.module("../../src/storage/citiesStorage.ts", () => ({
  saveCities: saveCitiesMock,
  loadCities: async () => ({ cities: [], defaultId: null }),
}));

mock.module("../../src/api/weather.ts", () => ({
  getForecast: async () => ({ temperature: 20, time: "t" }),
  getDailyForecast: async () => [],
  describeWeather: (c: number) => String(c),
}));

const { setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");

describe("setDefaultCity", () => {
  let config: Config;

  beforeEach(() => {
    const cities: City[] = [
      { id: "a", name: "Bogotá", latitude: 0, longitude: 0 },
      { id: "b", name: "Lima", latitude: 0, longitude: 0 },
    ];
    config = { cities, defaultId: null, unit: "c" };
    askQueue.length = 0;
    askMock.mockClear();
    saveCitiesMock.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("empty list returns config unchanged", async () => {
    config.cities = [];
    const next = await setDefaultCity(config);
    expect(next).toEqual(config);
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("invalid number returns config unchanged", async () => {
    askQueue.push("0");
    const next = await setDefaultCity(config);
    expect(next).toEqual(config);
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("sets default city", async () => {
    askQueue.push("2");
    const next = await setDefaultCity(config);
    expect(next.defaultId).toBe("b");
    expect(saveCitiesMock).toHaveBeenCalled();
  });
});