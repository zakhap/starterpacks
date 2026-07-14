import type { CanvasItemView } from "@/lib/types";
import { ItemCard } from "./ItemCard";

// The arrangement stage. Loose collage (D7/§7.4), NOT a grid. Fully responsive via
// container-query units (cqw) so the exact same layout renders at any size — feed card,
// pack page, and the fixed-size client share render.
//
// Coordinates: item.x/item.y are 0..1 fractions of the stage; scale multiplies the base
// card width; rotation is degrees. z-index orders overlap.

const BASE_CARD_CQW = 38; // base card width as % of stage width

export function PackCanvas({
  items,
  className = "",
  fill = false,
}: {
  items: CanvasItemView[];
  className?: string;
  fill?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden ${fill ? "h-full w-full" : "w-full"} ${className}`}
      style={{ ...(fill ? {} : { aspectRatio: "4 / 5" }), containerType: "size" }}
    >
      {/* faint grid-of-nothing so an empty canvas still reads as "a place for things" */}
      {items.length === 0 ? (
        <div className="absolute inset-0 grid place-items-center text-ink-soft">
          <span className="font-note italic">an empty shelf…</span>
        </div>
      ) : null}
      {items.map((ci) => (
        <div
          key={ci.itemId}
          className="absolute"
          style={{
            left: `${ci.x * 100}%`,
            top: `${ci.y * 100}%`,
            width: `${BASE_CARD_CQW * ci.scale}cqw`,
            transform: `translate(-50%, -50%) rotate(${ci.rotation}deg)`,
            zIndex: ci.zIndex,
          }}
        >
          <ItemCard item={ci.item} linerNote={ci.linerNote} width="100%" />
        </div>
      ))}
    </div>
  );
}
