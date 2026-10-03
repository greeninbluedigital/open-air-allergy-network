import { cookies, headers } from "next/headers";
import { ZIP_COOKIE } from "@/lib/zip";

/** Saved zip first; otherwise Vercel's approximate zip (US only), which the visitor can edit. */
async function knownZip(): Promise<string> {
  const saved = (await cookies()).get(ZIP_COOKIE)?.value;
  if (saved) return saved;
  const h = await headers();
  const ipZip = h.get("x-vercel-ip-postal-code") ?? "";
  return h.get("x-vercel-ip-country") === "US" && /^\d{5}$/.test(ipZip) ? ipZip : "";
}

const RADIUS_OPTIONS = [20, 30, 40, 50, 75, 100, 150, 200] as const;
const PROVIDER_SEARCH = "/find-an-ilit-provider";

/**
 * Plain GET form — no client JS needed, works with SEO/GEO server-rendering
 * requirement. Radius/zip are read from the URL on the receiving page rather
 * than posted via fetch. Stacks to full width below the 768px breakpoint
 * (Section 9) for every instance site-wide: homepage hero, SRP top bar,
 * Learn About ILIT, Blog PAF, SEM landing page.
 */
export async function ZipSearchForm({
  action = PROVIDER_SEARCH,
  showRadius = false,
  defaultRadius = 50,
  defaultZip,
  buttonLabel = "Find a Provider",
  variant = "light",
  origin,
}: {
  action?: string;
  showRadius?: boolean;
  defaultRadius?: number;
  /** Omit to pre-fill provider searches with the visitor's saved or approximate zip. */
  defaultZip?: string;
  buttonLabel?: string;
  variant?: "light" | "dark";
  /** Where this search box sits, sent to GA4 with each provider search (docs/gtm-ga4-setup.md). */
  origin?: string;
}) {
  const isDark = variant === "dark";
  const zipValue = defaultZip ?? (action === PROVIDER_SEARCH ? await knownZip() : "");

  return (
    <form
      action={action}
      method="get"
      data-search-origin={action === PROVIDER_SEARCH ? origin : undefined}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <input
        type="text"
        name="zip"
        inputMode="numeric"
        pattern="[0-9]{5}"
        placeholder="Enter zip code"
        autoComplete="postal-code"
        defaultValue={zipValue}
        required
        className={`min-w-0 flex-1 rounded border px-3 py-2.5 text-sm ${
          isDark
            ? "border-white/30 bg-white text-foreground placeholder:text-muted"
            : "border-line bg-white text-foreground placeholder:text-muted"
        }`}
      />
      {showRadius && (
        <select
          name="radius"
          aria-label="Search radius"
          defaultValue={defaultRadius}
          className={`rounded border px-3 py-2.5 text-sm ${
            isDark
              ? "border-white/30 bg-white text-foreground"
              : "border-line bg-white text-foreground"
          }`}
        >
          {RADIUS_OPTIONS.map((mi) => (
            <option key={mi} value={mi}>
              {mi} mi
            </option>
          ))}
        </select>
      )}
      <button
        type="submit"
        className={`shrink-0 rounded px-4 py-2.5 text-sm font-semibold whitespace-nowrap ${
          isDark
            ? "bg-white text-foreground"
            : "bg-action text-white hover:bg-action-hover"
        }`}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
