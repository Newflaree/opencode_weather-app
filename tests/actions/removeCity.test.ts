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

const { removeCity } = await import("../../src/actions/removeCity.ts");

describe("removeCity", () => {
  let config: Config;

  beforeEach(() => {
    const cities: City[] = [
      { id: "a", name: "Bogotá", latitude: 0, longitude: 0 },
      { id: "b", name: "Lima", latitude: 0, longitude: 0 },
    ];
    config = { cities, defaultId: "a", unit: "c" };
    askQueue.length = 0;
    askMock.mockClear();
    saveCitiesMock.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("empty list returns config unchanged", async () => {
    config.cities = [];
    config.defaultId = null;
    const next = await removeCity(config);
    expect(next).toEqual(config);
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("invalid number returns config unchanged", async () => {
    askQueue.push("99");
    const next = await removeCity(config);
    expect(next).toEqual(config);
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("removing default sets defaultId to null", async () => {
    askQueue.push("1");
    const next = await removeCity(config);
    expect(next.cities).toHaveLength(1);
    expect(next.defaultId).toBeNull();
    expect(saveCitiesMock).toHaveBeenCalled();
  });

  test("removing non-default keeps defaultId", async () => {
    askQueue.push("2");
    const next = await removeCity(config);
    expect(next.cities).toHaveLength(1);
    expect(next.defaultId).toBe("a");
  });
});