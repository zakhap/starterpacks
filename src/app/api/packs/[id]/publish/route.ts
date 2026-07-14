import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publish, PublishError, getPackWithItems } from "@/lib/packs";

// Publish sequence (E5-T3): share images are already uploaded (client render → /api/upload);
// we persist their URLs and flip status to published. A pack never publishes without its card.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;

  const body = (await req.json().catch(() => ({}))) as {
    image9x16?: string;
    image1x1?: string;
  };

  try {
    const pack = await publish(user.id, id, {
      image9x16: body.image9x16,
      image1x1: body.image1x1,
    });
    const detail = await getPackWithItems(pack.id);
    return NextResponse.json({
      ok: true,
      url: `/@${detail?.author.handle}/${pack.slug}`,
    });
  } catch (e) {
    if (e instanceof PublishError) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    const msg = e instanceof Error ? e.message : "Could not publish";
    const status = msg === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
