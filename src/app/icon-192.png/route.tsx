import { ImageResponse } from "next/og";

export const dynamic = "force-static";

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
          fontSize: 130,
        }}
      >
        🐀
      </div>
    ),
    { width: 192, height: 192 },
  );
}
