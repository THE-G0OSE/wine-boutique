import { useCallback, useId, useMemo, useRef, useState, type FC, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router";
import { formatWinePrice, formatWineRegionGrapes, useGetSearchSuggestionsQuery } from "@/entities/wine";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { useDebouncedValue } from "@/shared/lib/hooks/useDebouncedValue";
import { useDismiss } from "@/shared/lib/hooks/useDismiss";
import { searchHref, SUGGEST_MIN_LENGTH } from "../model/searchHref";

interface IProps {
  /** desktop — поле с подсказками в панели (SearchBox), mobile — подсказки списком под полем (MSearch) */
  variant?: "desktop" | "mobile";
  /** Запрос, с которым открыта страница результатов */
  initialQuery?: string;
  className?: string;
}

interface SuggestOption {
  key: string;
  href: string;
  kind: "wine" | "grape" | "region" | "all";
}

const KIND_LABEL = { wine: "вино", grape: "сорт", region: "регион" } as const;

/**
 * Поиск по магазину: подсказки — вина, сорта и регионы (GET /search/suggest), Enter или «Все результаты» —
 * страница /search?q=. Клавиатура: ↑↓ по подсказкам, Enter — открыть, Esc — закрыть.
 */
const SearchBox: FC<IProps> = ({ variant = "desktop", initialQuery = "", className }) => {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLFormElement>(null);
  const inputId = useId();
  const listId = useId();
  const isDesktop = variant === "desktop";

  const query = useDebouncedValue(value.trim());
  const { data } = useGetSearchSuggestionsQuery(query, { skip: query.length < SUGGEST_MIN_LENGTH });
  const suggestions = query.length >= SUGGEST_MIN_LENGTH ? data : undefined;

  const options = useMemo<SuggestOption[]>(() => {
    if (!suggestions) return [];
    return [
      ...suggestions.wines.map((wine) => ({ key: `wine:${wine.slug}`, href: ROUTES.wine(wine.slug), kind: "wine" as const })),
      ...suggestions.grapes.map((grape) => ({ key: `grape:${grape}`, href: searchHref(grape), kind: "grape" as const })),
      ...suggestions.regions.map((region) => ({ key: `region:${region}`, href: searchHref(region), kind: "region" as const })),
      ...(isDesktop ? [{ key: "all", href: searchHref(query), kind: "all" as const }] : []),
    ];
  }, [suggestions, query, isDesktop]);

  const open = focused && value.trim().length >= SUGGEST_MIN_LENGTH && options.length > 0;
  const close = useCallback(() => {
    setFocused(false);
    setActive(-1);
  }, []);
  useDismiss(rootRef, open, close);

  const go = (href: string) => {
    close();
    navigate(href);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (open && active >= 0) go(options[active].href);
    else if (value.trim()) go(searchHref(value));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const last = options.length - 1;
      setActive((index) => {
        if (event.key === "ArrowDown") return index >= last ? 0 : index + 1;
        return index <= 0 ? last : index - 1;
      });
    }
  };

  const optionId = (index: number) => `${listId}-${index}`;
  const optionProps = (option: SuggestOption, index: number) => ({
    id: optionId(index),
    role: "option",
    "aria-selected": active === index,
    href: option.href,
    onMouseEnter: () => setActive(index),
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      go(option.href);
    },
  });

  const wineIndex = (i: number) => i;
  const grapeIndex = (i: number) => (suggestions?.wines.length ?? 0) + i;
  const regionIndex = (i: number) => grapeIndex(suggestions?.grapes.length ?? 0) + i;
  const allIndex = regionIndex(suggestions?.regions.length ?? 0);

  const sectionTitle = "px-2.5 py-1 text-xs tracking-[0.1em] text-cellar-400 uppercase";
  const termLink = (selected: boolean) =>
    cn("flex min-h-10 items-center rounded-[10px] px-2.5 text-sm text-white no-underline", { "bg-amber-350/14": selected });

  return (
    <form ref={rootRef} role="search" onSubmit={onSubmit} className={cn("relative z-30", className)}>
      <label htmlFor={inputId} className="sr-only">
        Поиск вина
      </label>
      <div className="relative">
        <LuSearch size={isDesktop ? 20 : 18} aria-hidden="true" className={cn("absolute top-1/2 -translate-y-1/2 text-neutral-350", { "left-5": isDesktop, "left-4.5": !isDesktop })} />
        <input
          id={inputId}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          value={value}
          placeholder="Сорт, регион или винодельня"
          onChange={(event) => {
            setValue(event.target.value);
            setFocused(true);
            setActive(-1);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-full border bg-cellar-950/85 font-system text-sm text-white outline-none transition-colors placeholder:text-cellar-400",
            "focus:border-amber-350 [&::-webkit-search-cancel-button]:hidden",
            { "h-13 pr-5 pl-13": isDesktop, "h-12.5 pr-4.5 pl-12": !isDesktop },
            { "border-amber-350": open || !isDesktop, "border-cellar-700": !open && isDesktop }
          )}
        />
      </div>

      {open && suggestions ? (
        isDesktop ? (
          <div id={listId} role="listbox" aria-label="Подсказки" className="absolute inset-x-0 top-15 flex flex-col gap-1 rounded-[22px] border border-amber-200/30 bg-cellar-900 p-3.5 shadow-popover">
            {suggestions.wines.length > 0 ? <span className={sectionTitle}>Вина</span> : null}
            {suggestions.wines.map((wine, i) => (
              <a
                key={wine.slug}
                {...optionProps(options[wineIndex(i)], wineIndex(i))}
                className={cn("grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl px-2.5 py-2 text-white no-underline", {
                  "bg-amber-350/14": active === wineIndex(i),
                })}
              >
                <span className="flex h-14 w-9 items-end justify-center rounded-lg bg-cellar-800">
                  <img src={wine.image} alt="" className="h-12.5 w-auto" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{wine.name}</span>
                  <span className="truncate text-xs text-neutral-350">{formatWineRegionGrapes(wine)}</span>
                </span>
                <span className="font-system text-micro text-amber-200">{formatWinePrice(wine.price)}</span>
              </a>
            ))}
            {suggestions.grapes.length > 0 || suggestions.regions.length > 0 ? (
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  {suggestions.grapes.length > 0 ? <span className={sectionTitle}>Сорта</span> : null}
                  {suggestions.grapes.map((grape, i) => (
                    <a key={grape} {...optionProps(options[grapeIndex(i)], grapeIndex(i))} className={termLink(active === grapeIndex(i))}>
                      {grape}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col gap-0.5">
                  {suggestions.regions.length > 0 ? <span className={sectionTitle}>Регионы</span> : null}
                  {suggestions.regions.map((region, i) => (
                    <a key={region} {...optionProps(options[regionIndex(i)], regionIndex(i))} className={termLink(active === regionIndex(i))}>
                      {region}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <a
              {...optionProps(options[allIndex], allIndex)}
              className={cn("mt-2 flex min-h-12 items-center justify-center rounded-b-xl border-t border-cellar-700 text-sm font-semibold text-amber-200 no-underline", {
                "bg-amber-350/14": active === allIndex,
              })}
            >
              Все результаты по «{value.trim()}» →
            </a>
          </div>
        ) : (
          <div id={listId} role="listbox" aria-label="Подсказки" className="mt-3 flex flex-col rounded-[18px] border border-amber-200/30 bg-cellar-900 p-2.5">
            {options.map((option, index) => {
              const label =
                option.kind === "wine"
                  ? suggestions.wines[index].name
                  : option.kind === "grape"
                    ? suggestions.grapes[index - grapeIndex(0)]
                    : suggestions.regions[index - regionIndex(0)];
              return (
                <a
                  key={option.key}
                  {...optionProps(option, index)}
                  className={cn("flex min-h-11.5 items-center justify-between rounded-[10px] px-2.5 text-[15px] text-white no-underline", {
                    "bg-amber-350/14": active === index,
                  })}
                >
                  <span>{label}</span>
                  <span className="text-xs text-cellar-400">{option.kind === "all" ? "" : KIND_LABEL[option.kind]}</span>
                </a>
              );
            })}
          </div>
        )
      ) : null}
    </form>
  );
};

export default SearchBox;
