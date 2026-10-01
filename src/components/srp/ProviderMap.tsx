"use client";

import { useEffect, useRef, useState } from "react";
import type LType from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SrpProvider } from "@/lib/srp";
import { isFullProfilePlus, isVerifiedPlus } from "@/lib/tiers";

const MILES_TO_METERS = 1609.344;

// One tier system for pins and card badges (see Badge.tsx), told apart by
// size, lightness and shape as well as hue, so it still works for
// colorblind visitors: solid pins for Full Profile and Featured (violet
// with a star for Founding Members), and smaller pins for everyone else:
// light green with a dark green outline and dot for Verified, plain gray
// for the rest. Solid colors stay dark and saturated
// so they don't blend with the map's pastel parks, water and highways, and
// every pin has a contrasting outline. Violet also stays distinct from
// green for red-green colorblind visitors, unlike amber or red.
type PinKind = "founder" | "featured" | "verified" | "listed";

const PIN_STYLES: Record<
  PinKind,
  { size: number; fill: string; outline: string; glyph: "star" | "dot" | null; glyphColor: string; z: number; label: string }
> = {
  founder: { size: 20, fill: "#3F08E0", outline: "#ffffff", glyph: "star", glyphColor: "#ffffff", z: 3000, label: "Founding Member" },
  featured: { size: 20, fill: "#1F7A4D", outline: "#ffffff", glyph: "dot", glyphColor: "#ffffff", z: 2000, label: "Featured" },
  verified: { size: 14, fill: "#DCEEE0", outline: "#276B3D", glyph: "dot", glyphColor: "#276B3D", z: 1000, label: "Verified" },
  listed: { size: 14, fill: "#E2E2E2", outline: "#7A7A7A", glyph: null, glyphColor: "#ffffff", z: 0, label: "Providers" },
};

function pinKind(p: SrpProvider): PinKind {
  if (isFullProfilePlus(p.tier)) return p.foundingMember ? "founder" : "featured";
  return isVerifiedPlus(p.tier) ? "verified" : "listed";
}

/** A teardrop pin pointing down; the glyph is counter-rotated to sit upright. */
function pinHtml(kind: PinKind, size = PIN_STYLES[kind].size): string {
  const { fill, outline, glyph, glyphColor } = PIN_STYLES[kind];
  const border = size >= 20 ? 2 : 1.5;
  const inner =
    glyph === "star"
      ? `<span style="transform:rotate(45deg);color:${glyphColor};font-size:${Math.round(size * 0.55)}px;line-height:1">★</span>`
      : glyph === "dot"
        ? `<span style="width:${Math.round(size * 0.3)}px;height:${Math.round(size * 0.3)}px;border-radius:50%;background:${glyphColor}"></span>`
        : "";
  return `<div style="width:${size}px;height:${size}px;box-sizing:border-box;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${fill};border:${border}px solid ${outline};box-shadow:0 1px 3px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;">${inner}</div>`;
}

function makeIcon(L: typeof LType, kind: PinKind): LType.DivIcon {
  const { size } = PIN_STYLES[kind];
  // The rotated square's point sits about 0.71 × size below its center.
  const tip = Math.round(size / 2 + size * 0.71);
  return L.divIcon({
    className: "",
    html: pinHtml(kind),
    iconSize: [size, size],
    iconAnchor: [size / 2, tip],
    popupAnchor: [0, -tip + 4],
  });
}

export function ProviderMap({
  center,
  radiusMiles,
  providers,
  mode,
}: {
  center: { lat: number; lng: number };
  radiusMiles: number;
  providers: SrpProvider[];
  mode: "normal" | "extended-geo" | "extended-any" | "none";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const leafletRef = useRef<typeof LType | null>(null);
  const markersRef = useRef<LType.Marker[]>([]);
  const [ready, setReady] = useState(false);

  // Leaflet touches `window` at import time, so it must be loaded
  // client-side only, never at the top of the module (would break SSR of
  // this "use client" component's initial server-rendered pass).
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current).setView([center.lat, center.lng], 9);
      mapRef.current = map;
      // The container's real size isn't settled yet on first mount inside
      // this flex layout — Leaflet needs an explicit re-measure or later
      // getBounds()/fitBounds() calls break with "layerPointToLatLng of
      // undefined".
      requestAnimationFrame(() => map.invalidateSize());

      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (mapboxToken) {
        L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
          { attribution: "© Mapbox © OpenStreetMap", tileSize: 512, zoomOffset: -1 },
        ).addTo(map);
      } else {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
      }
      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Deliberately run once per mount — the parent remounts this component
    // (via a `key` on zip/radius/mode) for each distinct search rather than
    // updating center/radius in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    map.invalidateSize();

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const p of providers) {
      const kind = pinKind(p);
      const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon(L, kind), zIndexOffset: PIN_STYLES[kind].z })
        .addTo(map)
        .bindPopup(`<a href="/find-an-ilit-provider/${p.slug}">${p.practiceName}</a>`);
      markersRef.current.push(marker);
    }

    if (mode === "normal") {
      // L.circle(...).getBounds() needs the circle to already be added to a
      // map (it projects to pixels internally) — LatLng.toBounds() computes
      // the same bounds standalone, which is all we need since we're not
      // rendering a visible circle overlay.
      const bounds = L.latLng(center.lat, center.lng).toBounds(radiusMiles * MILES_TO_METERS);
      map.fitBounds(bounds, { padding: [16, 16] });
    } else if (providers.length > 0) {
      map.fitBounds(L.featureGroup(markersRef.current).getBounds(), { padding: [32, 32] });
    } else {
      map.setView([center.lat, center.lng], 6);
    }
  }, [ready, providers, mode, center, radiusMiles]);

  // Legend lists only the pin types on this map, most prominent first.
  const kinds = (Object.keys(PIN_STYLES) as PinKind[]).filter((k) => providers.some((p) => pinKind(p) === k));

  return (
    <div className="relative h-full min-h-64">
      <div ref={containerRef} className="h-full min-h-64" />
      {kinds.length > 1 && (
        <div className="pointer-events-none absolute bottom-6 left-2 z-[1000] flex flex-col gap-1 rounded border border-line bg-white/90 px-2 py-1.5 text-[11px] text-foreground/80 shadow-sm">
          {kinds.map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              {/* Scaled down, but keeping the pins' relative sizes. */}
              <span
                className="flex w-4 justify-center"
                dangerouslySetInnerHTML={{ __html: pinHtml(k, Math.round(PIN_STYLES[k].size * 0.7)) }}
              />
              {PIN_STYLES[k].label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
