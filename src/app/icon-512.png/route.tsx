import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// Generated PWA icon (needed for installability → share target on Android).
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e83f1d",
          fontSize: 340,
        }}
      >
        🐀
      </div>
    ),
    { width: 512, height: 512 },
  );
}
