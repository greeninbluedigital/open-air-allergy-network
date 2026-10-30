import { NextResponse } from "next/server";
import { refreshSiteCache } from "@/lib/cache";

/**
 * Clears the page data cache (src/lib/cache.ts) for writes made outside the
 * site's own server: the publish scripts call it after they write an
 * article or legal page, so it shows on the next visit. Same shared-secret
 * auth as /api/sync.
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
  refreshSiteCache();
  return NextResponse.json({ revalidated: true });
}
