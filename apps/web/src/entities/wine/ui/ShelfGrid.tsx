import type { FC, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useElementSize } from "@/shared/lib/hooks/useElementSize";
import { formatShelfMeta } from "../model/lib/format";
import type { WineShelf, WineSummary } from "../model/types";
import BottleCard from "./BottleCard";
import ShelfBoard from "./ShelfBoard";

interface IProps {
  wines: WineSummary[];
  variant: "desktop" | "mobile";
  /** Полка, с которой показаны вина (подпись на бирке у «10+ лет») */
  shelf?: WineShelf;
  /** Кнопка «в корзину» для бутылки — из слоя features */
  renderAction?: (wine: WineSummary, variant: "desktop" | "mobile") => ReactNode;
  className?: string;
}

const CARD_WIDTH = 190;
const MIN_GAP = 30;
const MAX_COLUMNS = 7;

/** Сколько бутылок встанет на доску: 7 на 1920, меньше на узких экранах */
const columnsFor = (width: number) => Math.max(2, Math.min(MAX_COLUMNS, Math.floor((width + MIN_GAP) / (CARD_WIDTH + MIN_GAP))));

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, row) => items.slice(row * size, row * size + size));

/**
 * Вина рядами на досках (Category, Search): на десктопе по 7 в ряд с поправкой на ширину экрана,
 * на мобильных — по два (MCategory)
 */
const ShelfGrid: FC<IProps> = ({ wines, variant, shelf, renderAction, className }) => {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const isDesktop = variant === "desktop";
  const columns = isDesktop ? columnsFor(Math.max(0, width - 40)) : 2;

  return (
    <div ref={ref} className={className}>
      {chunk(wines, columns).map((row, rowIndex) => (
        <div key={rowIndex} className={cn("relative", { "mt-7 h-130": isDesktop, "mt-4.5 h-82.5": !isDesktop })}>
          <ShelfBoard className={cn({ "-inset-x-5 top-84 h-11": isDesktop, "inset-x-0 top-53.5 h-6.5 rounded-none": !isDesktop })} />
          <ul
            role="list"
            className={cn("absolute inset-0 m-0 grid list-none p-0", {
              "justify-between px-5": isDesktop,
              "grid-cols-2 gap-3.5 px-5": !isDesktop,
            })}
            style={isDesktop ? { gridTemplateColumns: `repeat(${columns}, ${CARD_WIDTH}px)` } : undefined}
          >
            {row.map((wine, index) => (
              <li key={wine.id}>
                <BottleCard
                  wine={wine}
                  variant={isDesktop ? "shelf" : "grid"}
                  meta={isDesktop ? formatShelfMeta(wine, { shelf }) : undefined}
                  tilt={index % 2 ? "right" : "left"}
                  action={renderAction?.(wine, variant)}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ShelfGrid;
