import Link from "next/link";
import type { PackView } from "@/lib/types";
import { PackCanvas } from "./PackCanvas";

// Feed/gallery tile. The canvas IS the content; fork chrome sits below. Slight rotation
// on the frame = taped-down zine energy.
const ROT = ["rot-1", "rot-2", "rot-3", "rot-4"];

export function PackTile({ pack, index = 0 }: { pack: PackView; index?: number }) {
  const href = `/p/${pack.slug}`;
  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className={`block bg-paper ink-border tape-shadow transition-transform group-hover:-translate-y-0.5 ${ROT[index % ROT.length]}`}
      >
        <div className="border-b-[1.5px] border-ink px-3 py-2">
          {pack.dedicationRecipient ? (
            <p className="mb-0.5 font-note text-xs italic text-accent">for {pack.dedicationRecipient}</p>
          ) : null}
          <h3 className="poster-title text-lg leading-none">{pack.title || "untitled pack"}</h3>
        </div>
        <PackCanvas items={pack.items} className="px-3 py-3" />
      </Link>

      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          {pack.authorName ? <span className="font-semibold text-ink">by {pack.authorName}</span> : <span>anonymous</span>}
          {pack.remixCount > 0 ? <span>· {pack.remixCount} forks</span> : null}
        </div>
        <Link href={`/compose?fork=${pack.id}`} className="chip hover:bg-highlight">
          ⤳ fork
        </Link>
      </div>
    </article>
  );
}
