/**
 * Alt navigasyon: Keşfet / Harita / Favoriler / AI / Profil.
 */

import { useNavigation, type Tab } from "../app/navigation";

const TABS: Array<{ id: Tab; label: string; emoji: string }> = [
  { id: "discover", label: "Keşfet", emoji: "🏠" },
  { id: "map", label: "Harita", emoji: "🗺️" },
  { id: "favorites", label: "Favoriler", emoji: "❤️" },
  { id: "ai", label: "AI", emoji: "🤖" },
  { id: "profile", label: "Profil", emoji: "👤" },
];

export function BottomNav() {
  const { tab, setTab } = useNavigation();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-[900] border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2"
            >
              <span
                className={`text-xl transition ${active ? "scale-110" : "opacity-50 grayscale"}`}
              >
                {t.emoji}
              </span>
              <span
                className={`text-[10px] font-semibold ${active ? "text-brand" : "text-muted"}`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
