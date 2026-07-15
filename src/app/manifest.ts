import type { MetadataRoute } from "next";

// PWA manifest with a Web Share Target (E4-T5). Sharing a link from another app into
// the installed PWA hits /compose/share, which starts a pack with that item.
// Note: iOS Safari does not implement Web Share Target — paste is the iOS fallback.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Packrat",
    short_name: "Packrat",
    description: "Make, remix, and send starter packs.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2ede1",
    theme_color: "#e83f1d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Not yet in the Next Manifest type; valid per the Web Share Target spec.
    ...({
      share_target: {
        action: "/compose/share",
        method: "GET",
        enctype: "application/x-www-form-urlencoded",
        params: { title: "stitle", text: "stext", url: "surl" },
      },
    } as object),
  };
}
