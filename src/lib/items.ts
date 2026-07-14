import { eq, sql } from "drizzle-orm";
import { db, items, type Item } from "@/db";
import { canonicalizeUrl, domainOf, guessSourceType } from "./url";
import { newId } from "./ids";
import { unfurl } from "@/unfurl";

/**
 * Canonicalize → dedupe → unfurl a URL into a canonical Item.
 * Inline unfurl with a fetch timeout keeps the paste path snappy (<1s budget, §9.5);
 * a fallback card (ok=false) still returns a usable item, never a blank.
 */
export async function getOrCreateItem(rawUrl: string): Promise<Item> {
  const canonicalUrl = canonicalizeUrl(rawUrl);

  const existing = (await db.select().from(items).where(eq(items.canonicalUrl, canonicalUrl)).limit(1))[0];
  if (existing && existing.unfurlStatus === "done") return existing;

  // create (or reuse) a pending row
  let item =
    existing ??
    (
      await db
        .insert(items)
        .values({
          id: newId("i"),
          canonicalUrl,
          domain: domainOf(canonicalUrl),
          sourceType: guessSourceType(canonicalUrl),
          unfurlStatus: "pending",
        })
        .onConflictDoNothing({ target: items.canonicalUrl })
        .returning()
    )[0] ??
    (await db.select().from(items).where(eq(items.canonicalUrl, canonicalUrl)).limit(1))[0];

  // unfurl inline
  const result = await unfurl(canonicalUrl);
  const updated = (
    await db
      .update(items)
      .set({
        title: result.title,
        description: result.description,
        imageUrl: result.imageUrl,
        domain: result.domain,
        sourceType: result.sourceType,
        unfurlStatus: result.ok ? "done" : "failed",
        unfurledAt: new Date(),
      })
      .where(eq(items.id, item.id))
      .returning()
  )[0];

  return updated ?? item;
}

/** The user's shelf: canonical items they've used in their own packs (E4-T4). */
export async function shelfForUser(userId: string, limit = 40): Promise<Item[]> {
  const res = await db.execute(sql`
    SELECT DISTINCT i.id, i.canonical_url, i.source_type, i.title, i.description,
           i.image_url, i.domain, i.unfurl_status, i.unfurled_at, i.created_at
    FROM ${items} i
    JOIN pack_items pi ON pi.item_id = i.id
    JOIN packs p ON p.id = pi.pack_id
    WHERE p.author_id = ${userId}
    ORDER BY i.created_at DESC
    LIMIT ${limit}
  `);
  // postgres.js returns snake_case rows; map to Item shape.
  return (res as unknown as Record<string, unknown>[]).map(rowToItem);
}

function rowToItem(r: Record<string, unknown>): Item {
  return {
    id: r.id as string,
    canonicalUrl: r.canonical_url as string,
    sourceType: r.source_type as Item["sourceType"],
    title: (r.title as string) ?? null,
    description: (r.description as string) ?? null,
    imageUrl: (r.image_url as string) ?? null,
    domain: (r.domain as string) ?? null,
    unfurlStatus: r.unfurl_status as Item["unfurlStatus"],
    unfurledAt: (r.unfurled_at as Date) ?? null,
    createdAt: r.created_at as Date,
  };
}
