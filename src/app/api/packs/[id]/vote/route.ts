import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { castVote } from "@/lib/packs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { id } = await params;

  const { value } = (await req.json().catch(() => ({}))) as { value?: number };
  const v = value === 1 ? 1 : value === -1 ? -1 : 0;
  await castVote(user.id, id, v);
  return NextResponse.json({ ok: true });
}
