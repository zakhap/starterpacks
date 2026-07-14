import type { PackWithItems, FeedCard } from "./packs";
import type { PackView, CanvasItemView, ItemView } from "./types";
import type { Item } from "@/db";

function toItemView(item: Item): ItemView {
  return {
    id: item.id,
    canonicalUrl: item.canonicalUrl,
    title: item.title,
    imageUrl: item.imageUrl,
    domain: item.domain,
    sourceType: item.sourceType,
    unfurlStatus: item.unfurlStatus,
  };
}

export function detailToView(d: PackWithItems): PackView {
  return {
    id: d.pack.id,
    title: d.pack.title,
    slug: d.pack.slug,
    status: d.pack.status,
    handle: d.author.handle,
    authorName: d.author.displayName,
    dedicationRecipient: d.pack.dedicationRecipient,
    remixParentId: d.pack.remixParentId,
    generationDepth: d.pack.generationDepth,
    upvotes: d.pack.upvotes,
    downvotes: d.pack.downvotes,
    remixCount: d.pack.remixCount,
    shareImage9x16: d.pack.shareImage9x16,
    shareImage1x1: d.pack.shareImage1x1,
    items: d.items.map(
      (i): CanvasItemView => ({
        itemId: i.itemId,
        linerNote: i.linerNote,
        x: i.x,
        y: i.y,
        scale: i.scale,
        rotation: i.rotation,
        zIndex: i.zIndex,
        inherited: i.inherited,
        item: toItemView(i.item),
      }),
    ),
  };
}

export function cardToView(c: FeedCard): PackView {
  return {
    id: c.pack.id,
    title: c.pack.title,
    slug: c.pack.slug,
    status: c.pack.status,
    handle: c.author.handle,
    authorName: c.author.displayName,
    dedicationRecipient: c.pack.dedicationRecipient,
    remixParentId: c.pack.remixParentId,
    generationDepth: c.pack.generationDepth,
    upvotes: c.pack.upvotes,
    downvotes: c.pack.downvotes,
    remixCount: c.pack.remixCount,
    shareImage9x16: c.pack.shareImage9x16,
    shareImage1x1: c.pack.shareImage1x1,
    items: c.items.map(
      (i): CanvasItemView => ({
        itemId: i.item.id,
        linerNote: i.linerNote,
        x: i.x,
        y: i.y,
        scale: i.scale,
        rotation: i.rotation,
        zIndex: i.zIndex,
        inherited: false,
        item: toItemView(i.item),
      }),
    ),
  };
}
