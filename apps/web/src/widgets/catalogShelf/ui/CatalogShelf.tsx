import { useRef, type FC } from "react";
import { Link } from "react-router";
import {
  SHELF_SHORT_LABELS,
  ShelfGrid,
  useCatalogParams,
  useGetShelfWinesInfiniteQuery,
  useGetShelvesQuery,
  useGetWinesQuery,
  WINE_SHELVES,
  type WineShelf,
} from "@/entities/wine";
import { AddToCartButton } from "@/features/cart/addToCart";
import { FilterBar, MobileFilters } from "@/features/catalog/filterWines";
import { SearchBox, SearchLink } from "@/features/catalog/searchWines";
import { SortMenu } from "@/features/catalog/sortWines";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { plural } from "@/shared/lib/plural";
import { Breadcrumbs, Button, Eyebrow, Pagination, Text } from "uikit;/";

interface IProps {
  shelf: WineShelf;
}

/** На десктопе страница — три доски по семь бутылок (макет Category) */
const PAGE_SIZE = 21;

const bottles = (n: number) => `${n} ${plural(n, ["бутылка", "бутылки", "бутылок"])}`;

/**
 * Полка магазина (/shop/:shelf, макеты Category и MCategory): крошки, вступление, табы полок,
 * фильтры и сортировка, вина на досках; на десктопе — страницы, на мобильных — «Показать ещё»
 */
const CatalogShelf: FC<IProps> = ({ shelf }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const params = useCatalogParams();
  const gridRef = useRef<HTMLDivElement>(null);
  // Названия и описания полок (без фильтров — сколько всего бутылок на полке)
  const { data: shelves } = useGetShelvesQuery({ limit: 1 });
  const meta = shelves?.find((item) => item.id === shelf);
  const listArgs = { shelf, ...params.filter, sort: params.sort };

  const desktop = useGetWinesQuery({ ...listArgs, limit: PAGE_SIZE, offset: (params.page - 1) * PAGE_SIZE }, { skip: !isDesktop });
  const mobile = useGetShelfWinesInfiniteQuery(listArgs, { skip: isDesktop });

  const wines = isDesktop ? (desktop.data?.items ?? []) : (mobile.data?.pages.flatMap((page) => page.items) ?? []);
  const total = isDesktop ? desktop.data?.total : mobile.data?.pages[0]?.total;
  const isError = isDesktop ? desktop.isError : mobile.isError;
  const pages = total === undefined ? 0 : Math.ceil(total / PAGE_SIZE);
  const title = meta?.title ?? SHELF_SHORT_LABELS[shelf];
  const renderAction = (wine: (typeof wines)[number], variant: "desktop" | "mobile") => (
    <AddToCartButton wine={wine} className={cn({ "size-9": variant === "mobile" })} />
  );

  const changePage = (page: number) => {
    params.setPage(page);
    gridRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const tabs = (
    <nav aria-label="Другие полки" className={cn("flex gap-2.5", { "mx-auto max-w-480 px-10 pt-7 2xl:px-30": isDesktop, "mt-3.5 gap-2 overflow-x-auto px-5 [scrollbar-width:none]": !isDesktop })}>
      {WINE_SHELVES.map((id) => {
        const current = id === shelf;
        const label = isDesktop ? (shelves?.find((item) => item.id === id)?.title ?? SHELF_SHORT_LABELS[id]) : SHELF_SHORT_LABELS[id];
        return (
          <Link
            key={id}
            to={`${ROUTES.shelf(id)}${params.filterSearch}`}
            aria-current={current ? "page" : undefined}
            className={cn("inline-flex shrink-0 items-center rounded-full border no-underline transition-colors", {
              "h-11 px-5 text-[17px]": isDesktop,
              "h-10 px-4 text-[15px]": !isDesktop,
              "border-amber-350 bg-amber-350/20 text-amber-200": current,
              "border-cellar-700 bg-cellar-950/72 text-white hover:border-amber-350/60": !current,
            })}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const state = isError ? (
    <Text COLOR="MUTED" className="mt-10 px-5 lg:px-0">
      Не удалось открыть полку — обновите страницу.
    </Text>
  ) : total === 0 ? (
    <div className="mt-10 flex flex-col items-start gap-4 px-5 lg:px-0">
      <Text COLOR="MUTED">Под выбранные фильтры бутылок на этой полке нет.</Text>
      <Button variant="outline" onClick={params.clearAll}>
        Сбросить фильтры
      </Button>
    </div>
  ) : null;

  if (!isDesktop) {
    return (
      <div className="pb-10">
        <Breadcrumbs size="sm" items={[{ label: "Магазин", to: ROUTES.shop }, { label: title }]} className="px-5" />
        <section className="flex flex-col gap-2.5 px-5 pt-3.5">
          <Eyebrow size="sm">{meta ? `Полка · ${bottles(meta.total)}` : "Полка"}</Eyebrow>
          <Text as="h1" FONT="FIRM" SIZE="TITLE" className="leading-15 text-shadow-lg">
            {title}
          </Text>
          <SearchLink className="mt-1.5" />
        </section>
        {tabs}
        <MobileFilters shelf={shelf} className="mt-2.5" />
        <div className="mt-2 flex items-center justify-between px-5 text-micro text-neutral-350">
          <span aria-live="polite">{total === undefined ? "" : `Показано ${wines.length} из ${total}`}</span>
          <SortMenu variant="mobile" />
        </div>
        {state}
        <ShelfGrid wines={wines} variant="mobile" shelf={shelf} renderAction={renderAction} />
        {mobile.hasNextPage ? (
          <Button
            variant="outline"
            size="lg"
            disabled={mobile.isFetchingNextPage}
            onClick={() => mobile.fetchNextPage()}
            className="mx-5 mt-7.5 w-[calc(100%-2.5rem)] border-amber-200/50 bg-cellar-950/60"
          >
            {mobile.isFetchingNextPage ? "Загружаем ещё…" : "Показать ещё"}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pb-30">
      <div className="mx-auto max-w-480 px-10 2xl:px-30">
        <Breadcrumbs items={[{ label: "Магазин", to: ROUTES.shop }, { label: title }]} />
      </div>
      <section className="relative z-30 mx-auto flex max-w-480 items-end justify-between gap-15 px-10 pt-6 2xl:px-30">
        <div className="flex flex-col gap-2.5">
          <Eyebrow labelClassName="text-[22px]">{meta ? `Полка · ${bottles(meta.total)}` : "Полка"}</Eyebrow>
          <Text as="h1" FONT="FIRM" SIZE="FIRM" className="text-shadow-2xl">
            {title}
          </Text>
          {meta ? (
            <Text COLOR="MUTED" className="max-w-190">
              {meta.description}
            </Text>
          ) : null}
        </div>
        <SearchBox className="w-130 shrink-0" />
      </section>
      {tabs}
      <FilterBar shelf={shelf} end={<SortMenu />} className="mx-auto mt-5.5 max-w-480 px-10 2xl:px-30" />

      <div ref={gridRef} className="mx-auto max-w-480 scroll-mt-32 px-10 2xl:px-30">
        {state}
        <ShelfGrid wines={wines} variant="desktop" shelf={shelf} renderAction={renderAction} />
        <Pagination page={Math.min(params.page, Math.max(1, pages))} pages={pages} onChange={changePage} className="mt-14" />
        {total ? (
          <Text COLOR="INHERIT" SIZE="SYSTEM" className="mt-4.5 text-center text-cellar-400" aria-live="polite">
            Показано {wines.length} из {total}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export default CatalogShelf;
