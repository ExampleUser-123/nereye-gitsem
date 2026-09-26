/**
 * Favoriler ekranı — kalıcı saklanan favori mekânlar.
 */

import { useNavigation } from "../app/navigation";
import { useAppState } from "../app/state";
import { PlaceCard } from "../components/PlaceCard";
import { EmptyState } from "../components/states";

export function FavoritesScreen() {
  const nav = useNavigation();
  const { favorites, toggleFavorite } = useAppState();

  return (
    <div className="pb-24">
      <header className="safe-top bg-gradient-to-b from-brand-fog to-bg px-4 pb-4 pt-3">
        <p className="text-2xl font-extrabold text-ink">Favorilerim</p>
        <p className="mt-1 text-sm text-muted">
          {favorites.length > 0
            ? `${favorites.length} mekân kaydettin`
            : "Beğendiğin yerleri kalp ile kaydet"}
        </p>
      </header>

      <div className="px-4">
        {favorites.length === 0 ? (
          <EmptyState
            emoji="🤍"
            title="Henüz favorin yok"
            description="Keşfet ekranında veya mekân detayında ❤️ işaretine dokunarak yerleri buraya kaydet. Favoriler cihazında kalıcı olarak saklanır."
            action={
              <button
                onClick={() => nav.setTab("discover")}
                className="mt-3 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white active:scale-95"
              >
                Keşfetmeye başla
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {favorites.map((ref) => (
              <PlaceCard
                key={ref.placeId}
                place={ref}
                onClick={() => nav.openPlace(ref)}
                isFavorite
                onToggleFavorite={() => toggleFavorite(ref)}
                onNavigate={() => nav.openPlace(ref)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
