/**
 * NEREYE GİTSEM? — Temel veri modelleri.
 *
 * Tasarım hedefi: V1'de kullanılan alanlar gelecekteki sürümler için
 * (gezi listeleri, yorumlar, puanlama, etkinlikler, premium) bozulmadan
 * genişletilebilir olmalı. Zorunlu olmayan alanlar `undefined` kalabilir;
 * UI "Bilgi mevcut değil" göstermekten sorumludur — asla uydurma veri
 * üretilmez.
 */

/** Uygulamalar arası ortak mekân kimliği (kanonik tanımlayıcı). */
export interface PlaceRef {
  /** Kanonik kimlik. OSM kaynaklıysa `osm:N/123456` biçimindedir. */
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  osmType?: "N" | "W" | "R";
  osmId?: number;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Place extends PlaceRef {
  categoryId: string;
  description?: string;
  city?: string;
  district?: string;
  /** Yalnızca gerçek, doğrulanabilir görsel URL'leri (OSM image/wikimedia tag). */
  images: string[];
  openingHours?: string;
  /** OSM fee/charge tag'lerinden gelen gerçek bilgi; yoksa undefined. */
  priceInfo?: string;
  phone?: string;
  website?: string;
  /** Gerçek puan kaynağı V1'de yoktur; ileride yorum/puan sistemi için ayrılmıştır. */
  rating?: number;
  /** Ham kaynak etiketleri — gelecek özellikler için saklanır. */
  tags: Record<string, string>;
  /** Kullanıcı konumuna göre hesaplanan mesafe (metre). */
  distanceMeters?: number;
}

export interface CategoryDef {
  id: string;
  label: string;
  emoji: string;
  /** Kategori kartının ve harita markerının temsilî rengi. */
  color: string;
  /**
   * Overpass tag filtreleri. Boş dizi = bu kategorinin güvenilir veri
   * kaynağı yoktur; servis sorgu yapmadan "kaynak yok" döner.
   */
  tagFilters: Array<Record<string, string | string[]>>;
}

export interface DiscoveryModeDef {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Modun eşleştiği kategori kimlikleri. */
  categoryIds: string[];
  /** true ise fee=yes olan mekânlar dışlanır (ekonomik mod). */
  preferFree?: boolean;
}

export interface TripList {
  id: string;
  name: string;
  createdAt: number;
  placeIds: string[];
}

export interface UserProfile {
  name: string;
  createdAt: number;
}

export type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "granted"; coords: Coordinates; city?: string }
  | { status: "denied" }
  | { status: "unavailable"; reason: string };
