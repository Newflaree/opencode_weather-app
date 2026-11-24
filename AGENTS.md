# AGENTS.md

## Commands

- Run app: `bun run src/index.ts` (or `bun src/index.ts`)
- Typecheck: `bun run typecheck` (runs `bun check`)
- No test or lint scripts exist yet; do not claim tests pass.

## Project

- Bun + TypeScript, ESM. Entry point `index.ts`. `tsconfig.json` is strict with `noEmit`, bundler module resolution, and `verbatimModuleSyntax` (use `import type` for type-only imports).
- Weather CLI (spec in `README.md`, Spanish): console menu for default city weather, all saved cities, search/add city, delete city, set default, and settings (°C/°F). Goal is a compiled executable; `out/` and `dist/` are gitignored.
- HTTP flow uses OpenMeteo in two calls: geocoding `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`, then forecast `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`.

## Notes

- Prefer Bun built-ins (`fetch`, file I/O) over Node polyfills.
- README is the source of truth for the menu/UI; keep output matching its example.
