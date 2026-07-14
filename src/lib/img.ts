// Route remote item images through our same-origin proxy so the client-side share
// render (html-to-image) can draw them to canvas without CORS tainting (S2). Local
// and already-proxied URLs pass through untouched.
export function proxyImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  if (url.startsWith("data:")) return url;
  return `/api/img?u=${encodeURIComponent(url)}`;
}
