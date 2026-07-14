import type { SourceType } from "@/db/schema";

const LABELS: Record<SourceType, { label: string; emoji: string }> = {
  song: { label: "Song", emoji: "♪" },
  video: { label: "Video", emoji: "▶" },
  product: { label: "Thing", emoji: "◇" },
  book: { label: "Book", emoji: "❦" },
  place: { label: "Place", emoji: "⚑" },
  other: { label: "Link", emoji: "↗" },
};

export function SourceBadge({ source }: { source: SourceType }) {
  const { label, emoji } = LABELS[source] ?? LABELS.other;
  return (
    <span className="badge">
      <span aria-hidden>{emoji}</span>
      {label}
    </span>
  );
}
