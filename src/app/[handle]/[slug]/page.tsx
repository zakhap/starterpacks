import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPack, lineage } from "@/lib/packs";
import { detailToView } from "@/lib/view";
import { getCurrentUser } from "@/lib/auth";
import { userVote } from "@/lib/packs";
import { PackCanvas } from "@/components/PackCanvas";
import { VoteBar } from "@/components/VoteBar";
import { SourceBadge } from "@/components/SourceBadge";
import { APP_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

function stripAt(h: string) {
  return decodeURIComponent(h).replace(/^@/, "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}): Promise<Metadata> {
  const { handle, slug } = await params;
  const detail = await getPublishedPack(stripAt(handle), slug);
  if (!detail) return { title: "Pack not found · Packrat" };
  const p = detail.pack;
  const img = p.shareImage9x16 ?? p.shareImage1x1 ?? undefined;
  const abs = img && !img.startsWith("http") ? `${APP_URL}${img}` : img;
  const desc = p.dedicationRecipient
    ? `A pack made for ${p.dedicationRecipient}. Remix it on Packrat.`
    : `${detail.items.length} things, annotated. Remix it on Packrat.`;
  return {
    title: `${p.title} · Packrat`,
    description: desc,
    openGraph: {
      title: p.title,
      description: desc,
      images: abs ? [{ url: abs }] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: desc,
      images: abs ? [abs] : undefined,
    },
  };
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}) {
  const { handle, slug } = await params;
  const detail = await getPublishedPack(stripAt(handle), slug);
  if (!detail) notFound();

  const pack = detailToView(detail);
  const me = await getCurrentUser();
  const myVote = me ? await userVote(me.id, pack.id) : 0;
  const chain = pack.remixParentId ? await lineage(pack.id) : [];
  const ancestors = chain.filter((n) => n.id !== pack.id);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {/* the canvas IS the asset (D7) — chrome below only */}
      <article className="ink-border tape-shadow bg-paper rot-3">
        <div className="border-b-[1.5px] border-ink px-4 py-3">
          {pack.dedicationRecipient ? (
            <p className="font-note italic text-accent">for {pack.dedicationRecipient}</p>
          ) : null}
          <h1 className="poster-title text-3xl leading-none sm:text-4xl">{pack.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            by{" "}
            <Link href={`/@${pack.handle}`} className="font-semibold text-ink hover:text-accent">
              @{pack.handle}
            </Link>
          </p>
        </div>
        <PackCanvas items={pack.items} className="px-4 py-5" />
      </article>

      {/* chrome */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <VoteBar
            packId={pack.id}
            upvotes={pack.upvotes}
            downvotes={pack.downvotes}
            initialVote={myVote}
          />
          <span className="text-sm text-ink-soft">
            {pack.remixCount} {pack.remixCount === 1 ? "remix" : "remixes"}
          </span>
        </div>
        <div className="flex gap-2">
          <Link href={`/compose?remix=${pack.id}`} className="btn btn-accent">
            ⤳ Remix this
          </Link>
          <Link href={`/compose?remix=${pack.id}&dedicate=1`} className="btn">
            Send a version
          </Link>
        </div>
      </div>

      {/* lineage (E6-T5) */}
      {ancestors.length > 0 ? (
        <div className="ink-border bg-paper-2 px-4 py-3 text-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-soft">lineage</p>
          <p>
            remixed from{" "}
            <Link
              href={`/@${ancestors[0].handle}/${ancestors[0].slug}`}
              className="font-semibold text-accent hover:underline"
            >
              @{ancestors[0].handle}
            </Link>
            {pack.generationDepth > 1 ? `, ${pack.generationDepth} generations deep` : ""}.
          </p>
          {ancestors.length > 1 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-ink-soft">
              {ancestors
                .slice()
                .reverse()
                .map((n) => (
                  <Link
                    key={n.id}
                    href={n.status === "published" ? `/@${n.handle}/${n.slug}` : "#"}
                    className="chip !py-0.5 hover:bg-highlight"
                  >
                    @{n.handle}
                  </Link>
                ))
                .reduce<React.ReactNode[]>((acc, el, i) => {
                  if (i > 0) acc.push(<span key={`s${i}`}>→</span>);
                  acc.push(el);
                  return acc;
                }, [])}
              <span>→</span>
              <span className="chip !py-0.5 !bg-ink !text-paper">this</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* item detail list — decision (b): expanded notes + open-link secondary */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
          the {pack.items.length} things
        </p>
        {pack.items.map((ci) => (
          <div
            key={ci.itemId}
            className="flex items-start gap-3 ink-border bg-paper px-3 py-2 tape-shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <SourceBadge source={ci.item.sourceType} />
                <span className="truncate text-sm font-semibold">
                  {ci.item.title ?? ci.item.domain}
                </span>
              </div>
              {ci.linerNote ? (
                <p className="font-note text-sm italic text-ink-soft">
                  &ldquo;{ci.linerNote}&rdquo;
                </p>
              ) : null}
            </div>
            <a
              href={ci.item.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="chip shrink-0 hover:bg-highlight"
            >
              open ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
