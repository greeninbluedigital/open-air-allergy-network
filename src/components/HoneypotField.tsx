import { HONEYPOT_FIELD } from "@/lib/forms";

/**
 * Off-screen input real visitors never see (hidden from screen readers and
 * skipped by Tab). Bots that fill every field trip it. The name is chosen so
 * browser autofill never targets it.
 */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
      <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
    </div>
  );
}
