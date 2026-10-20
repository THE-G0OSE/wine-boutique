import { Injectable } from "@nestjs/common";
import { levelOf, UnknownWine, WELCOME_BONUS, WELCOME_REFERENCE, type FavoriteWine } from "../domain/loyalty.js";
import { LoyaltyRepository, WineCatalog } from "./ports.js";

const HISTORY_LIMIT = 50;

/** Бонусы и уровень: GET /me/loyalty. Первый визит в кабинет начисляет приветственные бонусы */
@Injectable()
export class GetLoyalty {
  constructor(private readonly loyalty: LoyaltyRepository) {}

  async execute(userId: string) {
    await this.loyalty.grantOnce(userId, WELCOME_REFERENCE, WELCOME_BONUS, "Приветственные бонусы");
    const [balance, history] = await Promise.all([this.loyalty.balance(userId), this.loyalty.history(userId, HISTORY_LIMIT)]);
    // Покупок по событиям бутика ещё нет — бутылок за год 0
    const bottles = 0;
    const { level, next } = levelOf(bottles);
    return { balance, level, bottles, nextLevel: next, history };
  }
}

/** Избранное: GET /me/favorites, PUT и DELETE /me/favorites/{wineId} */
@Injectable()
export class Favorites {
  constructor(
    private readonly loyalty: LoyaltyRepository,
    private readonly catalog: WineCatalog
  ) {}

  /** Вина в порядке добавления; снятые с полок catalog не вернёт — их пропускаем */
  async list(userId: string): Promise<FavoriteWine[]> {
    const ids = await this.loyalty.favoriteIds(userId);
    if (ids.length === 0) return [];
    const wines = await this.catalog.wines(ids);
    return ids.flatMap((id) => wines.get(id) ?? []);
  }

  async add(userId: string, wineId: string): Promise<void> {
    const wines = await this.catalog.wines([wineId]);
    if (!wines.has(wineId)) throw new UnknownWine("Такого вина нет");
    await this.loyalty.addFavorite(userId, wineId);
  }

  remove(userId: string, wineId: string): Promise<void> {
    return this.loyalty.removeFavorite(userId, wineId);
  }
}
