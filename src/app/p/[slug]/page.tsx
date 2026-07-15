import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackBySlug, lineage } from "@/lib/packs";
import { detailToView } from "@/lib/view";
import { PackCanvas } from "@/components/PackCanvas";
import { SourceBadge } from "@/components/SourceBadge";
import { APP_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPackBySlug(slug);
  if (!detail) return { title: "Pack not found · Packrat" };
  const p = detail.pack;
  const img = p.shareImage9x16 ?? p.shareImage1x1 ?? undefined;
  const abs = img && !img.startsWith("http") ? `${APP_URL}${img}` : img;
  const desc = p.dedicationRecipient
    ? `A pack made for ${p.dedicationRecipient}. Fork it on Packrat.`
    : `${detail.items.length} things, annotated${p.authorName ? ` by ${p.authorName}` : ""}. Fork it on Packrat.`;
  return {
    title: `${p.title} · Packrat`,
    description: desc,
    openGraph: {
      title: p.title,
      description: desc,
      images: abs ? [{ url: abs }] : undefined,
      type: "article",
      url: `${APP_URL}/p/${p.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: desc,
      images: abs ? [abs] : undefined,
    },
  };
}

export default async function PackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getPackBySlug(slug);
  if (!detail) notFound();

  const pack = detailToView(detail);
  const chain = pack.remixParentId ? await lineage(pack.id) : [];
  const ancestors = chain.filter((n) => n.id !== pack.id);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <article className="ink-border tape-shadow bg-paper rot-3">
        <div className="border-b-[1.5px] border-ink px-4 py-3">
          {pack.dedicationRecipient ? (
            <p className="font-note italic text-accent">for {pack.dedicationRecipient}</p>
          ) : null}
          <h1 className="poster-title text-3xl leading-none sm:text-4xl">{pack.title}</h1>
          {pack.authorName ? <p className="mt-1 text-sm text-ink-soft">by {pack.authorName}</p> : null}
        </div>
        <PackCanvas items={pack.items} className="px-4 py-5" />
      </article>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">
          {pack.remixCount} {pack.remixCount === 1 ? "fork" : "forks"}
        </span>
        <Link href={`/compose?fork=${pack.id}`} className="btn btn-accent btn-lg">
          ⤳ Fork this pack
        </Link>
      </div>

      {ancestors.length > 0 ? (
        <div className="ink-border bg-paper-2 px-4 py-3 text-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-ink-soft">lineage</p>
          <p>
            forked from{" "}
            <Link href={`/p/${ancestors[0].slug}`} className="font-semibold text-accent hover:underline">
              {ancestors[0].title}
            </Link>
            {pack.generationDepth > 1 ? `, ${pack.generationDepth} generations deep` : ""}.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">the {pack.items.length} things</p>
        {pack.items.map((ci) => (
          <div key={ci.itemId} className="flex items-start gap-3 ink-border bg-paper px-3 py-2 tape-shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <SourceBadge source={ci.item.sourceType} />
                <span className="truncate text-sm font-semibold">{ci.item.title ?? ci.item.domain}</span>
              </div>
              {ci.linerNote ? (
                <p className="font-note text-sm italic text-ink-soft">&ldquo;{ci.linerNote}&rdquo;</p>
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
