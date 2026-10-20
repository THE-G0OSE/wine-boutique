import type { FC, ReactNode } from "react";
import { Link } from "react-router";
import {
  formatDots,
  formatShortDate,
  formatShortMoment,
  type Loyalty,
  type MonthlySubscription,
  type MyCell,
  type MyReservation,
  type MyTasting,
} from "@/entities/account";
import { MONTHLY_PLAN_TITLES } from "@/entities/monthlyCrate";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/plural";
import { Button, Text } from "uikit;/";
import { PANEL, type AccountTab } from "../../model/tabs";
import QrCode from "./QrCode";

interface IProps {
  reservation: MyReservation | undefined;
  loyalty: Loyalty | undefined;
  cell: MyCell | null | undefined;
  tasting: MyTasting | undefined;
  monthly: MonthlySubscription | null | undefined;
  monthlyTheme: string | undefined;
  onOpen: (tab: AccountTab) => void;
}

const kicker = "text-xs tracking-[0.14em] text-cellar-400 uppercase lg:text-micro";
const link = "text-sm text-amber-200 hover:text-paper";

/** Обзор: бронь с QR, бонусы, ячейка, ближайшая дегустация, набор месяца — каждый блок ведёт в свою вкладку */
const OverviewTab: FC<IProps> = ({ reservation, loyalty, cell, tasting, monthly, monthlyTheme, onOpen }) => {
  const card = (children: ReactNode, className?: string) => <article className={cn(PANEL, "flex flex-col gap-2.5", className)}>{children}</article>;
  const readyCount = cell?.bottles.filter((bottle) => bottle.readyFrom === null).reduce((sum, bottle) => sum + bottle.qty, 0) ?? 0;
  const inCell = cell?.bottles.reduce((sum, bottle) => sum + bottle.qty, 0) ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      {reservation ? (
        <article className={cn(PANEL, "grid items-center gap-5 lg:col-span-2 lg:grid-cols-[1fr_170px] lg:gap-6")}>
          <div className="flex flex-col gap-2.5">
            <span className="self-start rounded-full bg-sage/20 px-3.5 py-1.5 text-micro text-sage">Ждёт вас в бутике</span>
            <Text as="h2" FONT="FIRM" className="text-lg leading-9 lg:text-xl lg:leading-10.5">
              Бронь № {reservation.number}
            </Text>
            <span className="text-sm text-neutral-350">{reservation.items.map((item) => `${item.name} ×${item.qty}`).join(" · ")}</span>
            <span className="text-micro text-cellar-400">
              {reservation.boutique.name} · забрать до {formatShortMoment(reservation.holdUntil)}
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-4">
              <Button size="md" onClick={() => onOpen("orders")}>
                Открыть бронь
              </Button>
              <Link to={ROUTES.pickup} className={link}>
                Как добраться
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <QrCode value={reservation.number} label={`QR-код брони ${reservation.number} — покажите на кассе`} className="w-36 lg:w-full" />
            <span className="text-center text-xs text-cellar-400">QR брони — покажите на кассе бутика</span>
          </div>
        </article>
      ) : (
        card(
          <>
            <span className={kicker}>Брони</span>
            <Text as="h2" FONT="FIRM" className="text-lg leading-9">
              Сейчас ничего не ждёт
            </Text>
            <span className="text-sm text-neutral-350">Положите бутылки в корзину — отложим их на ваше имя.</span>
            <Link to={ROUTES.shop} className={link}>
              К полкам →
            </Link>
          </>,
          "lg:col-span-2"
        )
      )}

      {card(
        <>
          <span className={kicker}>Бонусы</span>
          <span className="font-system text-[40px] leading-none font-semibold text-amber-200">{loyalty ? new Intl.NumberFormat("ru-RU").format(loyalty.balance) : "—"}</span>
          <span className="text-micro text-neutral-350">1 бонус = 1 ₽ при оплате в бутике, до 30% чека</span>
          <Button variant="outline" size="sm" onClick={() => onOpen("bonus")} className="mt-auto self-start">
            История начислений
          </Button>
        </>
      )}

      {card(
        cell ? (
          <>
            <span className={kicker}>Моя ячейка</span>
            <Text as="h2" FONT="FIRM" className="text-lg leading-9">
              № {cell.number} · {inCell} из {cell.capacity}
            </Text>
            <span className="text-micro text-neutral-350">Хранение оплачено до {formatDots(cell.paidUntil)}</span>
            {readyCount ? (
              <span className="text-micro text-sage">
                {readyCount} {plural(readyCount, ["бутылка уже готова", "бутылки уже готовы", "бутылок уже готовы"])} к открытию
              </span>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => onOpen("cell")} className="mt-auto self-start">
              Открыть опись
            </Button>
          </>
        ) : (
          <>
            <span className={kicker}>Моя ячейка</span>
            <span className="text-sm text-neutral-350">Ячейки пока нет — храните бутылки у нас, под землёй.</span>
            <Link to={ROUTES.cellar} className={cn(link, "mt-auto")}>
              Выбрать ячейку →
            </Link>
          </>
        )
      )}

      {card(
        tasting ? (
          <>
            <span className={kicker}>Ближайшая дегустация</span>
            <Text as="h2" FONT="FIRM" className="text-lg leading-9">
              {tasting.tasting.title}
            </Text>
            <span className="text-micro text-neutral-350">
              {formatShortDate(tasting.tasting.startsAt)}, {tasting.tasting.startsAt.slice(11, 16)} · {tasting.guests}{" "}
              {plural(tasting.guests, ["гость", "гостя", "гостей"])}
              {tasting.kind === "waitlist" ? " · лист ожидания" : ""}
            </span>
            <Button variant="outline" size="sm" onClick={() => onOpen("favorites")} className="mt-auto self-start">
              Мои записи
            </Button>
          </>
        ) : (
          <>
            <span className={kicker}>Дегустации</span>
            <span className="text-sm text-neutral-350">Записей нет — до 12 гостей за столом, места быстро кончаются.</span>
            <Link to={ROUTES.tastings} className={cn(link, "mt-auto")}>
              Календарь →
            </Link>
          </>
        )
      )}

      {card(
        <>
          <span className={kicker}>Набор месяца</span>
          {monthly ? (
            <>
              <Text as="h2" FONT="FIRM" className="text-lg leading-9">
                {monthlyTheme ? `«${monthlyTheme}»` : MONTHLY_PLAN_TITLES[monthly.plan]}
              </Text>
              <span className="text-micro text-neutral-350">
                Ящик «{MONTHLY_PLAN_TITLES[monthly.plan]}» {monthly.status === "paused" ? "на паузе" : "откладываем с 1-го числа"}
              </span>
            </>
          ) : (
            <span className="text-sm text-neutral-350">Подписки нет — ящик из вин на тему месяца ждёт в бутике.</span>
          )}
          <Link to={ROUTES.monthly} className={cn(link, "mt-auto")}>
            {monthly ? "Что внутри" : "Подписаться →"}
          </Link>
        </>
      )}

    </div>
  );
};

export default OverviewTab;
