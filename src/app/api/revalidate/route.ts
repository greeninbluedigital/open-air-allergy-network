import { NextResponse } from "next/server";
import { refreshArticleCache, refreshSiteCache } from "@/lib/cache";

/**
 * Clears the page data cache (src/lib/cache.ts) for writes made outside the
 * site's own server: the publish scripts call it after they write an
 * article (?scope=articles) or legal page, so it shows on the next visit.
 * Same shared-secret auth as /api/sync.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ?scope=articles (publish-article): Blog and Learn only, so practice pages
  // stay cached. Anything else clears the whole site.
  const scope = new URL(request.url).searchParams.get("scope");
  if (scope === "articles") refreshArticleCache();
  else refreshSiteCache();
  return NextResponse.json({ revalidated: scope === "articles" ? "articles" : "site" });
}
