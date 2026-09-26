/**
 * Gezi listesi detayı (V1 temel sürüm: listeyi gör, mekân aç, kaldır).
 * Gelişmiş gezi planlayıcı ileride bu ekranın üzerine inşa edilecek.
 */

import { useState } from "react";
import { useNavigation } from "../app/navigation";
import { useAppState } from "../app/state";
import * as storage from "../services/storage";
import { PlaceCard } from "../components/PlaceCard";
import { EmptyState } from "../components/states";

export function TripListOverlay({ listId }: { listId: string }) {
  const nav = useNavigation();
  const { bumpRecents } = useAppState();
  const [version, setVersion] = useState(0);

  const list = storage.getTripLists().find((l) => l.id === listId);
  const places = storage.getPlacesInList(listId);

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
          <div className="space-y-3">
            {places.map((ref, i) => (
              <div key={ref.placeId} className="relative">
                <span className="absolute -left-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[11px] font-black text-white">
                  {i + 1}
                </span>
                <PlaceCard
                  place={ref}
                  onClick={() => nav.openPlace(ref)}
                  onNavigate={() => nav.openPlace(ref)}
                />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
