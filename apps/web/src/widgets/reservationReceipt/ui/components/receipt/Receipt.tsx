import type { FC } from "react";
import { motion } from "motion/react";
import { formatZonedMoment } from "@/entities/boutique";
import type { Reservation } from "@/entities/reservation";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/formatPrice";
import { printIn } from "../../../model/animations";

interface IProps {
  reservation: Reservation;
  variant: "desktop" | "mobile";
}

const dateTime = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Зубчатый край чека сверху и снизу — маской из кругов */
const zigzag = {
  desktop:
    "[mask:radial-gradient(circle_10px_at_50%_0,transparent_9px,black_10px)_0_0/28px_51%_repeat-x,radial-gradient(circle_10px_at_50%_100%,transparent_9px,black_10px)_0_100%/28px_51%_repeat-x]",
  mobile:
    "[mask:radial-gradient(circle_8px_at_50%_0,transparent_7px,black_8px)_0_0/22px_51%_repeat-x,radial-gradient(circle_8px_at_50%_100%,transparent_7px,black_8px)_0_100%/22px_51%_repeat-x]",
};

const barcode =
  "bg-[repeating-linear-gradient(90deg,var(--color-label-ink)_0_3px,transparent_3px_5px,var(--color-label-ink)_5px_6px,transparent_6px_10px,var(--color-label-ink)_10px_14px,transparent_14px_16px,var(--color-label-ink)_16px_17px,transparent_17px_21px)]";

/**
 * Квитанция-чек о брони (Success): позиции, итог, бутик, время самовывоза, срок хранения, штамп «ЗАБРОНИРОВАНО».
 * Курсив чека — моноширинный системный: в Courier Prime из макета нет кириллицы.
 */
const Receipt: FC<IProps> = ({ reservation, variant }) => {
  const isDesktop = variant === "desktop";
  const total = reservation.total === null ? "[сумма] ₽" : formatPrice(reservation.total);
  const divider = <div aria-hidden="true" className="my-1.5 border-t-2 border-dashed border-label-ink" />;

  return (
    <motion.div
      variants={printIn}
      initial="hidden"
      animate="visible"
      className={cn("relative", { "rotate-[1.5deg] drop-shadow-showcase": isDesktop, "mx-5.5 rotate-[1.2deg] drop-shadow-showcase": !isDesktop })}
    >
      <div
        className={cn("relative bg-paper font-typewriter text-label-ink", zigzag[variant], {
          "px-13 pt-13 pb-14 text-caption leading-[1.4]": isDesktop,
          "px-6.5 pt-8.5 pb-9.5 text-[15px] leading-[1.4]": !isDesktop,
        })}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-b from-amber-500/8 via-transparent via-30% to-amber-500/12" />
        <div className={cn("relative flex flex-col", { "gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
          <div className={cn("text-center font-firm", { "text-[34px] leading-12": isDesktop, "text-lg": !isDesktop })}>Premium Wine Boutique</div>
          <div className="text-center font-bold tracking-[0.24em]">КВИТАНЦИЯ О БРОНИ</div>
          <div className={cn("text-center", { "text-sm": isDesktop, "text-[13px]": !isDesktop })}>
            № {reservation.number} · {dateTime.format(new Date(reservation.createdAt)).replace(",", "")}
          </div>
          {divider}
          {reservation.items.map((item) => (
            <div key={item.wineId} className="flex items-baseline gap-2">
              <span>
                {item.name} ×{item.qty}
              </span>
              <span aria-hidden="true" className="flex-1 -translate-y-1.25 border-b-2 border-dotted border-label-ink/50" />
              <span className="font-bold">{item.price === null ? "[цена]" : formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
          {divider}
          <div className={cn("flex justify-between font-bold", { "text-lg": isDesktop, "text-[19px]": !isDesktop })}>
            <span>ИТОГО</span>
            <span>{total}</span>
          </div>
          {isDesktop ? (
            <>
              <div className="text-sm">Оплата при получении</div>
              {divider}
              <dl className="m-0 grid grid-cols-[150px_1fr] gap-y-2 text-sm">
                <dt>БУТИК</dt>
                <dd className="m-0 font-bold">{reservation.boutique.name}</dd>
                <dt>АДРЕС</dt>
                <dd className="m-0">{reservation.boutique.address}</dd>
                <dt>ЗАБРАТЬ</dt>
                <dd className="m-0 font-bold">{formatZonedMoment(reservation.pickupAt)}</dd>
                <dt>ХРАНИМ ДО</dt>
                <dd className="m-0 font-bold">{formatZonedMoment(reservation.holdUntil)}</dd>
              </dl>
            </>
          ) : (
            <div className="text-[13px]">
              {reservation.boutique.name} · забрать {formatZonedMoment(reservation.pickupAt)}
              <br />
              Храним до {formatZonedMoment(reservation.holdUntil)}
            </div>
          )}
          <div aria-hidden="true" className={cn(barcode, { "mt-3.5 h-18": isDesktop, "h-14": !isDesktop })} />
          {isDesktop ? <div className="text-center text-[15px] tracking-[0.3em]">{reservation.number.replace("-", " ")}</div> : null}
          <div className={cn("text-center", { "text-[15px]": isDesktop, "text-xs": !isDesktop })}>
            Продажа только лицам старше 18 лет.
            {isDesktop ? (
              <>
                <br />
                Спасибо, что выбрали нас!
              </>
            ) : null}
          </div>
        </div>
        {isDesktop ? (
          <div
            aria-hidden="true"
            className="absolute right-10 bottom-52.5 flex size-37.5 -rotate-16 items-center justify-center rounded-full border-4 border-double border-primary-500/75 text-center text-caption leading-[1.2] font-bold text-primary-500/80"
          >
            ЗАБРОНИ-
            <br />
            РОВАНО
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default Receipt;
