import { describe, test, expect, beforeEach } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const tmp = mkdtempSync(join(tmpdir(), "weather-settings-"));
process.env.XDG_CONFIG_HOME = tmp;

const { loadSettings, saveSettings } = await import("../../src/storage/settingsStorage.ts");

describe("settingsStorage", () => {
  const dir = join(tmp, "weather-cli");

  beforeEach(async () => {
    const { rmSync } = await import("node:fs");
    rmSync(dir, { recursive: true, force: true });
  });

  test("defaults to c when no files", async () => {
    expect(await loadSettings()).toBe("c");
  });

  test("saveSettings + loadSettings round-trip", async () => {
    await saveSettings("f");
    expect(await loadSettings()).toBe("f");
  });

  test("corrupt settings.json returns c", async () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "settings.json"), "{bad");
    expect(await loadSettings()).toBe("c");
  });

  test("migrates legacy config.json unit", async () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "config.json"), JSON.stringify({ unit: "f" }));
    expect(await loadSettings()).toBe("f");
    const { readFileSync } = await import("node:fs");
    const written = JSON.parse(readFileSync(join(dir, "settings.json"), "utf8"));
    expect(written.unit).toBe("f");
  });

  test("corrupt legacy returns c", async () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "config.json"), "{bad");
    expect(await loadSettings()).toBe("c");
  });

  test("missing unit defaults to c", async () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "settings.json"), JSON.stringify({}));
    expect(await loadSettings()).toBe("c");
  });
});