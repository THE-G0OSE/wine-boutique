import type { FC } from "react";
import { useCatalogParams, useGetShelvesQuery } from "@/entities/wine";
import { FilterBar, MobileFilters } from "@/features/catalog/filterWines";
import { SearchBox, SearchLink } from "@/features/catalog/searchWines";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { Button, Eyebrow, Text } from "uikit;/";
import ShelfRow from "./components/shelfRow/ShelfRow";

/** Сколько бутылок показывает полка магазина */
const SHELF_PREVIEW = 10;

/**
 * Магазин (/shop, макеты Shop и MShop): вступление с поиском, фильтры и четыре полки-карусели.
 * Фильтры сужают все полки сразу; «Вся полка →» открывает полку с теми же фильтрами.
 */
const ShopShelves: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const params = useCatalogParams();
  const { data: shelves, isError, refetch } = useGetShelvesQuery({ ...params.filter, limit: SHELF_PREVIEW });
  const variant = isDesktop ? "desktop" : "mobile";
  const nothing = shelves !== undefined && shelves.every((shelf) => shelf.total === 0);

  return (
    <div className="pb-10 lg:pb-30">
      {isDesktop ? (
        <section className="relative z-30 mx-auto flex max-w-480 items-end justify-between gap-15 px-10 2xl:px-30">
          <div className="flex max-w-205 flex-col gap-3.5">
            <Eyebrow>Винная лавка • Wine shop</Eyebrow>
            <Text as="h1" FONT="FIRM" SIZE="FIRM" className="text-shadow-2xl">
              Наши полки
            </Text>
            <Text COLOR="MUTED">Каждая бутылка проверена сомелье и имеет подтверждённое происхождение. Листайте полки, как в настоящей лавке.</Text>
          </div>
          <SearchBox className="w-130 shrink-0" />
        </section>
      ) : (
        <section className="flex flex-col gap-2.5 px-5">
          <Eyebrow size="sm">Винная лавка</Eyebrow>
          <Text as="h1" FONT="FIRM" SIZE="TITLE" className="leading-15 text-shadow-lg">
            Наши полки
          </Text>
          <Text COLOR="MUTED" SIZE="SYSTEM" className="leading-[1.55]">
            Листайте полки пальцем, как в настоящей лавке.
          </Text>
          <SearchLink className="mt-1.5" />
        </section>
      )}

      {isDesktop ? <FilterBar className="mx-auto mt-9 max-w-480 px-10 2xl:px-30" /> : <MobileFilters className="mt-4" />}

      {isError ? (
        <div className="mx-5 mt-10 flex flex-col items-start gap-4 lg:mx-auto lg:max-w-480 lg:px-10 2xl:px-30">
          <Text COLOR="MUTED">Не удалось открыть полки — попробуйте ещё раз.</Text>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить
          </Button>
        </div>
      ) : null}

      {nothing ? (
        <div className="mx-5 mt-10 flex flex-col items-start gap-4 lg:mx-auto lg:max-w-480 lg:px-10 2xl:px-30">
          <Text COLOR="MUTED">Под выбранные фильтры бутылок нет.</Text>
          <Button variant="outline" onClick={params.clearAll}>
            Сбросить фильтры
          </Button>
        </div>
      ) : (
        shelves?.map((shelf) => <ShelfRow key={shelf.id} shelf={shelf} variant={variant} filterSearch={params.filterSearch} />)
      )}
    </div>
  );
};

export default ShopShelves;
