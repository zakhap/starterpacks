import type { SourceType } from "@/db/schema";

// Client-facing item (subset of the DB Item, safe to serialize to the browser).
export interface ItemView {
  id: string;
  canonicalUrl: string;
  title: string | null;
  imageUrl: string | null;
  domain: string | null;
  sourceType: SourceType;
  unfurlStatus: "pending" | "done" | "failed";
}

export interface CanvasItemView {
  itemId: string;
  linerNote: string | null;
  x: number; // 0..1 (fraction of canvas width)
  y: number; // 0..1
  scale: number;
  rotation: number; // degrees
  zIndex: number;
  inherited: boolean;
  item: ItemView;
}

export interface PackView {
  id: string;
  title: string;
  slug: string;
  status: string;
  handle: string;
  authorName: string | null;
  dedicationRecipient: string | null;
  remixParentId: string | null;
  generationDepth: number;
  upvotes: number;
  downvotes: number;
  remixCount: number;
  shareImage9x16: string | null;
  shareImage1x1: string | null;
  items: CanvasItemView[];
}
