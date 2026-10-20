import { useCallback, useRef, useState, type FC, type ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useCatalogParams, type FilterGroup, type WineShelf } from "@/entities/wine";
import { cn } from "@/shared/lib/cn";
import { useDismiss } from "@/shared/lib/hooks/useDismiss";
import { plural } from "@/shared/lib/plural";
import { Button } from "uikit;/";
import { PRICE_LABEL, useFilterGroups, type FilterGroupView } from "../model/useFilterGroups";
import PriceFields from "./components/priceFields/PriceFields";

interface IProps {
  /** Полка, для которой считаются варианты; без неё — весь магазин */
  shelf?: WineShelf;
  /** Справа в ряду — сортировка (фича sortWines) */
  end?: ReactNode;
  className?: string;
}

type OpenPanel = FilterGroup | "price" | null;

const chipClass = (open: boolean, picked: boolean) =>
  cn(
    "inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-full border px-4.5 font-regular text-sm transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
    {
      "border-amber-350 bg-amber-350/18 text-white": open,
      "border-amber-350 bg-cellar-950/72 text-white": !open && picked,
      "border-cellar-700 bg-cellar-950/72 text-neutral-350 hover:border-amber-350/60": !open && !picked,
    }
  );

const panelClass =
  "absolute top-13.5 left-0 z-30 flex w-90 flex-col gap-1.5 rounded-[20px] border border-amber-200/30 bg-cellar-900 p-5 shadow-popover";

/**
 * Фильтры каталога на десктопе (макеты Filters, FilterOpen, PriceOpen): чипы групп с выпадающими панелями,
 * ниже — выбранные значения и «Сбросить всё». Выбор сразу попадает в URL и меняет полку.
 */
const FilterBar: FC<IProps> = ({ shelf, end, className }) => {
  const params = useCatalogParams();
  const { groups, total, isFetching } = useFilterGroups(params, shelf);
  const [open, setOpen] = useState<OpenPanel>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);
  useDismiss(rowRef, open !== null, close);

  const { filter } = params;
  const hasPrice = filter.priceMin !== undefined || filter.priceMax !== undefined;
  const shown = total === undefined ? "" : ` ${total}`;

  const footer = (onClear: () => void) => (
    <div className="mt-2.5 flex items-center justify-between border-t border-cellar-700 pt-3.5">
      <button type="button" onClick={onClear} className="h-11 cursor-pointer border-0 bg-transparent px-1.5 text-sm text-neutral-350 underline">
        Сбросить
      </button>
      <Button size="sm" onClick={close} aria-busy={isFetching || undefined}>
        Показать{shown}
      </Button>
    </div>
  );

  const groupPanel = (group: FilterGroupView) => (
    <div role="dialog" aria-label={group.label} className={panelClass}>
      {group.options.length === 0 ? <p className="m-0 px-2 py-2 text-sm text-neutral-350">Подходящих вариантов нет</p> : null}
      <div className="flex max-h-90 flex-col gap-1.5 overflow-y-auto">
        {group.options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={option.checked}
            onClick={() => params.toggle(group.id, option.value)}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-2 text-left font-regular text-caption text-white hover:bg-cellar-800"
          >
            <span
              aria-hidden="true"
              className={cn("flex size-6 shrink-0 items-center justify-center rounded-[7px] border-2 border-amber-350 text-micro font-bold text-black", {
                "bg-amber-350": option.checked,
              })}
            >
              {option.checked ? "✓" : ""}
            </span>
            <span className="flex-1">{option.label}</span>
            <span className="font-system text-micro text-cellar-400">{option.count}</span>
          </button>
        ))}
      </div>
      {footer(() => params.clear(group.id))}
    </div>
  );

  const chip = (id: Exclude<OpenPanel, null>, label: string, count: number, panel: ReactNode) => {
    const isOpen = open === id;
    return (
      <div key={id} className="relative">
        <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : id)} className={chipClass(isOpen, count > 0)}>
          {label}
          {count > 0 ? (
            <span className="h-5.5 min-w-5.5 rounded-full bg-amber-350 px-1.5 text-center font-system text-xs leading-5.5 font-semibold text-black">{count}</span>
          ) : null}
          <LuChevronDown size={16} aria-hidden="true" className={cn("transition-transform duration-200", { "rotate-180": isOpen })} />
        </button>
        {isOpen ? panel : null}
      </div>
    );
  };

  const [country, grape, age, volume] = ["country", "grape", "age", "volume"].map((id) => groups.find((group) => group.id === id));
  const groupChip = (group: FilterGroupView | undefined) =>
    group ? chip(group.id, group.label, group.options.filter((option) => option.checked).length, groupPanel(group)) : null;

  const pricePanel = (
    <div role="dialog" aria-label={PRICE_LABEL} className={panelClass}>
      <span className="text-[15px] text-neutral-350">Цена за бутылку, ₽</span>
      <div className="mt-1.5">
        <PriceFields variant="popover" min={filter.priceMin} max={filter.priceMax} onChange={params.setPrice} />
      </div>
      {footer(() => params.clear("price"))}
    </div>
  );

  const active = groups.flatMap((group) => group.options.filter((option) => option.checked).map((option) => ({ group: group.id, ...option })));
  const priceLabel = [filter.priceMin !== undefined && `от ${filter.priceMin}`, filter.priceMax !== undefined && `до ${filter.priceMax}`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("relative z-20", className)}>
      <div ref={rowRef} className="flex flex-wrap items-center gap-3">
        {groupChip(country)}
        {groupChip(grape)}
        {chip("price", PRICE_LABEL, hasPrice ? 1 : 0, pricePanel)}
        {groupChip(age)}
        {groupChip(volume)}
        {end ? <div className="ml-auto">{end}</div> : null}
      </div>

      {active.length > 0 || hasPrice ? (
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5" aria-label="Выбранные фильтры">
          {active.map((option) => (
            <button
              key={`${option.group}:${option.value}`}
              type="button"
              aria-label={`Убрать фильтр: ${option.label}`}
              onClick={() => params.toggle(option.group, option.value)}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border-0 bg-amber-350/20 pr-3 pl-4 font-regular text-[15px] text-amber-200"
            >
              {option.label} <span aria-hidden="true" className="text-caption">×</span>
            </button>
          ))}
          {hasPrice ? (
            <button
              type="button"
              aria-label={`Убрать фильтр: цена ${priceLabel} ₽`}
              onClick={() => params.clear("price")}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border-0 bg-amber-350/20 pr-3 pl-4 font-regular text-[15px] text-amber-200"
            >
              {priceLabel} ₽ <span aria-hidden="true" className="text-caption">×</span>
            </button>
          ) : null}
          <button type="button" onClick={params.clearAll} className="h-9 cursor-pointer border-0 bg-transparent px-2 text-[15px] text-neutral-350 underline">
            Сбросить всё
          </button>
          {total !== undefined ? (
            <span className="text-[15px] text-cellar-400" aria-live="polite">
              {total} {plural(total, ["бутылка", "бутылки", "бутылок"])}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default FilterBar;
