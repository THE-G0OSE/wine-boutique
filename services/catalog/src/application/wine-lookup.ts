import { Injectable } from "@nestjs/common";
import type { Wine } from "../domain/wine.js";
import { WineRepository } from "./ports.js";

/** Карточки вин для других сервисов (gRPC CatalogService): пакетно, без вызовов в цикле */
@Injectable()
export class WineLookup {
  constructor(private readonly wines: WineRepository) {}

  /** Не больше 100 id за вызов — защита от случайно огромного пакета */
  summaries(ids: string[]): Promise<Wine[]> {
    return this.wines.findByIds([...new Set(ids)].slice(0, 100));
  }

  resolveSlugs(slugs: string[]): Promise<Map<string, string>> {
    return this.wines.resolveSlugs([...new Set(slugs)].slice(0, 100));
  }
}
