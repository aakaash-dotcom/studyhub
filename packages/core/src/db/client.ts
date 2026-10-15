import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { env } from "../env";
import { log } from "../logger";
import { migrations } from "./migrations";
import { schema } from "./schema";
import { sql } from "drizzle-orm";

/**
 * One database handle for the whole app.
 *
 * dev  (no DATABASE_URL): embedded PGlite at .data/pglite — a real Postgres in
 *                         wasm, so the SQL and Drizzle queries are identical to
 *                         production. Zero setup, no Docker needed.
 * prod (DATABASE_URL set): node-postgres (postgres-js) with a connection pool.
 *
 * Both drivers are Postgres dialect, so `Db` is the same type at the call site.
 */
export type Db = PgliteDatabase<typeof schema>;

type Runtime = { db: Db; driver: "pglite" | "postgres"; close: () => Promise<void> };

const globalForDb = globalThis as unknown as { __centumRuntime?: Promise<Runtime> };

export function getRuntime(): Promise<Runtime> {
  globalForDb.__centumRuntime ??= createRuntime();
  return globalForDb.__centumRuntime;
}

export async function getDb(): Promise<Db> {
  return (await getRuntime()).db;
}

async function createRuntime(): Promise<Runtime> {
  const e = env();
  if (e.DATABASE_URL) {
    const client = postgres(e.DATABASE_URL, { max: 10, onnotice: () => {} });
    const db = drizzlePostgres(client, { schema }) as unknown as Db;
    await runMigrations({
      exec: async (script) => {
        await client.unsafe(script);
      },
      query: async (statement) => client.unsafe(statement) as unknown as Array<Record<string, unknown>>,
      driver: "postgres",
    });
    log.info("database ready (postgres)");
    return { db, driver: "postgres", close: () => client.end({ timeout: 5 }) };
  }

  const dataDir = join(findRepoRoot(), ".data", "pglite");
  mkdirSync(dataDir, { recursive: true });
  const pglite = new PGlite(join(dataDir));
  await pglite.waitReady;
  const db = drizzlePglite(pglite, { schema }) as unknown as Db;
  await runMigrations({
    exec: async (script) => {
      await pglite.exec(script);
    },
    query: async (statement) => {
      const res = await pglite.query<Record<string, unknown>>(statement);
      return res.rows;
    },
    driver: "pglite",
  });
  log.info({ dataDir }, "database ready (embedded PGlite)");
  return { db, driver: "pglite", close: () => pglite.close() };
}

/**
 * ⚠ Embedded mode (no DATABASE_URL) is SINGLE-PROCESS.
 *
 * PGlite runs Postgres inside the calling process and keeps the database in
 * memory, persisting to .data/pglite. Two processes therefore hold two copies:
 * rows written by `npm run demo:data` are invisible to an already-running
 * `npm run dev` until it restarts, and two writers can clobber each other.
 *
 * Consequences, both deliberate:
 *   - dev: the worker/scheduler runs INSIDE the studio process (see the S6
 *     worker entry), not as a second process.
 *   - production: set DATABASE_URL to a real Postgres, where the studio and the
 *     worker are separate processes and this does not apply.
 *
 * Finds the workspace root so the embedded database always lives in the SAME
 * place, no matter which workspace the process was started from (Next dev runs
 * with cwd=apps/studio, the seed script with cwd=the repo root — both must open
 * the same .data/pglite).
 */
export function findRepoRoot(start = process.cwd()): string {
  let current = resolve(start);
  for (let depth = 0; depth < 6; depth += 1) {
    const pkgPath = join(current, "package.json");
    if (existsSync(pkgPath) && existsSync(join(current, "packages", "core", "src", "db"))) return current;
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === "centum-studio") return current;
      } catch {
        /* keep walking */
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return resolve(start);
}

type MigrationRunner = {
  exec: (script: string) => Promise<void>;
  query: (statement: string) => Promise<Array<Record<string, unknown>>>;
  driver: "pglite" | "postgres";
};

/** Idempotent: applies each migration once, tracked in `_migrations`. */
export async function runMigrations(runner: MigrationRunner): Promise<string[]> {
  await runner.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());`,
  );
  const appliedRows = await runner.query(`SELECT name FROM _migrations`);
  const applied = new Set(appliedRows.map((r) => String(r.name)));
  const newlyApplied: string[] = [];

  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    log.info({ migration: migration.name }, "applying migration");
    await runner.exec(migration.sql);
    await runner.exec(
      `INSERT INTO _migrations (name) VALUES ('${migration.name.replace(/'/g, "''")}') ON CONFLICT DO NOTHING;`,
    );
    newlyApplied.push(migration.name);
  }
  return newlyApplied;
}

/** Small helper so callers can await readiness with a friendly error. */
export async function pingDb(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    return true;
  } catch (error) {
    log.error({ err: error }, "database ping failed");
    return false;
  }
}
