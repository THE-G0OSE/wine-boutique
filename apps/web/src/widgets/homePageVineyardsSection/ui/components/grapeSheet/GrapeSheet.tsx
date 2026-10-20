import { GRAPE_TYPE_LABELS, type GrapeVariety } from "@/entities/grapeVariety";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { useLastDefined } from "@/shared/lib/hooks/useLastDefined";
import { ButtonLink, Drawer } from "uikit;/";
import { GRAPE_TONE } from "../../../model/layout";
import { srcSet } from "@/shared/lib/srcSet";

interface IProps {
  grape: GrapeVariety | null;
  onClose: () => void;
}

/** Карточка сорта в нижней шторке (мобильные) */
const GrapeSheet: FC<IProps> = ({ grape: openedGrape, onClose }) => {
  const grape = useLastDefined(openedGrape);
  return (
    <Drawer
      open={openedGrape !== null}
      onClose={onClose}
      side="bottom"
      label={grape?.name ?? "Сорт винограда"}
      className="max-h-[88%] overflow-auto border-t-0 bg-paper px-5 pt-3 pb-7 text-black"
    >
      {grape && (
        <>
          <span aria-hidden="true" className="mx-auto block h-1.25 w-11 shrink-0 rounded-full bg-neutral-350" />
          <div className="mt-3.5 grid grid-cols-[90px_1fr] items-center gap-3.5">
            <img src={grape.image} srcSet={srcSet(grape.image, [360], 700)} sizes="90px" alt="" className="h-32.5 w-auto justify-self-center" />
            <div className="flex flex-col gap-1">
              <span className={cn("text-[13px]", GRAPE_TONE[grape.type].onPaper)}>{GRAPE_TYPE_LABELS[grape.type].short}</span>
              <span className="font-firm text-xl leading-10">{grape.name}</span>
              <span className="text-micro text-paper-ink">{grape.origin}</span>
            </div>
          </div>
          <p className="m-0 mt-3.5 text-sm leading-[1.55] text-neutral-650">{grape.description}</p>
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            {[
              ["Вкус", grape.taste],
              ["Сбор", grape.harvest],
            ].map(([term, value]) => (
              <div key={term} className="rounded-[14px] bg-paper-300 p-3">
                <span className="block text-xs text-paper-ink">{term}</span>
                <span className="text-micro">{value}</span>
              </div>
            ))}
          </div>
          <ButtonLink to={ROUTES.shelf(grape.type)} onClick={onClose} className="mt-4.5 h-13.5 w-full shrink-0 text-[17px]">
            Вина из этого сорта
          </ButtonLink>
        </>
      )}
    </Drawer>
  );
};

export default GrapeSheet;
