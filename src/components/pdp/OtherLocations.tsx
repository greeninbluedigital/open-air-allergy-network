import Link from "next/link";
import { US_STATES } from "@/lib/states";

type Office = {
  slug: string;
  practiceName: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
};

/** How many sibling offices show before the rest fold into "Show all". */
const NEAREST = 5;
const STATE_NAMES = new Map<string, string>(US_STATES);
const EARTH_RADIUS_MILES = 3958.8;

function milesBetween(a: Office | { latitude: number | null; longitude: number | null }, b: Office) {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/**
 * The practice's other live offices (same Group ID), nearest first. Large
 * groups (e.g. Aspire Allergy & Sinus, 30+ ILIT offices) show the closest
 * five, with the full list grouped by state behind a "Show all" toggle.
 * Plain <details>, so it works without client-side JavaScript.
 */
export function OtherLocations({
  from,
  offices,
}: {
  from: { latitude: number | null; longitude: number | null };
  offices: Office[];
}) {
  if (offices.length === 0) return null;

  const sorted = offices
    .map((o) => ({ ...o, miles: milesBetween(from, o) }))
    .sort((a, b) => (a.miles ?? Infinity) - (b.miles ?? Infinity));
  const nearest = sorted.slice(0, NEAREST);

  const byState = new Map<string, typeof sorted>();
  for (const o of [...sorted].sort((a, b) => a.city.localeCompare(b.city))) {
    const name = STATE_NAMES.get(o.state) ?? o.state;
    byState.set(name, [...(byState.get(name) ?? []), o]);
  }
  const states = [...byState.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div>
      <h3 className="mb-2 text-base font-bold">Other Locations</h3>
      {offices.length > NEAREST && <p className="mb-2 text-xs text-muted">Nearest to this office</p>}
      <div className="space-y-2">
        {nearest.map((o) => (
          <Link
            key={o.slug}
            href={`/find-an-ilit-provider/${o.slug}`}
            className="block rounded border border-line p-2.5 text-sm transition-colors hover:border-muted hover:shadow-sm"
          >
            {o.practiceName} — {o.city}, {o.state}
            {o.miles != null && <span className="text-muted"> · {Math.round(o.miles)} mi</span>}
          </Link>
        ))}
      </div>

      {offices.length > NEAREST && (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-sage hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show all {offices.length} locations</span>
            <span className="hidden group-open:inline">Hide the full list</span>
          </summary>
          <div className="mt-3 space-y-4">
            {states.map(([state, list]) => (
              <div key={state}>
                <div className="mb-1 text-xs font-bold tracking-wide text-muted uppercase">{state}</div>
                <ul className="space-y-1 text-sm">
                  {list.map((o) => (
                    <li key={o.slug}>
                      <Link href={`/find-an-ilit-provider/${o.slug}`} className="font-semibold text-sage hover:underline">
                        {o.practiceName}
                      </Link>
                      <span className="text-muted"> — {o.city}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
