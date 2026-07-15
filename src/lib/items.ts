import { eq } from "drizzle-orm";
import { db, items, type Item } from "@/db";
import { canonicalizeUrl, domainOf, guessSourceType } from "./url";
import { newId } from "./ids";
import { unfurl } from "@/unfurl";

/**
 * Canonicalize → dedupe → unfurl a URL into a canonical Item. Inline unfurl with a fetch
 * timeout keeps the paste path snappy; a fallback card (ok=false) still returns a usable
 * item, never a blank.
 */
export async function getOrCreateItem(rawUrl: string): Promise<Item> {
  const canonicalUrl = canonicalizeUrl(rawUrl);

  const existing = (await db.select().from(items).where(eq(items.canonicalUrl, canonicalUrl)).limit(1))[0];
  if (existing && existing.unfurlStatus === "done") return existing;

  const item =
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
