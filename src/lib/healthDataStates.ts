/**
 * States whose consumer health data laws reach a business of OAAN's size
 * (checked 2026-10-09): Washington's My Health My Data Act, Nevada's
 * consumer health data law and Connecticut's health data rules. Visitors in
 * these states, and practices located in them, get the "Email {practice}"
 * button instead of the contact form, so OAAN never collects a message
 * there. New York's bill was vetoed (Dec 2025); Maryland's and Vermont's
 * laws have size thresholds OAAN is far below. Add a state here if a new law
 * without thresholds passes (owner's decision: no lawyer, err cautious).
 */
export const HEALTH_DATA_STATES = [
  { code: "WA", name: "Washington" },
  { code: "NV", name: "Nevada" },
  { code: "CT", name: "Connecticut" },
] as const;

const CODES = new Set<string>(HEALTH_DATA_STATES.map((s) => s.code));

/** "WA, NV or CT", for the contact form's compact location question. */
export const HEALTH_DATA_STATE_LIST = (() => {
  const codes = HEALTH_DATA_STATES.map((s) => s.code);
  return codes.length > 1 ? `${codes.slice(0, -1).join(", ")} or ${codes[codes.length - 1]}` : codes[0];
})();

export function isHealthDataState(code: string | null | undefined): boolean {
  return !!code && CODES.has(code.trim().toUpperCase());
}
