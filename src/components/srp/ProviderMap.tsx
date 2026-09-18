"use client";

import { useEffect, useRef, useState } from "react";
import type LType from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SrpProvider } from "@/lib/srp";

const MILES_TO_METERS = 1609.344;

function pinColor(p: SrpProvider): string {
  if (p.foundingMember) return "#b45309"; // amber
  if (p.geoExtension) return "#2c7a88"; // teal
  if (p.tier !== "FREE_CLAIMED") return "#4A6350"; // sage
  // TEMPORARY dev-visibility color, not a real brand choice — white was
  // nearly invisible against most map tile backgrounds. Swap this out once
  // a real palette exists.
  return "#e11d48"; // free/unverified — rose
}

function makeIcon(L: typeof LType, p: SrpProvider): LType.DivIcon {
  const color = pinColor(p);
  const isFree = p.tier === "FREE_CLAIMED";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid ${isFree ? "#bbb" : color};box-shadow:0 1px 3px rgba(0,0,0,.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 16],
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
  const [showFree, setShowFree] = useState(true);
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

    const visible = showFree ? providers : providers.filter((p) => p.tier !== "FREE_CLAIMED");

    for (const p of visible) {
      const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon(L, p) })
        .addTo(map)
        .bindPopup(`<a href="/find-a-provider/${p.slug}">${p.practiceName}</a>`);
      markersRef.current.push(marker);
    }

    if (mode === "normal") {
      // L.circle(...).getBounds() needs the circle to already be added to a
      // map (it projects to pixels internally) — LatLng.toBounds() computes
      // the same bounds standalone, which is all we need since we're not
      // rendering a visible circle overlay.
      const bounds = L.latLng(center.lat, center.lng).toBounds(radiusMiles * MILES_TO_METERS);
      map.fitBounds(bounds, { padding: [16, 16] });
    } else if (visible.length > 0) {
      map.fitBounds(L.featureGroup(markersRef.current).getBounds(), { padding: [32, 32] });
    } else {
      map.setView([center.lat, center.lng], 6);
    }
  }, [ready, providers, showFree, mode, center, radiusMiles]);

  return (
    <div className="flex h-full flex-col">
      <div ref={containerRef} className="min-h-64 flex-1" />
      <label className="flex items-center gap-2 border-t border-line px-3.5 py-2.5 text-xs">
        <input
          type="checkbox"
          checked={showFree}
          onChange={(e) => setShowFree(e.target.checked)}
        />
        Show Unverified Listings on Map
      </label>
    </div>
  );
}
