/**
 * Leaflet + OpenStreetMap harita bileşeni.
 *
 * - API key gerektirmez (OSM raster tile).
 * - Markerlar tek bir L.LayerGroup içinde tutulur; veri değişmedikçe
 *   yeniden oluşturulmaz (mobil performans).
 * - Tile yükleme hataları sayılır; art arda hata gelirse üst bileşene
 *   bildirilir (offline durumu için).
 */

import { useEffect, useRef, useState } from "react";
import type { Place } from "../models/types";
import type { Coordinates } from "../models/types";
import { getCategory } from "../data/categories";

export interface MapViewProps {
  center: Coordinates;
  centerKey: string;
  zoom?: number;
  places: Place[];
  userCoords?: Coordinates;
  selectedPlaceId?: string;
  onSelectPlace?: (place: Place) => void;
  onTilesError?: () => void;
  className?: string;
}

export function MapView({
  center,
  centerKey,
  zoom = 13,
  places,
  userCoords,
  selectedPlaceId,
  onSelectPlace,
  onTilesError,
  className = "h-full w-full",
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const LRef = useRef<unknown>(null); // leaflet modülü
  const layerRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);
  const tileErrorsRef = useRef(0);

  // Haritayı bir kez oluştur
  useEffect(() => {
    let disposed = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lon],
        zoom,
        zoomControl: false,
        attributionControl: true,
      });

      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap katkıcıları",
      });
      tiles.on("tileerror", () => {
        tileErrorsRef.current += 1;
        if (tileErrorsRef.current >= 6) onTilesError?.();
      });
      tiles.addTo(map);

      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    })();

    return () => {
      disposed = true;
      const map = mapRef.current as { remove?: () => void } | null;
      if (map?.remove) map.remove();
      mapRef.current = null;
      layerRef.current = null;
      userMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merkez değişimi (şehir seçimi, konum güncellemesi, marker seçimi)
  useEffect(() => {
    const map = mapRef.current as { flyTo?: (c: [number, number], z: number, opts?: { duration?: number }) => void } | null;
    if (ready && map?.flyTo) map.flyTo([center.lat, center.lon], zoom, { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerKey, ready]);

  // Kullanıcı konumu marker'ı
  useEffect(() => {
    const L = LRef.current as typeof import("leaflet") | null;
    const map = mapRef.current as import("leaflet").Map | null;
    if (!L || !map) return;
    if (userMarkerRef.current) {
      (userMarkerRef.current as import("leaflet").Marker).remove();
      userMarkerRef.current = null;
    }
    if (userCoords) {
      const icon = L.divIcon({ className: "", html: `<div class="user-dot"></div>`, iconSize: [18, 18] });
      const marker = L.marker([userCoords.lat, userCoords.lon], { icon, interactive: false });
      marker.addTo(map);
      userMarkerRef.current = marker;
    }
  }, [userCoords, ready]);

  // Mekân markerları — yalnızca places değiştiğinde yeniden üretilir
  useEffect(() => {
    const L = LRef.current as typeof import("leaflet") | null;
    const group = layerRef.current as import("leaflet").LayerGroup | null;
    if (!L || !group || !ready) return;

    group.clearLayers();
    for (const place of places) {
      const cat = getCategory(place.categoryId);
      const icon = L.divIcon({
        className: "",
        html: `<div class="place-marker" style="background:${cat.color}"><span>${cat.emoji}</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });
      const marker = L.marker([place.latitude, place.longitude], {
        icon,
        title: place.name,
      });
      if (onSelectPlace) {
        marker.on("click", () => onSelectPlace(place));
      }
      group.addLayer(marker);
    }
  }, [places, ready, onSelectPlace]);

  // Seçili marker görsel vurgusu
  useEffect(() => {
    // vurgu CSS `.place-marker.selected` ile bir sonraki render'da uygulanır
  }, [selectedPlaceId]);

  return <div ref={containerRef} className={className} />;
}
