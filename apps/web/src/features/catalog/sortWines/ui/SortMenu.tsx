import { useCallback, useId, useRef, useState, type FC } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useCatalogParams, WINE_SORT_OPTIONS } from "@/entities/wine";
import { cn } from "@/shared/lib/cn";
import { useDismiss } from "@/shared/lib/hooks/useDismiss";

interface IProps {
  /** desktop — справа в ряду фильтров (SortOpen), mobile — строка над полкой (MCategory) */
  variant?: "desktop" | "mobile";
  className?: string;
}

/** «Сначала: популярные ▾» — выбор сортировки, значение в URL (?sort=price_asc) */
const SortMenu: FC<IProps> = ({ variant = "desktop", className }) => {
  const { sort, setSort } = useCatalogParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const current = WINE_SORT_OPTIONS.find((option) => option.value === sort) ?? WINE_SORT_OPTIONS[0];
  const isDesktop = variant === "desktop";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={cn("inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent text-neutral-350", {
          "h-11 px-1.5 font-system text-[15px]": isDesktop,
          "h-8 px-0 font-regular text-micro": !isDesktop,
        })}
      >
        Сначала: <strong className="font-semibold text-white">{current.label}</strong>
        <LuChevronDown size={16} aria-hidden="true" className={cn("transition-transform duration-200", { "rotate-180": open })} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Сортировка"
          className={cn("absolute right-0 z-30 m-0 w-70 list-none rounded-[18px] border border-amber-200/30 bg-cellar-900 p-2.5 shadow-popover", {
            "top-13.5": isDesktop,
            "top-9": !isDesktop,
          })}
        >
          {WINE_SORT_OPTIONS.map((option) => {
            const selected = option.value === sort;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setSort(option.value);
                    close();
                  }}
                  className={cn("min-h-11 w-full cursor-pointer rounded-[10px] border-0 px-3.5 text-left font-regular text-sm", {
                    "bg-amber-350/18 text-amber-200": selected,
                    "bg-transparent text-white hover:bg-cellar-800": !selected,
                  })}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default SortMenu;
