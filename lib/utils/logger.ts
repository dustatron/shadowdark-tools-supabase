/**
 * Logger utility for development and production environments.
 * Suppresses debug logs in production.
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  debug: isDev ? console.log.bind(console, "[DEBUG]") : () => {},
  info: console.info.bind(console, "[INFO]"),
  warn: console.warn.bind(console, "[WARN]"),
  error: console.error.bind(console, "[ERROR]"),
};
