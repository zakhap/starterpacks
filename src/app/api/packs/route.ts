import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDraft } from "@/lib/packs";

// Create a new draft — blank, remix (remixParentId), or dedication.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    remixParentId?: string;
    dedicationRecipient?: string;
  };

  try {
    const pack = await createDraft(user.id, {
      title: body.title,
      remixParentId: body.remixParentId,
      dedicationRecipient: body.dedicationRecipient,
    });
    return NextResponse.json({ id: pack.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create pack";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
