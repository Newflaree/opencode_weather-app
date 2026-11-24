import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { geocodeCity } from "../../src/api/geocoding.ts";
import { API_GEOCODING } from "../../src/utils/constants.ts";

describe("geocodeCity", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns results from API", async () => {
    const results = [{ name: "Bogotá", latitude: 4.7, longitude: -74.1 }];
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ results }), { status: 200 })) as unknown as typeof fetch;

    const out = await geocodeCity("Bogotá");
    expect(out).toEqual(results);
  });

  test("returns [] when no results", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({}), { status: 200 })) as unknown as typeof fetch;
    expect(await geocodeCity("xyz")).toEqual([]);
  });

  test("throws on !ok", async () => {
    globalThis.fetch = (async () =>
      new Response("", { status: 500 })) as unknown as typeof fetch;
    await expect(geocodeCity("x")).rejects.toThrow(/Geocoding falló: 500/);
  });

  test("builds URL with encoded name and language=es", async () => {
    let captured = "";
    globalThis.fetch = (async (url: unknown) => {
      captured = String(url);
      return new Response(JSON.stringify({ results: [] }), { status: 200 });
    }) as unknown as typeof fetch;

    await geocodeCity("San José");
    expect(captured).toContain(API_GEOCODING);
    expect(captured).toContain("name=San%20Jos%C3%A9");
    expect(captured).toContain("language=es");
    expect(captured).toContain("count=5");
  });
});