type Level = "info" | "warn" | "error";

function ts() {
  return new Date().toISOString();
}

function log(level: Level, message: string, meta?: unknown) {
  const prefix = `[${ts()}] [${level.toUpperCase()}]`;
  if (meta === undefined) {
    // eslint-disable-next-line no-console
    console[level](`${prefix} ${message}`);
    return;
  }
  // eslint-disable-next-line no-console
  console[level](`${prefix} ${message}`, meta);
}

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};
