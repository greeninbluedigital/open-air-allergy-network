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
