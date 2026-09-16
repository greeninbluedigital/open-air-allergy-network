import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forwardLeadToPractice } from "@/lib/leadNotify";

const CONFIRMATION_WINDOW_MINUTES = 60;

/**
 * Stage 2, step 4 of lead email verification (Section 4) — auto-forwards
 * any lead still PENDING ~60 minutes after submission, tagged [Unverified]
 * instead of blocking on a confirmation click that may never come. Also
 * retries any CONFIRMED lead whose forward previously failed (forwardedAt
 * still null) — the confirm route only sets forwardedAt on a successful
 * send, so a transient email-provider failure lands here instead of being
 * silently marked as forwarded. Same shared-secret auth pattern as
 * /api/sync. Needs a cron trigger more frequent than daily (see
 * vercel.json) — polling on an interval rather than a precise per-lead
 * delayed job, since "~60 minutes" is explicitly an approximate window, not
 * an exact deadline.
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

  const submissions = await db.contactSubmission.findMany({
    where: {
      OR: [
        { confirmationStatus: "PENDING", createdAt: { lte: cutoff } },
        { confirmationStatus: "CONFIRMED", forwardedAt: null },
      ],
    },
    include: { provider: { select: { practiceName: true, phone: true, notificationEmail: true } } },
  });

  let forwarded = 0;
  const errors: string[] = [];

  for (const submission of submissions) {
    const tag = submission.confirmationStatus === "CONFIRMED" ? "Verified" : "Unverified";

    try {
      // Send first — only record the forward once it's actually succeeded,
      // so a failure (bad notificationEmail, provider outage, etc.) leaves
      // the row exactly as it was for the next run to retry, instead of
      // marking a lead forwarded that never actually reached the practice.
      await forwardLeadToPractice(submission, submission.provider, tag);
      await db.contactSubmission.update({
        where: { id: submission.id },
        data:
          tag === "Unverified"
            ? { confirmationStatus: "UNVERIFIED_FORWARDED", forwardedAt: new Date() }
            : { forwardedAt: new Date() },
      });
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
