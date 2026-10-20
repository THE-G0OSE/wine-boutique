import { Injectable } from "@nestjs/common";
import { countFacets, type WineFacets, type WineFilter } from "../domain/catalog-filter.js";
import { isPlaceholder, normalizeSearch, type Wine } from "../domain/wine.js";
import { WineRepository, type ShelfView, type WineCardView } from "./ports.js";

/** «С этим вином берут» — не больше шести */
const RELATED_LIMIT = 6;
const SUGGEST_WINES = 3;
const SUGGEST_TERMS = 4;

/** Полки магазина: GET /shelves */
@Injectable()
export class ListShelves {
  constructor(private readonly wines: WineRepository) {}

  execute(filter: Omit<WineFilter, "shelf">, limit: number, today = new Date()): Promise<ShelfView[]> {
    return this.wines.shelves(filter, limit, today);
  }
}

/** Варианты фильтров со счётчиками: GET /wines/facets */
@Injectable()
export class GetWineFacets {
  constructor(private readonly wines: WineRepository) {}

  async execute(filter: WineFilter, today = new Date()): Promise<WineFacets> {
    const rows = await this.wines.facetRows({ shelf: filter.shelf, category: filter.category, q: filter.q });
    return countFacets(rows, filter, today);
  }
}

/** Карточка вина: GET /wines/{slug}; null — такого вина нет */
@Injectable()
export class GetWineCard {
  constructor(private readonly wines: WineRepository) {}

  async execute(slug: string): Promise<(WineCardView & { related: Wine[] }) | null> {
    const view = await this.wines.findCard(slug);
    if (!view) return null;
    // Сомелье не выбрал пару — соседи по полке
    const related = view.related.length
      ? view.related.slice(0, RELATED_LIMIT)
      : await this.wines.shelfNeighbours(view.shelf, view.card.id, RELATED_LIMIT);
    return { ...view, related };
  }
}

export interface SearchSuggestions {
  wines: Wine[];
  grapes: string[];
  regions: string[];
}

const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase("ru") + value.slice(1);

/** Значения, в которых есть запрос, без повторов (регистр не важен) и плейсхолдеров — в исходном порядке */
const containing = (values: string[], q: string) => {
  const needle = normalizeSearch(q.trim());
  const seen = new Map<string, string>();
  for (const value of values) {
    const key = normalizeSearch(value);
    if (isPlaceholder(value) || !key.includes(needle) || seen.has(key)) continue;
    seen.set(key, value);
  }
  return [...seen.values()];
};

/**
 * Подсказки поиска: GET /search/suggest — до трёх вин, сорта с запросом в названии,
 * регионы — сначала с запросом в названии, затем откуда найденные вина (чаще встречающиеся первыми)
 */
@Injectable()
export class SuggestSearch {
  constructor(private readonly wines: WineRepository) {}

  async execute(q: string, today = new Date()): Promise<SearchSuggestions> {
    const [found, terms] = await Promise.all([
      // Регионы считаем по всем найденным винам, не только по трём показанным
      this.wines.list({ filter: { q }, sort: "popular", limit: 10_000, offset: 0, today }),
      this.wines.searchTerms(),
    ]);
    const counts = new Map<string, number>();
    for (const wine of found.items) if (!isPlaceholder(wine.region)) counts.set(wine.region, (counts.get(wine.region) ?? 0) + 1);
    const byWines = [...counts]
      .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, "ru"))
      .map(([region]) => region);
    return {
      wines: found.items.slice(0, SUGGEST_WINES),
      grapes: containing(terms.grapes, q).slice(0, SUGGEST_TERMS).map(capitalize),
      regions: [...new Set([...containing(terms.regions, q), ...byWines])].slice(0, SUGGEST_TERMS),
    };
  }
}

