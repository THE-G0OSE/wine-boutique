import { useState, type FC } from "react";
import { Link } from "react-router";
import { formatDots, formatShortMoment, type BonusEntry, type MyReservation } from "@/entities/account";
import { cartActions } from "@/entities/cart";
import { useLazyGetWineQuery } from "@/entities/wine";
import { useCancelMyReservationMutation, useExtendMyReservationMutation } from "@/features/account/manageReservation";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/formatPrice";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { Button, Text } from "uikit;/";
import { PANEL } from "../../model/tabs";
import QrCode from "./QrCode";

interface IProps {
  active: MyReservation[];
  history: MyReservation[];
  bonuses: BonusEntry[];
}

const STATUS = {
  active: { text: "Ждёт вас", className: "bg-sage/20 text-sage" },
  completed: { text: "Выдана", className: "bg-cellar-800 text-neutral-350" },
  cancelled: { text: "Отменена", className: "bg-primary-500/20 text-note-pink" },
  expired: { text: "Срок вышел", className: "bg-cellar-800 text-cellar-400" },
};

const PERIODS = [
  { id: "year", title: "Этот год" },
  { id: "last", title: "Прошлый год" },
  { id: "all", title: "Всё время" },
] as const;

const total = (reservation: MyReservation) => (reservation.total === null ? "[сумма] ₽" : formatPrice(reservation.total));

/** Брони и заказы: активные с QR, продлением и отменой; история выданных с бонусами и «Повторить» в корзину */
const OrdersTab: FC<IProps> = ({ active, history, bonuses }) => {
  const dispatch = useAppDispatch();
  const [extend, extending] = useExtendMyReservationMutation();
  const [cancel, cancelling] = useCancelMyReservationMutation();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("all");
  const [repeated, setRepeated] = useState<Set<string>>(() => new Set());
  const thisYear = new Date().getFullYear();
  const error = extending.error ?? cancelling.error;

  const visible = history.filter((reservation) => {
    const year = Number(reservation.pickupAt.slice(0, 4));
    return period === "all" || (period === "year" ? year === thisYear : year === thisYear - 1);
  });
  const bonusOf = (reservation: MyReservation) => bonuses.find((entry) => entry.amount > 0 && entry.title.endsWith(reservation.number))?.amount;

  const [loadWine] = useLazyGetWineQuery();
  // Повторить — те же бутылки в корзину; вина берём с полки (цены и наличие — сегодняшние)
  const repeat = async (reservation: MyReservation) => {
    for (const item of reservation.items) {
      const wine = await loadWine(item.slug, true).unwrap().catch(() => null);
      if (wine) dispatch(cartActions.addItem({ wine, qty: item.qty }));
    }
    setRepeated((prev) => new Set(prev).add(reservation.id));
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <Text as="h2" FONT="FIRM" className="text-xl leading-10.5 lg:text-2xl lg:leading-13">
        Активные брони
      </Text>
      {active.length === 0 ? (
        <p className="m-0 text-sm text-neutral-350">
          Активных броней нет.{" "}
          <Link to={ROUTES.shop} className="text-amber-200 hover:text-paper">
            К полкам →
          </Link>
        </p>
      ) : null}
      {active.map((reservation) => (
        <article key={reservation.id} className={cn(PANEL, "grid gap-6 lg:grid-cols-[1fr_220px] lg:gap-10")}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Text as="h3" FONT="FIRM" className="text-lg leading-9 lg:text-xl lg:leading-10.5">
                {reservation.number}
              </Text>
              <span className={cn("rounded-full px-3 py-1 text-xs lg:text-[13px]", STATUS.active.className)}>{reservation.extended ? "Продлена" : STATUS.active.text}</span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {reservation.items.map((item) => (
                <li key={item.wineId} className="flex items-center gap-3.5">
                  <img src={item.image} alt="" className="h-14 w-auto" />
                  <span className="flex flex-col">
                    <b className="font-semibold">{item.name}</b>
                    <span className="text-micro text-neutral-350">
                      ×{item.qty} · {item.price === null ? "[цена] ₽" : formatPrice(item.price)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-3 gap-3 border-t border-cellar-700 pt-3.5 text-micro text-neutral-350">
              <span>
                Бутик
                <br />
                <b className="text-white">{reservation.boutique.name}</b>
              </span>
              <span>
                Забрать до
                <br />
                <b className="text-white">{formatShortMoment(reservation.holdUntil)}</b>
              </span>
              <span>
                Итого
                <br />
                <b className="text-white">{total(reservation)}</b>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="md" disabled={reservation.extended || extending.isLoading} onClick={() => extend(reservation.id)}>
                {reservation.extended ? "Продлено на 3 дня ✓" : "Продлить на 3 дня"}
              </Button>
              <Link to={ROUTES.pickup} className="text-sm text-amber-200 hover:text-paper">
                Маршрут до бутика
              </Link>
              <Button variant="link" disabled={cancelling.isLoading} onClick={() => cancel(reservation.id)} className="ml-auto text-sm text-neutral-350">
                Отменить бронь
              </Button>
            </div>
            {error ? (
              <Text role="alert" SIZE="SYSTEM" className="text-error">
                {isApiError(error) ? error.data.message : "Не получилось — попробуйте ещё раз"}
              </Text>
            ) : null}
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <QrCode value={reservation.number} label={`QR-код брони ${reservation.number}`} className="w-44 lg:w-full" />
            <span className="text-center text-xs text-cellar-400">Покажите код и паспорт на кассе</span>
          </div>
        </article>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text as="h2" FONT="FIRM" className="text-xl leading-10.5 lg:text-2xl lg:leading-13">
          История покупок
        </Text>
        <div role="group" aria-label="Период" className="flex gap-2">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === period}
              onClick={() => setPeriod(item.id)}
              className={cn("h-10 cursor-pointer rounded-full border px-4 text-micro transition-colors", {
                "border-amber-350 bg-amber-350/20 text-amber-200": item.id === period,
                "border-cellar-700 bg-cellar-950 text-white hover:border-amber-350/60": item.id !== period,
              })}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? <p className="m-0 text-sm text-neutral-350">За этот период покупок нет.</p> : null}
      <div role="table" aria-label="История покупок" className="flex flex-col">
        <div role="row" className="hidden grid-cols-[110px_120px_minmax(0,1fr)_120px_90px_130px] gap-4 border-b border-cellar-700 pb-2.5 text-xs tracking-[0.1em] text-cellar-400 uppercase lg:grid">
          <span role="columnheader">Дата</span>
          <span role="columnheader">Номер</span>
          <span role="columnheader">Бутылки</span>
          <span role="columnheader">Сумма</span>
          <span role="columnheader">Бонусы</span>
          <span role="columnheader" />
        </div>
        {visible.map((reservation) => {
          const bonus = bonusOf(reservation);
          return (
            <div
              key={reservation.id}
              role="row"
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-cellar-800 py-3.5 text-sm lg:grid-cols-[110px_120px_minmax(0,1fr)_120px_90px_130px]"
            >
              <span role="cell" className="text-neutral-350">
                {formatDots(reservation.pickupAt)}
              </span>
              <span role="cell" className="font-system max-lg:text-right">
                {reservation.number}
              </span>
              <span role="cell" className="col-span-2 lg:col-span-1">
                {reservation.items.map((item) => `${item.name}${item.qty > 1 ? ` ×${item.qty}` : ""}`).join(" · ")}
                {reservation.status !== "completed" ? <span className="text-cellar-400"> · {STATUS[reservation.status].text.toLowerCase()}</span> : null}
              </span>
              <span role="cell">{total(reservation)}</span>
              <span role="cell" className="text-sage max-lg:text-right">
                {bonus ? `+${bonus}` : "—"}
              </span>
              <span role="cell" className="col-span-2 lg:col-span-1">
                <Button variant="outline" size="sm" disabled={repeated.has(reservation.id)} onClick={() => repeat(reservation)} className="h-9 px-4">
                  {repeated.has(reservation.id) ? "В корзине ✓" : "Повторить"}
                </Button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersTab;
