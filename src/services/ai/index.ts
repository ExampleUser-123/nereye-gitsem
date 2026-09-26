/**
 * AI sağlayıcı fabrikası.
 *
 * VITE_AI_PROVIDER=local (varsayılan): yerel OSM keşif motoru.
 * İleride "llm" gibi bir değer eklenirse karşılık gelen sağlayıcı burada
 * kaydedilir; anahtar asla frontend'e gömülmez, proxy backend üzerinden
 * konuşulur.
 */

import type { AIProvider } from "./types";
import { localEngine } from "./localEngine";

export type { AIProvider, AIRequest, AIResponse, AIContext } from "./types";
export { AIUnavailableError } from "./types";

export function createAIProvider(): AIProvider {
  const provider = (import.meta.env.VITE_AI_PROVIDER as string) ?? "local";
  switch (provider) {
    case "local":
    default:
      // V1'de tek sağlayıcı yerel motordur; arayüz (AIProvider) LLM
      // eklenmesine hazırdır.
      return localEngine;
  }
}
