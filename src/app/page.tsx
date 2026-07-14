import Link from "next/link";
import { feed } from "@/lib/packs";
import { cardToView } from "@/lib/view";
import { PackTile } from "@/components/PackTile";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cards = await feed(30);
  const packs = cards.map(cardToView);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden ink-border tape-shadow bg-paper-2 px-5 py-8 sm:px-8 sm:py-10">
        <span className="tape rot-2" style={{ width: 120, top: -8, left: 40 }} />
        <span className="tape rot-1" style={{ width: 90, bottom: -8, right: 60 }} />
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
          a cultural mixtape
        </p>
        <h1 className="poster-title max-w-3xl text-5xl sm:text-6xl">
          Make the pack.
          <br />
          Remix anyone&rsquo;s.
          <br />
          <span className="text-accent">Send one to someone.</span>
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          The starter-pack meme, rebuilt as a real thing you can make in 60 seconds — every item a
          real link, every note yours.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/compose" className="btn btn-accent btn-lg">
            Start a pack →
          </Link>
          <Link href="#feed" className="btn btn-lg">
            Browse the feed
          </Link>
        </div>
      </section>

      <section id="feed" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="poster-title text-2xl">Fresh packs</h2>
          <span className="text-xs uppercase tracking-widest text-ink-soft">
            newest first · voted up
          </span>
        </div>

        {packs.length === 0 ? (
          <div className="ink-border bg-paper-2 px-6 py-16 text-center">
            <p className="font-note text-lg italic text-ink-soft">
              No packs yet. Be the first to press one.
            </p>
            <Link href="/compose" className="btn btn-accent mt-4">
              Make pack #001
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((p, i) => (
              <PackTile key={p.id} pack={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
