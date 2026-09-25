/**
 * HTML `pattern` for a US phone number: exactly 10 digits (optionally led by
 * a country code 1), with any spacing/punctuation around them, so
 * "(555) 123-4567", "555.123.4567" and "+1 555 123 4567" all pass.
 */
export const US_PHONE_PATTERN = "\\D*1?\\D*(\\d\\D*){10}";
export const US_PHONE_TITLE = "Enter a 10-digit phone number, like (555) 123-4567";

/** Returns the 10 bare digits, or null if it isn't a valid US number. */
export function normalizeUsPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return ten.length === 10 ? ten : null;
}
