import { parse } from "node-html-parser";
import type { SourceType } from "@/db/schema";
import { domainOf, guessSourceType } from "@/lib/url";

export interface UnfurlResult {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  domain: string;
  sourceType: SourceType;
  ok: boolean; // false => caller should render the fallback card
}

const FETCH_TIMEOUT_MS = 4000;
const UA =
  "Mozilla/5.0 (compatible; PackratBot/0.1; +https://packrat.app/bot) AppleWebKit/537.36";

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,application/json", ...(init?.headers ?? {}) },
      redirect: "follow",
    });
  } finally {
    clearTimeout(t);
  }
}

async function oembed(endpoint: string, source: SourceType, domain: string): Promise<UnfurlResult | null> {
  try {
    const res = await fetchWithTimeout(endpoint);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    const title = data.title ?? null;
    const subtitle = data.author_name ? `${data.author_name}` : null;
    return {
      title,
      description: subtitle,
      imageUrl: data.thumbnail_url ?? null,
      domain,
      sourceType: source,
      ok: Boolean(title),
    };
  } catch {
    return null;
  }
}

function pickMeta(root: ReturnType<typeof parse>, keys: string[]): string | null {
  for (const key of keys) {
    const el =
      root.querySelector(`meta[property="${key}"]`) ??
      root.querySelector(`meta[name="${key}"]`);
    const content = el?.getAttribute("content");
    if (content && content.trim()) return content.trim();
  }
  return null;
}

function absolutize(maybe: string | null, base: string): string | null {
  if (!maybe) return null;
  try {
    return new URL(maybe, base).toString();
  } catch {
    return null;
  }
}

async function unfurlGeneric(url: string): Promise<UnfurlResult> {
  const domain = domainOf(url);
  const sourceType = guessSourceType(url);
  const fallback: UnfurlResult = {
    title: null,
    description: null,
    imageUrl: null,
    domain,
    sourceType,
    ok: false,
  };
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return fallback;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html")) return fallback;
    const html = await res.text();
    const root = parse(html);

    const title =
      pickMeta(root, ["og:title", "twitter:title"]) ??
      root.querySelector("title")?.textContent?.trim() ??
      null;
    const description = pickMeta(root, ["og:description", "twitter:description", "description"]);
    const image = absolutize(
      pickMeta(root, ["og:image", "twitter:image", "twitter:image:src"]),
      url,
    );

    return {
      title,
      description,
      imageUrl: image,
      domain,
      sourceType,
      ok: Boolean(title),
    };
  } catch {
    return fallback;
  }
}

/** Unfurl a canonical URL into item metadata. Never throws; returns ok=false for a fallback card. */
export async function unfurl(canonicalUrl: string): Promise<UnfurlResult> {
  const domain = domainOf(canonicalUrl);

  if (domain.includes("spotify.com")) {
    const r = await oembed(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(canonicalUrl)}`,
      "song",
      domain,
    );
    if (r) return r;
  }
  if (domain.includes("youtube.com") || domain === "youtu.be") {
    const r = await oembed(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`,
      "video",
      domain,
    );
    if (r) return r;
  }

  return unfurlGeneric(canonicalUrl);
}
