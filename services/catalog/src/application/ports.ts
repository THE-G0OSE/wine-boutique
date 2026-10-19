import type { GrapeVariety } from "../domain/grape-variety.js";
import type { Wine, WineCategory, WineSort } from "../domain/wine.js";

export interface WineListQuery {
  category?: WineCategory;
  sort: WineSort;
  limit: number;
  offset: number;
}

export interface WinePage {
  items: Wine[];
  total: number;
}

/** Хранилище вин — порт: сценарии не знают про Prisma */
export abstract class WineRepository {
  abstract list(query: WineListQuery): Promise<WinePage>;
  /** Вина по id в порядке ids; неизвестные id пропускаются */
  abstract findByIds(ids: string[]): Promise<Wine[]>;
  /** slug → id для найденных вин */
  abstract resolveSlugs(slugs: string[]): Promise<Map<string, string>>;
}

export abstract class GrapeVarietyRepository {
  /** Все сорта по порядку, у каждого — его вина */
  abstract listWithWines(): Promise<GrapeVariety[]>;
}
