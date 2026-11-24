import { cyan } from "../utils/colors.ts";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL = 100;

function isTty(): boolean {
  return Boolean(process.stdout.isTTY) && !("NO_COLOR" in process.env);
}

export async function withSpinner<T>(
  msg: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isTty()) {
    process.stdout.write(`${msg}\n`);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      throw err;
    }
  }

  let frame = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r${cyan(FRAMES[frame++ % FRAMES.length]!)} ${msg}`);
  }, INTERVAL);

  try {
    const result = await fn();
    clearInterval(timer);
    process.stdout.write("\r\x1b[K");
    return result;
  } catch (err) {
    clearInterval(timer);
    process.stdout.write("\r\x1b[K");
    throw err;
  }
}