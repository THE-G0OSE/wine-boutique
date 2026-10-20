import type { FC } from "react";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";

interface IProps {
  /** Положение и высота доски задаёт полка: `top-84 h-11 -inset-x-5` */
  className?: string;
}

/** Деревянная доска под бутылками: текстура, блик сверху и тень вниз (макеты Shop, Category, Product) */
const ShelfBoard: FC<IProps> = ({ className }) => {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute overflow-hidden rounded-[3px] shadow-shelf", className)}>
      <img src={asset("/images/textures/shelf.webp")} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-b from-amber-200/28 via-transparent via-25% to-black/45" />
    </div>
  );
};

export default ShelfBoard;
