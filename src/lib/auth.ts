import { cookies } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import { db, users, sessions, type User } from "@/db";
import { newId } from "./ids";

// Dev auth (AUTH_DRIVER=dev): cookie-session, pick-a-handle, no password.
// Swap for Supabase social login in prod behind the same getCurrentUser() shape.

const COOKIE = "packrat_session";
const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

const HANDLE_RE = /^[a-z0-9_]{2,20}$/;
const RESERVED = new Set([
  "api", "admin", "login", "logout", "compose", "new", "feed", "settings",
  "about", "help", "packrat", "uploads", "_next", "favicon",
]);

export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

export function validateHandle(handle: string): string | null {
  const h = normalizeHandle(handle);
  if (!HANDLE_RE.test(h)) return "Handles are 2–20 chars: a–z, 0–9, underscore.";
  if (RESERVED.has(h)) return "That handle is reserved.";
  return null;
}

/** Current signed-in user, or null. Cached per-request is fine; keep it simple. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const now = new Date();
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  return u;
}

/** Dev login: find-or-create by handle, set session cookie. Returns the user. */
export async function devLogin(handleRaw: string): Promise<User> {
  const handle = normalizeHandle(handleRaw);
  const err = validateHandle(handle);
  if (err) throw new Error(err);

  let user = (await db.select().from(users).where(eq(users.handle, handle)).limit(1))[0];
  if (!user) {
    user = (
      await db
        .insert(users)
        .values({ id: newId("u"), handle, displayName: handle })
        .returning()
    )[0];
  }

  const token = newId("s");
  await db.insert(sessions).values({
    id: token,
    userId: user.id,
    expiresAt: new Date(Date.now() + THIRTY_DAYS),
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS / 1000,
  });
  return user;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, token));
  store.delete(COOKIE);
}
