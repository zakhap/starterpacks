import { NextResponse } from "next/server";
import { createPack, PublishError, type CanvasItem } from "@/lib/packs";

// Create a pack in one shot (no auth, no drafts). The composer holds state client-side
// and posts the whole thing here on publish.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    authorName?: string | null;
    dedicationRecipient?: string | null;
    remixParentId?: string | null;
    items?: CanvasItem[];
    image9x16?: string;
    image1x1?: string;
  };

  try {
    const pack = await createPack({
      title: body.title ?? "",
      authorName: body.authorName ?? null,
      dedicationRecipient: body.dedicationRecipient ?? null,
      remixParentId: body.remixParentId ?? null,
      items: body.items ?? [],
      share: { image9x16: body.image9x16, image1x1: body.image1x1 },
    });
    return NextResponse.json({ ok: true, url: `/p/${pack.slug}`, slug: pack.slug });
  } catch (e) {
    if (e instanceof PublishError) return NextResponse.json({ error: e.message }, { status: 422 });
    const msg = e instanceof Error ? e.message : "Could not create pack";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
