/**
 * Uygulama genelinde paylaşılan durum: kullanıcı konumu, favoriler,
 * profil ve seçili şehir. Tek provider altında toplanmıştır; ekranlar
 * hook'lar üzerinden tüketir.
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
import type { PlaceRef, UserProfile } from "../models/types";
import {
  requestPosition,
  checkPermission,
} from "../services/location";
import * as storage from "../services/storage";
import type { LocationState } from "../models/types";

interface AppState {
  location: LocationState;
  requestLocation: () => Promise<void>;
  selectedCity: string | undefined;
  setSelectedCity: (city: string) => void;

  profile: UserProfile;
  setProfileName: (name: string) => void;

  favorites: PlaceRef[];
  isFavorite: (placeId: string) => boolean;
  toggleFavorite: (place: PlaceRef) => void;

  recentsVersion: number;
  bumpRecents: () => void;
}

const StateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [selectedCity, setSelectedCityState] = useState<string | undefined>(() =>
    storage.getLastCityId(),
  );
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [favorites, setFavorites] = useState<PlaceRef[]>(() => storage.getFavorites());
  const [recentsVersion, setRecentsVersion] = useState(0);

  const requestLocation = useCallback(async () => {
    setLocation({ status: "locating" });
    const result = await requestPosition();
    setLocation(result);
  }, []);

  // İlk açılışta izin durumunu sessizce kontrol et; "prompt" ise otomatik
  // istem (kullanıcı deneyimi: tek sor).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const permission = await checkPermission();
      if (cancelled) return;
      if (permission === "granted" || permission === "prompt") {
        await requestLocation();
      } else {
        setLocation({ status: "denied" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestLocation]);

  const setSelectedCity = useCallback((city: string) => {
    setSelectedCityState(city);
    storage.setLastCityId(city);
  }, []);

  const setProfileName = useCallback((name: string) => {
    storage.setProfileName(name);
    setProfile(storage.getProfile());
  }, []);

  const toggleFavorite = useCallback((place: PlaceRef) => {
    storage.toggleFavorite(place);
    setFavorites(storage.getFavorites());
  }, []);

  const isFavorite = useCallback(
    (placeId: string) => favorites.some((f) => f.placeId === placeId),
    [favorites],
  );

  const bumpRecents = useCallback(() => setRecentsVersion((v) => v + 1), []);

  const value = useMemo<AppState>(
    () => ({
      location,
      requestLocation,
      selectedCity,
      setSelectedCity,
      profile,
      setProfileName,
      favorites,
      isFavorite,
      toggleFavorite,
      recentsVersion,
      bumpRecents,
    }),
    [
      location,
      requestLocation,
      selectedCity,
      setSelectedCity,
      profile,
      setProfileName,
      favorites,
      isFavorite,
      toggleFavorite,
      recentsVersion,
      bumpRecents,
    ],
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
