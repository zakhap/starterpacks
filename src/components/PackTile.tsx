import Link from "next/link";
import type { PackView } from "@/lib/types";
import { PackCanvas } from "./PackCanvas";
import { VoteBar } from "./VoteBar";

// Feed/profile tile: the canvas IS the content (D7); remix/vote chrome sits BELOW it,
// never on the canvas. Slight rotation on the frame = taped-down zine energy.

const ROT = ["rot-1", "rot-2", "rot-3", "rot-4"];

export function PackTile({
  pack,
  index = 0,
  userVote = 0,
}: {
  pack: PackView;
  index?: number;
  userVote?: number;
}) {
  const href = `/@${pack.handle}/${pack.slug}`;
  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className={`block bg-paper ink-border tape-shadow transition-transform group-hover:-translate-y-0.5 ${ROT[index % ROT.length]}`}
      >
        <div className="border-b-[1.5px] border-ink px-3 py-2">
          {pack.dedicationRecipient ? (
            <p className="mb-0.5 font-note text-xs italic text-accent">
              for {pack.dedicationRecipient}
            </p>
          ) : null}
          <h3 className="poster-title text-lg leading-none">{pack.title || "untitled pack"}</h3>
        </div>
        <PackCanvas items={pack.items} className="px-3 py-3" />
      </Link>

      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <Link href={`/@${pack.handle}`} className="font-semibold text-ink hover:text-accent">
            @{pack.handle}
          </Link>
          {pack.remixCount > 0 ? <span>· {pack.remixCount} remixes</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/compose?remix=${pack.id}`} className="chip hover:bg-highlight">
            ⤳ remix
          </Link>
          <VoteBar
            packId={pack.id}
            upvotes={pack.upvotes}
            downvotes={pack.downvotes}
            initialVote={userVote}
          />
        </div>
      </div>
    </article>
  );
}
