"use client";

import { useEffect, useRef, useState } from "react";
import type LType from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SrpProvider } from "@/lib/srp";
import { isFullProfilePlus, isVerifiedPlus, showsAcademic } from "@/lib/tiers";
import { badgeClass, cardBadges } from "@/components/Badge";
import { pushDataLayer } from "@/lib/track";

const MILES_TO_METERS = 1609.344;

// One tier system for pins and card badges (see Badge.tsx), told apart by
// size and lightness as well as hue, so it still works for colorblind
// visitors: large solid pins for Full Profile and Featured (violet with a
// star for Founding Members, blue for Academic centers), small light pins
// with a dark outline and dot for Verified (green) and the Academic package
// (blue), and small gray pins for everyone else. Every pin has an outline
// and shadow so it stands off the map's pastel parks, water and highways.
type PinKind = "academicPremium" | "founder" | "featured" | "academic" | "verified" | "listed";

const PIN_STYLES: Record<
  PinKind,
  { size: number; fill: string; outline: string; glyph: "star" | "dot" | null; glyphColor: string; z: number }
> = {
  academicPremium: { size: 20, fill: "#00ABDA", outline: "#ffffff", glyph: "dot", glyphColor: "#ffffff", z: 3500 },
  founder: { size: 20, fill: "#3F08E0", outline: "#ffffff", glyph: "star", glyphColor: "#ffffff", z: 3000 },
  featured: { size: 20, fill: "#1F7A4D", outline: "#ffffff", glyph: "dot", glyphColor: "#ffffff", z: 2000 },
  academic: { size: 14, fill: "#D4F1FA", outline: "#00ABDA", glyph: "dot", glyphColor: "#00ABDA", z: 1500 },
  verified: { size: 14, fill: "#DCEEE0", outline: "#276B3D", glyph: "dot", glyphColor: "#276B3D", z: 1000 },
  listed: { size: 14, fill: "#E2E2E2", outline: "#7A7A7A", glyph: null, glyphColor: "#ffffff", z: 0 },
};

function pinKind(p: SrpProvider): PinKind {
  const premium = isFullProfilePlus(p.tier);
  if (showsAcademic(p)) return premium ? "academicPremium" : "academic";
  if (premium) return p.foundingMember ? "founder" : "featured";
  return isVerifiedPlus(p.tier) ? "verified" : "listed";
}

/** A teardrop pin pointing down; the glyph is counter-rotated to sit upright. */
function pinHtml(kind: PinKind): string {
  const { size, fill, outline, glyph, glyphColor } = PIN_STYLES[kind];
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

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Same badges and details as the practice's card in the list. The link
 * carries the search's back link, like the cards do. */
function popupHtml(p: SrpProvider, backHref: string): string {
  const name = escapeHtml(p.practiceName);
  const href = `/find-an-ilit-provider/${p.slug}?back=${encodeURIComponent(backHref)}`;
  const badges = cardBadges(p)
    .map((b) => `<span class="${badgeClass(b.variant)}">${escapeHtml(b.label)}</span>`)
    .join("");
  return `<div style="min-width:240px">
    ${badges ? `<div class="mb-1.5 flex flex-wrap gap-1">${badges}</div>` : ""}
    <a href="${href}" data-cta="map_pin_popup" data-cta-provider="${name}" class="text-sm font-bold hover:underline" style="color:#222">${name}</a>
    <div class="mt-0.5 text-xs" style="color:#777">${escapeHtml(p.city)}, ${escapeHtml(p.state)} · ${p.distanceMiles.toFixed(1)} mi</div>
  </div>`;
}

export function ProviderMap({
  center,
  radiusMiles,
  providers,
  mode,
  backHref,
}: {
  center: { lat: number; lng: number };
  radiusMiles: number;
  /** The search to return to from a practice's page (same as the cards'). */
  backHref: string;
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
        .bindPopup(popupHtml(p, backHref))
        .on("popupopen", () => pushDataLayer("oaan_map_pin_click", { provider_name: p.practiceName }));
      markersRef.current.push(marker);
    }

    if (providers.length > 0) {
      // Zoom in as far as possible while keeping every practice and the
      // searched location in view. maxZoom keeps a single nearby practice
      // from zooming to street level.
      const bounds = L.featureGroup(markersRef.current).getBounds().extend([center.lat, center.lng]);
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
    } else if (mode === "normal") {
      // LatLng.toBounds() computes the search circle's bounds without
      // needing a circle on the map.
      map.fitBounds(L.latLng(center.lat, center.lng).toBounds(radiusMiles * MILES_TO_METERS), { padding: [16, 16] });
    } else {
      map.setView([center.lat, center.lng], 6);
    }
  }, [ready, providers, mode, center, radiusMiles, backHref]);

  return <div ref={containerRef} className="h-full min-h-64" />;
}
