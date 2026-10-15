import { asc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { brands } from "../db/schema";
import { recordEvent } from "../audit";

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function listBrands(): Promise<Brand[]> {
  const db = await getDb();
  return db.select().from(brands).orderBy(asc(brands.name));
}

export async function getBrand(id: string): Promise<Brand | null> {
  const db = await getDb();
  const rows = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const db = await getDb();
  const rows = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createBrand(input: Omit<NewBrand, "slug"> & { slug?: string }): Promise<Brand> {
  const db = await getDb();
  const slug = input.slug?.trim() || slugify(input.name);
  const rows = await db
    .insert(brands)
    .values({ ...input, slug })
    .returning();
  const brand = rows[0]!;
  await recordEvent({ type: "brand.created", subject: brand.id, payload: { name: brand.name, slug } });
  return brand;
}

export async function updateBrand(id: string, patch: Partial<NewBrand>): Promise<Brand | null> {
  const db = await getDb();
  const rows = await db
    .update(brands)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning();
  if (rows[0]) await recordEvent({ type: "brand.updated", subject: id, payload: { fields: Object.keys(patch) } });
  return rows[0] ?? null;
}
