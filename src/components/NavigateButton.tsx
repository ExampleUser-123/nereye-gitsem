/**
 * "🚀 BURAYA NASIL GİDERİM?" butonu.
 * HEDEFİME NASIL GİDERİM uygulamasına deep-link gönderir; uygulama
 * kurulu değilse (scheme açılmadıysa) mağaza/uyarı diyaloğu gösterir.
 */

import { useState } from "react";
import type { PlaceRef } from "../models/types";
import {
  getStoreUrl,
  openNavigation,
} from "../services/deeplink";

export function NavigateButton({
  place,
  size = "large",
}: {
  place: PlaceRef;
  size?: "large" | "compact";
}) {
  const [showFallback, setShowFallback] = useState(false);

  const go = () => {
    openNavigation(place, () => setShowFallback(true));
  };

  const storeUrl = getStoreUrl();

  return (
    <>
      <button
        onClick={go}
        className={
          size === "large"
            ? "w-full rounded-2xl bg-gradient-to-r from-brand to-brand-strong py-4 text-center text-base font-extrabold tracking-wide text-white shadow-lg shadow-brand/30 transition active:scale-[0.98]"
            : "rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white active:scale-95"
        }
      >
        {size === "large" ? "🚀 BURAYA NASIL GİDERİM?" : "🚀 BURAYA NASIL GİDERİM?"}
      </button>

      {showFallback && (
        <div
          className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50"
          onClick={() => setShowFallback(false)}
        >
          <div
            className="safe-bottom w-full max-w-md rounded-t-3xl bg-surface p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <p className="text-lg font-bold text-ink">
              HEDEFİME NASIL GİDERİM bulunamadı
            </p>
            <p className="mt-2 text-sm text-muted">
              "HEDEFİME NASIL GİDERİM" uygulaması telefonunda kurulu görünmüyor.
              Kuruluysa uygulamayı açıp hedefi yeniden seçmeyi dene.
            </p>
            <p className="mt-3 rounded-xl bg-brand-fog p-3 text-xs text-ink-soft">
              Aktarılmak istenen hedef:
              <br />
              <strong>{place.name}</strong>
              <br />
              {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
              {place.address ? (
                <>
                  <br />
                  {place.address}
                </>
              ) : null}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {storeUrl && (
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-brand py-3 text-center font-bold text-white active:scale-95"
                >
                  Play Store'dan Aç
                </a>
              )}
              <button
                onClick={() => setShowFallback(false)}
                className="rounded-xl bg-line py-3 font-semibold text-ink-soft active:scale-95"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
