import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { db } from "@/lib/db";
import { FORWARD_DUE_URL, FORWARD_INCLUDE, forwardIfDue } from "@/lib/leadForwarding";

/**
 * Called by Upstash QStash an hour after each contact form lead
 * (scheduleLeadForward in src/lib/leadForwarding.ts). Forwards that one lead
 * as Unverified if the patient still hasn't confirmed, and does nothing if
 * the confirm click already sent it. Only accepts requests signed with the
 * QStash signing keys. A thrown error returns 500, which makes QStash retry;
 * /api/leads/process-pending (GitHub Actions) is the backup for anything
 * that still slips through.
 */
export async function POST(request: Request) {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  const signature = request.headers.get("upstash-signature");
  if (!currentSigningKey || !nextSigningKey || !signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const receiver = new Receiver({ currentSigningKey, nextSigningKey, devMode: false });
  const valid = await receiver.verify({ signature, body, url: FORWARD_DUE_URL }).catch(() => false);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let id: unknown;
  try {
    id = (JSON.parse(body) as { id?: unknown }).id;
  } catch {
    id = undefined;
  }
  if (typeof id !== "string" || !id) {
    // Signed but malformed: retrying won't help, so don't return an error.
    return NextResponse.json({ result: "bad-body" });
  }

  const submission = await db.contactSubmission.findUnique({ where: { id }, include: FORWARD_INCLUDE });
  if (!submission) {
    return NextResponse.json({ result: "not-found" });
  }

  const result = await forwardIfDue(submission);
  return NextResponse.json({ result });
}
