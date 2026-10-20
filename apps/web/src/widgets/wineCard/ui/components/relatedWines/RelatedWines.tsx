import type { FC } from "react";
import { Link } from "react-router";
import { BOTTLE_HEIGHT_CLASS, BottleCard, formatShelfMeta, formatWinePrice, ShelfBoard, ShelfPlaque, type WineDetails } from "@/entities/wine";
import { AddToCartButton } from "@/features/cart/addToCart";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { Text } from "uikit;/";

interface IProps {
  wine: WineDetails;
  variant: "desktop" | "mobile";
}

/** «С этим вином берут» — соседи по полке на доске (Product / MProduct) */
const RelatedWines: FC<IProps> = ({ wine, variant }) => {
  if (wine.related.length === 0) return null;

  if (variant === "mobile") {
    return (
      <section aria-labelledby="wine-related" className="mt-7">
        <Text as="h2" id="wine-related" FONT="FIRM" SIZE="H4" className="px-5">
          С этим вином берут
        </Text>
        <div className="relative mt-3 h-95">
          <ShelfBoard className="inset-x-0 top-59 h-7.5 rounded-none" />
          <div className="absolute inset-0 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 [scrollbar-width:none]">
            {wine.related.map((related) => (
              <BottleCard
                key={related.id}
                wine={related}
                variant="rail"
                meta={formatShelfMeta(related, { compact: true })}
                action={<AddToCartButton wine={related} className="size-9" />}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="wine-related" className="mx-auto mt-20 max-w-480 px-10 2xl:px-30">
      <div className="flex items-center justify-between">
        <ShelfPlaque as="h2" id="wine-related">
          С этим вином берут
        </ShelfPlaque>
        <Link to={ROUTES.shelf(wine.shelf)} className="text-[17px] font-semibold text-amber-200 no-underline hover:text-paper">
          Вернуться к полкам →
        </Link>
      </div>
      <div className="relative mt-5 h-117.5">
        <ShelfBoard className="-inset-x-5 top-84 h-11" />
        <ul role="list" className="absolute inset-0 m-0 flex list-none gap-10 overflow-x-auto px-15 [scrollbar-width:none] 2xl:justify-between">
          {wine.related.map((related) => (
            <li key={related.id} className="shrink-0">
              <Link to={ROUTES.wine(related.slug)} className="group relative block h-117.5 w-47.5 text-white no-underline">
                <span className="absolute inset-x-0 top-0 flex h-86.5 items-end justify-center">
                  <img
                    src={related.image}
                    alt=""
                    loading="lazy"
                    className={cn(BOTTLE_HEIGHT_CLASS[related.bottle].lg, "w-auto brightness-90 drop-shadow-bottle transition-[translate,filter] duration-350 group-hover:-translate-y-2 group-hover:brightness-100 motion-reduce:transition-none")}
                  />
                </span>
                <span className="absolute inset-x-2 top-99 flex flex-col gap-0.5 rounded-md border border-cellar-700 bg-cellar-850 px-3.5 py-2.5 transition-colors group-hover:border-amber-200/60">
                  <span className="text-sm font-semibold">{related.name}</span>
                  <span className="font-system text-micro text-amber-200">{formatWinePrice(related.price)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default RelatedWines;
