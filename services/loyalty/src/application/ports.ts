import type { BonusEntry, FavoriteWine } from "../domain/loyalty.js";

export abstract class LoyaltyRepository {
  /** Начислить один раз: проводка с той же ссылкой у гостя уже есть — ничего не делает */
  abstract grantOnce(userId: string, reference: string, amount: number, title: string): Promise<void>;
  abstract balance(userId: string): Promise<number>;
  /** Проводки от свежих к старым */
  abstract history(userId: string, limit: number): Promise<BonusEntry[]>;
  /** id избранных вин от недавно добавленных */
  abstract favoriteIds(userId: string): Promise<string[]>;
  /** Добавить; уже в избранном — ничего не делает */
  abstract addFavorite(userId: string, wineId: string): Promise<void>;
  abstract removeFavorite(userId: string, wineId: string): Promise<void>;
}

/**
 * Каталог вин — сервис catalog по gRPC, один пакетный вызов с дедлайном.
 * Не ответил — CatalogUnavailable: без карточек избранное показать нечем.
 */
export abstract class WineCatalog {
  abstract wines(ids: string[]): Promise<Map<string, FavoriteWine>>;
}

export class CatalogUnavailable extends Error {}
