import { GRAPE_TYPE_LABELS, type GrapeVariety } from "@/entities/grapeVariety";
import { cn } from "@/shared/lib/cn";
import { srcSet } from "@/shared/lib/srcSet";
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
  /** Координата сцены → CSS (на десктопе — stage от 1920, на телефоне — от 390) */
  unit: (px: number) => string;
  /** Телефон: подсказка с названием — компактнее */
  compact?: boolean;
}

/** Гроздь на лозе: качается, при наведении замирает, светится и показывает название сорта */
const GrapeCluster: FC<IProps> = ({ grape, place, index, isHovered, onHover, onOpen, unit, compact = false }) => {
  const tone = GRAPE_TONE[grape.type];
  const rotate = isHovered ? place.rotate * 0.4 : place.rotate;

  return (
    <div
      className="absolute origin-top animate-sway"
      style={{
        left: unit(place.x),
        top: unit(place.y),
        width: unit(place.height * GRAPE_ASPECT),
        height: unit(place.height),
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
            className={cn(
              "pointer-events-none absolute left-1/2 z-3 flex -translate-x-1/2 flex-col items-center gap-1 rounded-2xl bg-paper whitespace-nowrap shadow-xl",
              { "bottom-[calc(100%+18px)] px-6.5 py-3.5": !compact, "bottom-[calc(100%+10px)] px-4 py-2": compact }
            )}
          >
            <span className={cn("font-firm text-black", { "text-[28px] leading-11": !compact, "text-lg leading-7": compact })}>{grape.name}</span>
            <span className={cn("flex items-center gap-2 text-neutral-650", { "text-[15px]": !compact, "text-xs": compact })}>
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
        <img
          src={grape.image}
          srcSet={srcSet(grape.image, [360], 700)}
          sizes={compact ? "120px" : "(min-width: 1024px) 230px, 120px"}
          alt=""
          draggable={false}
          className="pointer-events-none block size-full object-contain"
        />
      </button>
    </div>
  );
};

export default GrapeCluster;
