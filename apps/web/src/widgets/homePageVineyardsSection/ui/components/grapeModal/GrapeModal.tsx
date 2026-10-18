import { formatPlantation, GRAPE_TYPE_LABELS, type GrapeVariety } from "@/entities/grapeVariety";
import { WineMiniCard } from "@/entities/wine";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import { useLastDefined } from "@/shared/lib/hooks/useLastDefined";
import { LuX } from "react-icons/lu";
import { Link } from "react-router";
import { IconButton, Modal, Text } from "uikit;/";
import { GRAPE_TONE } from "../../../model/layout";
import { asset } from "@/shared/lib/asset";

interface IProps {
  grape: GrapeVariety | null;
  onClose: () => void;
}

/** Карточка сорта на «бумаге» (десктоп): гроздь на деревянной панели, паспорт и вина из сорта */
const GrapeModal: FC<IProps> = ({ grape: openedGrape, onClose }) => {
  const grape = useLastDefined(openedGrape);
  const passport = grape
    ? [
        ["Родина сорта", grape.origin],
        ["Вкус и аромат", grape.taste],
        ["Сбор урожая", grape.harvest],
        ["Наша плантация", formatPlantation(grape.plantation)],
      ]
    : [];

  return (
    <Modal
      open={openedGrape !== null}
      onClose={onClose}
      label={grape?.name}
      backdropClassName="bg-cellar-950/72 backdrop-blur-[6px]"
      className="grid h-[min(840px,calc(100svh-32px))] w-full max-w-360 grid-cols-[minmax(0,560fr)_minmax(0,880fr)] overflow-hidden rounded-lg bg-paper text-black shadow-[0_40px_90px_rgba(0,0,0,0.55)]"
    >
      {grape && (
        <>
          <div aria-hidden="true" className="relative overflow-hidden bg-cellar-800">
            <img src={asset("/images/textures/wood.webp")} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 shadow-[inset_0_80px_70px_0_rgba(0,0,0,0.5),inset_-40px_0_60px_-20px_rgba(0,0,0,0.45)]" />
            <img
              src={asset("/images/textures/ripped-paper.webp")}
              alt=""
              className="absolute top-[27.4%] left-[-10.7%] h-[45.2%] w-[121.4%] max-w-none object-fill drop-shadow-[30px_20px_30px_rgba(0,0,0,0.35)]"
            />
            <img
              src={grape.image}
              alt=""
              className="absolute top-[14.3%] left-[16%] h-[71.4%] w-[72.5%] -rotate-8 object-contain drop-shadow-[14px_30px_22px_rgba(0,0,0,0.5)]"
            />
          </div>

          <div className="relative flex min-w-0 flex-col gap-7 overflow-auto p-10 2xl:pt-16 2xl:pr-20 2xl:pb-14 2xl:pl-18">
            <IconButton label="Закрыть" variant="paper" size="lg" onClick={onClose} className="absolute top-7 right-7">
              <LuX size={22} aria-hidden="true" />
            </IconButton>

            <div className="flex flex-col gap-2.5 pr-16">
              <div className="flex items-center gap-3.5">
                <span aria-hidden="true" className={cn("h-[3px] w-10", GRAPE_TONE[grape.type].line)} />
                <span className="text-caption text-neutral-650">{GRAPE_TYPE_LABELS[grape.type].full}</span>
              </div>
              <Text as="h3" FONT="FIRM" COLOR="BLACK" className="text-display-sm 2xl:text-display-lg">
                {grape.name}
              </Text>
              <Text COLOR="INK_MUTED" className="max-w-175">
                {grape.description}
              </Text>
            </div>

            <dl className="m-0 grid grid-cols-2 gap-x-10 gap-y-5 border-y border-neutral-350 py-6">
              {passport.map(([term, value]) => (
                <div key={term} className="flex flex-col gap-1">
                  <dt className="font-system text-[13px] tracking-[0.06em] text-neutral-650 uppercase">{term}</dt>
                  <dd className="m-0 text-[19px]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-baseline justify-between gap-6">
                <h4 className="m-0 text-lg font-semibold">Вина из этого сорта</h4>
                <Link to={ROUTES.shelf(grape.type)} onClick={onClose} className="text-sm font-semibold text-primary-500">
                  Все в магазине →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {grape.wines.map((wine) => (
                  <WineMiniCard key={wine.id} wine={wine} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default GrapeModal;
