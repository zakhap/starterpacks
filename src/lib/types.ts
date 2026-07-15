import type { SourceType } from "@/db/schema";

// Client-facing item (safe to serialize to the browser).
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
  x: number; // 0..1
  y: number; // 0..1
  scale: number;
  rotation: number; // degrees
  zIndex: number;
  item: ItemView;
}

export interface PackView {
  id: string;
  title: string;
  slug: string;
  authorName: string | null;
  dedicationRecipient: string | null;
  remixParentId: string | null;
  generationDepth: number;
  remixCount: number;
  shareImage9x16: string | null;
  shareImage1x1: string | null;
  items: CanvasItemView[];
}
