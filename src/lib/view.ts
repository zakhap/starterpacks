import type { PackWithItems } from "./packs";
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
    authorName: d.pack.authorName,
    dedicationRecipient: d.pack.dedicationRecipient,
    remixParentId: d.pack.remixParentId,
    generationDepth: d.pack.generationDepth,
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
        item: toItemView(i.item),
      }),
    ),
  };
}
