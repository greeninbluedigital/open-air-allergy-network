"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";

/**
 * PDP "tracked contact form" (Full Profile+ only). Logs Provider ID + UTM
 * data per PROJECT_SPEC.md Section 2. Works as a plain form action so
 * submission doesn't require client JS — the character counter is a
 * separate, optional client enhancement (see MessageField.tsx).
 */
export async function submitContactMessage(formData: FormData) {
  const providerId = String(formData.get("providerId") || "");
  const providerSlug = String(formData.get("providerSlug") || "");
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const message = String(formData.get("message") || "").trim().slice(0, 500);
  const utmSource = String(formData.get("utmSource") || "") || null;
  const utmMedium = String(formData.get("utmMedium") || "") || null;
  const utmCampaign = String(formData.get("utmCampaign") || "") || null;

  if (!providerId || !firstName || !lastName || !email || !message) {
    redirect(`/find-a-provider/${providerSlug}?error=missing_fields`);
  }

  await db.contactSubmission.create({
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
  });

  redirect(`/find-a-provider/${providerSlug}?sent=1`);
}

/**
 * For Practices lead capture — the actual top-of-funnel sales conversation
 * starter (Section 1: high-touch, not self-service). Same plain-form-action
 * pattern as the PDP contact form.
 */
export async function submitPracticeLead(formData: FormData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const practiceName = String(formData.get("practiceName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  // Normalize first, then check digit count — more forgiving than matching a
  // rigid format string against however someone naturally types a phone
  // number ("(555) 123-4567", "555-123-4567", "5551234567").
  const phoneDigits = String(formData.get("phone") || "").replace(/\D/g, "");
  const phoneExt = String(formData.get("phoneExt") || "").trim() || null;
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const comments = String(formData.get("comments") || "").trim() || null;
  const utmSource = String(formData.get("utmSource") || "") || null;
  const utmMedium = String(formData.get("utmMedium") || "") || null;
  const utmCampaign = String(formData.get("utmCampaign") || "") || null;

  if (
    !firstName ||
    !lastName ||
    !practiceName ||
    !email ||
    phoneDigits.length !== 10 ||
    !city ||
    !state
  ) {
    redirect("/for-practices?error=missing_fields");
  }

  await db.practiceLead.create({
    data: {
      firstName,
      lastName,
      practiceName,
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
