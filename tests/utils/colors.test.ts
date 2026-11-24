import { describe, test, expect, beforeEach, afterEach } from "bun:test";

describe("colors (non-TTY)", () => {
  let originalIsTTY: any;
  let colors: any;

  beforeEach(async () => {
    originalIsTTY = process.stdout.isTTY;
    (process.stdout as any).isTTY = false;
    colors = await import("../../src/utils/colors.ts");
  });

  afterEach(() => {
    (process.stdout as any).isTTY = originalIsTTY;
  });

  test("returns input unchanged when not a TTY", () => {
    expect(colors.cyan("hola")).toBe("hola");
    expect(colors.yellow("hola")).toBe("hola");
    expect(colors.green("hola")).toBe("hola");
    expect(colors.red("hola")).toBe("hola");
  });
});