// Seed a handful of published packs so the feed, lineage, dedication, and item-dedupe
// all demo out of the box. Run: bun run db:seed
import { eq } from "drizzle-orm";
import { db, users, packs, packItems } from "@/db";
import { newId } from "@/lib/ids";
import { getOrCreateItem } from "@/lib/items";
import { createDraft, saveDraft, publish, type CanvasItem } from "@/lib/packs";

const SLOTS = [
  { x: 0.28, y: 0.3, r: -5 },
  { x: 0.7, y: 0.26, r: 6 },
  { x: 0.5, y: 0.52, r: -2 },
  { x: 0.26, y: 0.7, r: 4 },
  { x: 0.74, y: 0.68, r: -6 },
  { x: 0.5, y: 0.85, r: 3 },
];

async function ensureUser(handle: string) {
  const existing = (await db.select().from(users).where(eq(users.handle, handle)).limit(1))[0];
  if (existing) return existing;
  return (
    await db.insert(users).values({ id: newId("u"), handle, displayName: handle }).returning()
  )[0];
}

async function buildPack(
  authorId: string,
  opts: { title: string; dedication?: string; remixParentId?: string },
  specs: { url: string; note: string }[],
) {
  const draft = await createDraft(authorId, {
    title: opts.title,
    remixParentId: opts.remixParentId,
    dedicationRecipient: opts.dedication,
  });

  const canvas: CanvasItem[] = [];
  for (let i = 0; i < specs.length; i++) {
    const item = await getOrCreateItem(specs[i].url);
    const slot = SLOTS[i % SLOTS.length];
    canvas.push({
      itemId: item.id,
      linerNote: specs[i].note,
      x: slot.x,
      y: slot.y,
      scale: 1 + ((i % 3) - 1) * 0.1,
      rotation: slot.r,
      zIndex: i + 1,
      inherited: false,
    });
    process.stdout.write(`  · ${item.title ?? item.domain}\n`);
  }
  await saveDraft(authorId, draft.id, { title: opts.title, items: canvas });
  const published = await publish(authorId, draft.id);
  console.log(`✓ "${opts.title}" (@${(await handleOf(authorId))})  /${published.slug}`);
  return published;
}

async function handleOf(userId: string) {
  return (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0]?.handle;
}

async function main() {
  console.log("Seeding Packrat…\n");
  const mara = await ensureUser("mara");
  const rat = await ensureUser("packrat");

  const perfMale = await buildPack(
    mara.id,
    { title: "The performative male starter pack" },
    [
      { url: "https://en.wikipedia.org/wiki/Matcha", note: "iced. oat. extra ceremonial." },
      { url: "https://en.wikipedia.org/wiki/Tote_bag", note: "this is the tote. don't fight it." },
      { url: "https://en.wikipedia.org/wiki/Labubu", note: "clipped to the tote. non-negotiable." },
      { url: "https://en.wikipedia.org/wiki/Phonograph_record", note: "vinyl he does not play." },
      { url: "https://en.wikipedia.org/wiki/Normal_People", note: "sally rooney, spine out." },
      { url: "https://en.wikipedia.org/wiki/Amazon_Kindle", note: "a KINDLE?? we let the comments cook." },
    ],
  );

  // a remix that "fixes" the planted wrong item (5.1) — demonstrates lineage + ≥1 change
  await buildPack(
    rat.id,
    { title: "The performative male starter pack (corrected)", remixParentId: perfMale.id },
    [
      { url: "https://en.wikipedia.org/wiki/Matcha", note: "iced. oat. extra ceremonial." },
      { url: "https://en.wikipedia.org/wiki/Tote_bag", note: "this is the tote. don't fight it." },
      { url: "https://en.wikipedia.org/wiki/Labubu", note: "clipped to the tote. non-negotiable." },
      { url: "https://en.wikipedia.org/wiki/Phonograph_record", note: "vinyl he does not play." },
      { url: "https://en.wikipedia.org/wiki/Paperback", note: "fixed it. physical book only." },
    ],
  );

  await buildPack(
    mara.id,
    { title: "The reformer pilates is her whole personality starter pack" },
    [
      { url: "https://en.wikipedia.org/wiki/Pilates", note: "the reformer is the personality now." },
      { url: "https://en.wikipedia.org/wiki/Matcha", note: "post-class, obviously." },
      { url: "https://en.wikipedia.org/wiki/Leggings", note: "the matching set." },
      { url: "https://en.wikipedia.org/wiki/Lemon", note: "warm lemon water at 6am." },
      { url: "https://en.wikipedia.org/wiki/Sock", note: "grip socks. $22. worth it." },
    ],
  );

  await buildPack(
    rat.id,
    { title: "The just discovered woodworking guy starter pack" },
    [
      { url: "https://en.wikipedia.org/wiki/Woodworking", note: "it's a lifestyle now." },
      { url: "https://en.wikipedia.org/wiki/Chisel", note: "owns nine. uses two." },
      { url: "https://en.wikipedia.org/wiki/Workbench", note: "built the bench before any project." },
      { url: "https://en.wikipedia.org/wiki/Danish_oil", note: "smells it more than applies it." },
      { url: "https://en.wikipedia.org/wiki/Live_edge", note: "the live edge is the whole point." },
    ],
  );

  await buildPack(
    mara.id,
    { title: "The capybara-core unbothered summer starter pack" },
    [
      { url: "https://en.wikipedia.org/wiki/Capybara", note: "the patron saint of calm." },
      { url: "https://en.wikipedia.org/wiki/Hot_spring", note: "with a yuzu floating in it." },
      { url: "https://en.wikipedia.org/wiki/Hammock", note: "horizontal all summer." },
      { url: "https://en.wikipedia.org/wiki/Matcha", note: "unbothered fuel." },
      { url: "https://en.wikipedia.org/wiki/Yuzu", note: "citrus, spa-coded." },
    ],
  );

  await buildPack(
    rat.id,
    { title: "The getting over him starter pack", dedication: "whoever needs it" },
    [
      { url: "https://en.wikipedia.org/wiki/Dreams_(Fleetwood_Mac_song)", note: "on loop. loudly." },
      { url: "https://en.wikipedia.org/wiki/Running", note: "you're a runner now, apparently." },
      { url: "https://en.wikipedia.org/wiki/Diary", note: "write it down. don't text it." },
      { url: "https://en.wikipedia.org/wiki/Bangs_(hair)", note: "the breakup bangs. we support." },
      { url: "https://en.wikipedia.org/wiki/Ice_cream", note: "self-explanatory." },
    ],
  );

  console.log("\nDone. Visit / to see the feed.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
