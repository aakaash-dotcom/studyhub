import pino from "pino";
import { env } from "./env";

/** Structured logs. Pretty in dev, JSON in production (so a VPS log shipper can parse it). */
export const log = pino({
  level: env().LOG_LEVEL,
  base: { app: "centum-studio" },
  transport:
    env().NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
      : undefined,
});

export function childLogger(bindings: Record<string, unknown>) {
  return log.child(bindings);
}
