import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { AwsClient } from "aws4fetch";
import { env, APP_URL } from "./env";

// Pluggable storage for share images. dev=local disk, prod=R2 (Cloudflare, free egress).
// Same interface either way (§9.4 portability).

export interface StoredImage {
  url: string;
}

export async function putImage(key: string, bytes: Buffer, contentType = "image/webp"): Promise<StoredImage> {
  if (env.STORAGE_DRIVER === "r2") return putImageR2(key, bytes, contentType);
  return putImageLocal(key, bytes);
}

async function putImageLocal(key: string, bytes: Buffer): Promise<StoredImage> {
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, key), bytes);
  return { url: `${APP_URL}/uploads/${key}` };
}

let _r2: AwsClient | null = null;
function r2Client(): AwsClient {
  if (_r2) return _r2;
  _r2 = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    region: "auto",
    service: "s3",
  });
  return _r2;
}

async function putImageR2(key: string, bytes: Buffer, contentType: string): Promise<StoredImage> {
  const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`;
  const res = await r2Client().fetch(endpoint, {
    method: "PUT",
    body: new Uint8Array(bytes),
    headers: {
      "content-type": contentType,
      // immutable per-pack URL → caches forever at the edge, egress ≈ 0
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const base = env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return { url: `${base}/${key}` };
}
