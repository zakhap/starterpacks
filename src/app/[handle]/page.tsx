import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { profilePacks } from "@/lib/packs";
import { cardToView } from "@/lib/view";
import { PackTile } from "@/components/PackTile";

export const dynamic = "force-dynamic";

function stripAt(h: string) {
  return decodeURIComponent(h).replace(/^@/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const h = stripAt(handle);
  return { title: `@${h} · Packrat`, description: `Packs by @${h}.` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const h = stripAt(handle);
  const user = (await db.select().from(users).where(eq(users.handle, h)).limit(1))[0];
  if (!user) notFound();

  const packs = (await profilePacks(h)).map(cardToView);

  return (
    <div className="space-y-6">
      <header className="ink-border tape-shadow bg-paper-2 px-5 py-6 rot-3">
        <span className="grid h-14 w-14 place-items-center border-[1.5px] border-ink bg-accent text-accent-ink text-2xl tape-shadow-sm rot-2">
          🐀
        </span>
        <h1 className="poster-title mt-3 text-4xl">@{user.handle}</h1>
        <p className="text-sm text-ink-soft">
          {packs.length} {packs.length === 1 ? "pack" : "packs"} on the shelf
        </p>
      </header>

      {packs.length === 0 ? (
        <div className="ink-border bg-paper px-6 py-16 text-center">
          <p className="font-note text-lg italic text-ink-soft">An empty shelf. For now.</p>
          <Link href="/compose" className="btn btn-accent mt-4">
            Press a pack
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((p, i) => (
            <PackTile key={p.id} pack={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
