/**
 * Yerel keşif motoru (V1 AI provider).
 *
 * Türkçe doğal dil girdisini basit NLU ile ayrıştırır:
 *   - şehir adı (İstanbul, İzmir, ...)
 *   - niyet kelimeleri (sakin, tarihi, ucuz, kahve, deniz, yakınımda, ...)
 * Ardından gerçek OSM verisi üzerinden öneri üretir.
 *
 * Uydurma yasağı: fiyat/saat/adres gibi bilgiler asla üretilmez;
 * öneri metni yalnızca gerçek veri alanlarından kurallu olarak yazılır.
 */

import type { Place } from "../../models/types";
import { CITIES, findCityByName, normalizeTr } from "../../data/cities";
import { DISCOVERY_MODES } from "../../data/modes";
import { getNearbyPlaces, NoSourceError } from "../osm";
import {
  AIUnavailableError,
  type AIProvider,
  type AIRequest,
  type AIResponse,
} from "./types";

interface Intent {
  city?: string;
  cityCoords?: { lat: number; lon: number };
  categoryIds?: string[];
  modeLabel?: string;
  nearMe: boolean;
  freeOnly: boolean;
  wantsFood: boolean;
}

const KEYWORD_MAP: Array<{
  words: string[];
  categoryIds: string[];
  modeLabel: string;
}> = [
  { words: ["sakin", "sessiz", "huzur", "sükunet", "sukunet"], categoryIds: ["nature", "photo"], modeLabel: "sakin" },
  { words: ["manzara", "manzaralı", "manzarali", "fotoğraf", "fotograf", "foto"], categoryIds: ["photo"], modeLabel: "manzaralı" },
  { words: ["kahve", "cafe", "kafe", "mola"], categoryIds: ["cafe"], modeLabel: "kahve molalı" },
  { words: ["tarih", "tarihi", "antik", "müze", "muze", "kalıntı", "kalinti", "eser"], categoryIds: ["historic", "attraction"], modeLabel: "tarihi" },
  { words: ["deniz", "plaj", "sahil", "yüzme", "yuzme", "kumsal"], categoryIds: ["beach"], modeLabel: "deniz kenarı" },
  { words: ["doğa", "doga", "yeşil", "yesil", "orman", "park", "yürüyüş", "yuruyus"], categoryIds: ["nature"], modeLabel: "doğa" },
  { words: ["eğlence", "eglence", "eğlen", "eglence", "sinema", "tiyatro", "oyun"], categoryIds: ["entertainment"], modeLabel: "eğlence" },
  { words: ["aile", "çocuk", "cocuk", "çocukla", "cocukla"], categoryIds: ["family"], modeLabel: "aile dostu" },
  { words: ["yemek", "lokanta", "restoran", "akşam yemeği", "aksam yemegi"], categoryIds: ["restaurant"], modeLabel: "yemek" },
  { words: ["alışveriş", "alisveris", "avm", "market"], categoryIds: ["shopping"], modeLabel: "alışveriş" },
  { words: ["gezecek", "gezilecek", "gezmek", "keşfet", "kesfet", "yer arıyorum", "ne yapabilirim"], categoryIds: ["attraction", "historic", "nature"], modeLabel: "gezilecek" },
];

const NEAR_WORDS = ["yakın", "yakınımda", "yakin", "etraf", "burada", "çevre", "cevre", "bana yakın"];
const FREE_WORDS = ["ucuz", "ekonomik", "bedava", "ücretsiz", "ucretsiz", "parasız", "parasiz", "az para"];

function parseIntent(query: string, ctx: AIRequest["context"]): Intent {
  const q = normalizeTr(query);

  const intent: Intent = { nearMe: false, freeOnly: false, wantsFood: false };

  // Şehir tespiti
  for (const city of CITIES) {
    if (q.includes(normalizeTr(city.name))) {
      intent.city = city.name;
      intent.cityCoords = { lat: city.lat, lon: city.lon };
      break;
    }
  }

  // Niyet kelimeleri
  for (const entry of KEYWORD_MAP) {
    if (entry.words.some((w) => q.includes(normalizeTr(w)))) {
      intent.categoryIds = entry.categoryIds;
      intent.modeLabel = entry.modeLabel;
      break;
    }
  }

  // Keşif modu kelimeleri (modlar kategoriye bağladır)
  if (!intent.categoryIds) {
    for (const mode of DISCOVERY_MODES) {
      if (q.includes(normalizeTr(mode.label))) {
        intent.categoryIds = mode.categoryIds;
        intent.modeLabel = mode.label.toLocaleLowerCase("tr-TR");
        if (mode.preferFree) intent.freeOnly = true;
        break;
      }
    }
  }

  if (NEAR_WORDS.some((w) => q.includes(normalizeTr(w)))) intent.nearMe = true;
  if (FREE_WORDS.some((w) => q.includes(normalizeTr(w)))) intent.freeOnly = true;

  // Bağlamdan varsayılanlar
  if (!intent.city && ctx.selectedCity) {
    const c = findCityByName(ctx.selectedCity);
    if (c) {
      intent.city = c.name;
      intent.cityCoords = { lat: c.lat, lon: c.lon };
    }
  }

  return intent;
}

function filterFree(places: Place[]): Place[] {
  return places.filter(
    (p) => p.tags.fee !== "yes" && !p.tags.charge,
  );
}

function buildText(
  intent: Intent,
  places: Place[],
  originLabel: string,
): string {
  if (places.length === 0) {
    return `${originLabel} için bu kriterlere uyan bir mekân bulamadım. Şehri veya kriterleri değiştirip tekrar dener misin? Örneğin: "İstanbul'da sakin bir yer" ya da "Yakınımda kahve içebileceğim bir yer".`;
  }

  const scope = intent.modeLabel
    ? `${originLabel} sana ${intent.modeLabel} yerler öneriyorum`
    : `${originLabel} şu yerleri öneriyorum`;

  const lines = places.slice(0, 5).map((p, i) => {
    const bits = [p.city, p.district].filter(Boolean).join(" / ");
    return `${i + 1}. ${p.name}${bits ? ` (${bits})` : ""}`;
  });

  const note =
    "Fiyat, çalışma saati ve adres gibi bilgiler yalnızca doğrulanmış veri olduğunda mekân sayfasında gösterilir — uydurma bilgi vermem.";
  return `${scope}:\n\n${lines.join("\n")}\n\n${note}`;
}

export const localEngine: AIProvider = {
  id: "local-osm-engine",

  async recommend({ query, context }: AIRequest): Promise<AIResponse> {
    const intent = parseIntent(query, context);

    const center = intent.nearMe && context.userCoords
      ? context.userCoords
      : intent.cityCoords
        ? intent.cityCoords
        : context.userCoords;

    if (!center) {
      return {
        engine: this.id,
        text: "Hangi şehirde gezmek istediğini yazabilir misin? Örneğin: \"İstanbul'da tarihi yerler\". Konum iznini açarsan çevrendeki yerleri de önerebilirim.",
        places: [],
      };
    }

    const originLabel =
      intent.nearMe && context.userCoords
        ? "Çevrendeki"
        : intent.city
          ? `${intent.city} için`
          : "Bulunduğun bölge için";

    try {
      let places = await getNearbyPlaces({
        center,
        radius: intent.nearMe ? 5000 : 15000,
        categoryIds: intent.categoryIds,
        limit: 100,
      });

      if (intent.freeOnly) places = filterFree(places);

      const text = buildText(intent, places, originLabel);
      return { engine: this.id, text, places: places.slice(0, 5) };
    } catch (err) {
      if (err instanceof NoSourceError) {
        return {
          engine: this.id,
          text: `${originLabel} bu konuda henüz güvenilir bir veri kaynağım yok. Başka bir kriterle dener misin?`,
          places: [],
        };
      }
      throw new AIUnavailableError();
    }
  },
};
