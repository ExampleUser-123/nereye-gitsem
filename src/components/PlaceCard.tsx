/**
 * Mekân kartı — listelerde ve harita önizlemesinde kullanılan ortak bileşen.
 * Görsel yoksa kategori renkli placeholder gösterilir (uydurma görsel yok).
 */

import type { Place, PlaceRef } from "../models/types";
import { getCategory } from "../data/categories";
import { formatDistance } from "../services/osm";

interface PlaceCardProps {
  place: Place | (PlaceRef & Partial<Place>);
  onClick: () => void;
  onNavigate?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function PlaceCard({
  place,
  onClick,
  onNavigate,
  isFavorite,
  onToggleFavorite,
}: PlaceCardProps) {
  const p = place as Place;
  const category = getCategory(p.categoryId ?? "attraction");
  const distance = formatDistance(p.distanceMeters);
  const image = p.images?.[0];
  const subtitle =
    [p.city, p.district].filter(Boolean).join(" / ") || p.address || "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition active:scale-[0.98]"
    >
      {image ? (
        <img
          src={image}
          alt={place.name}
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${category.color}1a` }}
        >
          <span>{category.emoji}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{place.name}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
          <span>{category.emoji}</span>
          <span>{category.label}</span>
          {subtitle && <span className="truncate">· {subtitle}</span>}
        </p>
        {distance && (
          <p className="mt-0.5 text-xs font-medium text-brand">📏 {distance}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        {onToggleFavorite && (
          <button
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="rounded-full p-1.5 text-lg active:scale-90"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}
        {onNavigate && (
          <button
            aria-label="Buraya nasıl giderim"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate();
            }}
            className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-bold text-white active:scale-95"
          >
            🚀 GİDERİM
          </button>
        )}
      </div>
    </div>
  );
}
