import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/lib/env";

export function connectionOptions(url: string): postgres.Options<Record<string, never>> {
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const isPooler = /pooler|:6543/.test(url); // Supabase transaction pooler
  return {
    max: 10,
    // Supabase (and most hosted PG) require TLS; local does not.
    ssl: isLocal ? false : "require",
    // Transaction-mode poolers can't use prepared statements.
    prepare: isPooler ? false : undefined,
  };
}

// Reuse the pool across HMR reloads in dev to avoid exhausting connections.
const globalForDb = globalThis as unknown as { _pgClient?: ReturnType<typeof postgres> };
const client = globalForDb._pgClient ?? postgres(env.DATABASE_URL, connectionOptions(env.DATABASE_URL));
if (process.env.NODE_ENV !== "production") globalForDb._pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
export * from "./schema";
