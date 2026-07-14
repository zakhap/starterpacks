import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { env, APP_URL } from "./env";

// Pluggable storage for share images (E5). dev=local disk, prod=R2.
// Kept behind this interface so R2 is a swap, not a rewrite (§9.4 portability).

export interface StoredImage {
  url: string;
}

export async function putImage(key: string, bytes: Buffer, contentType = "image/webp"): Promise<StoredImage> {
  if (env.STORAGE_DRIVER === "r2") {
    return putImageR2(key, bytes, contentType);
  }
  return putImageLocal(key, bytes);
}

async function putImageLocal(key: string, bytes: Buffer): Promise<StoredImage> {
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const path = join(dir, key);
  await writeFile(path, bytes);
  return { url: `${APP_URL}/uploads/${key}` };
}

// Placeholder for prod. Wire up S3-compatible R2 client at deploy time.
async function putImageR2(key: string, bytes: Buffer, contentType: string): Promise<StoredImage> {
  void bytes;
  void contentType;
  if (!env.R2_PUBLIC_URL) throw new Error("R2_PUBLIC_URL not configured");
  // TODO(deploy): PutObject to R2 bucket via aws4fetch / S3 client.
  throw new Error("R2 storage driver not implemented yet — use STORAGE_DRIVER=local in dev.");
}
