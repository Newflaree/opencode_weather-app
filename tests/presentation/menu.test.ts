import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import type { Config } from "../../src/types/Config.ts";

const getWeatherMock = mock(async (_c: any) => {});
const getAllWeatherMock = mock(async (_c: any) => {});
const addCityMock = mock(async (c: any) => c);
const removeCityMock = mock(async (c: any) => c);
const setDefaultCityMock = mock(async (c: any) => c);
const getForecast7Mock = mock(async (_c: any) => {});
const updateSettingsMock = mock(async (c: any) => c);

mock.module("../../src/actions/getWeather.ts", () => ({ getDefaultWeather: getWeatherMock }));
mock.module("../../src/actions/listCities.ts", () => ({ getAllWeather: getAllWeatherMock }));
mock.module("../../src/actions/addCity.ts", () => ({ addCity: addCityMock }));
mock.module("../../src/actions/removeCity.ts", () => ({ removeCity: removeCityMock }));
mock.module("../../src/actions/setDefaultCity.ts", () => ({ setDefaultCity: setDefaultCityMock }));
mock.module("../../src/actions/getForecast.ts", () => ({ getForecast7: getForecast7Mock }));
mock.module("../../src/actions/updateSettings.ts", () => ({ updateSettings: updateSettingsMock }));

const { renderMenu, isMenuOption, handleOption } = await import("../../src/presentation/menu.ts");

describe("isMenuOption", () => {
  test("valid options", () => {
    for (const v of ["1", "2", "3", "4", "5", "6", "8", "9"]) {
      expect(isMenuOption(v)).toBe(true);
    }
  });

  test("invalid options", () => {
    expect(isMenuOption("7")).toBe(false);
    expect(isMenuOption("0")).toBe(false);
    expect(isMenuOption("abc")).toBe(false);
    expect(isMenuOption("")).toBe(false);
  });
});

describe("renderMenu", () => {
  test("prints menu with city count and unit", () => {
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    const cfg: Config = {
      cities: [{ id: "1", name: "X", latitude: 0, longitude: 0 }],
      defaultId: null,
      unit: "f",
    };
    renderMenu(cfg);
    const calls = logSpy.mock.calls.map((c) => c[0]);
    logSpy.mockRestore();
    const joined = calls.join("\n");
    expect(joined).toContain("WEATHER CLI");
    expect(joined).toContain("todas las ciudades (1)");
    expect(joined).toContain("Ajustes (°F)");
  });
});

describe("handleOption", () => {
  const config: Config = { cities: [], defaultId: null, unit: "c" };

  beforeEach(() => {
    getWeatherMock.mockClear();
    getAllWeatherMock.mockClear();
    addCityMock.mockClear();
    removeCityMock.mockClear();
    setDefaultCityMock.mockClear();
    getForecast7Mock.mockClear();
    updateSettingsMock.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("option 9 returns null", async () => {
    const res = await handleOption("9", config);
    expect(res).toBeNull();
  });

  test("option 1 returns same config", async () => {
    const res = await handleOption("1", config);
    expect(res).toEqual(config);
    expect(getWeatherMock).toHaveBeenCalledWith(config);
  });

  test("option 2 calls getAllWeather and returns config", async () => {
    const res = await handleOption("2", config);
    expect(getAllWeatherMock).toHaveBeenCalledWith(config);
    expect(res).toEqual(config);
  });

  test("option 3 calls addCity and returns its result", async () => {
    const next = { ...config, unit: "f" as const };
    addCityMock.mockImplementation(async () => next);
    const res = await handleOption("3", config);
    expect(addCityMock).toHaveBeenCalledWith(config);
    expect(res).toEqual(next);
  });

  test("option 4 calls removeCity and returns its result", async () => {
    removeCityMock.mockImplementation(async () => config);
    const res = await handleOption("4", config);
    expect(removeCityMock).toHaveBeenCalledWith(config);
    expect(res).toEqual(config);
  });

  test("option 5 calls setDefaultCity and returns its result", async () => {
    setDefaultCityMock.mockImplementation(async () => config);
    const res = await handleOption("5", config);
    expect(setDefaultCityMock).toHaveBeenCalledWith(config);
    expect(res).toEqual(config);
  });

  test("option 6 calls getForecast7 and returns config", async () => {
    const res = await handleOption("6", config);
    expect(getForecast7Mock).toHaveBeenCalledWith(config);
    expect(res).toEqual(config);
  });

  test("option 8 calls updateSettings and returns its result", async () => {
    updateSettingsMock.mockImplementation(async (c: any) => ({ ...c, unit: "f" }));
    const res = await handleOption("8", config);
    expect(updateSettingsMock).toHaveBeenCalledWith(config);
    expect(res).not.toEqual(config);
  });
});