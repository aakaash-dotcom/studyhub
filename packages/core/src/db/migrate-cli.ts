/**
 * `npm run db:migrate` — applies migrations and exits.
 * Used by the Docker entrypoint; the app also self-migrates on first connect.
 */
import { getRuntime } from "./client";
import { log } from "../logger";

const runtime = await getRuntime();
log.info({ driver: runtime.driver }, "migrations up to date");
await runtime.close();
