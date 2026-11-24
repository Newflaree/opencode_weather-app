import readline from "node:readline";
import type { Config } from "./types.ts";

const LINE = "═".repeat(40);

let rl: readline.Interface | null = null;
let iterator: AsyncIterator<string> | null = null;

function getIterator() {
  if (!iterator) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    iterator = rl[Symbol.asyncIterator]();
  }
  return iterator;
}

export function renderMenu(config: Config): void {
  const unitLabel = config.unit === "c" ? "°C" : "°F";
  console.log("");
  console.log(LINE);
  console.log("         WEATHER CLI");
  console.log(LINE);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${unitLabel})`);
  console.log("  9. Salir");
  console.log(LINE);
}

export async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const { value, done } = await getIterator().next();
  if (done) return "";
  return (value ?? "").trim();
}

export function closeRL(): void {
  rl?.close();
  rl = null;
  iterator = null;
}