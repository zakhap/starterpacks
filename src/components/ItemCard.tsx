import type { ItemView } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";
import { proxyImage } from "@/lib/img";

// Deterministic, self-contained card. Rendered identically in the composer, feed,
// pack page, AND the client-side share render (E3-T6) — so keep it pure/pixel-stable.

export function ItemCard({
  item,
  linerNote,
  width = 168,
}: {
  item: ItemView;
  linerNote?: string | null;
  width?: number | string;
}) {
  const src = proxyImage(item.imageUrl);
  const hasImage = Boolean(src);
  const initial = (item.title ?? item.domain ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="ink-border bg-paper tape-shadow-sm select-none overflow-hidden"
      style={{ width }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={item.title ?? ""}
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          // intentional fallback card — never a blank (E3-T3)
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-paper-2">
            <span className="poster-title text-4xl text-ink/70">{initial}</span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-ink-soft">
              {item.domain ?? "link"}
            </span>
          </div>
        )}
        <div className="absolute left-1 top-1">
          <SourceBadge source={item.sourceType} />
        </div>
      </div>

      <div className="space-y-1 px-2 py-1.5">
        <p className="line-clamp-2 text-[0.72rem] font-semibold leading-tight">
          {item.title ?? item.domain ?? item.canonicalUrl}
        </p>
        {linerNote ? (
          <p className="font-note text-[0.72rem] italic leading-snug text-ink-soft">
            &ldquo;{linerNote}&rdquo;
          </p>
        ) : null}
      </div>
    </div>
  );
}
