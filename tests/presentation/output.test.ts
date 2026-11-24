import { describe, test, expect, spyOn } from "bun:test";
import { success, error, warn, info, title } from "../../src/presentation/output.ts";

describe("output helpers", () => {
  test("all helpers print the message", () => {
    const spy = spyOn(console, "log").mockImplementation(() => {});
    success("s");
    error("e");
    warn("w");
    info("i");
    title("t");
    const args = spy.mock.calls.map((c) => c[0]);
    // Colores pueden estar activos o no según el entorno, así que verificamos contención.
    expect(args[0]).toContain("s");
    expect(args[1]).toContain("e");
    expect(args[2]).toContain("w");
    expect(args[3]).toContain("i");
    expect(args[4]).toContain("t");
    spy.mockRestore();
  });
});