import type { FC, ReactNode } from "react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { BOTTLE_HEIGHT_CLASS } from "../model/lib/catalog";
import { formatWinePrice } from "../model/lib/format";
import type { WineSummary } from "../model/types";

export type BottleCardVariant = "shelf" | "rail" | "grid";

interface IProps {
  wine: WineSummary;
  /** shelf — десктопная полка (190×520), rail — мобильная лента (132×380), grid — мобильная сетка в два ряда */
  variant: BottleCardVariant;
  /** Подпись под названием (регион · сорта); в сетке не показывается */
  meta?: string;
  /** Кнопка «в корзину» — фича слоя features, сущность её только размещает */
  action?: ReactNode;
  /** Бирки висят чуть вкось: чётные — влево, нечётные — вправо */
  tilt?: "left" | "right";
  className?: string;
}

/**
 * Бутылка на полке с биркой: бутылка — ссылка на карточку, по наведению поднимается и светлеет,
 * бирка подсвечивается (макеты Shop, Category, Search и их мобильные версии)
 */
const BottleCard: FC<IProps> = ({ wine, variant, meta, action, tilt = "left", className }) => {
  const isShelf = variant === "shelf";
  const height = BOTTLE_HEIGHT_CLASS[wine.bottle] ?? BOTTLE_HEIGHT_CLASS.red;

  return (
    <article
      className={cn(
        "group relative shrink-0",
        { "h-130 w-47.5": isShelf, "h-95 w-33 snap-start": variant === "rail", "h-82.5": variant === "grid" },
        className
      )}
    >
      <Link
        to={ROUTES.wine(wine.slug)}
        aria-label={`Открыть карточку: ${wine.name}`}
        className={cn("absolute inset-x-0 top-0 flex items-end justify-center rounded-md", "focus-visible:outline-2 focus-visible:outline-amber-200", {
          "h-86.5": isShelf,
          "h-60.5": variant === "rail",
          "h-55": variant === "grid",
        })}
      >
        <img
          src={wine.image}
          alt=""
          loading="lazy"
          className={cn("block w-auto object-contain drop-shadow-bottle", {
            [cn(
              height.lg,
              "max-w-42.5 origin-bottom brightness-[0.86] transition-[translate,filter] duration-350 ease-out motion-reduce:transition-none",
              "group-hover:-translate-y-4 group-hover:brightness-100 group-hover:drop-shadow-bottle-lift",
              "group-focus-within:-translate-y-4 group-focus-within:brightness-100"
            )]: isShelf,
            [height.sm]: variant === "rail",
            "h-49": variant === "grid",
          })}
        />
      </Link>

      {isShelf ? (
        <>
          <span aria-hidden="true" className="absolute top-95 left-11 h-5.5 w-px bg-amber-200/60" />
          <span aria-hidden="true" className="absolute top-95 right-11 h-5.5 w-px bg-amber-200/60" />
        </>
      ) : null}

      <div
        className={cn("absolute flex rounded-md border border-cellar-700 bg-cellar-850", {
          [cn(
            "inset-x-2 top-100 flex-col gap-1 px-3.5 py-3 shadow-tag transition-colors duration-300",
            "group-hover:border-amber-200/60 group-focus-within:border-amber-200/60"
          )]: isShelf,
          "-rotate-[0.8deg]": isShelf && tilt === "left",
          "rotate-[0.8deg]": isShelf && tilt === "right",
          "inset-x-0 top-69.5 flex-col gap-0.75 p-2.5": variant === "rail",
          "inset-x-1.5 top-63 items-center justify-between gap-1.5 px-2.5 py-2": variant === "grid",
        })}
      >
        {variant === "grid" ? (
          <>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-xs leading-[1.25] font-semibold text-white">{wine.name}</span>
              <span className="font-system text-xs font-semibold text-amber-200">{formatWinePrice(wine.price)}</span>
            </span>
            {action}
          </>
        ) : (
          <>
            <span className={cn("font-semibold text-white", { "text-sm leading-[1.25]": isShelf, "text-micro leading-[1.2]": !isShelf })}>
              {wine.name}
            </span>
            {meta ? <span className="text-xs leading-[1.35] text-neutral-350">{meta}</span> : null}
            <span className={cn("flex items-center justify-between", { "mt-1": isShelf, "mt-0.5": !isShelf })}>
              <span className={cn("font-system font-semibold text-amber-200", { "text-sm": isShelf, "text-micro": !isShelf })}>
                {formatWinePrice(wine.price)}
              </span>
              {action}
            </span>
          </>
        )}
      </div>
    </article>
  );
};

export default BottleCard;
