/** Shared limit for free-text message/comments boxes on every public form. */
export const MESSAGE_MAX_LENGTH = 500;

/** Name of the off-screen honeypot input (see HoneypotField). */
export const HONEYPOT_FIELD = "leave_blank";

/** True when a bot filled the hidden field; callers fake success and save nothing. */
export function isHoneypotFilled(formData: FormData): boolean {
  return String(formData.get(HONEYPOT_FIELD) || "") !== "";
}

// Common spam TLDs. Deliberately excludes short ones like .co/.me/.us that
// show up in ordinary typos ("allergies.co workers").
const BARE_DOMAIN = /\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|info|biz|io|ru|cn|xyz|top|site|online|shop|store|click|link|app|ca|uk)\b/i;

/**
 * Links aren't allowed in message boxes (spam protection for practices and
 * us). Email addresses are stripped first so "reach me at jane@gmail.com"
 * still goes through.
 */
export function containsLink(text: string): boolean {
  const withoutEmails = text.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, " ");
  return /https?:\/\/|www\./i.test(withoutEmails) || BARE_DOMAIN.test(withoutEmails);
}

export const LINKS_ERROR_MESSAGE = "Please remove links or web addresses from your message and try again.";

export type FormError = "missing_fields" | "invalid_email" | "has_links";

/** Error text for the For Practices and About forms (the PDP's has a phone fallback). */
export const FORM_ERROR_MESSAGES: Record<FormError, string> = {
  missing_fields: "Please fill in all required fields and try again.",
  invalid_email: "That email address doesn't look right. Please double-check it and try again.",
  has_links: LINKS_ERROR_MESSAGE,
};

export function parseFormError(value: unknown): FormError | null {
  return value === "missing_fields" || value === "invalid_email" || value === "has_links" ? value : null;
}
