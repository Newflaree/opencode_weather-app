import readline from "node:readline";

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