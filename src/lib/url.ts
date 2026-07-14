import type { SourceType } from "@/db/schema";

// Tracking params stripped during canonicalization (E3-T1).
const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid",
  "si", "igshid", "ref", "ref_src", "ref_url", "spm", "_hsenc", "_hsmi",
  "yclid", "twclid", "cmpid", "source",
]);

// Hosts we can classify without fetching.
function hostToSource(host: string): SourceType | null {
  const h = host.replace(/^www\./, "");
  if (h.includes("spotify.com")) return "song";
  if (h.includes("youtube.com") || h === "youtu.be") return "video";
  if (h.includes("music.apple.com")) return "song";
  if (h.includes("goodreads.com") || h.includes("books.google") || h.includes("bookshop.org"))
    return "book";
  if (
    h.includes("amazon.") || h.includes("shopify") || h.includes("etsy.com") ||
    h.includes("nike.com") || h.includes("ssense.com")
  )
    return "product";
  if (h.includes("google.com/maps") || h.includes("maps.app.goo.gl") || h.includes("yelp.com"))
    return "place";
  return null;
}

export function isProbablyUrl(text: string): boolean {
  const t = text.trim();
  if (/\s/.test(t)) return false;
  return /^https?:\/\/\S+$/i.test(t) || /^[\w-]+\.[a-z]{2,}(\/\S*)?$/i.test(t);
}

/** Normalize a URL to a canonical, dedupe-safe form. Also the unfurl cache key. */
export function canonicalizeUrl(input: string): string {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return input.trim();
  }
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  u.protocol = "https:";
  u.hash = "";

  // drop tracking params, keep the rest sorted for stability
  const kept: [string, string][] = [];
  for (const [k, v] of u.searchParams.entries()) {
    if (TRACKING_PARAMS.has(k.toLowerCase())) continue;
    kept.push([k, v]);
  }
  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  u.search = "";
  for (const [k, v] of kept) u.searchParams.append(k, v);

  // strip trailing slash on path (but keep root "/")
  if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, "");

  return u.toString();
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function guessSourceType(url: string): SourceType {
  return hostToSource(domainOf(url)) ?? "other";
}
