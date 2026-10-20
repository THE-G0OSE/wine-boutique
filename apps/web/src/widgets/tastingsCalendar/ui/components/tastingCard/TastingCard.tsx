import type { FC, ReactNode } from "react";
import { SeatsMeter, TastingKindTag, tastingTime, type Tasting } from "@/entities/tasting";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/formatPrice";
import { Button, Text } from "uikit;/";

interface IProps {
  tasting: Tasting;
  variant: "desktop" | "mobile";
  /** Гость уже в листе ожидания этой дегустации */
  waited: boolean;
  onBook: () => void;
  onWait: () => void;
}

const priceOf = (tasting: Tasting) => (tasting.price === null ? "[цена] ₽" : formatPrice(tasting.price));

/**
 * Дегустация дня: на десктопе — блок панели с местами квадратиками, на мобильных — билет на бумаге
 * с вырезами по краям. Кнопка — по статусу: записаться, лист ожидания или «уже прошла».
 */
const TastingCard: FC<IProps> = ({ tasting, variant, waited, onBook, onWait }) => {
  const isDesktop = variant === "desktop";

  const action: ReactNode =
    tasting.status === "past" ? (
      <Text SIZE="SYSTEM" className={cn("text-center", { "text-neutral-350": isDesktop, "text-paper-ink": !isDesktop })}>
        Дегустация уже прошла
      </Text>
    ) : tasting.status === "open" ? (
      <Button size={isDesktop ? "xl" : "md"} onClick={onBook} className={cn("w-full", { "h-13.5 text-[17px]": !isDesktop })}>
        Записаться
      </Button>
    ) : (
      <Button
        size={isDesktop ? "xl" : "md"}
        variant={isDesktop ? "outline" : "primary"}
        disabled={waited}
        onClick={onWait}
        className={cn("w-full", {
          "border-amber-200/50 bg-cellar-950/60": isDesktop,
          "h-13.5 text-[17px]": !isDesktop,
          "disabled:bg-cellar-950/60 disabled:text-amber-200": isDesktop && waited,
          "disabled:bg-paper-300 disabled:text-label-ink": !isDesktop && waited,
        })}
      >
        {waited ? "Сообщим, если место освободится ✓" : isDesktop ? "Мест нет — в лист ожидания" : "В лист ожидания"}
      </Button>
    );

  if (!isDesktop) {
    const stat = (label: string, value: string) => (
      <span>
        {label}
        <br />
        <b className="text-sm text-label-ink">{value}</b>
      </span>
    );
    return (
      <article className="relative rounded-[20px] bg-paper p-5 text-label-ink shadow-ticket">
        <span aria-hidden="true" className="absolute top-24 -left-2.5 size-5 rounded-full bg-cellar-950" />
        <span aria-hidden="true" className="absolute top-24 -right-2.5 size-5 rounded-full bg-cellar-950" />
        <TastingKindTag kind={tasting.kind} size="sm" />
        <Text as="h3" FONT="FIRM" className="mt-2 text-[26px] leading-9">
          {tasting.title}
        </Text>
        <div className="mt-4 grid grid-cols-3 gap-1.5 border-t-2 border-dashed border-label-ink/35 pt-3 text-[13px] text-paper-ink">
          {stat("время", tastingTime(tasting.startsAt))}
          {stat("вин", String(tasting.wines))}
          {stat("места", tasting.seatsLeft ? `${tasting.seatsLeft} из ${tasting.capacity}` : "нет")}
        </div>
        <Text className="mt-2.5 text-micro leading-[1.5] text-neutral-650">{tasting.description}</Text>
        <div className="mt-3.5">{action}</div>
      </article>
    );
  }

  const stat = (label: string, value: string, accent = false) => (
    <div className="flex flex-col gap-0.5 rounded-[14px] bg-cellar-800 p-3">
      <span className="text-[13px] text-cellar-400">{label}</span>
      <span className={cn("font-system text-[17px] font-semibold", { "text-amber-200": accent })}>{value}</span>
    </div>
  );

  return (
    <article className="flex flex-col gap-3.5 border-b border-cellar-800 pb-4.5">
      <TastingKindTag kind={tasting.kind} />
      <Text as="h3" FONT="FIRM" className="text-[34px] leading-12">
        {tasting.title}
      </Text>
      <Text COLOR="MUTED" className="text-[17px] leading-[1.55]">
        {tasting.description}
      </Text>
      <div className="grid grid-cols-3 gap-2.5">
        {stat("время", tastingTime(tasting.startsAt))}
        {stat("вин в сете", String(tasting.wines))}
        {stat("за гостя", priceOf(tasting), true)}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[15px] text-neutral-350">Места:</span>
        <SeatsMeter capacity={tasting.capacity} seatsLeft={tasting.seatsLeft} />
      </div>
      <span className="text-[15px] text-neutral-350">Ведёт: {tasting.host}</span>
      {action}
    </article>
  );
};

export default TastingCard;
