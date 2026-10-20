import { useState, type FC } from "react";
import { Link } from "react-router";
import { LuHeart } from "react-icons/lu";
import { formatShortDate, type MonthlySubscription, type MyTasting } from "@/entities/account";
import { cartActions } from "@/entities/cart";
import { MONTHLY_PLAN_TITLES } from "@/entities/monthlyCrate";
import { useUpdateMyMonthlyMutation } from "@/features/account/manageMonthly";
import { useRemoveFavoriteMutation } from "@/features/wine/toggleFavorite";
import type { ApiSchemas } from "@/shared/api";
import { REVIEWS_ANCHORS, ROUTES } from "@/shared/config/routes";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { plural } from "@/shared/lib/plural";
import { Button, Text } from "uikit;/";
import { PANEL } from "../../model/tabs";

interface IProps {
  tastings: MyTasting[];
  monthly: MonthlySubscription | null;
  favorites: ApiSchemas["WineSummary"][];
}

const MONTHS_GENITIVE = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"];

/** Избранное и дегустации: билеты записей, подписка на набор (пауза, пропуск месяца), избранные вина на полке */
const FavoritesTab: FC<IProps> = ({ tastings, monthly, favorites }) => {
  const dispatch = useAppDispatch();
  const [updateMonthly, monthlyUpdate] = useUpdateMyMonthlyMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [added, setAdded] = useState<Set<string>>(() => new Set());

  const monthlyState = !monthly
    ? null
    : monthly.status === "paused"
      ? "Подписка на паузе — ящик не откладываем"
      : monthly.skipMonth
        ? `В ${MONTHS_GENITIVE[Number(monthly.skipMonth.slice(5, 7)) - 1]} пропускаем — следующий ящик через месяц`
        : "Ящик откладываем 1-го числа · забрать в течение 7 дней";

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <Text as="h2" FONT="FIRM" className="text-xl leading-10.5 lg:text-2xl lg:leading-13">
        Мои дегустации
      </Text>
      {tastings.length ? (
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {tastings.map(({ tasting, kind, guests }) => {
            const past = tasting.status === "past";
            return (
              <article key={`${tasting.id}-${kind}`} className={cn("relative flex flex-col gap-1.5 rounded-[18px] bg-paper px-6.5 py-6 text-label-ink shadow-ticket", { "opacity-75": past })}>
                <span aria-hidden="true" className="absolute top-1/2 -left-2.5 size-5 -translate-y-1/2 rounded-full bg-cellar-950" />
                <span aria-hidden="true" className="absolute top-1/2 -right-2.5 size-5 -translate-y-1/2 rounded-full bg-cellar-950" />
                <span className="text-micro tracking-[0.12em] text-primary-500 uppercase">
                  {formatShortDate(tasting.startsAt)} · {tasting.startsAt.slice(11, 16)}
                </span>
                <Text as="h3" FONT="FIRM" className="text-lg leading-9">
                  {tasting.title}
                </Text>
                <span className="text-micro text-paper-ink">
                  {past ? "Прошла · " : kind === "waitlist" ? "Лист ожидания · " : ""}
                  {guests} {plural(guests, ["гость", "гостя", "гостей"])}
                </span>
                <Link to={past ? `${ROUTES.reviews}#${REVIEWS_ANCHORS.write}` : `${ROUTES.tastings}?month=${tasting.startsAt.slice(0, 7)}&day=${tasting.startsAt.slice(0, 10)}`} className="mt-1.5 text-sm text-primary-500 hover:text-primary-350">
                  {past ? "Написать письмо-отзыв →" : kind === "waitlist" ? "Сообщим о месте →" : "Подробнее →"}
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="m-0 text-sm text-neutral-350">
          Записей нет.{" "}
          <Link to={ROUTES.tastings} className="text-amber-200 hover:text-paper">
            Календарь дегустаций →
          </Link>
        </p>
      )}

      {monthly ? (
        <div className={cn(PANEL, "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between")}>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Набор месяца · «{MONTHLY_PLAN_TITLES[monthly.plan]}»</span>
            <span aria-live="polite" className="text-sm text-neutral-350">
              {monthlyState}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={monthlyUpdate.isLoading || monthly.status === "paused"}
              onClick={() => updateMonthly({ skipNext: !monthly.skipMonth })}
            >
              {monthly.skipMonth ? "Вернуть месяц" : "Пропустить месяц"}
            </Button>
            <Button variant="outline" size="sm" disabled={monthlyUpdate.isLoading} onClick={() => updateMonthly({ status: monthly.status === "paused" ? "active" : "paused" })}>
              {monthly.status === "paused" ? "Возобновить" : "Поставить на паузу"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-baseline justify-between gap-3">
        <Text as="h2" FONT="FIRM" className="text-xl leading-10.5 lg:text-2xl lg:leading-13">
          Избранное
        </Text>
        <Link to={ROUTES.shop} className="text-sm text-amber-200 hover:text-paper">
          Ещё на полках →
        </Link>
      </div>
      {favorites.length ? (
        <div className="relative overflow-hidden rounded-2xl px-4 pt-6 pb-4 lg:px-8">
          <img src={asset("/images/textures/shelf.webp")} alt="" className="absolute inset-x-0 bottom-0 h-10 w-full object-cover" />
          <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {favorites.map((wine) => {
              return (
                <article key={wine.id} className="relative flex flex-col items-center gap-2 text-center">
                  <Link to={ROUTES.wine(wine.slug)} aria-label={wine.name} className="flex h-40 items-end">
                    <img src={wine.image} alt="" className="h-38 w-auto drop-shadow-bottle" />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Убрать из избранного: ${wine.name}`}
                    onClick={() => removeFavorite(wine.id)}
                    className="absolute top-0 right-2 flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-cellar-950/70 text-primary-200 hover:bg-cellar-950"
                  >
                    <LuHeart aria-hidden="true" className="size-4.5 fill-current" />
                  </button>
                  <b className="text-sm leading-tight">{wine.name}</b>
                  <Button
                    size="sm"
                    disabled={added.has(wine.id)}
                    onClick={() => {
                      dispatch(cartActions.addItem({ wine }));
                      setAdded((prev) => new Set(prev).add(wine.id));
                    }}
                    className="h-9 px-4 text-micro"
                  >
                    {added.has(wine.id) ? "В корзине ✓" : "В корзину"}
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="m-0 text-sm text-neutral-350">Отмечайте вина сердечком на карточке — они соберутся здесь.</p>
      )}
    </div>
  );
};

export default FavoritesTab;
