/**
 * Uygulama navigasyon durumu.
 *
 * 5 ana sekme + overlay yığını (arama, mekân detayı, şehir seçimi,
 * gezi listesi). Router kütüphanesi yerine hafif bir state yığını
 * kullanılır: Capacitor WebView'da hash routing sorunlarına yer bırakmaz
 * ve geri tuşu (Android back) tek yerden yönetilir.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PlaceRef } from "../models/types";

export type Tab = "discover" | "map" | "favorites" | "ai" | "profile";

export type Overlay =
  | { kind: "search" }
  | { kind: "place"; ref: PlaceRef }
  | { kind: "citySelect" }
  | { kind: "tripList"; listId: string };

interface NavState {
  tab: Tab;
  overlays: Overlay[];
  setTab: (tab: Tab) => void;
  openSearch: () => void;
  openPlace: (ref: PlaceRef) => void;
  openCitySelect: () => void;
  openTripList: (listId: string) => void;
  back: () => void;
  /** En üstteki overlay (yoksa undefined). */
  top: Overlay | undefined;
}

const NavContext = createContext<NavState | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<Tab>("discover");
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const setTab = useCallback((next: Tab) => {
    setTabState(next);
    setOverlays([]);
  }, []);

  const push = useCallback((overlay: Overlay) => {
    setOverlays((prev) => [...prev, overlay]);
  }, []);

  const back = useCallback(() => {
    setOverlays((prev) => prev.slice(0, -1));
  }, []);

  // Android geri tuşu (Capacitor) ve tarayıcı geri tuşu için history entegrasyonu.
  useEffect(() => {
    const onPop = () => {
      setOverlays((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const pushWithHistory = useCallback(
    (overlay: Overlay) => {
      push(overlay);
      try {
        window.history.pushState({ ng: true }, "");
      } catch {
        /* history erişilemezse sorun değil */
      }
    },
    [push],
  );

  const value = useMemo<NavState>(
    () => ({
      tab,
      overlays,
      top: overlays[overlays.length - 1],
      setTab,
      openSearch: () => pushWithHistory({ kind: "search" }),
      openPlace: (ref) => pushWithHistory({ kind: "place", ref }),
      openCitySelect: () => pushWithHistory({ kind: "citySelect" }),
      openTripList: (listId) => pushWithHistory({ kind: "tripList", listId }),
      back,
    }),
    [tab, overlays, setTab, pushWithHistory, back],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavigation(): NavState {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
  return ctx;
}
