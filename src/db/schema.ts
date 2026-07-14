import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enum-ish string unions (kept as text + $type to avoid enum migration friction) ---
export type SourceType =
  | "product"
  | "song"
  | "video"
  | "book"
  | "place"
  | "other";
export type PackStatus = "draft" | "published" | "taken_down";
export type UnfurlStatus = "pending" | "done" | "failed";

// --- users ---
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    handle: text("handle").notNull(), // stored lowercase; URL is /@handle
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_handle_unique").on(t.handle)],
);

// --- sessions (dev cookie auth; swapped for Supabase in prod) ---
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // opaque token stored in cookie
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

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

// --- packs ---
export const packs = pgTable(
  "packs",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    slug: text("slug").notNull(),
    status: text("status").$type<PackStatus>().notNull().default("draft"),

    // lineage (D3): direct parent + denormalized root/depth for cheap display (§9.6)
    remixParentId: text("remix_parent_id"),
    rootPackId: text("root_pack_id"),
    generationDepth: integer("generation_depth").notNull().default(0),

    // dedication (D2): recipient handle/name + optional on-platform user
    dedicationRecipient: text("dedication_recipient"),
    dedicationRecipientUserId: text("dedication_recipient_user_id"),
    dedicationReadAt: timestamp("dedication_read_at", { withTimezone: true }),

    // canvas-level config (per-item layout lives on pack_items). §9.6 JSONB.
    canvasLayout: jsonb("canvas_layout").$type<{ background?: string }>(),

    // share assets (D7) — rendered client-side, stored in R2/local
    shareImage9x16: text("share_image_9x16"),
    shareImage1x1: text("share_image_1x1"),

    // counter caches
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
    remixCount: integer("remix_count").notNull().default(0),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("packs_author_slug_unique").on(t.authorId, t.slug),
    index("packs_status_published_idx").on(t.status, t.publishedAt),
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
    // freeform-canvas layout (§7.4) — normalized 0..1 x/y, scale, degrees
    x: real("x").notNull().default(0.5),
    y: real("y").notNull().default(0.5),
    scale: real("scale").notNull().default(1),
    rotation: real("rotation").notNull().default(0),
    zIndex: integer("z_index").notNull().default(0),
    inherited: boolean("inherited").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pack_items_pack_idx").on(t.packId)],
);

// --- votes ---
export const votes = pgTable(
  "votes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    packId: text("pack_id")
      .notNull()
      .references(() => packs.id, { onDelete: "cascade" }),
    value: integer("value").notNull(), // +1 / -1
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("votes_user_pack_unique").on(t.userId, t.packId)],
);

// --- unfurl_jobs: worker queue (FOR UPDATE SKIP LOCKED) ---
export const unfurlJobs = pgTable("unfurl_jobs", {
  id: text("id").primaryKey(),
  url: text("url").notNull(), // canonical url
  status: text("status").$type<UnfurlStatus>().notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- reports (E9 moderation) ---
export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").references(() => users.id, { onDelete: "set null" }),
  packId: text("pack_id").references(() => packs.id, { onDelete: "cascade" }),
  itemId: text("item_id").references(() => items.id, { onDelete: "set null" }),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"), // open | actioned | dismissed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- relations (for drizzle query API) ---
export const packsRelations = relations(packs, ({ one, many }) => ({
  author: one(users, { fields: [packs.authorId], references: [users.id] }),
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

export const usersRelations = relations(users, ({ many }) => ({
  packs: many(packs),
}));

export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Pack = typeof packs.$inferSelect;
export type PackItem = typeof packItems.$inferSelect;
