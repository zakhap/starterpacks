import { customAlphabet } from "nanoid";

// URL-friendly id (no ambiguous chars).
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nano = customAlphabet(alphabet, 12);

export function newId(prefix?: string): string {
  return prefix ? `${prefix}_${nano()}` : nano();
}

/** Turn a pack title into a URL slug. Non-unique on its own; caller ensures uniqueness. */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "pack";
}

const shortNano = customAlphabet(alphabet, 5);
export function shortSuffix(): string {
  return shortNano();
}
