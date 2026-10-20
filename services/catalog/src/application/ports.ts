import type { FacetRow, WineFilter } from "../domain/catalog-filter.js";
import type { GrapeVariety } from "../domain/grape-variety.js";
import type { Wine, WineCard, WineShelf, WineSort } from "../domain/wine.js";

export interface WineListQuery {
  filter: WineFilter;
  sort: WineSort;
  limit: number;
  offset: number;
  today: Date;
}

export interface WinePage {
  items: Wine[];
  total: number;
}

export interface ShelfInfo {
  id: WineShelf;
  title: string;
  note: string;
  description: string;
}

export interface ShelfView extends ShelfInfo {
  total: number;
  wines: Wine[];
}

export interface WineCardView {
  card: WineCard;
  /** Полка для крошек — первая в магазине, на которой стоит вино */
  shelf: WineShelf;
  /** Выбор сомелье по порядку; пусто — сценарий возьмёт соседей по полке */
  related: Wine[];
}

/** Первые вхождения сортов и регионов в порядке популярности вин — для подсказок поиска */
export interface SearchTerms {
  grapes: string[];
  regions: string[];
}

/** Хранилище вин — порт: сценарии не знают про Prisma */
export abstract class WineRepository {
  abstract list(query: WineListQuery): Promise<WinePage>;
  /** Колонки для фасетов: вина полки, типа и поиска — без остальных фильтров */
  abstract facetRows(base: Pick<WineFilter, "shelf" | "category" | "q">): Promise<FacetRow[]>;
  /** Полки по порядку с числом подходящих вин и первыми `limit` из них */
  abstract shelves(filter: Omit<WineFilter, "shelf">, limit: number, today: Date): Promise<ShelfView[]>;
  abstract findCard(slug: string): Promise<WineCardView | null>;
  /** Соседи по полке без самого вина, по порядку полки */
  abstract shelfNeighbours(shelf: WineShelf, wineId: string, limit: number): Promise<Wine[]>;
  abstract searchTerms(): Promise<SearchTerms>;
  /** Вина по id в порядке ids; неизвестные id пропускаются */
  abstract findByIds(ids: string[]): Promise<Wine[]>;
  /** slug → id для найденных вин */
  abstract resolveSlugs(slugs: string[]): Promise<Map<string, string>>;
}

export abstract class GrapeVarietyRepository {
  /** Все сорта по порядку, у каждого — его вина */
  abstract listWithWines(): Promise<GrapeVariety[]>;
}
