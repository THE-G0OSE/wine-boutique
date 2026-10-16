import type { FC } from "react";
import { Link } from "react-router";
import { ROUTES } from "@/shared/config/routes";
import { formatWinePrice, formatWineRegionGrapes } from "../model/lib/format";
import type { WineSummary } from "../model/types";

interface IProps {
  wine: WineSummary;
}

/** Светлая карточка вина на «бумаге» (модалка сорта): бутылка, название, регион, цена */
const WineMiniCard: FC<IProps> = ({ wine }) => {
  return (
    <Link
      to={ROUTES.wine(wine.slug)}
      className="flex min-w-0 flex-col gap-1.5 rounded-[14px] border border-neutral-350 bg-white px-4 pt-3.5 pb-4 text-black no-underline transition-shadow hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    >
      <img
        src={wine.image}
        alt=""
        loading="lazy"
        className="h-30 w-full object-contain drop-shadow-[6px_12px_8px_rgba(0,0,0,0.25)]"
      />
      <span className="truncate text-[17px] font-semibold">{wine.name}</span>
      <span className="truncate text-micro text-neutral-650">{formatWineRegionGrapes(wine)}</span>
      <span className="font-system text-sm font-semibold text-primary-500">{formatWinePrice(wine.price)}</span>
    </Link>
  );
};

export default WineMiniCard;
