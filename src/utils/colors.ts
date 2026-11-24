const enabled =
  Boolean(process.stdout.isTTY) && !("NO_COLOR" in process.env);

export const cyan = (s: string): string =>
  enabled ? `\x1b[36m${s}\x1b[0m` : s;

export const yellow = (s: string): string =>
  enabled ? `\x1b[33m${s}\x1b[0m` : s;

export const green = (s: string): string =>
  enabled ? `\x1b[32m${s}\x1b[0m` : s;

export const red = (s: string): string =>
  enabled ? `\x1b[31m${s}\x1b[0m` : s;