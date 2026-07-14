import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { putImage } from "@/lib/storage";
import { newId } from "@/lib/ids";

// Store a rendered share image (E5-T2). dev=local disk, prod=R2 (same interface).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "img"); // "9x16" | "1x1"
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const key = `${newId("img")}-${kind}.webp`;
  const stored = await putImage(key, bytes, "image/webp");
  return NextResponse.json({ url: stored.url });
}
