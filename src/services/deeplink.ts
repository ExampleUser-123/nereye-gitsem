/**
 * HEDEFİME NASIL GİDERİM entegrasyonu (deep-link).
 *
 * İki uygulama bağımsız çalışır ama güvenli şekilde veri aktarabilir:
 *   NEREYE GİTSEM?  →  HEDEFİME NASIL GİDERİM   (bu dosya)
 *   HEDEFİME NASIL GİDERİM  →  NEREYE GİTSEM?   (ters entegrasyon için
 *   buildAppLink + PlaceRef sözleşmesi hazır; hedef uygulama
 *   nereyegitsem://place?place_id=... linkini işleyecektir.)
 *
 * Aktarım alanları: place_id, name, lat, lon, address.
 * Uygulama kurulu değilse (scheme açılmadıysa) mağaza sayfası önerilir.
 */

import type { PlaceRef } from "../models/types";
import { qs } from "./http";

const SCHEME = import.meta.env.VITE_HEDERIM_SCHEME ?? "hedefimenasilgiderim://navigate";
const PLAY_URL = import.meta.env.VITE_HEDERIM_PLAY_URL as string | undefined;
const APP_SCHEME = import.meta.env.VITE_APP_SCHEME ?? "nereyegitsem://place";

/** Hedef uygulamaya gönderilecek navigasyon linkini üretir. */
export function buildNavigateUrl(place: PlaceRef): string {
  const params = qs({
    place_id: place.placeId,
    name: place.name,
    lat: place.latitude,
    lon: place.longitude,
    address: place.address,
  });
  return `${SCHEME}?${params}`;
}

/** Ters entegrasyon: bu uygulamanın mekân linkini üretir. */
export function buildAppLink(place: PlaceRef): string {
  const params = qs({
    place_id: place.placeId,
    name: place.name,
    lat: place.latitude,
    lon: place.longitude,
  });
  return `${APP_SCHEME}?${params}`;
}

export function getStoreUrl(): string | undefined {
  return PLAY_URL;
}

export interface NavigateAttempt {
  /** Hedef uygulama açıldıysa true. Kurulu değilse false → fallback göster. */
  opened: boolean;
}

/**
 * Deep-link'i dener. Özel scheme navigasyonunda JS hatası fırlatılmaz;
 * sayfa görünür kaldıysa uygulamanın açılamadığı varsayılır.
 */
export function openNavigation(
  place: PlaceRef,
  onFallback: () => void,
): NavigateAttempt {
  const url = buildNavigateUrl(place);
  let leftPage = false;

  const onHide = () => {
    if (document.hidden) leftPage = true;
  };
  document.addEventListener("visibilitychange", onHide);
  const onBlur = () => {
    leftPage = true;
  };
  window.addEventListener("blur", onBlur);

  const finish = () => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("blur", onBlur);
    if (!leftPage) onFallback();
  };

  try {
    window.location.assign(url);
  } catch {
    /* bazı WebView'lerde throw etmez, timeout devreye girer */
  }

  // Uygulama açıldıysa sayfa gizlenir/blur olur; 1800 ms içinde olmadıysa fallback.
  window.setTimeout(finish, 1800);
  return { opened: false };
}
