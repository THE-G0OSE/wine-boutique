import { useState, type FC } from "react";
import { LuSlidersHorizontal } from "react-icons/lu";
import { useCatalogParams, type WineShelf } from "@/entities/wine";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/plural";
import { Button, Drawer, Text } from "uikit;/";
import { PRICE_LABEL, useFilterGroups } from "../model/useFilterGroups";
import PriceFields from "./components/priceFields/PriceFields";

interface IProps {
  shelf?: WineShelf;
  className?: string;
}

/** Чипы в ряду открывают одну и ту же шторку — как в MShop */
const CHIP_LABELS = ["Страна", "Сорт", PRICE_LABEL, "Выдержка"];

/** Сколько вариантов группы видно сразу; остальные — по «Ещё N» (сортов в погребе несколько десятков) */
const VISIBLE_OPTIONS = 8;

/**
 * Фильтры на мобильных (MShop, MCategory): кнопка «Фильтры» со счётчиком и чипы групп в прокручиваемом ряду,
 * по нажатию — нижняя шторка с вариантами-пилюлями и ценой
 */
const MobileFilters: FC<IProps> = ({ shelf, className }) => {
  const params = useCatalogParams();
  const { groups, total, isFetching } = useFilterGroups(params, shelf);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const { filter } = params;

  const openSheet = () => setOpen(true);

  return (
    <>
      <div className={cn("flex gap-2 overflow-x-auto overflow-y-hidden px-5 [scrollbar-width:none]", className)}>
        <button
          type="button"
          onClick={openSheet}
          className="inline-flex h-10.5 shrink-0 items-center gap-2 rounded-full border border-amber-350 bg-amber-350/18 px-4 font-regular text-[15px] text-white"
        >
          <LuSlidersHorizontal size={16} aria-hidden="true" />
          Фильтры
          {params.activeCount > 0 ? (
            <span className="h-5 min-w-5 rounded-full bg-amber-350 px-1 text-center text-[11px] leading-5 text-black">{params.activeCount}</span>
          ) : null}
        </button>
        {CHIP_LABELS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={openSheet}
            className="h-10.5 shrink-0 rounded-full border border-cellar-700 bg-cellar-950/75 px-4 font-regular text-[15px] text-neutral-350"
          >
            {label} ▾
          </button>
        ))}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} side="bottom" label="Фильтры" closeLabel="Закрыть фильтры">
        <div className="overflow-y-auto px-5 pt-3 pb-6">
          <span aria-hidden="true" className="mx-auto block h-1.25 w-11 rounded-sm bg-cellar-700" />
          <div className="mt-3 flex items-baseline justify-between">
            <Text as="h2" FONT="FIRM" className="text-[28px] leading-10">
              Фильтры
            </Text>
            <button type="button" onClick={params.clearAll} className="h-10 border-0 bg-transparent text-micro text-neutral-350 underline">
              Сбросить
            </button>
          </div>

          {groups.map((group) => {
            const isExpanded = expanded.includes(group.id);
            // Выбранные варианты видны всегда, даже если в первые восемь не попали
            const visible = isExpanded
              ? group.options
              : group.options.filter((option, index) => index < VISIBLE_OPTIONS || option.checked);
            const hidden = group.options.length - visible.length;
            return (
            <fieldset key={group.id} className="m-0 mt-3.5 border-0 p-0">
              <legend className="p-0 text-sm font-semibold text-white">{group.label}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {visible.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={option.checked}
                    onClick={() => params.toggle(group.id, option.value)}
                    className={cn("h-10 rounded-full border px-3.5 font-regular text-micro", {
                      "border-amber-350 bg-amber-350/20 text-amber-200": option.checked,
                      "border-cellar-700 bg-cellar-950 text-white": !option.checked,
                    })}
                  >
                    {option.label}
                  </button>
                ))}
                {hidden > 0 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => [...prev, group.id])}
                    className="h-10 rounded-full border-0 bg-transparent px-2 font-regular text-micro text-amber-200 underline"
                  >
                    Ещё {hidden}
                  </button>
                ) : null}
              </div>
            </fieldset>
            );
          })}

          <div className="mt-4">
            <span className="text-sm font-semibold text-white">Цена, ₽</span>
            <div className="mt-2">
              <PriceFields variant="sheet" min={filter.priceMin} max={filter.priceMax} onChange={params.setPrice} />
            </div>
          </div>

          <Button size="lg" onClick={() => setOpen(false)} aria-busy={isFetching || undefined} className="mt-5 w-full">
            {total === undefined ? "Показать" : `Показать ${total} ${plural(total, ["бутылку", "бутылки", "бутылок"])}`}
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default MobileFilters;
