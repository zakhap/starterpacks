import { and, desc, eq, sql } from "drizzle-orm";
import { db, packs, packItems, items, users, votes, type Pack, type Item } from "@/db";
import { newId, slugify, shortSuffix } from "./ids";

export const MIN_ITEMS = 3; // spec §7.4: "minimum 4ish" — lenient floor for MVP
export const MAX_ITEMS = 9; // hard cap (§7.4)

export interface CanvasItem {
  itemId: string;
  linerNote: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  inherited: boolean;
}

export interface PackWithItems {
  pack: Pack;
  author: { id: string; handle: string; displayName: string | null };
  items: (CanvasItem & { item: Item })[];
}

// ---------- reads ----------

export async function getPackWithItems(packId: string): Promise<PackWithItems | null> {
  const row = (
    await db
      .select({ pack: packs, author: { id: users.id, handle: users.handle, displayName: users.displayName } })
      .from(packs)
      .innerJoin(users, eq(packs.authorId, users.id))
      .where(eq(packs.id, packId))
      .limit(1)
  )[0];
  if (!row) return null;
  const pis = await db
    .select({ pi: packItems, item: items })
    .from(packItems)
    .innerJoin(items, eq(packItems.itemId, items.id))
    .where(eq(packItems.packId, packId))
    .orderBy(packItems.zIndex);
  return {
    pack: row.pack,
    author: row.author,
    items: pis.map(({ pi, item }) => ({
      itemId: pi.itemId,
      linerNote: pi.linerNote,
      x: pi.x,
      y: pi.y,
      scale: pi.scale,
      rotation: pi.rotation,
      zIndex: pi.zIndex,
      inherited: pi.inherited,
      item,
    })),
  };
}

export async function getPublishedPack(handle: string, slug: string): Promise<PackWithItems | null> {
  const row = (
    await db
      .select({ id: packs.id })
      .from(packs)
      .innerJoin(users, eq(packs.authorId, users.id))
      .where(and(eq(users.handle, handle), eq(packs.slug, slug), eq(packs.status, "published")))
      .limit(1)
  )[0];
  if (!row) return null;
  return getPackWithItems(row.id);
}

// ---------- create / remix ----------

export async function createDraft(
  authorId: string,
  opts: { title?: string; remixParentId?: string; dedicationRecipient?: string } = {},
): Promise<Pack> {
  let remixParentId: string | null = null;
  let rootPackId: string | null = null;
  let generationDepth = 0;
  let title = opts.title ?? "";
  let seedItems: CanvasItem[] = [];

  if (opts.remixParentId) {
    const parent = await getPackWithItems(opts.remixParentId);
    if (!parent) throw new Error("Parent pack not found");
    remixParentId = parent.pack.id;
    rootPackId = parent.pack.rootPackId ?? parent.pack.id;
    generationDepth = parent.pack.generationDepth + 1;
    title = title || parent.pack.title;
    seedItems = parent.items.map((it) => ({
      itemId: it.itemId,
      linerNote: it.linerNote,
      x: it.x,
      y: it.y,
      scale: it.scale,
      rotation: it.rotation,
      zIndex: it.zIndex,
      inherited: true, // E6-T3: inherited visual state until touched
    }));
  }

  const id = newId("p");
  const pack = (
    await db
      .insert(packs)
      .values({
        id,
        authorId,
        title,
        slug: id, // provisional; real slug assigned at publish
        status: "draft",
        remixParentId,
        rootPackId,
        generationDepth,
        dedicationRecipient: opts.dedicationRecipient ?? null,
      })
      .returning()
  )[0];

  if (seedItems.length) await writeItems(id, seedItems);
  return pack;
}

// ---------- save draft ----------

async function writeItems(packId: string, canvasItems: CanvasItem[]) {
  await db.delete(packItems).where(eq(packItems.packId, packId));
  if (!canvasItems.length) return;
  await db.insert(packItems).values(
    canvasItems.slice(0, MAX_ITEMS).map((ci) => ({
      id: newId("pi"),
      packId,
      itemId: ci.itemId,
      linerNote: ci.linerNote,
      x: ci.x,
      y: ci.y,
      scale: ci.scale,
      rotation: ci.rotation,
      zIndex: ci.zIndex,
      inherited: ci.inherited,
    })),
  );
}

export async function saveDraft(
  userId: string,
  packId: string,
  data: { title?: string; dedicationRecipient?: string | null; items?: CanvasItem[] },
): Promise<Pack> {
  const pack = (await db.select().from(packs).where(eq(packs.id, packId)).limit(1))[0];
  if (!pack) throw new Error("Pack not found");
  if (pack.authorId !== userId) throw new Error("FORBIDDEN");

  const updated = (
    await db
      .update(packs)
      .set({
        title: data.title ?? pack.title,
        dedicationRecipient:
          data.dedicationRecipient === undefined ? pack.dedicationRecipient : data.dedicationRecipient,
        updatedAt: new Date(),
      })
      .where(eq(packs.id, packId))
      .returning()
  )[0];

  if (data.items) await writeItems(packId, data.items);
  return updated;
}

// ---------- publish ----------

export class PublishError extends Error {}

export async function publish(
  userId: string,
  packId: string,
  share: { image9x16?: string; image1x1?: string } = {},
): Promise<Pack> {
  const detail = await getPackWithItems(packId);
  if (!detail) throw new PublishError("Pack not found");
  if (detail.pack.authorId !== userId) throw new Error("FORBIDDEN");

  const { pack, items: pi } = detail;
  if (!pack.title.trim()) throw new PublishError("Give your pack a title first.");
  if (pi.length < MIN_ITEMS) throw new PublishError(`Add at least ${MIN_ITEMS} items.`);

  // ≥1-change rule for remixes (E6-T2)
  if (pack.remixParentId) {
    const parent = await getPackWithItems(pack.remixParentId);
    if (parent && !packsDiffer(parent, detail)) {
      throw new PublishError("Change at least one thing before republishing a remix.");
    }
  }

  // assign a stable, unique-per-author slug from the (final) title
  const slug = await uniqueSlug(pack.authorId, pack.title, pack.id);

  const published = (
    await db
      .update(packs)
      .set({
        status: "published",
        slug,
        shareImage9x16: share.image9x16 ?? pack.shareImage9x16,
        shareImage1x1: share.image1x1 ?? pack.shareImage1x1,
        publishedAt: pack.publishedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(packs.id, packId))
      .returning()
  )[0];

  // bump parent remix counter once (only first publish of a remix)
  if (pack.remixParentId && !pack.publishedAt) {
    await db
      .update(packs)
      .set({ remixCount: sql`${packs.remixCount} + 1` })
      .where(eq(packs.id, pack.remixParentId));
  }

  return published;
}

function packsDiffer(a: PackWithItems, b: PackWithItems): boolean {
  if (a.pack.title.trim() !== b.pack.title.trim()) return true;
  const key = (p: PackWithItems) =>
    p.items
      .map((i) => `${i.itemId}:${i.linerNote ?? ""}`)
      .sort()
      .join("|");
  return key(a) !== key(b);
}

async function uniqueSlug(authorId: string, title: string, packId: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  for (let i = 0; i < 5; i++) {
    const clash = (
      await db
        .select({ id: packs.id })
        .from(packs)
        .where(and(eq(packs.authorId, authorId), eq(packs.slug, candidate)))
        .limit(1)
    )[0];
    if (!clash || clash.id === packId) return candidate;
    candidate = `${base}-${shortSuffix()}`;
  }
  return `${base}-${shortSuffix()}`;
}

// ---------- feed / profile / lineage ----------

export interface FeedCard {
  pack: Pack;
  author: { handle: string; displayName: string | null };
  items: { item: Item; x: number; y: number; scale: number; rotation: number; zIndex: number; linerNote: string | null }[];
}

async function cardsFor(packRows: { pack: Pack; author: { handle: string; displayName: string | null } }[]): Promise<FeedCard[]> {
  const cards: FeedCard[] = [];
  for (const row of packRows) {
    const detail = await getPackWithItems(row.pack.id);
    cards.push({
      pack: row.pack,
      author: row.author,
      items: detail?.items ?? [],
    });
  }
  return cards;
}

export async function feed(limit = 30): Promise<FeedCard[]> {
  // chrono + light vote weighting (E7-T1): recent-first, boosted by net votes.
  const rows = await db
    .select({
      pack: packs,
      author: { handle: users.handle, displayName: users.displayName },
    })
    .from(packs)
    .innerJoin(users, eq(packs.authorId, users.id))
    .where(eq(packs.status, "published"))
    .orderBy(
      desc(sql`${packs.publishedAt} + (${packs.upvotes} - ${packs.downvotes}) * interval '2 hours'`),
    )
    .limit(limit);
  return cardsFor(rows);
}

export async function profilePacks(handle: string): Promise<FeedCard[]> {
  const rows = await db
    .select({
      pack: packs,
      author: { handle: users.handle, displayName: users.displayName },
    })
    .from(packs)
    .innerJoin(users, eq(packs.authorId, users.id))
    .where(and(eq(users.handle, handle), eq(packs.status, "published")))
    .orderBy(desc(packs.publishedAt));
  return cardsFor(rows);
}

export interface LineageNode {
  id: string;
  title: string;
  slug: string;
  handle: string;
  status: string;
  depth: number;
}

export async function lineage(packId: string): Promise<LineageNode[]> {
  const res = await db.execute(sql`
    WITH RECURSIVE chain AS (
      SELECT p.id, p.title, p.slug, p.status, p.remix_parent_id, p.generation_depth, u.handle
      FROM packs p JOIN users u ON u.id = p.author_id
      WHERE p.id = ${packId}
      UNION ALL
      SELECT p.id, p.title, p.slug, p.status, p.remix_parent_id, p.generation_depth, u.handle
      FROM packs p JOIN users u ON u.id = p.author_id
      JOIN chain c ON c.remix_parent_id = p.id
    )
    SELECT id, title, slug, handle, status, generation_depth FROM chain ORDER BY generation_depth ASC
  `);
  return (res as unknown as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    slug: r.slug as string,
    handle: r.handle as string,
    status: r.status as string,
    depth: Number(r.generation_depth),
  }));
}

// ---------- votes ----------

export async function castVote(userId: string, packId: string, value: 1 | -1 | 0): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = (
      await tx.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.packId, packId))).limit(1)
    )[0];
    if (value === 0) {
      if (existing) await tx.delete(votes).where(and(eq(votes.userId, userId), eq(votes.packId, packId)));
    } else if (existing) {
      await tx
        .update(votes)
        .set({ value })
        .where(and(eq(votes.userId, userId), eq(votes.packId, packId)));
    } else {
      await tx.insert(votes).values({ userId, packId, value });
    }
    // recompute counter caches from source of truth
    const agg = (
      await tx.execute(sql`
        SELECT
          COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) AS up,
          COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) AS down
        FROM votes WHERE pack_id = ${packId}
      `)
    )[0] as unknown as { up: number; down: number };
    await tx
      .update(packs)
      .set({ upvotes: Number(agg.up), downvotes: Number(agg.down) })
      .where(eq(packs.id, packId));
  });
}

export async function userVote(userId: string, packId: string): Promise<number> {
  const v = (
    await db.select().from(votes).where(and(eq(votes.userId, userId), eq(votes.packId, packId))).limit(1)
  )[0];
  return v?.value ?? 0;
}
