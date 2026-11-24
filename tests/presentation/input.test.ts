import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { Readable, Writable } from "node:stream";
import { ask, closeRL } from "../../src/presentation/input.ts";

describe("ask (real readline)", () => {
  let originalStdin: any;
  let originalStdout: any;
  let output: string;

  beforeEach(() => {
    closeRL();
    originalStdin = process.stdin;
    originalStdout = process.stdout;
    output = "";
    const fakeStdout: any = new Writable({
      write(chunk: any, _enc: any, cb: any) {
        output += chunk.toString();
        cb();
        return true;
      },
    });
    process.stdout = fakeStdout;
  });

  afterEach(() => {
    closeRL();
    process.stdin = originalStdin;
    process.stdout = originalStdout;
  });

  test("returns trimmed input and writes prompt", async () => {
    process.stdin = Readable.from(["  hola  \n"]) as any;
    const res = await ask("prompt: ");
    expect(res).toBe("hola");
    expect(output).toContain("prompt: ");
  });

  test("handles multiple sequential asks", async () => {
    process.stdin = Readable.from(["first\n", "second\n"]) as any;
    expect(await ask("> ")).toBe("first");
    expect(await ask("> ")).toBe("second");
  });

  test("returns empty string on EOF", async () => {
    process.stdin = Readable.from([]) as any;
    const res = await ask("x");
    expect(res).toBe("");
  });

  test("closeRL resets state for reuse", async () => {
    process.stdin = Readable.from(["a\n"]) as any;
    expect(await ask("> ")).toBe("a");
    closeRL();
    process.stdin = Readable.from(["b\n"]) as any;
    expect(await ask("> ")).toBe("b");
  });
});