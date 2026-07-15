// Startup env validation (E1-T8). Fails loudly on missing required vars.
import { z } from "zod";

const schema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    STORAGE_DRIVER: z.enum(["local", "r2"]).default("local"),
    // R2 (prod) — required only when STORAGE_DRIVER=r2 (checked below)
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_URL: z.string().url().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.STORAGE_DRIVER === "r2") {
      for (const k of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"] as const) {
        if (!v[k]) ctx.addIssue({ code: "custom", path: [k], message: `${k} is required when STORAGE_DRIVER=r2` });
      }
    }
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}\n\nSee .env.example.`);
}

export const env = parsed.data;
export const APP_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
