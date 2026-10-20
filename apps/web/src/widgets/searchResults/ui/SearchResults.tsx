import { useRef, type FC } from "react";
import { LuWine } from "react-icons/lu";
import { Link, useSearchParams } from "react-router";
import {
  BottleCard,
  formatShelfMeta,
  ShelfBoard,
  ShelfGrid,
  useCatalogParams,
  useGetSearchSuggestionsQuery,
  useGetShelfWinesInfiniteQuery,
  useGetWinesQuery,
  type WineSummary,
} from "@/entities/wine";
import { AddToCartButton } from "@/features/cart/addToCart";
import { FilterBar } from "@/features/catalog/filterWines";
import { SearchBox, searchHref } from "@/features/catalog/searchWines";
import { SortMenu } from "@/features/catalog/sortWines";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { plural } from "@/shared/lib/plural";
import { Button, ButtonLink, Pagination, Text } from "uikit;/";

const PAGE_SIZE = 21;
/** На мобильных результаты — ленты по четыре бутылки (MSearch) */
const RAIL_SIZE = 4;

/** Подсказки пустого поиска (SearchEmpty): что попробовать вместо */
const TRY_INSTEAD = [
  { label: "Пино нуар", to: searchHref("пино нуар") },
  { label: "Бургундия", to: searchHref("Бургундия") },
  { label: "Игристые", to: ROUTES.shelf("sparkling") },
  { label: "Коллекция 10+ лет", to: ROUTES.shelf("aged") },
];

/** «Нашли 9 бутылок, 2 сорта и 2 региона» */
const foundText = (wines: number, grapes: number, regions: number) => {
  const parts = [`${wines} ${plural(wines, ["бутылку", "бутылки", "бутылок"])}`];
  if (grapes) parts.push(`${grapes} ${plural(grapes, ["сорт", "сорта", "сортов"])}`);
  if (regions) parts.push(`${regions} ${plural(regions, ["регион", "региона", "регионов"])}`);
  return `Нашли ${parts.length > 1 ? `${parts.slice(0, -1).join(", ")} и ${parts[parts.length - 1]}` : parts[0]}`;
};

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, row) => items.slice(row * size, row * size + size));

/** Поиск (/search?q=, макеты Search, SearchEmpty, MSearch): результаты на полках, фильтры, пустое состояние */
const SearchResults: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const [searchParams] = useSearchParams();
  const params = useCatalogParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const q = (searchParams.get("q") ?? "").trim();
  const listArgs = { ...params.filter, q: q || undefined, sort: params.sort };

  const desktop = useGetWinesQuery({ ...listArgs, limit: PAGE_SIZE, offset: (params.page - 1) * PAGE_SIZE }, { skip: !q || !isDesktop });
  const mobile = useGetShelfWinesInfiniteQuery(listArgs, { skip: !q || isDesktop });
  const { data: suggestions } = useGetSearchSuggestionsQuery(q, { skip: q.length < 2 });

  const wines = isDesktop ? (desktop.data?.items ?? []) : (mobile.data?.pages.flatMap((page) => page.items) ?? []);
  const total = isDesktop ? desktop.data?.total : mobile.data?.pages[0]?.total;
  const pages = total === undefined ? 0 : Math.ceil(total / PAGE_SIZE);
  const empty = Boolean(q) && total === 0 && params.activeCount === 0;
  const filteredOut = Boolean(q) && total === 0 && params.activeCount > 0;

  const heading = !q ? "Поиск по магазину" : empty ? "Ничего не нашлось" : `Результаты: «${q}»`;
  const sub = !q
    ? "Сорт, регион, страна или винодельня — найдём на полках"
    : empty
      ? `По запросу «${q}» ничего нет`
      : total === undefined
        ? ""
        : isDesktop
          ? foundText(total, suggestions?.grapes.length ?? 0, suggestions?.regions.length ?? 0)
          : foundText(total, 0, 0);

  const renderAction = (wine: WineSummary, variant: "desktop" | "mobile") => (
    <AddToCartButton wine={wine} className={cn({ "size-9": variant === "mobile" })} />
  );

  const emptyState = (
    <div
      className={cn("mx-auto flex flex-col items-center gap-4.5 rounded-[28px] border border-cellar-700 bg-cellar-950/82 text-center", {
        "mt-15 w-225 px-16 py-14": isDesktop,
        "mx-5 mt-8 px-6 py-10": !isDesktop,
      })}
    >
      <LuWine size={isDesktop ? 72 : 56} strokeWidth={1.2} aria-hidden="true" className="text-amber-200" />
      <Text as="h2" FONT="FIRM" className={cn({ "text-title leading-15": isDesktop, "text-[28px] leading-10": !isDesktop })}>
        Такой бутылки на полках нет
      </Text>
      <Text COLOR="MUTED" className={cn({ "text-[19px] leading-[1.55]": isDesktop, "text-sm": !isDesktop })}>
        Проверьте написание или поищите по сорту и региону. А можно спросить сомелье — найдём под заказ.
      </Text>
      <div className="flex flex-wrap justify-center gap-2.5">
        {TRY_INSTEAD.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="inline-flex h-11 items-center rounded-full border border-cellar-700 bg-cellar-900 px-5 text-[17px] text-white no-underline hover:border-amber-350"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <ButtonLink to={ROUTES.faq} size="lg" className="mt-2">
        Спросить сомелье
      </ButtonLink>
    </div>
  );

  const filteredOutState = (
    <div className="mt-10 flex flex-col items-start gap-4 px-5 lg:px-0">
      <Text COLOR="MUTED">Под выбранные фильтры ничего не нашлось.</Text>
      <Button variant="outline" onClick={params.clearAll}>
        Сбросить фильтры
      </Button>
    </div>
  );

  if (!isDesktop) {
    return (
      <div className="pb-10">
        <section className="flex flex-col gap-3 px-5">
          <Link to={ROUTES.shop} className="text-[15px] text-amber-200 no-underline">
            ← Все полки
          </Link>
          <SearchBox key={q} variant="mobile" initialQuery={q} />
          <Text as="h1" FONT="FIRM" className="mt-1.5 text-[32px] leading-11.5">
            {heading}
          </Text>
          <Text as="span" COLOR="MUTED" className="text-[15px]">
            {sub}
          </Text>
        </section>
        {empty ? emptyState : null}
        {filteredOut ? filteredOutState : null}
        {chunk(wines, RAIL_SIZE).map((rail, index) => (
          <div key={index} className={cn("relative h-95", { "mt-3.5": index === 0, "mt-2": index > 0 })}>
            <ShelfBoard className="inset-x-0 top-59 h-7.5 rounded-none" />
            <div className="absolute inset-0 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 [scrollbar-width:none]">
              {rail.map((wine) => (
                <BottleCard key={wine.id} wine={wine} variant="rail" meta={formatShelfMeta(wine, { compact: true })} action={renderAction(wine, "mobile")} />
              ))}
            </div>
          </div>
        ))}
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
      <section className="relative z-30 mx-auto flex max-w-480 flex-col gap-4.5 px-10 2xl:px-30">
        <Link to={ROUTES.shop} className="text-[17px] text-amber-200 no-underline hover:text-paper">
          ← Все полки
        </Link>
        <div className="flex items-end justify-between gap-15">
          <Text as="h1" FONT="FIRM" SIZE="DISPLAY_LG" className="text-shadow-2xl">
            {heading}
          </Text>
          <SearchBox key={q} initialQuery={q} className="w-130 shrink-0" />
        </div>
        <Text as="span" COLOR="MUTED">
          {sub}
        </Text>
      </section>

      {q && !empty ? <FilterBar end={<SortMenu />} className="mx-auto mt-6.5 max-w-480 px-10 2xl:px-30" /> : null}

      {empty ? emptyState : null}
      <div ref={gridRef} className="mx-auto max-w-480 scroll-mt-32 px-10 2xl:px-30">
        {filteredOut ? filteredOutState : null}
        <ShelfGrid wines={wines} variant="desktop" renderAction={renderAction} />
        <Pagination
          page={Math.min(params.page, Math.max(1, pages))}
          pages={pages}
          onChange={(page) => {
            params.setPage(page);
            gridRef.current?.scrollIntoView({ block: "start" });
          }}
          className="mt-14"
        />
      </div>
    </div>
  );
};

export default SearchResults;
