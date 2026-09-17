const RADIUS_OPTIONS = [20, 30, 40, 50, 75, 100, 150, 200] as const;

/**
 * Plain GET form — no client JS needed, works with SEO/GEO server-rendering
 * requirement. Radius/zip are read from the URL on the receiving page rather
 * than posted via fetch. Stacks to full width below the 768px breakpoint
 * (Section 9) for every instance site-wide: homepage hero, SRP top bar,
 * Learn About ILIT, Blog PAF, SEM landing page.
 */
export function ZipSearchForm({
  action = "/find-a-provider",
  showRadius = false,
  defaultRadius = 50,
  defaultZip = "",
  buttonLabel = "Find a Provider",
  variant = "light",
}: {
  action?: string;
  showRadius?: boolean;
  defaultRadius?: number;
  defaultZip?: string;
  buttonLabel?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <form
      action={action}
      method="get"
      className="flex flex-col gap-2 sm:flex-row"
    >
      <input
        type="text"
        name="zip"
        inputMode="numeric"
        pattern="[0-9]{5}"
        placeholder="Enter zip code"
        autoComplete="postal-code"
        defaultValue={defaultZip}
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
            : "bg-foreground text-background"
        }`}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
