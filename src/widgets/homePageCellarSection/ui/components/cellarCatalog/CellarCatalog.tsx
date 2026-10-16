import { formatCellarAge, formatWineOrigin, formatWinePrice, useGetWinesQuery, type WineSummary } from "@/entities/wine";
import { AddToCartButton } from "@/features/cart/addToCart";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/plural";
import { useId, useState, type FC } from "react";
import { LuArrowRight } from "react-icons/lu";
import { Link } from "react-router";
import { ButtonLink, Chip, Text } from "uikit;/";
import { CELLAR_CATALOG_LIMIT, CELLAR_TABS, type CellarTab } from "../../../model/content";

interface IProps {
  variant: "desktop" | "mobile";
}

const WineRow: FC<{ wine: WineSummary; variant: IProps["variant"] }> = ({ wine, variant }) => {
  if (variant === "mobile") {
    return (
      <li className="grid grid-cols-[44px_minmax(0,1fr)_40px] items-center gap-3 border-b border-cellar-800 px-1 py-2.5">
        <Link to={ROUTES.wine(wine.slug)} aria-label={wine.name} className="flex h-17.5 items-center justify-center">
          <img src={wine.image} alt="" loading="lazy" className="h-17 w-auto" />
        </Link>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[15px] font-semibold">{wine.name}</span>
          <span className="text-xs text-neutral-350">{formatCellarAge(wine.cellarYears)}</span>
          <span className="font-system text-micro font-semibold text-amber-200">{formatWinePrice(wine.price)}</span>
        </span>
        <AddToCartButton wine={wine} className="size-10" />
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)_auto_44px] items-center gap-4.5 rounded-[14px] px-3 py-2.5 transition-colors hover:bg-cellar-900">
      <Link
        to={ROUTES.wine(wine.slug)}
        aria-label={wine.name}
        className="relative h-24 w-16 overflow-hidden rounded-xl bg-cellar-800"
      >
        <img
          src={wine.image}
          alt=""
          loading="lazy"
          className="absolute top-1.5 left-0 h-21 w-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
        />
      </Link>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[19px] font-semibold text-white">{wine.name}</span>
        <span className="truncate text-micro text-neutral-350">{formatWineOrigin(wine)}</span>
        <span className="mt-1 self-start rounded-full border border-amber-200/45 px-2.5 py-0.75 font-system text-[13px] whitespace-nowrap text-amber-200">
          {formatCellarAge(wine.cellarYears)}
        </span>
      </span>
      <span className="font-system text-caption font-semibold whitespace-nowrap text-white">{formatWinePrice(wine.price)}</span>
      <AddToCartButton wine={wine} />
    </li>
  );
};

/** «Каталог погреба»: табы по типу вина, четыре самые выдержанные бутылки и «+» в корзину */
const CellarCatalog: FC<IProps> = ({ variant }) => {
  const isDesktop = variant === "desktop";
  const titleId = useId();
  const [tab, setTab] = useState<CellarTab>("all");
  const { data, isFetching, isError } = useGetWinesQuery({
    category: tab === "all" ? undefined : tab,
    sort: "vintage_asc",
    limit: CELLAR_CATALOG_LIMIT,
  });
  const wines = data?.items ?? [];
  const catalogLink = tab === "all" ? ROUTES.shop : ROUTES.shelf(tab);

  return (
    <div
      className={cn(
        "flex flex-col",
        isDesktop
          ? "gap-5.5 rounded-[22px] border border-amber-200/22 bg-cellar-950/78 p-9 shadow-panel backdrop-blur-[10px]"
          : "mx-4 mt-11 mb-12 rounded-[22px] border border-cellar-700 bg-cellar-950/85 px-4 pt-6 pb-5 backdrop-blur-[4px]"
      )}
    >
      <div className="flex flex-col gap-1">
        <Text as="h3" id={titleId} FONT="FIRM" className={isDesktop ? "text-title" : "mx-1 text-[28px] leading-10"}>
          {isDesktop ? "Каталог погреба" : "Вино, которое умеет ждать"}
        </Text>
        <Text COLOR="MUTED" className={isDesktop ? "text-sm" : "mx-1 text-micro"}>
          Бутылки, которые уже готовы к открытию
        </Text>
      </div>

      <div
        role="tablist"
        aria-label="Тип вина"
        className={cn("flex gap-2", isDesktop ? "flex-wrap" : "mt-4 overflow-x-auto [scrollbar-width:none]")}
      >
        {CELLAR_TABS.map(({ id, label }) => (
          <Chip
            key={id}
            role="tab"
            aria-selected={tab === id}
            active={tab === id}
            onClick={() => setTab(id)}
            className={cn(!isDesktop && "h-10 shrink-0 px-4 text-micro")}
          >
            {label}
          </Chip>
        ))}
      </div>

      <ul
        role="tabpanel"
        aria-labelledby={titleId}
        aria-busy={isFetching}
        className={cn(
          "m-0 flex list-none flex-col p-0 transition-opacity duration-200",
          isDesktop ? "min-h-[464px] gap-1" : "mt-3",
          isFetching && "opacity-60"
        )}
      >
        {wines.map((wine) => (
          <WineRow key={wine.id} wine={wine} variant={variant} />
        ))}
        {isError && <li className="py-6 text-sm text-neutral-350">Не получилось загрузить каталог — обновите страницу.</li>}
      </ul>

      <div
        className={cn(
          "flex items-center justify-between gap-4",
          isDesktop ? "border-t border-cellar-700 pt-4.5" : "mt-4 flex-col"
        )}
      >
        {isDesktop && data && (
          <span className="font-system text-micro text-neutral-350">
            Показано {wines.length} из {data.total} {plural(data.total, ["вина", "вин", "вин"])}
          </span>
        )}
        <ButtonLink to={catalogLink} size={isDesktop ? "sm" : "lg"} className={cn(isDesktop ? "h-12 px-6" : "h-13.5 w-full text-[17px]")}>
          Открыть весь каталог
          {isDesktop && <LuArrowRight size={18} aria-hidden="true" />}
        </ButtonLink>
      </div>
    </div>
  );
};

export default CellarCatalog;
