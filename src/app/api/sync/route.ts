import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync";

/**
 * Protected sync endpoint — covers both the daily scheduled sync and the
 * manual "sync now" trigger (PROJECT_SPEC.md Section 2). There's no admin
 * panel yet, so this is secured with a shared secret rather than session
 * auth. Named CRON_SECRET specifically: Vercel Cron automatically sends
 * `Authorization: Bearer $CRON_SECRET` on scheduled requests when a project
 * env var of that exact name exists, so the daily run (vercel.json) and a
 * manual curl trigger both authenticate the same way.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runSync();
  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  return GET(request);
}
