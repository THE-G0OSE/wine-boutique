import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { motion, type MotionValue } from "motion/react";
import type { FC } from "react";
import { stage, stageFont } from "@/shared/lib/stage";
import {
  leftButtonInnerVariants,
  leftButtonVariants,
  rightButtonInnerVariants,
  rightButtonVariants,
} from "../model/animations";
import { HERO_LAYOUT } from "../../../../model/layout";
import ProgressBar from "./ProgressBar";
import SlideCounter from "./SlideCounter";

interface IProps {
  prevHandler: () => void;
  nextHandler: () => void;
  progress: MotionValue<number>;
  activeIndex: number;
  count: number;
  /** Телефон: всё в один ряд внизу — стрелки слева, прогресс, номер справа */
  compact?: boolean;
}

const arrowButton =
  "absolute flex cursor-pointer items-center justify-center rounded-full border-2 border-white bg-transparent p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200";

/** Раскладка телефона, px: та же композиция, что в макете 1920, сжатая в одну строку внизу экрана */
const COMPACT = {
  arrow: { size: 48, left: 20, gap: 10, bottom: 34 },
  bar: { left: 138, right: 78, bottom: 56 },
  counter: { right: 20, bottom: 36, fontSize: 40 },
};

/** Управление hero: стрелки, прогресс и номер слайда — по координатам макета (на телефоне — COMPACT) */
const CarouselControls: FC<IProps> = ({ prevHandler, nextHandler, progress, activeIndex, count, compact = false }) => {
  const { arrows, progress: bar, counter } = HERO_LAYOUT;
  const arrowSize = compact ? `${COMPACT.arrow.size}px` : `clamp(64px, ${stage(arrows.size)}, ${arrows.size}px)`;
  const arrowBottom = compact ? COMPACT.arrow.bottom : stage(arrows.bottom);
  const iconSize = compact ? 22 : 34;

  return (
    <>
      <motion.button
        type="button"
        aria-label="Предыдущий слайд"
        onClick={prevHandler}
        variants={leftButtonVariants}
        initial="show"
        animate="show"
        whileHover="hover"
        whileTap="tap"
        className={arrowButton}
        style={{ left: compact ? COMPACT.arrow.left : stage(arrows.left), bottom: arrowBottom, width: arrowSize, height: arrowSize }}
      >
        <motion.span variants={leftButtonInnerVariants} className="flex">
          <LuChevronLeft size={iconSize} strokeWidth={1.6} aria-hidden="true" />
        </motion.span>
      </motion.button>
      <motion.button
        type="button"
        aria-label="Следующий слайд"
        onClick={nextHandler}
        variants={rightButtonVariants}
        initial="show"
        animate="show"
        whileHover="hover"
        whileTap="tap"
        className={arrowButton}
        style={{
          left: compact ? COMPACT.arrow.left + COMPACT.arrow.size + COMPACT.arrow.gap : stage(arrows.left + arrows.size + arrows.gap),
          bottom: arrowBottom,
          width: arrowSize,
          height: arrowSize,
        }}
      >
        <motion.span variants={rightButtonInnerVariants} className="flex">
          <LuChevronRight size={iconSize} strokeWidth={1.6} aria-hidden="true" />
        </motion.span>
      </motion.button>

      <ProgressBar
        activeIndex={activeIndex}
        count={count}
        progress={progress}
        className="absolute"
        style={compact ? COMPACT.bar : { left: stage(bar.left), width: stage(bar.width), bottom: stage(bar.bottom) }}
      />

      <SlideCounter
        activeIndex={activeIndex}
        count={count}
        className="absolute"
        style={compact ? COMPACT.counter : { left: stage(counter.left), bottom: stage(counter.bottom), fontSize: stageFont(96, 56) }}
      />
    </>
  );
};

export default CarouselControls;
