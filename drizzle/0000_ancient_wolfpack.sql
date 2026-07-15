CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"canonical_url" text NOT NULL,
	"source_type" text DEFAULT 'other' NOT NULL,
	"title" text,
	"description" text,
	"image_url" text,
	"domain" text,
	"unfurl_status" text DEFAULT 'pending' NOT NULL,
	"unfurled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_items" (
	"id" text PRIMARY KEY NOT NULL,
	"pack_id" text NOT NULL,
	"item_id" text NOT NULL,
	"liner_note" text,
	"x" real DEFAULT 0.5 NOT NULL,
	"y" real DEFAULT 0.5 NOT NULL,
	"scale" real DEFAULT 1 NOT NULL,
	"rotation" real DEFAULT 0 NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"slug" text NOT NULL,
	"author_name" text,
	"remix_parent_id" text,
	"root_pack_id" text,
	"generation_depth" integer DEFAULT 0 NOT NULL,
	"dedication_recipient" text,
	"canvas_layout" jsonb,
	"share_image_9x16" text,
	"share_image_1x1" text,
	"remix_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unfurl_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pack_items" ADD CONSTRAINT "pack_items_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_items" ADD CONSTRAINT "pack_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "items_canonical_url_unique" ON "items" USING btree ("canonical_url");--> statement-breakpoint
CREATE INDEX "pack_items_pack_idx" ON "pack_items" USING btree ("pack_id");--> statement-breakpoint
CREATE UNIQUE INDEX "packs_slug_unique" ON "packs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "packs_created_idx" ON "packs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "packs_remix_parent_idx" ON "packs" USING btree ("remix_parent_id");