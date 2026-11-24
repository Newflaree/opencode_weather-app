import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import type { Config } from "../../src/types/Config.ts";

const saveSettingsMock = mock(async () => {});
mock.module("../../src/storage/settingsStorage.ts", () => ({
  saveSettings: saveSettingsMock,
  loadSettings: async () => "c",
}));

mock.module("../../src/api/weather.ts", () => ({
  getForecast: async () => ({ temperature: 20, time: "t" }),
  getDailyForecast: async () => [],
  describeWeather: (c: number) => String(c),
}));

const { updateSettings } = await import("../../src/actions/updateSettings.ts");

describe("updateSettings", () => {
  beforeEach(() => {
    saveSettingsMock.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
  });

  test("toggles c -> f", async () => {
    const config: Config = { cities: [], defaultId: null, unit: "c" };
    const next = await updateSettings(config);
    expect(next.unit).toBe("f");
    expect(saveSettingsMock).toHaveBeenCalledWith("f");
  });

  test("toggles f -> c", async () => {
    const config: Config = { cities: [], defaultId: null, unit: "f" };
    const next = await updateSettings(config);
    expect(next.unit).toBe("c");
    expect(saveSettingsMock).toHaveBeenCalledWith("c");
  });
});