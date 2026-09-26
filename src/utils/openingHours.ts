/**
 * OSM opening_hours mini parser.
 *
 * Desteklenen yaygın kalıplar:
 *   24/7
 *   Mo-Su 09:00-21:00
 *   Mo-Fr 09:00-20:00; Sa 10:00-22:00; Su 11:00-19:00
 *   Mo-Sa 09:00-19:00 (kapalı Pazar → gün listesi dışında)
 *   09:00-21:00 (gün belirtilmemiş → her gün kabul)
 *   Mo,Tu,Th-Fr 10:00-18:00
 *
 * Ayrıştırılamayan / belirsiz ifadeler null döner — rozet gösterilmez,
 * ham metin aynen kalır (uydurma yasağı).
 */

const DAY_MAP: Record<string, number> = {
  mo: 1,
  tu: 2,
  we: 3,
  th: 4,
  fr: 5,
  sa: 6,
  su: 0,
};

interface Rule {
  days: number[]; // 0=Paz ... 6=Cmt
  startMin: number;
  endMin: number;
}

function parseTime(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

function parseDays(part: string): number[] | null {
  if (!part) return [0, 1, 2, 3, 4, 5, 6];
  const days: number[] = [];
  for (const chunk of part.split(",")) {
    const c = chunk.trim().toLowerCase();
    const range = /^([a-z]{2})-([a-z]{2})$/.exec(c);
    if (range) {
      const a = DAY_MAP[range[1]];
      const b = DAY_MAP[range[2]];
      if (a === undefined || b === undefined) return null;
      if (a <= b) {
        for (let d = a; d <= b; d++) days.push(d % 7);
      } else {
        // Sa-Mo gibi sarmal aralık
        for (let d = a; d <= a + (6 - a + b); d++) days.push(d % 7);
      }
    } else if (DAY_MAP[c] !== undefined) {
      days.push(DAY_MAP[c]);
    } else {
      return null;
    }
  }
  return days.length > 0 ? days : null;
}

export function parseOpeningHours(input: string): Rule[] | null {
  const s = input.trim();
  if (!s) return null;
  if (/^24\/7$/.test(s)) {
    return [
      { days: [0, 1, 2, 3, 4, 5, 6], startMin: 0, endMin: 24 * 60 },
    ];
  }

  const rules: Rule[] = [];
  for (const chunk of s.split(";")) {
    const text = chunk.trim();
    if (!text) continue;
    // İsteğe bağlı gün kısmı + saat aralıkları
    const m = /^(?:([A-Za-z]{2}(?:[-,][A-Za-z]{2})*))?\s*(.+)$/.exec(text);
    if (!m) return null;
    const dayPart = m[1] ?? "";
    const timePart = m[2].trim();

    const days = parseDays(dayPart);
    if (!days) return null;

    // "09:00-21:00" veya "09:00-13:00,14:00-21:00"
    for (const range of timePart.split(",")) {
      const rm = /^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(range);
      if (!rm) return null;
      const startMin = parseTime(rm[1]);
      let endMin = parseTime(rm[2]);
      if (startMin === null || endMin === null) return null;
      if (endMin === 24 * 60) endMin = 24 * 60; // 24:00 geçerli
      if (endMin <= startMin) return null; // gece devri desteklenmiyor → null
      rules.push({ days, startMin, endMin });
    }
  }
  return rules.length > 0 ? rules : null;
}

/**
 * Şu an açık mı? null = belirsiz (rozet gösterme).
 * Saat dilimi: Europe/Istanbul.
 */
export function isOpenNow(input: string): boolean | null {
  const rules = parseOpeningHours(input);
  if (!rules) return null;
  try {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }),
    );
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return rules.some(
      (r) => r.days.includes(day) && minutes >= r.startMin && minutes < r.endMin,
    );
  } catch {
    return null;
  }
}
