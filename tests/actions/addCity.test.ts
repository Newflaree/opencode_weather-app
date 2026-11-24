import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import type { Config } from "../../src/types/Config.ts";

const askQueue: string[] = [];
const askMock = mock(async (_prompt: string) => askQueue.shift() ?? "");
mock.module("../../src/presentation/input.ts", () => ({ ask: askMock, closeRL: () => {} }));

const saveCitiesMock = mock(async () => {});
mock.module("../../src/storage/citiesStorage.ts", () => ({
  saveCities: saveCitiesMock,
  loadCities: async () => ({ cities: [], defaultId: null }),
}));

const geocodeMock = mock(async (_name: string) => [] as any[]);
mock.module("../../src/api/geocoding.ts", () => ({ geocodeCity: geocodeMock }));

const getForecastMock = mock(async () => ({ temperature: 20, time: "t" }));
mock.module("../../src/api/weather.ts", () => ({
  getForecast: getForecastMock,
  getDailyForecast: async () => [],
  describeWeather: (c: number) => String(c),
}));

const { addCity } = await import("../../src/actions/addCity.ts");

describe("addCity", () => {
  let config: Config;

  beforeEach(() => {
    config = { cities: [], defaultId: null, unit: "c" };
    askQueue.length = 0;
    askMock.mockClear();
    saveCitiesMock.mockClear();
    geocodeMock.mockClear();
    getForecastMock.mockClear();
    // suppress console
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("empty name returns config unchanged", async () => {
    askQueue.push("");
    const next = await addCity(config);
    expect(next).toEqual(config);
    expect(geocodeMock).not.toHaveBeenCalled();
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("no results returns config unchanged", async () => {
    askQueue.push("Atlantis");
    geocodeMock.mockImplementation(async () => []);
    const next = await addCity(config);
    expect(next).toEqual(config);
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("invalid option returns config unchanged", async () => {
    askQueue.push("Bogotá", "99");
    geocodeMock.mockImplementation(async () => [
      { name: "Bogotá", latitude: 4.7, longitude: -74.1, country: "Colombia" },
    ]);
    const next = await addCity(config);
    expect(next).toEqual(config);
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("cancel (0) returns config unchanged", async () => {
    askQueue.push("Bogotá", "0");
    geocodeMock.mockImplementation(async () => [
      { name: "Bogotá", latitude: 4.7, longitude: -74.1, country: "Colombia" },
    ]);
    const next = await addCity(config);
    expect(next).toEqual(config);
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("success adds city and sets default when first", async () => {
    askQueue.push("Bogotá", "1");
    geocodeMock.mockImplementation(async () => [
      { name: "Bogotá", latitude: 4.7, longitude: -74.1, country: "Colombia", admin1: "Cundinamarca" },
    ]);
    const next = await addCity(config);
    expect(next.cities).toHaveLength(1);
    expect(next.cities[0]!.name).toBe("Bogotá");
    expect(next.defaultId).toBe(next.cities[0]!.id);
    expect(saveCitiesMock).toHaveBeenCalled();
    expect(getForecastMock).toHaveBeenCalled();
  });

  test("success does not override default when cities exist", async () => {
    const existing = { id: "x", name: "Madrid", latitude: 0, longitude: 0 };
    config = { cities: [existing as any], defaultId: "x", unit: "c" };
    askQueue.push("Lima", "1");
    geocodeMock.mockImplementation(async () => [
      { name: "Lima", latitude: -12, longitude: -77, country: "Perú" },
    ]);
    const next = await addCity(config);
    expect(next.cities).toHaveLength(2);
    expect(next.defaultId).toBe("x");
  });
});