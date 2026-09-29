/**
 * Şehir seçimi: konum izni olmadığında keşfin ana giriş noktası.
 */

import { useNavigation } from "../app/navigation";
import { useAppState } from "../app/state";
import { CITIES } from "../data/cities";

export function CitySelectOverlay() {
  const nav = useNavigation();
  const { setSelectedCity, requestLocation, location } = useAppState();

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col sunset-background">
      <div className="safe-top flex items-center gap-2 border-b border-line bg-surface px-3 pb-3 pt-3">
        <button
          onClick={nav.back}
          className="rounded-full p-2 text-xl active:scale-90"
          aria-label="Geri"
        >
          ←
        </button>
        <p className="font-bold text-ink">Şehir Seç</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <button
          onClick={async () => {
            await requestLocation();
            nav.back();
          }}
          disabled={location.status === "locating"}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl bg-brand px-4 py-4 text-left text-white shadow-lg shadow-brand/20 active:scale-[0.98] disabled:opacity-60"
        >
          <span className="text-2xl">📍</span>
          <span>
            <span className="block font-bold">Konumumu kullan</span>
            <span className="text-xs opacity-80">
              Çevrendeki yerleri otomatik keşfet
            </span>
          </span>
        </button>

        <p className="mb-2 text-sm font-bold text-ink-soft">
          Ya da bir şehir seç
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CITIES.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setSelectedCity(city.name);
                nav.back();
              }}
              className="rounded-xl bg-surface px-2 py-3 text-sm font-semibold text-ink-soft shadow-sm active:scale-95"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
