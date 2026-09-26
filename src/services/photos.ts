/**
 * Foto enrichment: OSM'de fotoğrafı olmayan mekânlar için Wikipedia /
 * Wikidata üzerinden GERÇEK görsel bulur.
 *
 * Uydurma yasağına uygunluk: yalnızca Wikipedia maddesine bağlı resmî
 * görsel URL'leri döner; hiçbir görsel bulunamazsa null döner ve UI
 * mevcut kategori placeholder'ını kullanmaya devam eder.
 *
 * Sonuçlar 7 gün cache'lenir (gereksiz API çağrısı yasak).
 */

import type { Place } from "../models/types";
import { cached } from "./cache";
import { fetchJSON } from "./http";

const WIKI_TR = "https://tr.wikipedia.org/w/api.php";
const WIKIDATA = "https://www.wikidata.org/w/api.php";
const TTL = 7 * 24 * 60 * 60 * 1000;

interface WikiPagesResponse {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        thumbnail?: { source: string };
        original?: { source: string };
      }
    >;
  };
}

interface WikidataClaimsResponse {
  claims?: Record<
    string,
    Array<{ mainsnak?: { datavalue?: { value?: unknown } } }>
  >;
}

function commonsFileUrl(file: string, width = 900): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    file,
  )}?width=${width}`;
}

async function photoFromWikidata(qid: string): Promise<string | null> {
  return cached(`wd-photo:${qid}`, TTL, async () => {
    const url = `${WIKIDATA}?${new URLSearchParams({
      action: "wbgetclaims",
      entity: qid,
      property: "P18",
      format: "json",
      origin: "*",
    })}`;
    const res = await fetchJSON<WikidataClaimsResponse>(url, { timeoutMs: 10000 });
    const file = res.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    return typeof file === "string" ? commonsFileUrl(file) : null;
  });
}

async function photoFromWikipedia(query: string): Promise<string | null> {
  return cached(`wiki-photo:${query.toLocaleLowerCase("tr-TR")}`, TTL, async () => {
    const url = `${WIKI_TR}?${new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrlimit: "1",
      gsrnamespace: "0",
      prop: "pageimages",
      piprop: "thumbnail|original",
      pithumbsize: "900",
      redirects: "1",
      format: "json",
      origin: "*",
    })}`;
    const res = await fetchJSON<WikiPagesResponse>(url, { timeoutMs: 10000 });
    const pages = res.query?.pages;
    if (!pages) return null;
    const first = Object.values(pages)[0];
    return first?.original?.source ?? first?.thumbnail?.source ?? null;
  });
}

/**
 * Mekân için en iyi gerçek fotoğrafı bulur.
 * Öncelik: OSM'deki mevcut görsel → Wikidata P18 → Türkçe Wikipedia.
 * Bulunamazsa null (arayüz placeholder gösterir).
 */
export async function fetchPlacePhoto(place: Place): Promise<string | null> {
  if (place.images.length > 0) return place.images[0];

  const qid = place.tags.wikidata;
  if (qid && /^Q\d+$/.test(qid)) {
    try {
      const wd = await photoFromWikidata(qid);
      if (wd) return wd;
    } catch {
      /* wikidata başarısız → wikipedia dene */
    }
  }

  try {
    // 1) İsim + şehir (daha isabetli)
    const fullQuery = [place.name, place.city].filter(Boolean).join(" ");
    const full = await photoFromWikipedia(fullQuery);
    if (full) return full;
    // 2) Yalnızca isim (şehir eki eşleşmeyi bozuyorsa)
    if (place.city && place.city !== place.name) {
      return await photoFromWikipedia(place.name);
    }
    return null;
  } catch {
    return null;
  }
}
