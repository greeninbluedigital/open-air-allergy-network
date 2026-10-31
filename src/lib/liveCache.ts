/**
 * For scripts that write to the production database from outside the site
 * (publish-article, publish-legal-pages): asks the live site to clear its
 * page data cache (src/lib/cache.ts, via /api/revalidate) so the change shows
 * on the next visit. `articles` clears only Blog and Learn data and pages.
 * Call it before IndexNow, so crawlers fetch the new page.
 * Never throws; a failure only delays the change until the next sync.
 */
const ORIGIN = "https://openairallergynetwork.com";

export async function refreshLiveSite(scope?: "articles"): Promise<string> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return "skipped (CRON_SECRET not set)";
  try {
    const res = await fetch(`${ORIGIN}/api/revalidate${scope ? `?scope=${scope}` : ""}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? "cleared" : `failed (${res.status})`;
  } catch (err) {
    return `failed: ${(err as Error).message}`;
  }
}
