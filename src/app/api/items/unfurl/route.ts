import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateItem } from "@/lib/items";
import { isProbablyUrl } from "@/lib/url";
import type { ItemView } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url || !isProbablyUrl(url)) {
    return NextResponse.json({ error: "Not a link" }, { status: 400 });
  }

  const item = await getOrCreateItem(url);
  const view: ItemView = {
    id: item.id,
    canonicalUrl: item.canonicalUrl,
    title: item.title,
    imageUrl: item.imageUrl,
    domain: item.domain,
    sourceType: item.sourceType,
    unfurlStatus: item.unfurlStatus,
  };
  return NextResponse.json({ item: view });
}
