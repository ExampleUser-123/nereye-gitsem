/**
 * Kalıcı depolama katmanı (localStorage + versioned keys).
 *
 * V1'de hesap sistemi yoktur; favoriler, gezi listeleri, son görüntülenen
 * yerler ve profil yerel olarak saklanır. Katman, ileride Supabase/auth
 * tabanlı bir depoya taşınacaksa yalnızca bu dosyanın değişmesi gerekir —
 * arayüz (API) aynı kalır.
 */

import type { PlaceRef, TripList, UserProfile } from "../models/types";

const K = {
  profile: "ngv1:profile",
  favorites: "ngv1:favorites",
  recents: "ngv1:recents",
  lists: "ngv1:lists",
  city: "ngv1:city",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kota/erişim sorunlarında sessizce yut — uygulama çalışmaya devam etsin */
  }
}

// ------------------------------------------------------------ Profil

export function getProfile(): UserProfile {
  const p = read<UserProfile | null>(K.profile, null);
  if (p) return p;
  return { name: "Gezgin", createdAt: Date.now() };
}

export function setProfileName(name: string) {
  const p = getProfile();
  write(K.profile, { ...p, name: name.trim() || "Gezgin" });
}

// ------------------------------------------------------------ Favoriler

export function getFavorites(): PlaceRef[] {
  return read<PlaceRef[]>(K.favorites, []);
}

export function isFavorite(placeId: string): boolean {
  return getFavorites().some((f) => f.placeId === placeId);
}

/** Yeni durum: favori ise false (kaldırıldı), değilse true (eklendi). */
export function toggleFavorite(place: PlaceRef): boolean {
  const list = getFavorites();
  const idx = list.findIndex((f) => f.placeId === place.placeId);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(K.favorites, list);
    return false;
  }
  list.unshift(place);
  write(K.favorites, list);
  return true;
}

// ------------------------------------------------------------ Son görüntülenen

export function getRecents(): PlaceRef[] {
  return read<PlaceRef[]>(K.recents, []);
}

export function addRecent(place: PlaceRef) {
  const list = getRecents().filter((r) => r.placeId !== place.placeId);
  list.unshift(place);
  write(K.recents, list.slice(0, 30));
}

// ------------------------------------------------------------ Gezi listeleri

export function getTripLists(): TripList[] {
  return read<TripList[]>(K.lists, []);
}

export function createTripList(name: string): TripList {
  const list: TripList = {
    id: `tl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || "Yeni Liste",
    createdAt: Date.now(),
    placeIds: [],
  };
  const all = getTripLists();
  all.unshift(list);
  write(K.lists, all);
  return list;
}

export function deleteTripList(listId: string) {
  write(
    K.lists,
    getTripLists().filter((l) => l.id !== listId),
  );
}

export function addPlaceToList(listId: string, place: PlaceRef): boolean {
  const all = getTripLists();
  const target = all.find((l) => l.id === listId);
  if (!target) return false;
  if (!target.placeIds.includes(place.placeId)) {
    target.placeIds.push(place.placeId);
    write(K.lists, all);
    return true;
  }
  return false;
}

export function removePlaceFromList(listId: string, placeId: string): boolean {
  const all = getTripLists();
  const target = all.find((l) => l.id === listId);
  if (!target) return false;
  const before = target.placeIds.length;
  target.placeIds = target.placeIds.filter((id) => id !== placeId);
  write(K.lists, all);
  return target.placeIds.length < before;
}

export function getPlacesInList(listId: string): PlaceRef[] {
  const list = getTripLists().find((l) => l.id === listId);
  if (!list) return [];
  const favorites = getFavorites();
  const recents = getRecents();
  const pool = [...favorites, ...recents];
  return list.placeIds
    .map((id) => pool.find((p) => p.placeId === id))
    .filter((p): p is PlaceRef => p !== undefined);
}

// ------------------------------------------------------------ Son seçilen şehir

export function getLastCityId(): string | undefined {
  return read<string | undefined>(K.city, undefined);
}

export function setLastCityId(cityId: string) {
  write(K.city, cityId);
}
