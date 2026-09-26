/**
 * Türkiye'deki büyük şehirlerin merkez koordinatları (kamuya açık
 * coğrafi referans verisi). Konum izni verilmediğinde veya kullanıcı
 * şehir seçmek istediğinde keşif bu merkezler üzerinden yapılır.
 */
export interface CityDef {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: CityDef[] = [
  { id: "istanbul", name: "İstanbul", lat: 41.0082, lon: 28.9784 },
  { id: "ankara", name: "Ankara", lat: 39.9334, lon: 32.8597 },
  { id: "izmir", name: "İzmir", lat: 38.4192, lon: 27.1287 },
  { id: "antalya", name: "Antalya", lat: 36.8969, lon: 30.7133 },
  { id: "bursa", name: "Bursa", lat: 40.1826, lon: 29.0665 },
  { id: "adana", name: "Adana", lat: 37.0, lon: 35.3213 },
  { id: "konya", name: "Konya", lat: 37.8746, lon: 32.4932 },
  { id: "gaziantep", name: "Gaziantep", lat: 37.0662, lon: 37.3833 },
  { id: "sanliurfa", name: "Şanlıurfa", lat: 37.1591, lon: 38.7969 },
  { id: "kayseri", name: "Kayseri", lat: 38.7312, lon: 35.4787 },
  { id: "mersin", name: "Mersin", lat: 36.8121, lon: 34.6415 },
  { id: "eskiehir", name: "Eskişehir", lat: 39.7767, lon: 30.5206 },
  { id: "samsun", name: "Samsun", lat: 41.2867, lon: 36.33 },
  { id: "denizli", name: "Denizli", lat: 37.7765, lon: 29.0864 },
  { id: "trabzon", name: "Trabzon", lat: 41.0027, lon: 39.7168 },
  { id: "rize", name: "Rize", lat: 41.0201, lon: 40.5234 },
  { id: "mugla", name: "Muğla", lat: 37.2153, lon: 28.3636 },
  { id: "aydin", name: "Aydın", lat: 37.856, lon: 27.8416 },
  { id: "canakkale", name: "Çanakkale", lat: 40.1553, lon: 26.4142 },
  { id: "balikesir", name: "Balıkesir", lat: 39.6484, lon: 27.8826 },
  { id: "nevsehir", name: "Nevşehir", lat: 38.6431, lon: 34.8289 },
  { id: "hatay", name: "Hatay", lat: 36.2025, lon: 36.1606 },
  { id: "mardin", name: "Mardin", lat: 37.3212, lon: 40.7245 },
  { id: "diyarbakir", name: "Diyarbakır", lat: 37.9144, lon: 40.2306 },
  { id: "van", name: "Van", lat: 38.4891, lon: 43.4089 },
  { id: "malatya", name: "Malatya", lat: 38.3552, lon: 38.3095 },
  { id: "erzurum", name: "Erzurum", lat: 39.9, lon: 41.27 },
  { id: "sivas", name: "Sivas", lat: 39.7477, lon: 37.0179 },
];

/** Türkçe karakterleri normalize eden basit sıralama/arama yardımcısı. */
export function normalizeTr(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

export function findCityByName(name: string): CityDef | undefined {
  const q = normalizeTr(name);
  return CITIES.find((c) => normalizeTr(c.name) === q);
}
