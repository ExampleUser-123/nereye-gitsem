/**
 * Gezi listesi detayı.
 * V1.1: mesafeye göre rota sıralama (en yakın ilk) + doğrudan navigasyon.
 * Gelişmiş gezi planlayıcı ileride bu ekranın üzerine inşa edilecek.
 */

import { useState } from "react";
import { useNavigation } from "../app/navigation";
import { useAppState } from "../app/state";
import * as storage from "../services/storage";
import { haversineMeters, formatDistance } from "../services/osm";
import { PlaceCard } from "../components/PlaceCard";
import { EmptyState } from "../components/states";
import type { PlaceRef } from "../models/types";

export function TripListOverlay({ listId }: { listId: string }) {
  const nav = useNavigation();
  const { bumpRecents, location } = useAppState();
  const [version, setVersion] = useState(0);
  const [sortedByDistance, setSortedByDistance] = useState(false);

  const list = storage.getTripLists().find((l) => l.id === listId);
  let places = storage.getPlacesInList(listId);

  const userCoords =
    location.status === "granted" ? location.coords : undefined;

  if (sortedByDistance && userCoords) {
    places = [...places].sort(
      (a, b) =>
        haversineMeters(userCoords, { lat: a.latitude, lon: a.longitude }) -
        haversineMeters(userCoords, { lat: b.latitude, lon: b.longitude }),
    );
  }

  if (!list) {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-bg">
        <p className="font-semibold">Liste bulunamadı</p>
        <button
          onClick={nav.back}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white"
        >
          Geri dön
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-bg">
      <div className="safe-top flex items-center gap-2 border-b border-line bg-surface px-3 pb-3 pt-3">
        <button
          onClick={nav.back}
          className="rounded-full p-2 text-xl active:scale-90"
          aria-label="Geri"
        >
          ←
        </button>
        <div>
          <p className="font-bold text-ink">📋 {list.name}</p>
          <p className="text-xs text-muted">{places.length} mekân</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {places.length === 0 ? (
          <EmptyState
            emoji="🗺️"
            title="Listede henüz mekân yok"
            description="Mekân detay ekranındaki ➕ butonuyla yer ekleyebilirsin."
          />
        ) : (
          <>
            {userCoords && (
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setSortedByDistance((s) => !s)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold active:scale-95 ${
                    sortedByDistance
                      ? "bg-brand text-white"
                      : "bg-surface text-ink-soft"
                  }`}
                >
                  📍 Mesafeye göre sırala
                </button>
                {places.length > 0 && (
                  <button
                    onClick={() => nav.openPlace(places[0] as PlaceRef)}
                    className="flex-1 rounded-xl bg-ink py-2.5 text-xs font-bold text-white active:scale-95"
                  >
                    🚀 Rotayı başlat ({sortedByDistance ? "en yakın" : "1."})
                  </button>
                )}
              </div>
            )}
            <div className="space-y-3">
              {places.map((ref, i) => {
                const dist = userCoords
                  ? formatDistance(
                      haversineMeters(userCoords, {
                        lat: ref.latitude,
                        lon: ref.longitude,
                      }),
                    )
                  : null;
                return (
                  <div key={ref.placeId} className="relative">
                    <span className="absolute -left-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[11px] font-black text-white">
                      {i + 1}
                    </span>
                    <PlaceCard
                      place={ref}
                      onClick={() => nav.openPlace(ref)}
                      onNavigate={() => nav.openPlace(ref)}
                    />
                    {dist && (
                      <span className="absolute right-14 top-2 rounded-full bg-brand-fog px-2 py-0.5 text-[10px] font-bold text-brand-strong">
                        {dist}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        storage.removePlaceFromList(listId, ref.placeId);
                        setVersion((v) => v + 1);
                        bumpRecents();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-sm"
                      aria-label="Listeden çıkar"
                    >
                      ✖️
                    </button>
                  </div>
                );
              })}
            </div>
            {sortedByDistance && (
              <p className="mt-3 text-center text-[11px] text-muted">
                Sıralama: konumuna en yakın mekân ilk sırada · her karttan
                "GİDERİM" ile navigasyonu başlat
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
