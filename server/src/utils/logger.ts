type LogLevel = "info" | "warn" | "error" | "debug";

const LOG_COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(
      `${LOG_COLORS.dim}[${formatTimestamp()}]${LOG_COLORS.reset} ${LOG_COLORS.cyan}[INFO]${LOG_COLORS.reset} ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ""
    );
  },

  warn: (message: string, meta?: unknown) => {
    console.warn(
      `${LOG_COLORS.dim}[${formatTimestamp()}]${LOG_COLORS.reset} ${LOG_COLORS.yellow}[WARN]${LOG_COLORS.reset} ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ""
    );
  },

  error: (message: string, error?: unknown) => {
    console.error(
      `${LOG_COLORS.dim}[${formatTimestamp()}]${LOG_COLORS.reset} ${LOG_COLORS.red}[ERROR]${LOG_COLORS.reset} ${message}`,
      error instanceof Error ? error.stack : error ? JSON.stringify(error, null, 2) : ""
    );
  },

  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `${LOG_COLORS.dim}[${formatTimestamp()}]${LOG_COLORS.reset} ${LOG_COLORS.magenta}[DEBUG]${LOG_COLORS.reset} ${message}`,
        meta ? JSON.stringify(meta, null, 2) : ""
      );
    }
  },

  http: (method: string, path: string, statusCode: number, durationMs: number) => {
    const statusColor =
      statusCode >= 500
        ? LOG_COLORS.red
        : statusCode >= 400
        ? LOG_COLORS.yellow
        : statusCode >= 300
        ? LOG_COLORS.cyan
        : LOG_COLORS.green;

    console.log(
      `${LOG_COLORS.dim}[${formatTimestamp()}]${LOG_COLORS.reset} ${LOG_COLORS.blue}[HTTP]${LOG_COLORS.reset} ${method} ${path} -> ${statusColor}${statusCode}${LOG_COLORS.reset} (${durationMs}ms)`
    );
  },
};

export default logger;
