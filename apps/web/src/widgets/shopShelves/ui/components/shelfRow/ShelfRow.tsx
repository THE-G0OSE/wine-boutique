import { useEffect, useId, type FC } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Link } from "react-router";
import { BottleCard, formatShelfMeta, ShelfBoard, ShelfPlaque, type Shelf } from "@/entities/wine";
import { AddToCartButton } from "@/features/cart/addToCart";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { Text } from "uikit;/";
import { useTrackScroll } from "../../../model/useTrackScroll";

interface IProps {
  shelf: Shelf;
  variant: "desktop" | "mobile";
  /** Фильтры магазина — с ними же открывается вся полка */
  filterSearch: string;
}

const arrowClass = (enabled: boolean) =>
  cn(
    "absolute top-35 z-10 flex size-14 items-center justify-center rounded-full border border-amber-200/35 bg-cellar-950/80 p-0 text-white shadow-tag transition-opacity",
    "focus-visible:outline-2 focus-visible:outline-amber-200",
    { "cursor-pointer opacity-100": enabled, "cursor-default opacity-35": !enabled }
  );

/** Одна полка магазина: табличка, «Вся полка →» и ряд бутылок на доске (Shop / MShop) */
const ShelfRow: FC<IProps> = ({ shelf, variant, filterSearch }) => {
  const titleId = useId();
  const track = useTrackScroll<HTMLDivElement>();
  const isDesktop = variant === "desktop";
  const { measure } = track;
  useEffect(measure, [measure, shelf.wines.length]);

  const header = (
    <div className={cn("flex items-center justify-between", { "mx-auto max-w-480 px-10 2xl:px-30": isDesktop, "px-5": !isDesktop })}>
      <div className="flex items-center gap-5">
        <ShelfPlaque as="h2" id={titleId} size={isDesktop ? "lg" : "sm"}>
          {shelf.title}
        </ShelfPlaque>
        {isDesktop ? (
          <Text as="span" COLOR="MUTED" className="text-[17px]">
            {shelf.note}
          </Text>
        ) : null}
      </div>
      <Link to={`${ROUTES.shelf(shelf.id)}${filterSearch}`} className={cn("font-semibold text-amber-200 no-underline hover:text-paper", { "text-[17px]": isDesktop, "text-[15px]": !isDesktop })}>
        Вся полка →
      </Link>
    </div>
  );

  const cards = shelf.wines.map((wine, index) => (
    <BottleCard
      key={wine.id}
      wine={wine}
      variant={isDesktop ? "shelf" : "rail"}
      meta={formatShelfMeta(wine, { shelf: shelf.id, compact: !isDesktop })}
      tilt={index % 2 ? "right" : "left"}
      action={<AddToCartButton wine={wine} className={cn({ "size-9": !isDesktop })} />}
    />
  ));

  if (shelf.wines.length === 0) {
    return (
      <section aria-labelledby={titleId} className={cn({ "mt-16": isDesktop, "mt-7.5": !isDesktop })}>
        {header}
        <Text COLOR="MUTED" className={cn("mt-4 text-sm", { "mx-auto max-w-480 px-10 2xl:px-30": isDesktop, "px-5": !isDesktop })}>
          Под выбранные фильтры на этой полке бутылок нет.
        </Text>
      </section>
    );
  }

  if (!isDesktop) {
    return (
      <section aria-labelledby={titleId} className="mt-7.5">
        {header}
        <div className="relative mt-3 h-95">
          <ShelfBoard className="inset-x-0 top-59 h-7.5 rounded-none" />
          <div className="absolute inset-0 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 [scrollbar-width:none]">{cards}</div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby={titleId} className="relative mt-16">
      {header}
      <div className="relative mt-5">
        <button type="button" aria-label={`Листать полку «${shelf.title}» назад`} disabled={!track.canPrev} onClick={track.prev} className={cn(arrowClass(track.canPrev), "left-3 2xl:left-11")}>
          <LuChevronLeft size={26} aria-hidden="true" />
        </button>
        <button type="button" aria-label={`Листать полку «${shelf.title}» вперёд`} disabled={!track.canNext} onClick={track.next} className={cn(arrowClass(track.canNext), "right-3 2xl:right-11")}>
          <LuChevronRight size={26} aria-hidden="true" />
        </button>
        <div className="mx-auto max-w-480 px-10 2xl:px-30">
          <div className="relative h-135 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_60px,black_calc(100%-60px),transparent)]">
            <ShelfBoard className="-inset-x-5 top-84 h-11" />
            <div ref={track.ref} className="absolute inset-0 flex gap-10 overflow-x-auto overflow-y-hidden px-10 [scrollbar-width:none]">
              {cards}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShelfRow;
