"use client";

import { useEffect } from "react";
import { markersForLeaflet } from "@/lib/stations";

export type MarkerItem = {
  id: string;
  title: string;
  province: string;
  traffic_level: string;
  spaces_count: number;
  lat: number;
  lng: number;
  location: string;
  traffic_badge: string;
  match_badge: string;
  image: string;
};

declare global {
  interface Window {
    L: typeof import("leaflet");
    __ptgExploreMap: import("leaflet").Map | null;
    __ptgExploreMapInited: boolean;
  }
}

export default function ExploreLeafletMap({ markers: markersProp }: { markers?: MarkerItem[] }) {
  const markers: MarkerItem[] = markersProp && markersProp.length > 0 ? markersProp : markersForLeaflet();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);

    function stationTooltipHtml(m: MarkerItem) {
      return `
        <div style="width: 240px;">
          <div style="display:flex; gap:10px; align-items:flex-start;">
            <img src="${m.image}" alt="${m.title}" style="width:64px; height:48px; object-fit:cover; border-radius:10px;" />
            <div style="flex:1; min-width:0;">
              <div style="font-weight:800; font-family: inherit; font-size:13px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${m.title}
              </div>
              <div style="font-size:12px; opacity:0.8; margin-top:2px;">
                ${m.location}
              </div>
              <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
                <span style="background: rgba(70,104,0,0.15); color:#466800; padding:2px 8px; border-radius:999px; font-weight:700; font-size:10px;">
                  ${m.traffic_badge}
                </span>
                <span style="background:#466800; color:#fff; padding:2px 8px; border-radius:999px; font-weight:800; font-size:10px;">
                  ${m.match_badge}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function destinationIcon(fill: string) {
      return window.L.divIcon({
        className: "",
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -42],
        html: `
          <div style="width:30px; height:42px; position:relative;">
            <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0C9.05 0 4.25 4.8 4.25 10.75C4.25 20.5 15 42 15 42C15 42 25.75 20.5 25.75 10.75C25.75 4.8 20.95 0 15 0Z" fill="${fill}" />
              <circle cx="15" cy="12" r="5" fill="#FFFFFF" opacity="0.95"/>
            </svg>
          </div>
        `,
      });
    }

    function initMap() {
      const el = document.getElementById("ptg-explore-leaflet-map");
      if (!el || !window.L) return;

      if (window.__ptgExploreMap?.getContainer?.() === el) {
        try { window.__ptgExploreMap.invalidateSize(); } catch { /* noop */ }
        return;
      }

      if (window.__ptgExploreMap?.remove) {
        try { window.__ptgExploreMap.remove(); } catch { /* noop */ }
        window.__ptgExploreMap = null;
        window.__ptgExploreMapInited = false;
      }

      try {
        // @ts-expect-error leaflet internal
        if (el._leaflet_id) delete el._leaflet_id;
      } catch { /* noop */ }

      const map = window.L.map(el, { zoomControl: false }).setView([13.7563, 100.5018], 10);
      window.__ptgExploreMap = map;
      window.__ptgExploreMapInited = true;

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const icon = destinationIcon("#466800");
      const userIcon = destinationIcon("#ef4444");
      const stationMarkers: { marker: import("leaflet").Marker; data: MarkerItem }[] = [];

      markers.forEach((m) => {
        const marker = window.L.marker([m.lat, m.lng], { icon }).addTo(map);
        stationMarkers.push({ marker, data: m });

        marker.bindTooltip(stationTooltipHtml(m), {
          direction: "top",
          offset: [0, -24],
          opacity: 1,
          sticky: true,
          className: "ptg-leaflet-tooltip",
        });
        marker.on("mouseover", () => marker.openTooltip());
        marker.on("mouseout", () => marker.closeTooltip());
        marker.on("click", () => {
          window.location.href = "/stationdetailpage/" + encodeURIComponent(m.id);
        });
      });

      let userPin: import("leaflet").Marker | null = null;

      const zoomInBtn = document.getElementById("ptg-explore-zoom-in-btn");
      const zoomOutBtn = document.getElementById("ptg-explore-zoom-out-btn");
      const locBtn = document.getElementById("ptg-explore-loc-btn");

      zoomInBtn?.addEventListener("click", () => map.zoomIn());
      zoomOutBtn?.addEventListener("click", () => map.zoomOut());

      locBtn?.addEventListener("click", () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
          const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setView([latlng.lat, latlng.lng], 13);
          if (userPin) map.removeLayer(userPin);
          userPin = window.L.marker([latlng.lat, latlng.lng], { icon: userIcon }).addTo(map);
          userPin.bindTooltip("Your location", {
            direction: "top",
            offset: [0, -24],
            sticky: true,
          }).openTooltip();
        });
      });

      setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, 120);
      setTimeout(() => { try { map.invalidateSize(); } catch { /* noop */ } }, 420);

      const provinceSelect = document.getElementById("ptg-explore-filter-province") as HTMLSelectElement | null;
      const trafficSelect = document.getElementById("ptg-explore-filter-traffic") as HTMLSelectElement | null;
      const spacesSelect = document.getElementById("ptg-explore-filter-spaces") as HTMLSelectElement | null;
      const searchInput = document.getElementById("ptg-explore-search-input") as HTMLInputElement | null;

      const provinceValues = Array.from(new Set(markers.map((m) => m.province).filter(Boolean)));
      const provinceValuesLower = provinceValues.map((p) => p.toLowerCase());

      const applyFilters = () => {
        const provinceVal = provinceSelect?.value ?? "all";
        const trafficVal = trafficSelect?.value ?? "all";
        const spacesVal = spacesSelect?.value ?? "all";
        const minSpaces = spacesVal === "all" ? null : parseInt(spacesVal, 10);
        const searchVal = (searchInput?.value ?? "").trim().toLowerCase();
        const provinceOnlyMatch = !!searchVal && provinceValuesLower.includes(searchVal);

        stationMarkers.forEach((item) => {
          const m = item.data;
          const okProvince = provinceVal === "all" || m.province === provinceVal;
          const okTraffic = trafficVal === "all" || m.traffic_level === trafficVal;
          const okSpaces = minSpaces === null || m.spaces_count >= minSpaces;
          const okSearch = !searchVal
            ? true
            : provinceOnlyMatch
            ? (m.province || "").toLowerCase() === searchVal
            : (`${m.title || ""} ${m.province || ""} ${m.location || ""}`).toLowerCase().includes(searchVal);

          if (okProvince && okTraffic && okSpaces && okSearch) {
            item.marker.addTo(map);
          } else {
            map.removeLayer(item.marker);
            item.marker.closeTooltip?.();
          }
        });

        const cards = document.querySelectorAll<HTMLElement>("[id^='ptg-station-card-']");
        cards.forEach((card) => {
          const cardProvince = card.getAttribute("data-province") ?? "";
          const cardTraffic = card.getAttribute("data-traffic") ?? "";
          const cardSpaces = parseInt(card.getAttribute("data-spaces") ?? "0", 10);
          const okProvince = provinceVal === "all" || cardProvince === provinceVal;
          const okTraffic = trafficVal === "all" || cardTraffic === trafficVal;
          const okSpaces = minSpaces === null || cardSpaces >= minSpaces;
          const cardText = (card.textContent ?? "").toLowerCase();
          const okSearch = !searchVal
            ? true
            : provinceOnlyMatch
            ? (cardProvince || "").toLowerCase() === searchVal
            : cardText.includes(searchVal);

          card.style.display = okProvince && okTraffic && okSpaces && okSearch ? "" : "none";
        });
      };

      provinceSelect?.addEventListener("change", applyFilters);
      trafficSelect?.addEventListener("change", applyFilters);
      spacesSelect?.addEventListener("change", applyFilters);
      searchInput?.addEventListener("input", applyFilters);
      applyFilters();
      setTimeout(applyFilters, 250);
    }

    return () => {
      if (window.__ptgExploreMap?.remove) {
        try { window.__ptgExploreMap.remove(); } catch { /* noop */ }
        window.__ptgExploreMap = null;
        window.__ptgExploreMapInited = false;
      }
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [markers]);

  return (
    <section className="absolute inset-0 z-0">
      <div className="relative w-full h-full">
        <div id="ptg-explore-leaflet-map" className="absolute inset-0 w-full h-full z-0" />
        <div className="absolute inset-0 pointer-events-none map-gradient-overlay z-[1]" />
      </div>
    </section>
  );
}
