import { GRAPE_TYPE_LABELS, type GrapeVariety } from "@/entities/grapeVariety";
import { cn } from "@/shared/lib/cn";
import { stage } from "@/shared/lib/stage";
import { AnimatePresence, motion } from "motion/react";
import type { FC } from "react";
import { GRAPE_ASPECT, GRAPE_TONE, grapeFilter, type GrapePlace } from "../../../model/layout";

interface IProps {
  grape: GrapeVariety;
  place: GrapePlace;
  index: number;
  isHovered: boolean;
  onHover: (slug: string | null) => void;
  onOpen: (slug: string) => void;
}

/** Гроздь на лозе: качается, при наведении замирает, светится и показывает название сорта */
const GrapeCluster: FC<IProps> = ({ grape, place, index, isHovered, onHover, onOpen }) => {
  const tone = GRAPE_TONE[grape.type];
  const rotate = isHovered ? place.rotate * 0.4 : place.rotate;

  return (
    <div
      className="absolute origin-top animate-sway"
      style={{
        left: stage(place.x),
        top: stage(place.y),
        width: stage(place.height * GRAPE_ASPECT),
        height: stage(place.height),
        zIndex: isHovered ? 4 : 2,
        animationDuration: `${5 + (index % 3) * 0.9}s`,
        animationDelay: `${-index * 1.3}s`,
        animationPlayState: isHovered ? "paused" : "running",
      }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute bottom-[calc(100%+18px)] left-1/2 z-3 flex -translate-x-1/2 flex-col items-center gap-1 rounded-2xl bg-paper px-6.5 py-3.5 whitespace-nowrap shadow-xl"
          >
            <span className="font-firm text-[28px] leading-11 text-black">{grape.name}</span>
            <span className="flex items-center gap-2 text-[15px] text-neutral-650">
              <span className={cn("size-2 rounded-full", tone.line)} />
              {GRAPE_TYPE_LABELS[grape.type].short}
            </span>
            <span className="absolute -bottom-1.75 left-1/2 size-3.5 -translate-x-1/2 rotate-45 bg-paper" />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-label={`${grape.name} — подробнее о сорте`}
        onMouseEnter={() => onHover(grape.slug)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(grape.slug)}
        onBlur={() => onHover(null)}
        onClick={() => onOpen(grape.slug)}
        className="block size-full origin-top cursor-pointer border-0 bg-transparent p-0 transition-[transform,filter] duration-350 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
        style={{ transform: `rotate(${rotate}deg) scale(${isHovered ? 1.07 : 1})`, filter: grapeFilter(grape.type, isHovered) }}
      >
        <img src={grape.image} alt="" draggable={false} className="pointer-events-none block size-full object-contain" />
      </button>
    </div>
  );
};

export default GrapeCluster;
