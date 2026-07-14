// Unfurl worker (E3-T2 / E3-T7). Drains the unfurl_jobs queue with FOR UPDATE SKIP LOCKED
// and re-unfurls stale/failed items so dead images self-heal. Optional in dev — the paste
// path unfurls inline — but this is the production shape (a 2nd Railway service). No Redis.
import { sql, eq, lt, or } from "drizzle-orm";
import { db, items, unfurlJobs } from "@/db";
import { unfurl } from "@/unfurl";

const POLL_MS = 2000;
const REUNFURL_AFTER_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

let running = true;
process.on("SIGTERM", () => (running = false));
process.on("SIGINT", () => (running = false));

async function claimJob() {
  // atomic claim: one worker gets the row
  const rows = await db.execute(sql`
    UPDATE unfurl_jobs SET status = 'pending', locked_at = now(), attempts = attempts + 1
    WHERE id = (
      SELECT id FROM unfurl_jobs
      WHERE status = 'pending' AND (locked_at IS NULL OR locked_at < now() - interval '2 minutes')
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id, url, attempts
  `);
  return (rows as unknown as { id: string; url: string; attempts: number }[])[0] ?? null;
}

async function processJob(job: { id: string; url: string; attempts: number }) {
  const result = await unfurl(job.url);
  await db
    .update(items)
    .set({
      title: result.title,
      description: result.description,
      imageUrl: result.imageUrl,
      domain: result.domain,
      sourceType: result.sourceType,
      unfurlStatus: result.ok ? "done" : "failed",
      unfurledAt: new Date(),
    })
    .where(eq(items.canonicalUrl, job.url));
  await db
    .update(unfurlJobs)
    .set({ status: result.ok ? "done" : job.attempts >= 3 ? "failed" : "pending" })
    .where(eq(unfurlJobs.id, job.id));
  console.log(`[unfurl] ${result.ok ? "✓" : "✗"} ${job.url}`);
}

async function reunfurlStale() {
  const cutoff = new Date(Date.now() - REUNFURL_AFTER_MS);
  const stale = await db
    .select({ url: items.canonicalUrl })
    .from(items)
    .where(or(eq(items.unfurlStatus, "failed"), lt(items.unfurledAt, cutoff)))
    .limit(5);
  for (const s of stale) {
    const r = await unfurl(s.url);
    await db
      .update(items)
      .set({
        title: r.title,
        imageUrl: r.imageUrl,
        unfurlStatus: r.ok ? "done" : "failed",
        unfurledAt: new Date(),
      })
      .where(eq(items.canonicalUrl, s.url));
  }
}

async function main() {
  console.log("[worker] Packrat unfurl worker up. Polling…");
  let ticks = 0;
  while (running) {
    const job = await claimJob();
    if (job) {
      try {
        await processJob(job);
      } catch (e) {
        console.error("[unfurl] error", e);
      }
    } else {
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    if (++ticks % 60 === 0) await reunfurlStale().catch(() => {});
  }
  console.log("[worker] shutting down.");
  process.exit(0);
}

main();
