// Apply versioned migrations (prod deploy step). Run: bun run db:migrate
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "@/lib/env";
import { connectionOptions } from "./index";

async function main() {
  const sql = postgres(env.DATABASE_URL, { ...connectionOptions(env.DATABASE_URL), max: 1 });
  console.log("Applying migrations…");
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  await sql.end();
  console.log("Migrations applied.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
