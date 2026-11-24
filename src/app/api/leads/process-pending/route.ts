import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CONFIRMATION_WINDOW_MINUTES, FORWARD_INCLUDE, forwardIfDue } from "@/lib/leadForwarding";

/**
 * Backup for the lead auto-forward. Each lead normally gets its own QStash
 * call an hour after it's submitted (/api/leads/forward-due, since
 * 2026-11-23). This poll, run by GitHub Actions, catches anything that
 * missed: a lead still PENDING past the window whose QStash call failed,
 * and a CONFIRMED lead whose forward failed on the confirm click (the
 * confirm route only sets forwardedAt on a successful send). GitHub runs
 * the "hourly" schedule only about 3 times a day, which is why it's no
 * longer the main path. Same shared-secret auth pattern as /api/sync.
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
    include: FORWARD_INCLUDE,
  });

  let forwarded = 0;
  const noEmail: string[] = [];
  const errors: string[] = [];

  for (const submission of submissions) {
    try {
      const result = await forwardIfDue(submission);
      if (result === "sent") forwarded++;
      // Left as is: it forwards once the practice has a notificationEmail.
      if (result === "no-email") noEmail.push(submission.id);
    } catch (err) {
      errors.push(`${submission.id}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ forwarded, noEmail, errors });
}

export async function POST(request: Request) {
  return GET(request);
}
