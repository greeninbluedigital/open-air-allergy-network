/** Shared limit for free-text message/comments boxes on every public form. */
export const MESSAGE_MAX_LENGTH = 500;

/** Name of the off-screen honeypot input (see HoneypotField). */
export const HONEYPOT_FIELD = "leave_blank";

/** True when a bot filled the hidden field; callers fake success and save nothing. */
export function isHoneypotFilled(formData: FormData): boolean {
  return String(formData.get(HONEYPOT_FIELD) || "") !== "";
}
