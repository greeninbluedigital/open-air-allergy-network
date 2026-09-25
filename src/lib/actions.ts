"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { domainCanReceiveMail } from "@/lib/emailDomainCheck";
import { sendConfirmationEmail } from "@/lib/leadNotify";
import { normalizeUsPhone } from "@/lib/phone";
import { PRACTICE_LEAD_REASONS, normalizeWebsite, notifyPracticeLead } from "@/lib/practiceLead";

/**
 * PDP/SEM "tracked contact form" (Full Profile+ on the PDP; always shown on
 * SEM landing pages, which are only ever generated for paying tiers). Logs
 * Provider ID + UTM data per Section 2. Works as a plain form action so
 * submission doesn't require client JS — the character counter is a
 * separate, optional client enhancement (see MessageField.tsx).
 *
 * Two-stage lead email verification (Section 4): Stage 1 is a synchronous
 * MX/domain check here, before anything is persisted — a structurally
 * undeliverable address is rejected inline, never stored. Stage 2 (double
 * opt-in, 60-minute auto-forward) starts once the row is created; see
 * src/app/api/leads/confirm/[token]/route.ts for the confirm side and
 * src/app/api/leads/process-pending/route.ts for the auto-forward side.
 */
export async function submitContactMessage(formData: FormData) {
  const providerId = String(formData.get("providerId") || "");
  const providerSlug = String(formData.get("providerSlug") || "");
  const returnPath = String(formData.get("returnPath") || `/find-an-ilit-provider/${providerSlug}`);
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const message = String(formData.get("message") || "").trim().slice(0, 500);
  const utmSource = String(formData.get("utmSource") || "") || null;
  const utmMedium = String(formData.get("utmMedium") || "") || null;
  const utmCampaign = String(formData.get("utmCampaign") || "") || null;

  if (!providerId || !firstName || !lastName || !email || !message) {
    redirect(`${returnPath}?error=missing_fields`);
  }

  // Stage 1 — reject structurally-undeliverable addresses before persisting
  // anything. The inline error's phone-number fallback is rendered by the
  // page itself (it already has the provider's phone in scope), not passed
  // through the redirect.
  const canReceiveMail = await domainCanReceiveMail(email);
  if (!canReceiveMail) {
    redirect(`${returnPath}?error=invalid_email`);
  }

  const submission = await db.contactSubmission.create({
    data: {
      providerId,
      firstName,
      lastName,
      email,
      phone,
      message,
      utmSource,
      utmMedium,
      utmCampaign,
    },
    include: { provider: { select: { practiceName: true, phone: true, notificationEmail: true } } },
  });

  // Stage 2, step 1 — confirmation email goes out immediately. A failure
  // here shouldn't lose the lead (it's already persisted) or block the
  // visitor from seeing the confirmation state, so it's logged, not thrown.
  try {
    await sendConfirmationEmail(submission, submission.provider);
  } catch (err) {
    console.error("Failed to send lead confirmation email:", err);
  }

  redirect(`${returnPath}?sent=1`);
}

/**
 * For Practices lead capture — the actual top-of-funnel sales conversation
 * starter (Section 1: high-touch, not self-service). Same plain-form-action
 * pattern as the PDP contact form.
 */
export async function submitPracticeLead(formData: FormData) {
  const reasonRaw = String(formData.get("reason") || "");
  const reason = PRACTICE_LEAD_REASONS.find((r) => r === reasonRaw);
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const practiceName = String(formData.get("practiceName") || "").trim();
  const website = normalizeWebsite(String(formData.get("website") || ""));
  const email = String(formData.get("email") || "").trim();
  const phoneDigits = normalizeUsPhone(String(formData.get("phone") || ""));
  const phoneExt = String(formData.get("phoneExt") || "").trim() || null;
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const comments = String(formData.get("comments") || "").trim() || null;
  const utmSource = String(formData.get("utmSource") || "") || null;
  const utmMedium = String(formData.get("utmMedium") || "") || null;
  const utmCampaign = String(formData.get("utmCampaign") || "") || null;

  // Honeypot: an off-screen field real visitors never see. Bots that fill
  // every input get the normal success page, but nothing is saved.
  if (String(formData.get("leave_blank") || "")) {
    redirect("/for-practices?sent=1");
  }

  if (!reason || !firstName || !lastName || !practiceName || !email || !phoneDigits || !city || !state) {
    redirect("/for-practices?error=missing_fields");
  }

  // Same Stage 1 check as the PDP form: reject domains that can't receive mail.
  if (!(await domainCanReceiveMail(email))) {
    redirect("/for-practices?error=invalid_email");
  }

  const lead = await db.practiceLead.create({
    data: {
      reason,
      firstName,
      lastName,
      practiceName,
      website,
      email,
      phone: phoneDigits,
      phoneExt,
      city,
      state,
      comments,
      utmSource,
      utmMedium,
      utmCampaign,
    },
  });

  // The lead is already saved, so a send failure is logged rather than
  // shown to the visitor.
  try {
    await notifyPracticeLead({ ...lead, reason });
  } catch (err) {
    console.error("Failed to send practice lead notification:", err);
  }

  redirect("/for-practices?sent=1");
}

/**
 * About page's general contact form — the catch-all for press,
 * partnerships, and accessibility requests, distinct from PracticeLead and
 * the PDP's ContactSubmission (Section 5).
 */
export async function submitGeneralInquiry(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const reason = String(formData.get("reason") || "General Inquiry").trim();
  const message = String(formData.get("message") || "").trim();
  const utmSource = String(formData.get("utmSource") || "") || null;
  const utmMedium = String(formData.get("utmMedium") || "") || null;
  const utmCampaign = String(formData.get("utmCampaign") || "") || null;

  if (!firstName || !lastName || !email || !message) {
    redirect("/about?error=missing_fields#contact");
  }

  await db.generalInquiry.create({
    data: { firstName, lastName, email, reason, message, utmSource, utmMedium, utmCampaign },
  });

  redirect("/about?sent=1#contact");
}
