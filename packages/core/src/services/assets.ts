import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { assets } from "../db/schema";
import { recordEvent } from "../audit";

export type Asset = typeof assets.$inferSelect;

export async function listAssets(limit = 60): Promise<Asset[]> {
  const db = await getDb();
  return db.select().from(assets).orderBy(desc(assets.createdAt)).limit(limit);
}

export async function getAsset(id: string): Promise<Asset | null> {
  const db = await getDb();
  const rows = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createAsset(input: typeof assets.$inferInsert): Promise<Asset> {
  const db = await getDb();
  const rows = await db.insert(assets).values(input).returning();
  const asset = rows[0]!;
  await recordEvent({ type: "asset.created", subject: asset.id, payload: { kind: asset.kind, source: asset.source } });
  return asset;
}
