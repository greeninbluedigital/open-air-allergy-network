import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEADS_INBOX, escapeHtml, sendEmail } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** How far back to look for the lead when a bounce has no lead_id tag
 * (emails sent before tags were added, 2026-11-25). */
const FALLBACK_DAYS = 7;

/**
 * Resend webhook (subscribe to email.bounced only). When a lead email that
 * was forwarded to a practice bounces, marks the lead (forwardBouncedAt)
 * and emails leads@ an alert, so the owner can reach the practice by phone
 * and fix its Notification Email the same day. A bounced confirmation email
 * to a patient needs nothing: the lead still forwards, unconfirmed, an hour
 * later. Any other bounce gets a short alert. Only touches the database
 * when a bounce actually arrives.
 *
 * Signed by Resend (Svix headers); needs RESEND_WEBHOOK_SECRET, the
 * signing secret shown on the webhook in Resend's dashboard (whsec_...).
 */
function verifySignature(request: Request, body: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const header = request.headers.get("svix-signature");
  if (!secret || !id || !timestamp || !header) return false;

  // Reject anything more than 5 minutes off, to block replays.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return header.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

type BounceEvent = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    subject?: string;
    bounce?: { message?: string; type?: string; subType?: string };
    tags?: Record<string, string> | { name: string; value: string }[];
  };
};

function tagValue(tags: NonNullable<BounceEvent["data"]>["tags"], name: string): string | undefined {
  if (!tags) return undefined;
  if (Array.isArray(tags)) return tags.find((t) => t.name === name)?.value;
  return tags[name];
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!verifySignature(request, body)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: BounceEvent;
  try {
    event = JSON.parse(body) as BounceEvent;
  } catch {
    return NextResponse.json({ result: "bad-body" });
  }
  if (event.type !== "email.bounced") {
    return NextResponse.json({ result: "ignored" });
  }

  const data = event.data ?? {};
  const to = (Array.isArray(data.to) ? data.to : [data.to]).filter(Boolean).map((t) => String(t).toLowerCase());
  const reason = [data.bounce?.type, data.bounce?.subType, data.bounce?.message].filter(Boolean).join(": ").slice(0, 500);
  const kind = tagValue(data.tags, "oaan_type");
  const leadId = tagValue(data.tags, "lead_id");

  if (kind === "lead_confirm") {
    return NextResponse.json({ result: "confirm-bounce-ignored" });
  }

  // Find the lead: by tag, or (for emails sent before tags) by the practice
  // address it was forwarded to.
  const select = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    message: true,
    createdAt: true,
    confirmationStatus: true,
    forwardBouncedAt: true,
    provider: { select: { slug: true, practiceName: true, phone: true, notificationEmail: true } },
  } as const;
  let lead = leadId ? await db.contactSubmission.findUnique({ where: { id: leadId }, select }) : null;
  if (!lead && kind !== "lead_forward" && to.length) {
    lead = await db.contactSubmission.findFirst({
      where: {
        forwardedAt: { gte: new Date(Date.now() - FALLBACK_DAYS * 24 * 60 * 60 * 1000) },
        forwardBouncedAt: null,
        provider: { notificationEmail: { in: to, mode: "insensitive" } },
      },
      orderBy: { forwardedAt: "desc" },
      select,
    });
  }

  if (!lead) {
    // Not a lead email (or the lead can't be found): a short alert is enough.
    await sendEmail({
      to: LEADS_INBOX,
      subject: `Email bounced: ${to.join(", ") || "unknown recipient"}`,
      html: `<p>An email from the site bounced.</p>
        <p><strong>To:</strong> ${escapeHtml(to.join(", "))}<br>
        <strong>Subject:</strong> ${escapeHtml(data.subject ?? "")}<br>
        <strong>Reason:</strong> ${escapeHtml(reason)}<br>
        <strong>Resend email id:</strong> ${escapeHtml(data.email_id ?? "")}</p>`,
    });
    return NextResponse.json({ result: "alerted-unmatched" });
  }

  if (lead.forwardBouncedAt) {
    // Resend retries webhooks; one alert per lead is enough.
    return NextResponse.json({ result: "already-recorded" });
  }

  await db.contactSubmission.update({
    where: { id: lead.id },
    data: { forwardBouncedAt: new Date(), forwardBounceReason: reason || null },
  });

  const p = lead.provider;
  const submitted = lead.createdAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" });
  await sendEmail({
    to: LEADS_INBOX,
    subject: `Lead not delivered: ${p.practiceName} (email bounced)`,
    html: `<p><strong>A lead for ${escapeHtml(p.practiceName)} never reached the practice.</strong> The forwarded email bounced, so the practice's Notification Email doesn't accept mail.</p>
      <p><strong>Practice:</strong> <a href="${SITE_URL}/find-an-ilit-provider/${encodeURIComponent(p.slug)}">${escapeHtml(p.practiceName)}</a><br>
      <strong>Practice phone:</strong> ${escapeHtml(p.phone ?? "not listed")}<br>
      <strong>Bounced address:</strong> ${escapeHtml(to.join(", ") || p.notificationEmail || "")}<br>
      <strong>Reason:</strong> ${escapeHtml(reason)}</p>
      <p><strong>Lead:</strong> ${escapeHtml(`${lead.firstName} ${lead.lastName}`)}, ${escapeHtml(lead.email)}${lead.phone ? `, ${escapeHtml(lead.phone)}` : ""}<br>
      <strong>Submitted:</strong> ${escapeHtml(submitted)} Pacific (${escapeHtml(lead.confirmationStatus === "CONFIRMED" ? "email confirmed" : "not confirmed")})<br>
      <strong>Message:</strong> ${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>
      <p><strong>Next steps:</strong> call the practice for a working address, update its Notification Email on the sheet (or clear it so the form comes down), then resend this lead: <code>npx tsx scripts/resend-lead.ts ${escapeHtml(lead.id)}</code>. Resend has also added the bounced address to its suppression list, so remove it there only once it's fixed.</p>`,
  });

  return NextResponse.json({ result: "alerted" });
}
