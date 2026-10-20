import { useState, type FC } from "react";
import { LuStore } from "react-icons/lu";
import { Link } from "react-router";
import { CART_MAX_QTY } from "@/entities/cart";
import { formatWinePrice, SHELF_SHORT_LABELS, ShelfBoard, useGetShelvesQuery, useGetWineQuery, type WineDetails } from "@/entities/wine";
import { AddQtyToCartButton, ReserveNowLink } from "@/features/cart/addToCart";
import { CONTACTS } from "@/shared/config/contacts";
import { ROUTES } from "@/shared/config/routes";
import { isApiError } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Breadcrumbs, ButtonLink, QtyStepper, Text } from "uikit;/";
import RelatedWines from "./components/relatedWines/RelatedWines";
import TastePanels from "./components/tastePanels/TastePanels";
import WineLabel from "./components/wineLabel/WineLabel";

interface IProps {
  slug: string;
}

/** Бутылка под лампой на полке и бирки над ней (витрина карточки) */
const Showcase: FC<{ wine: WineDetails; variant: "desktop" | "mobile" }> = ({ wine, variant }) => {
  const isDesktop = variant === "desktop";
  return (
    <div className={cn("relative", { "h-220": isDesktop, "mt-1.5 h-117.5": !isDesktop })}>
      <div
        aria-hidden="true"
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-radial-[at_50%_30%] from-amber-200/32 via-amber-200/8 via-45% to-transparent to-70%",
          { "h-190 w-150 motion-safe:animate-breathe": isDesktop, "h-105 w-75": !isDesktop }
        )}
      />
      <div className={cn("absolute inset-x-0 top-0 flex items-end justify-center", { "h-178": isDesktop, "h-101": !isDesktop })}>
        <img
          src={wine.image}
          alt={`Бутылка ${wine.name}`}
          className={cn("w-auto drop-shadow-showcase", { "h-165": isDesktop, "h-95": !isDesktop })}
        />
      </div>
      <ShelfBoard className={cn({ "inset-x-0 top-177 h-14": isDesktop, "inset-x-0 top-100 h-8.5 rounded-none": !isDesktop })} />
      {isDesktop ? (
        <ul role="list" aria-label="О вине" className="absolute inset-x-0 top-198 m-0 flex list-none flex-wrap justify-center gap-3 p-0">
          {wine.badges.map((badge) => (
            <li key={badge} className="rounded-full border border-amber-200/40 bg-cellar-950/70 px-4 py-2 text-[15px] text-amber-200">
              {badge}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

/**
 * Карточка вина (/wine/:slug, макеты Product и MProduct): витрина, этикетка-паспорт, количество,
 * «В корзину» и «Забронировать», профиль вкуса, подача и «С этим вином берут»
 */
const WineCard: FC<IProps> = ({ slug }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { data: wine, error, isLoading } = useGetWineQuery(slug);
  const { data: shelves } = useGetShelvesQuery({ limit: 1 });
  const [qty, setQty] = useState(1);

  if (isLoading) return <div className="min-h-screen" aria-busy="true" />;

  if (!wine) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <div className="mx-5 flex flex-col items-start gap-5 pt-6 lg:mx-auto lg:max-w-480 lg:px-10 2xl:px-30">
        <Text as="h1" FONT="FIRM" className="text-title leading-15">
          {notFound ? "Такой бутылки на полках нет" : "Не удалось открыть карточку"}
        </Text>
        <Text COLOR="MUTED">{notFound ? "Возможно, её уже забрали. Посмотрите, что стоит рядом." : "Обновите страницу или загляните позже."}</Text>
        <ButtonLink to={ROUTES.shop}>К полкам</ButtonLink>
      </div>
    );
  }

  const shelfTitle = shelves?.find((shelf) => shelf.id === wine.shelf)?.title ?? SHELF_SHORT_LABELS[wine.shelf];
  const crumbs = [
    { label: "Магазин", to: ROUTES.shop },
    { label: shelfTitle, to: ROUTES.shelf(wine.shelf) },
    ...(isDesktop ? [{ label: wine.name }] : []),
  ];
  const availability = (
    <>
      В наличии в бутике {CONTACTS.address}. Бронь держим 3 дня, оплата при получении.{" "}
      <Link to={ROUTES.tastings} className="text-amber-200 no-underline hover:text-paper">
        Попробовать на дегустации →
      </Link>
    </>
  );

  if (!isDesktop) {
    return (
      <div>
        <Breadcrumbs size="sm" items={crumbs} className="px-5" />
        <Showcase wine={wine} variant="mobile" />
        <div className="mx-4 mt-1.5">
          <WineLabel wine={wine} variant="mobile" />
        </div>
        <Text COLOR="MUTED" SIZE="MICRO" className="mx-5 mt-4 leading-[1.5]">
          {availability}
        </Text>
        <TastePanels wine={wine} variant="mobile" />
        <RelatedWines wine={wine} variant="mobile" />
        {/* Цена и действия всегда под рукой (MProduct) */}
        <div className="sticky bottom-0 z-30 mt-7 grid grid-cols-[auto_1fr_1fr] items-center gap-2.5 border-t border-amber-200/25 bg-cellar-950/96 px-4 pt-3 pb-4.5 shadow-bar">
          <span className="flex flex-col">
            <span className="text-[11px] text-neutral-350">за бутылку</span>
            <span className="font-system text-caption font-semibold text-amber-200">{formatWinePrice(wine.price)}</span>
          </span>
          <AddQtyToCartButton wine={wine} qty={1} className="h-12.5 bg-transparent text-[15px]" />
          <ReserveNowLink wine={wine} className="h-12.5 px-3 text-[15px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-30">
      <div className="mx-auto max-w-480 px-10 2xl:px-30">
        <Breadcrumbs items={crumbs} />
      </div>
      <section className="mx-auto mt-3 grid max-w-480 grid-cols-[minmax(0,760px)_minmax(0,840px)] justify-between gap-10 px-10 2xl:px-30">
        <Showcase wine={wine} variant="desktop" />
        <div className="pt-2.5">
          <WineLabel wine={wine} variant="desktop" />
          <div className="mt-10 flex items-center gap-7">
            <div className="flex flex-col gap-0.5">
              <Text as="span" COLOR="MUTED" SIZE="SYSTEM">
                Цена за бутылку
              </Text>
              <span className="font-system text-3xl font-semibold text-amber-200">{formatWinePrice(wine.price)}</span>
            </div>
            <QtyStepper
              size="lg"
              value={qty}
              min={1}
              max={CART_MAX_QTY}
              onDecrement={() => setQty((value) => Math.max(1, value - 1))}
              onIncrement={() => setQty((value) => Math.min(CART_MAX_QTY, value + 1))}
              decrementLabel="Меньше"
              incrementLabel="Больше"
              className="ml-auto"
            />
          </div>
          <div className="mt-5.5 flex gap-4">
            <AddQtyToCartButton wine={wine} qty={qty} className="h-15 flex-1 text-md" />
            <ReserveNowLink wine={wine} qty={qty} className="flex-1 text-md" />
          </div>
          <div className="mt-5.5 flex items-start gap-3.5 text-sm leading-[1.5] text-neutral-350">
            <LuStore size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-200" />
            <span>{availability}</span>
          </div>
        </div>
      </section>
      <TastePanels wine={wine} variant="desktop" />
      <RelatedWines wine={wine} variant="desktop" />
    </div>
  );
};

export default WineCard;
