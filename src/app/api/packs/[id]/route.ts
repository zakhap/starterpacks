import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveDraft, type CanvasItem } from "@/lib/packs";

// Save a draft (title, dedication, canvas items).
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    dedicationRecipient?: string | null;
    items?: CanvasItem[];
  };

  try {
    const pack = await saveDraft(user.id, id, {
      title: body.title,
      dedicationRecipient: body.dedicationRecipient,
      items: body.items,
    });
    return NextResponse.json({ ok: true, updatedAt: pack.updatedAt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not save";
    const status = msg === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
