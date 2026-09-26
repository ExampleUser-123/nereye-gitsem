import type { CategoryDef } from "../models/types";

/**
 * Kategori kayıt defteri.
 *
 * Kategoriler sabit HTML kartları değildir; buradaki kayıt arayüzü üzerinden
 * tanımlanırlar ve Overpass (OpenStreetMap) tag filtreleriyle veriye
 * bağlanırlar. Yeni bir kategori eklemek için sadece bu listeye yeni bir
 * kayıt eklemek yeterlidir — arama, keşif, harita ve AI otomatik olarak
 * yeni kategoriyi kullanır.
 */
export const CATEGORIES: CategoryDef[] = [
  {
    id: "historic",
    label: "Tarihi Yerler",
    emoji: "🏛️",
    color: "#b45309",
    tagFilters: [{ historic: "*" }],
  },
  {
    id: "nature",
    label: "Doğa",
    emoji: "🌿",
    color: "#16a34a",
    tagFilters: [
      { leisure: ["park", "garden", "nature_reserve"] },
      { natural: ["wood", "scrub"] },
    ],
  },
  {
    id: "beach",
    label: "Deniz / Plaj",
    emoji: "🌊",
    color: "#0284c7",
    tagFilters: [{ natural: ["beach"] }],
  },
  {
    id: "cafe",
    label: "Kafe",
    emoji: "☕",
    color: "#92400e",
    tagFilters: [{ amenity: ["cafe"] }],
  },
  {
    id: "restaurant",
    label: "Restoran",
    emoji: "🍽️",
    color: "#dc2626",
    tagFilters: [{ amenity: ["restaurant"] }],
  },
  {
    id: "attraction",
    label: "Gezilecek Yer",
    emoji: "📍",
    color: "#0d9488",
    tagFilters: [{ tourism: ["attraction", "artwork"] }],
  },
  {
    id: "event",
    label: "Etkinlik",
    emoji: "🎭",
    color: "#7c3aed",
    // Etkinlikler için güvenilir, sürekli bir açık veri kaynağı V1'de yok.
    // Uydurma etkinlik üretmek yasaktır; kategori modelde mevcut, veri
    // kaynağı ileride ayrı bir etkinlik servisiyle bağlanacaktır.
    tagFilters: [],
  },
  {
    id: "shopping",
    label: "Alışveriş",
    emoji: "🛍️",
    color: "#db2777",
    tagFilters: [
      { shop: ["mall", "department_store", "marketplace"] },
    ],
  },
  {
    id: "entertainment",
    label: "Eğlence",
    emoji: "🎮",
    color: "#4f46e5",
    tagFilters: [
      { amenity: ["cinema", "theatre", "nightclub"] },
      { leisure: ["amusement_arcade", "escape_game"] },
    ],
  },
  {
    id: "family",
    label: "Aile",
    emoji: "👨‍👩‍👧",
    color: "#0891b2",
    tagFilters: [
      { tourism: ["zoo", "aquarium", "museum"] },
      { leisure: ["playground", "water_park"] },
    ],
  },
  {
    id: "photo",
    label: "Fotoğraf Noktaları",
    emoji: "📸",
    color: "#c026d3",
    tagFilters: [{ tourism: ["viewpoint"] }],
  },
];

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: string): CategoryDef {
  return (
    BY_ID.get(id) ?? {
      id,
      label: "Diğer",
      emoji: "📍",
      color: "#64748b",
      tagFilters: [],
    }
  );
}
