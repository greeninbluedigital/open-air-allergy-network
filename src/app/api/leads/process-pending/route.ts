import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forwardLeadToPractice } from "@/lib/leadNotify";

const CONFIRMATION_WINDOW_MINUTES = 60;

/**
 * Stage 2, step 4 of lead email verification (Section 4) — auto-forwards
 * any lead still PENDING ~60 minutes after submission, tagged [Unverified]
 * instead of blocking on a confirmation click that may never come. Same
 * shared-secret auth pattern as /api/sync. Needs a cron trigger more
 * frequent than daily (see vercel.json) — polling on an interval rather
 * than a precise per-lead delayed job, since "~60 minutes" is explicitly an
 * approximate window, not an exact deadline.
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

  const cutoff = new Date(Date.now() - CONFIRMATION_WINDOW_MINUTES * 60 * 1000);

  const pending = await db.contactSubmission.findMany({
    where: { confirmationStatus: "PENDING", createdAt: { lte: cutoff } },
    include: { provider: { select: { practiceName: true, phone: true, notificationEmail: true } } },
  });

  let forwarded = 0;
  const errors: string[] = [];

  for (const submission of pending) {
    try {
      await db.contactSubmission.update({
        where: { id: submission.id },
        data: { confirmationStatus: "UNVERIFIED_FORWARDED", forwardedAt: new Date() },
      });
      await forwardLeadToPractice(submission, submission.provider, "Unverified");
      forwarded++;
    } catch (err) {
      errors.push(`${submission.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ forwarded, errors });
}

export async function POST(request: Request) {
  return GET(request);
}
