"use client";

import { useEffect, useRef, useState } from "react";
import type LType from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SrpProvider } from "@/lib/srp";
import { badgeClass, cardBadges } from "@/components/Badge";
import { pushDataLayer } from "@/lib/track";

const MILES_TO_METERS = 1609.344;

// Every pin is solid with a white outline, a white dot and a shadow, so it
// stands off the map's busy, pastel detail at any zoom. One size and color
// for every practice (a neutral site: no tier styling), blue for academic
// medical centers to match their card badge (Badge.tsx).
type PinKind = "academic" | "practice";

const PIN_STYLES: Record<
  PinKind,
  { size: number; fill: string; outline: string; glyph: "star" | "dot" | null; glyphColor: string; z: number }
> = {
  academic: { size: 16, fill: "#00ABDA", outline: "#ffffff", glyph: "dot", glyphColor: "#ffffff", z: 1000 },
  practice: { size: 16, fill: "#1F7A4D", outline: "#ffffff", glyph: "dot", glyphColor: "#ffffff", z: 0 },
};

function pinKind(p: SrpProvider): PinKind {
  return p.academic ? "academic" : "practice";
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
  return `<div style="width:${size}px;height:${size}px;box-sizing:border-box;border-radius:50% 50% 50% 0;transform:rotate(-45deg);transition:transform .15s;background:${fill};border:${border}px solid ${outline};box-shadow:0 1px 3px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;">${inner}</div>`;
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

// The searched location: a round dot (not a pin shape), drawn under the pins.
const SEARCH_POINT_HTML =
  '<div style="width:14px;height:14px;border-radius:50%;background:#222;border:3px solid #fff;box-shadow:0 0 0 4px rgba(34,34,34,.18),0 1px 3px rgba(0,0,0,.4)"></div>';

/** Enlarges a pin (or restores it) while its card is hovered or its popup is open. */
function setPinActive(marker: LType.Marker, kind: PinKind, active: boolean) {
  const pin = marker.getElement()?.firstElementChild as HTMLElement | null;
  if (pin) pin.style.transform = active ? "rotate(-45deg) scale(1.45)" : "rotate(-45deg)";
  marker.setZIndexOffset(active ? 10000 : PIN_STYLES[kind].z);
}

/** The practice's card in the list beside the map (ProviderCard's data-map-id). */
function cardFor(id: string): HTMLElement | null {
  return document.querySelector(`[data-map-id="${CSS.escape(id)}"]`);
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
    <div class="mt-0.5 text-xs" style="color:#6b6b6b">${escapeHtml(p.city)}, ${escapeHtml(p.state)} · ${p.distanceMiles.toFixed(1)} mi</div>
  </div>`;
}

// A stable default, so the markers effect doesn't rerun on every render.
const NO_PROVIDERS: SrpProvider[] = [];

export function ProviderMap({
  center,
  radiusMiles,
  providers,
  mode,
  backHref,
  outOfArea = NO_PROVIDERS,
}: {
  center: { lat: number; lng: number };
  radiusMiles: number;
  /** The search to return to from a practice's page (same as the cards'). */
  backHref: string;
  /** Out-of-area Geo-Extension practices: pinned, but left out of the
   * zoom-to-fit so the map stays on the patient's area. */
  outOfArea?: SrpProvider[];
  providers: SrpProvider[];
  mode: "normal" | "extended-geo" | "extended-any" | "none";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const leafletRef = useRef<typeof LType | null>(null);
  const markersRef = useRef<LType.Marker[]>([]);
  const markersById = useRef(new Map<string, { marker: LType.Marker; kind: PinKind }>());
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
    markersById.current.clear();

    // Not added to markersRef, so it doesn't count toward the zoom-to-fit
    // bounds twice (the center is added to those bounds directly).
    const searchPoint = L.marker([center.lat, center.lng], {
      icon: L.divIcon({ className: "", html: SEARCH_POINT_HTML, iconSize: [20, 20], iconAnchor: [10, 10] }),
      zIndexOffset: -1000,
      keyboard: false,
    })
      .addTo(map)
      .bindTooltip("Your search location", { direction: "top", offset: [0, -8] });

    const local: LType.Marker[] = [];
    for (const p of [...providers, ...outOfArea]) {
      const kind = pinKind(p);
      const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon(L, kind), zIndexOffset: PIN_STYLES[kind].z })
        .addTo(map)
        .bindPopup(popupHtml(p, backHref))
        .on("popupopen", () => {
          pushDataLayer("oaan_map_pin_click", { provider_name: p.practiceName });
          setPinActive(marker, kind, true);
          // Outline the practice's card and bring it into view in the list.
          const card = cardFor(p.id);
          if (card) {
            card.dataset.mapActive = "";
            card.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        })
        .on("popupclose", () => {
          setPinActive(marker, kind, false);
          delete cardFor(p.id)?.dataset.mapActive;
        });
      markersRef.current.push(marker);
      markersById.current.set(p.id, { marker, kind });
      if (!outOfArea.includes(p)) local.push(marker);
    }

    if (providers.length > 0) {
      // Zoom in as far as possible while keeping every practice and the
      // searched location in view. maxZoom keeps a single nearby practice
      // from zooming to street level.
      const bounds = L.featureGroup(local).getBounds().extend([center.lat, center.lng]);
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
    } else if (mode === "normal") {
      // LatLng.toBounds() computes the search circle's bounds without
      // needing a circle on the map.
      map.fitBounds(L.latLng(center.lat, center.lng).toBounds(radiusMiles * MILES_TO_METERS), { padding: [16, 16] });
    } else {
      map.setView([center.lat, center.lng], 6);
    }

    return () => {
      searchPoint.remove();
    };
  }, [ready, providers, outOfArea, mode, center, radiusMiles, backHref]);

  // Hovering a card in the list enlarges its pin (desktop, where the list and
  // map sit side by side).
  useEffect(() => {
    const toggle = (e: MouseEvent, active: boolean) => {
      const card = (e.target as Element | null)?.closest?.("[data-map-id]");
      if (!(card instanceof HTMLElement)) return;
      // Ignore moves between elements inside the same card.
      if (e.relatedTarget instanceof Node && card.contains(e.relatedTarget)) return;
      const entry = markersById.current.get(card.dataset.mapId ?? "");
      if (entry && !entry.marker.isPopupOpen()) setPinActive(entry.marker, entry.kind, active);
    };
    const over = (e: MouseEvent) => toggle(e, true);
    const out = (e: MouseEvent) => toggle(e, false);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  return <div ref={containerRef} className="h-full min-h-64" />;
}
