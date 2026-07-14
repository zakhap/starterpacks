import { NextResponse } from "next/server";

// Same-origin image proxy (see lib/img.ts). Streams a remote image so the client
// share-render can draw it to canvas cleanly. Cached hard at the edge in prod.
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u || !/^https?:\/\//i.test(u)) {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }
  try {
    const upstream = await fetch(u, {
      headers: {
        // browser-like UA + referer: some image CDNs (e.g. upload.wikimedia.org)
        // reject bot UAs for hotlinked images.
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        referer: new URL(u).origin,
      },
      redirect: "follow",
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }
    const ct = upstream.headers.get("content-type") ?? "image/jpeg";
    if (!ct.startsWith("image/")) {
      return NextResponse.json({ error: "not an image" }, { status: 415 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "content-type": ct,
        "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
        "access-control-allow-origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
