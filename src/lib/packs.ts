import { desc, eq, sql } from "drizzle-orm";
import { db, packs, packItems, items, type Pack, type Item } from "@/db";
import { newId, slugify, shortSuffix } from "./ids";

export type { Pack, Item } from "@/db";

export const MIN_ITEMS = 3; // lenient floor
export const MAX_ITEMS = 9; // hard cap

export class PublishError extends Error {}

export interface CanvasItem {
  itemId: string;
  linerNote: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface PackWithItems {
  pack: Pack;
  items: (CanvasItem & { item: Item })[];
}

// ---------- reads ----------

export async function getPackWithItems(packId: string): Promise<PackWithItems | null> {
  const pack = (await db.select().from(packs).where(eq(packs.id, packId)).limit(1))[0];
  if (!pack) return null;
  return withItems(pack);
}

export async function getPackBySlug(slug: string): Promise<PackWithItems | null> {
  const pack = (await db.select().from(packs).where(eq(packs.slug, slug)).limit(1))[0];
  if (!pack) return null;
  return withItems(pack);
}

async function withItems(pack: Pack): Promise<PackWithItems> {
  const pis = await db
    .select({ pi: packItems, item: items })
    .from(packItems)
    .innerJoin(items, eq(packItems.itemId, items.id))
    .where(eq(packItems.packId, pack.id))
    .orderBy(packItems.zIndex);
  return {
    pack,
    items: pis.map(({ pi, item }) => ({
      itemId: pi.itemId,
      linerNote: pi.linerNote,
      x: pi.x,
      y: pi.y,
      scale: pi.scale,
      rotation: pi.rotation,
      zIndex: pi.zIndex,
      item,
    })),
  };
}

// ---------- create (one shot; no auth, no drafts) ----------

export interface CreatePackInput {
  title: string;
  authorName?: string | null;
  dedicationRecipient?: string | null;
  remixParentId?: string | null;
  items: CanvasItem[];
  share?: { image9x16?: string; image1x1?: string };
}

export async function createPack(input: CreatePackInput): Promise<Pack> {
  const title = input.title.trim();
  if (!title) throw new PublishError("Give your pack a title first.");
  const clean = input.items.slice(0, MAX_ITEMS);
  if (clean.length < MIN_ITEMS) throw new PublishError(`Add at least ${MIN_ITEMS} items.`);

  let rootPackId: string | null = null;
  let generationDepth = 0;
  let parent: PackWithItems | null = null;
  if (input.remixParentId) {
    parent = await getPackWithItems(input.remixParentId);
    if (!parent) throw new PublishError("The pack you're forking no longer exists.");
    rootPackId = parent.pack.rootPackId ?? parent.pack.id;
    generationDepth = parent.pack.generationDepth + 1;
    // ≥1-change rule: a fork must differ from its parent
    if (!forkDiffers(parent, title, clean)) {
      throw new PublishError("Change at least one thing before forking.");
    }
  }

  const id = newId("p");
  const slug = await uniqueSlug(title);

  const pack = (
    await db
      .insert(packs)
      .values({
        id,
        title,
        slug,
        authorName: input.authorName?.trim() || null,
        dedicationRecipient: input.dedicationRecipient?.trim() || null,
        remixParentId: input.remixParentId ?? null,
        rootPackId,
        generationDepth,
        shareImage9x16: input.share?.image9x16 ?? null,
        shareImage1x1: input.share?.image1x1 ?? null,
      })
      .returning()
  )[0];

  await db.insert(packItems).values(
    clean.map((ci) => ({
      id: newId("pi"),
      packId: id,
      itemId: ci.itemId,
      linerNote: ci.linerNote,
      x: ci.x,
      y: ci.y,
      scale: ci.scale,
      rotation: ci.rotation,
      zIndex: ci.zIndex,
    })),
  );

  if (input.remixParentId) {
    await db
      .update(packs)
      .set({ remixCount: sql`${packs.remixCount} + 1` })
      .where(eq(packs.id, input.remixParentId));
  }

  return pack;
}

function forkDiffers(parent: PackWithItems, title: string, items: CanvasItem[]): boolean {
  if (parent.pack.title.trim() !== title) return true;
  const key = (its: { itemId: string; linerNote: string | null }[]) =>
    its.map((i) => `${i.itemId}:${i.linerNote ?? ""}`).sort().join("|");
  return key(parent.items) !== key(items);
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let candidate = `${base}-${shortSuffix()}`;
  for (let i = 0; i < 6; i++) {
    const clash = (await db.select({ id: packs.id }).from(packs).where(eq(packs.slug, candidate)).limit(1))[0];
    if (!clash) return candidate;
    candidate = `${base}-${shortSuffix()}`;
  }
  return `${base}-${newId()}`;
}

// ---------- feed / lineage ----------

export async function feed(limit = 40): Promise<PackWithItems[]> {
  const rows = await db.select().from(packs).orderBy(desc(packs.createdAt)).limit(limit);
  return Promise.all(rows.map(withItems));
}

export interface LineageNode {
  id: string;
  title: string;
  slug: string;
  authorName: string | null;
  depth: number;
}

export async function lineage(packId: string): Promise<LineageNode[]> {
  const res = await db.execute(sql`
    WITH RECURSIVE chain AS (
      SELECT id, title, slug, author_name, remix_parent_id, generation_depth
      FROM packs WHERE id = ${packId}
      UNION ALL
      SELECT p.id, p.title, p.slug, p.author_name, p.remix_parent_id, p.generation_depth
      FROM packs p JOIN chain c ON c.remix_parent_id = p.id
    )
    SELECT id, title, slug, author_name, generation_depth FROM chain ORDER BY generation_depth ASC
  `);
  return (res as unknown as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    authorName: (r.author_name as string) ?? null,
    depth: Number(r.generation_depth),
  }));
}
