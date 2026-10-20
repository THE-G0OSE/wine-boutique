import { Controller, Delete, Get, Header, HttpCode, Param, Put } from "@nestjs/common";
import type { components } from "@wine/contracts/openapi";
import { zAddFavoritePath, zGetMyFavoritesResponse, zGetMyLoyaltyResponse, zRemoveFavoritePath } from "@wine/contracts/openapi/zod";
import { ApiError, ContractResponse, CurrentUser } from "@wine/service-kit";
import type { z } from "zod";
import { Favorites, GetLoyalty } from "../application/loyalty.js";
import { CatalogUnavailable } from "../application/ports.js";
import { UnknownWine, type FavoriteWine } from "../domain/loyalty.js";

type Schemas = components["schemas"];

const requireUser = (userId: string | null): string => {
  if (!userId) throw new ApiError(401, "unauthorized", "Войдите, чтобы продолжить");
  return userId;
};

const volume = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 });

/** Вино в формате списков контракта — как отдаёт catalog: объём «0,75 л», цена в рублях */
const toWineSummary = (wine: FavoriteWine): Schemas["WineSummary"] => ({
  id: wine.id,
  slug: wine.slug,
  name: wine.name,
  categories: wine.categories as Schemas["WineSummary"]["categories"],
  region: wine.region,
  country: wine.country,
  grapes: wine.grapes,
  volume: `${volume.format(wine.volumeMl / 1000)} л`,
  vintage: wine.vintage,
  cellarYears: wine.cellarYears,
  price: wine.priceKopecks === null ? null : Math.round(wine.priceKopecks / 100),
  image: wine.imageUrl,
  bottle: wine.bottle as Schemas["WineSummary"]["bottle"],
});

const guard = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    if (error instanceof UnknownWine) throw new ApiError(404, "not_found", error.message);
    if (error instanceof CatalogUnavailable) throw new ApiError(503, "catalog_unavailable", "Не удалось открыть карточки вин — попробуйте через минуту");
    throw error;
  }
};

/** Бонусы и избранное в кабинете: шлюз пускает только вошедших и передаёт X-User-Id */
@Controller("me")
export class LoyaltyController {
  constructor(
    private readonly loyalty: GetLoyalty,
    private readonly favorites: Favorites
  ) {}

  /** GET /api/me/loyalty — operationId getMyLoyalty */
  @Get("loyalty")
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetMyLoyaltyResponse)
  async getLoyalty(@CurrentUser() userId: string | null): Promise<Schemas["Loyalty"]> {
    const loyalty = await this.loyalty.execute(requireUser(userId));
    return { ...loyalty, history: loyalty.history.map((entry) => ({ ...entry, at: entry.at.toISOString() })) };
  }

  /** GET /api/me/favorites — operationId getMyFavorites */
  @Get("favorites")
  @Header("Cache-Control", "private, no-store")
  @ContractResponse(zGetMyFavoritesResponse)
  async list(@CurrentUser() userId: string | null): Promise<Schemas["MyFavorites"]> {
    return (await guard(() => this.favorites.list(requireUser(userId)))).map(toWineSummary);
  }

  /** PUT /api/me/favorites/{wineId} — operationId addFavorite */
  @Put("favorites/:wineId")
  @HttpCode(204)
  async add(@CurrentUser() userId: string | null, @Param({ schema: zAddFavoritePath }) { wineId }: z.output<typeof zAddFavoritePath>): Promise<void> {
    await guard(() => this.favorites.add(requireUser(userId), wineId));
  }

  /** DELETE /api/me/favorites/{wineId} — operationId removeFavorite */
  @Delete("favorites/:wineId")
  @HttpCode(204)
  async remove(@CurrentUser() userId: string | null, @Param({ schema: zRemoveFavoritePath }) { wineId }: z.output<typeof zRemoveFavoritePath>): Promise<void> {
    await this.favorites.remove(requireUser(userId), wineId);
  }
}
