import type { CanvasItemView } from "@/lib/types";
import { PackCanvas } from "./PackCanvas";

// Fixed-pixel composition rendered to the share image. The canvas IS the asset; this
// frames it with the title + branding for 9:16 / 1:1 export.
export function ShareFrame({
  title,
  authorName,
  dedicationRecipient,
  items,
  width,
  height,
}: {
  title: string;
  authorName?: string | null;
  dedicationRecipient?: string | null;
  items: CanvasItemView[];
  width: number;
  height: number;
}) {
  return (
    <div className="flex flex-col bg-paper" style={{ width, height, backgroundColor: "var(--paper)", color: "var(--ink)" }}>
      <div className="border-b-[3px] border-ink px-8 pb-5 pt-7">
        {dedicationRecipient ? (
          <p className="font-note text-2xl italic text-accent">for {dedicationRecipient}</p>
        ) : null}
        <h1 className="poster-title" style={{ fontSize: width * 0.075, lineHeight: 0.9 }}>
          {title || "untitled pack"}
        </h1>
      </div>
      <div className="relative flex-1 px-6 py-6">
        <PackCanvas items={items} fill />
      </div>
      <div className="flex items-center justify-between border-t-[3px] border-ink px-8 py-4">
        <span className="poster-title text-3xl">PACKRAT</span>
        <span className="text-xl font-semibold text-ink-soft">
          {authorName ? `by ${authorName} · ` : ""}fork it
        </span>
      </div>
    </div>
  );
}
