import {
  pgTable,
  text,
  integer,
  real,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Super-simple model: no accounts, no auth, no votes. A pack is an immutable, shareable
// artifact. You make one → get a link → anyone can fork it. That's the whole thing.

export type SourceType = "product" | "song" | "video" | "book" | "place" | "other";
export type UnfurlStatus = "pending" | "done" | "failed";

// --- items: canonical, URL-deduped link objects ---
export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey(),
    canonicalUrl: text("canonical_url").notNull(),
    sourceType: text("source_type").$type<SourceType>().notNull().default("other"),
    title: text("title"),
    description: text("description"),
    imageUrl: text("image_url"),
    domain: text("domain"),
    unfurlStatus: text("unfurl_status").$type<UnfurlStatus>().notNull().default("pending"),
    unfurledAt: timestamp("unfurled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("items_canonical_url_unique").on(t.canonicalUrl)],
);

// --- packs: the artifact ---
export const packs = pgTable(
  "packs",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull().default(""),
    slug: text("slug").notNull(), // globally unique, the shareable path /p/<slug>
    authorName: text("author_name"), // optional signature, no account

    // fork lineage: direct parent + denormalized root/depth for cheap display
    remixParentId: text("remix_parent_id"),
    rootPackId: text("root_pack_id"),
    generationDepth: integer("generation_depth").notNull().default(0),

    // optional "made for ___" label (just a caption; no recipient account)
    dedicationRecipient: text("dedication_recipient"),

    canvasLayout: jsonb("canvas_layout").$type<{ background?: string }>(),

    // share assets — rendered client-side, stored in R2/local
    shareImage9x16: text("share_image_9x16"),
    shareImage1x1: text("share_image_1x1"),

    remixCount: integer("remix_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("packs_slug_unique").on(t.slug),
    index("packs_created_idx").on(t.createdAt),
    index("packs_remix_parent_idx").on(t.remixParentId),
  ],
);

// --- pack_items: an item placed on a pack's canvas ---
export const packItems = pgTable(
  "pack_items",
  {
    id: text("id").primaryKey(),
    packId: text("pack_id")
      .notNull()
      .references(() => packs.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    linerNote: text("liner_note"),
    x: real("x").notNull().default(0.5),
    y: real("y").notNull().default(0.5),
    scale: real("scale").notNull().default(1),
    rotation: real("rotation").notNull().default(0),
    zIndex: integer("z_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pack_items_pack_idx").on(t.packId)],
);

// --- unfurl_jobs: worker queue (optional; paste path unfurls inline) ---
export const unfurlJobs = pgTable("unfurl_jobs", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  status: text("status").$type<UnfurlStatus>().notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const packsRelations = relations(packs, ({ one, many }) => ({
  items: many(packItems),
  parent: one(packs, {
    fields: [packs.remixParentId],
    references: [packs.id],
    relationName: "lineage",
  }),
}));

export const packItemsRelations = relations(packItems, ({ one }) => ({
  pack: one(packs, { fields: [packItems.packId], references: [packs.id] }),
  item: one(items, { fields: [packItems.itemId], references: [items.id] }),
}));

export type Item = typeof items.$inferSelect;
export type Pack = typeof packs.$inferSelect;
export type PackItem = typeof packItems.$inferSelect;
