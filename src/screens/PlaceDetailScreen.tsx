/**
 * Mekân detay ekranı.
 * Tüm bilgiler gerçek OSM/Nominatim verisinden gelir; olmayan bilgi
 * "Bilgi mevcut değil" olarak gösterilir — asla uydurulmaz.
 */

import { useEffect, useState } from "react";
import { useNavigation } from "../app/navigation";
import { useAppState } from "../app/state";
import {
  getPlaceDetail,
  formatDistance,
  toRef,
  haversineMeters,
} from "../services/osm";
import * as storage from "../services/storage";
import type { Place, PlaceRef } from "../models/types";
import { getCategory } from "../data/categories";
import { NavigateButton } from "../components/NavigateButton";
import { LoadingBlock, ErrorState } from "../components/states";
import { fetchPlacePhoto } from "../services/photos";
import { isOpenNow } from "../utils/openingHours";

export function PlaceDetailScreen({ placeRef }: { placeRef: PlaceRef }) {
  const nav = useNavigation();
  const { isFavorite, toggleFavorite, location, bumpRecents } = useAppState();

  const [place, setPlace] = useState<Place | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<unknown>(null);
  const [addedListId, setAddedListId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [offline, setOffline] = useState(false);
  const [openNow, setOpenNow] = useState<boolean | null>(null);

  const finishReady = (p: Place, isOffline = false) => {
    setPlace(p);
    setStatus("ready");
    setOffline(isOffline);
    setOpenNow(p.openingHours ? isOpenNow(p.openingHours) : null);
    storage.addRecent(toRef(p));
    if (!isOffline) storage.saveOfflinePlace(p);
    bumpRecents();

    // Foto enrichment: OSM'de foto yoksa Wikipedia/Wikidata'dan gerçek görsel
    if (p.images.length === 0 && !isOffline) {
      fetchPlacePhoto(p)
        .then((photo) => {
          if (photo) {
            const enriched = { ...p, images: [photo] };
            setPlace(enriched);
            storage.saveOfflinePlace(enriched);
          }
        })
        .catch(() => {
          /* görsel opsiyonel */
        });
    }
  };

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setOffline(false);
    const origin = location.status === "granted" ? location.coords : undefined;
    getPlaceDetail(placeRef, origin)
      .then((p) => {
        if (!cancelled) finishReady(p);
      })
      .catch((err) => {
        if (cancelled) return;
        // Offline rehber: daha önce görüntülendiyse cihazdan aç
        const cachedPlace = storage.getOfflinePlace(placeRef.placeId) as
          | Place
          | null;
        if (cachedPlace?.placeId === placeRef.placeId) {
          finishReady(cachedPlace, true);
          return;
        }
        setError(err);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeRef.placeId, reloadKey]);

  const distance =
    place && location.status === "granted"
      ? formatDistance(
          place.distanceMeters ??
            haversineMeters(location.coords, {
              lat: place.latitude,
              lon: place.longitude,
            }),
        )
      : null;

  const favorite = isFavorite(placeRef.placeId);
  const cat = getCategory(place?.categoryId ?? "attraction");

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col sunset-background">
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Başlık görseli */}
        <div className="relative h-56 w-full">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${cat.color}, #134e4a)`,
            }}
          />
          {place?.images[0] && (
            <img
              src={place.images[0]}
              alt={place.name}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-3">
            <button
              onClick={nav.back}
              className="rounded-full bg-black/40 p-2 text-xl text-white backdrop-blur active:scale-90"
              aria-label="Geri"
            >
              ←
            </button>
            <button
              onClick={() => toggleFavorite(place ? toRef(place) : placeRef)}
              className="rounded-full bg-black/40 p-2 text-xl backdrop-blur active:scale-90"
              aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            >
              {favorite ? "❤️" : "🤍"}
            </button>
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {cat.emoji} {cat.label}
            </span>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-white drop-shadow">
              {placeRef.name}
            </h1>
          </div>
        </div>

        <div className="px-4 py-4">
          {status === "loading" && (
            <LoadingBlock label="Mekân bilgileri yükleniyor..." />
          )}

          {status === "error" && (
            <ErrorState
              error={error}
              title="Mekân bilgileri alınamadı"
              onRetry={() => setReloadKey((k) => k + 1)}
            />
          )}

          {status === "ready" && place && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                {place.city && (
                  <span className="rounded-full bg-surface px-3 py-1.5">
                    🏙️ {place.city}
                  </span>
                )}
                {place.district && (
                  <span className="rounded-full bg-surface px-3 py-1.5">
                    🗺️ {place.district}
                  </span>
                )}
                {distance && (
                  <span className="rounded-full bg-surface px-3 py-1.5 text-brand">
                    📏 {distance}
                  </span>
                )}
                {openNow === true && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700">
                    ✅ Şu an açık
                  </span>
                )}
                {openNow === false && (
                  <span className="rounded-full bg-red-100 px-3 py-1.5 text-red-700">
                    ❌ Şu an kapalı
                  </span>
                )}
                {offline && (
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">
                    📴 Çevrimdışı — kayıtlı bilgiler
                  </span>
                )}
              </div>

              <section className="mt-4 rounded-2xl bg-surface p-4">
                <h2 className="text-sm font-bold text-ink-soft">Hakkında</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {place.description ?? "Bilgi mevcut değil."}
                </p>
              </section>

              <section className="mt-3 divide-y divide-line rounded-2xl bg-surface">
                <InfoRow icon="📮" label="Adres" value={place.address ?? place.city} />
                <InfoRow icon="🕒" label="Ziyaret saatleri" value={place.openingHours} />
                <InfoRow icon="💰" label="Giriş ücreti" value={place.priceInfo} />
                <InfoRow icon="📞" label="Telefon" value={place.phone} />
                <InfoRow
                  icon="🌐"
                  label="Web sitesi"
                  value={place.website}
                  href={place.website}
                />
                <InfoRow
                  icon="⭐"
                  label="Kullanıcı puanı"
                  hint="Puan sistemi ilerleyen sürümlerde geliyor"
                />
                <InfoRow
                  icon="⏱️"
                  label="Tahmini ziyaret süresi"
                  value={place.tags.duration}
                />
              </section>

              <section className="mt-4">
                <NavigateButton place={place} />
              </section>

              <section className="mt-3">
                <ListAddRow
                  placeRef={toRef(place)}
                  addedListId={addedListId}
                  onAdded={setAddedListId}
                />
              </section>

              <p className="mt-4 text-center text-[11px] text-muted">
                Veri kaynağı: OpenStreetMap katkıcıları
              </p>
            </>
          )}
        </div>
      </div>

      <button
        onClick={nav.back}
        className="safe-bottom fixed inset-x-0 bottom-0 z-[1001] bg-surface/95 py-3 text-center text-sm font-bold text-ink-soft backdrop-blur"
      >
        ← Geri
      </button>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  hint,
}: {
  icon: string;
  label: string;
  value?: string;
  href?: string;
  hint?: string;
}) {
  const missing = !value;
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted">{label}</p>
        {missing ? (
          <p className="mt-0.5 text-sm italic text-muted/70">{hint ?? "Bilgi mevcut değil."}</p>
        ) : href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block break-all text-sm font-semibold text-brand underline"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 break-words text-sm font-semibold text-ink">{value}</p>
        )}
      </div>
    </div>
  );
}

function ListAddRow({
  placeRef,
  addedListId,
  onAdded,
}: {
  placeRef: PlaceRef;
  addedListId: string | null;
  onAdded: (listId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const lists = storage.getTripLists();

  if (addedListId) {
    const name = storage.getTripLists().find((l) => l.id === addedListId)?.name;
    return (
      <div className="rounded-2xl bg-brand-fog p-3 text-center text-sm font-semibold text-brand-strong">
        ✅ "{name ?? "Liste"}" listesine eklendi
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 text-sm font-bold text-ink-soft"
      >
        ➕ Gezi listesine ekle
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {lists.length === 0 && (
            <p className="text-xs text-muted">
              Henüz listen yok — "İstanbul Hafta Sonu" gibi bir liste oluştur.
            </p>
          )}
          {lists.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                storage.addPlaceToList(l.id, placeRef);
                onAdded(l.id);
              }}
              className="block w-full rounded-xl bg-bg px-3 py-2.5 text-left text-sm font-semibold text-ink-soft active:scale-[0.98]"
            >
              📋 {l.name}
            </button>
          ))}
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Yeni liste adı"
              className="flex-1 rounded-xl bg-bg px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={() => {
                if (!newName.trim()) return;
                const list = storage.createTripList(newName);
                storage.addPlaceToList(list.id, placeRef);
                onAdded(list.id);
              }}
              className="rounded-xl bg-brand px-4 text-sm font-bold text-white active:scale-95"
            >
              Oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
