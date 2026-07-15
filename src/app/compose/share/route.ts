import { NextResponse } from "next/server";
import { isProbablyUrl } from "@/lib/url";

const URL_RE = /(https?:\/\/[^\s]+)/i;

function extractUrl(...vals: (string | null)[]): string | null {
  for (const v of vals) if (v && isProbablyUrl(v.trim())) return v.trim();
  for (const v of vals) {
    const m = v?.match(URL_RE);
    if (m) return m[1];
  }
  return null;
}

// Web Share Target landing (E4-T5). Android shares a link here; we open the composer
// pre-loaded with that link to plop. No auth, no draft — the composer is client-side.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const shared = extractUrl(sp.get("surl"), sp.get("stext"), sp.get("stitle"));
  const dest = shared ? `/compose?add=${encodeURIComponent(shared)}` : "/compose";
  return NextResponse.redirect(new URL(dest, url.origin));
}
