import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDraft, saveDraft } from "@/lib/packs";
import { getOrCreateItem } from "@/lib/items";
import { isProbablyUrl } from "@/lib/url";

const URL_RE = /(https?:\/\/[^\s]+)/i;

function extractUrl(...vals: (string | null)[]): string | null {
  for (const v of vals) {
    if (v && isProbablyUrl(v.trim())) return v.trim();
  }
  for (const v of vals) {
    const m = v?.match(URL_RE);
    if (m) return m[1];
  }
  return null;
}

// Web Share Target landing (E4-T5). Android shares a link here; we plop it into a new
// draft and open the composer. Shared fields arrive as stitle/stext/surl (see manifest).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const shared = extractUrl(sp.get("surl"), sp.get("stext"), sp.get("stitle"));

  const user = await getCurrentUser();
  if (!user) {
    const next = `/compose/share?${sp.toString()}`;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, url.origin));
  }

  // No usable link shared → just open a blank composer.
  if (!shared) {
    return NextResponse.redirect(new URL("/compose", url.origin));
  }

  const draft = await createDraft(user.id, {});
  const item = await getOrCreateItem(shared);
  await saveDraft(user.id, draft.id, {
    items: [
      {
        itemId: item.id,
        linerNote: null,
        x: 0.5,
        y: 0.42,
        scale: 1,
        rotation: -3,
        zIndex: 1,
        inherited: false,
      },
    ],
  });
  return NextResponse.redirect(new URL(`/compose?draft=${draft.id}`, url.origin));
}
