import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { withSpinner } from "../../src/presentation/spinner.ts";

describe("withSpinner (non-TTY)", () => {
  let originalIsTTY: any;

  beforeEach(() => {
    originalIsTTY = process.stdout.isTTY;
    (process.stdout as any).isTTY = false;
  });

  afterEach(() => {
    (process.stdout as any).isTTY = originalIsTTY;
  });

  test("writes msg and returns result", async () => {
    const writeSpy = spyOn(process.stdout, "write").mockImplementation(() => true);
    const res = await withSpinner("cargando", async () => 42);
    expect(res).toBe(42);
    expect(writeSpy).toHaveBeenCalled();
    const firstArg = writeSpy.mock.calls[0]?.[0];
    expect(String(firstArg)).toContain("cargando");
    writeSpy.mockRestore();
  });

  test("propagates errors", async () => {
    const writeSpy = spyOn(process.stdout, "write").mockImplementation(() => true);
    await expect(
      withSpinner("x", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    writeSpy.mockRestore();
  });
});

describe("withSpinner (TTY)", () => {
  let originalIsTTY: any;

  beforeEach(() => {
    originalIsTTY = process.stdout.isTTY;
    (process.stdout as any).isTTY = true;
    delete process.env.NO_COLOR;
  });

  afterEach(() => {
    (process.stdout as any).isTTY = originalIsTTY;
  });

  test("renders spinner frames and returns result", async () => {
    const writeSpy = spyOn(process.stdout, "write").mockImplementation(() => true);
    const res = await withSpinner("cargando", async () => {
      await new Promise((r) => setTimeout(r, 130));
      return 7;
    });
    expect(res).toBe(7);
    expect(writeSpy).toHaveBeenCalled();
    writeSpy.mockRestore();
  });

  test("propagates errors in TTY mode", async () => {
    const writeSpy = spyOn(process.stdout, "write").mockImplementation(() => true);
    await expect(
      withSpinner("x", async () => {
        await new Promise((r) => setTimeout(r, 130));
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    writeSpy.mockRestore();
  });
});