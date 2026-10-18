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
}

const arrowButton =
  "absolute flex cursor-pointer items-center justify-center rounded-full border-2 border-white bg-transparent p-0 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200";

/** Управление hero на десктопе: стрелки, прогресс и номер слайда — по координатам макета */
const CarouselControls: FC<IProps> = ({ prevHandler, nextHandler, progress, activeIndex, count }) => {
  const { arrows, progress: bar, counter } = HERO_LAYOUT;
  const arrowSize = `clamp(64px, ${stage(arrows.size)}, ${arrows.size}px)`;

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
        style={{ left: stage(arrows.left), bottom: stage(arrows.bottom), width: arrowSize, height: arrowSize }}
      >
        <motion.span variants={leftButtonInnerVariants} className="flex">
          <LuChevronLeft size={34} strokeWidth={1.6} aria-hidden="true" />
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
          left: stage(arrows.left + arrows.size + arrows.gap),
          bottom: stage(arrows.bottom),
          width: arrowSize,
          height: arrowSize,
        }}
      >
        <motion.span variants={rightButtonInnerVariants} className="flex">
          <LuChevronRight size={34} strokeWidth={1.6} aria-hidden="true" />
        </motion.span>
      </motion.button>

      <ProgressBar
        activeIndex={activeIndex}
        count={count}
        progress={progress}
        className="absolute"
        style={{ left: stage(bar.left), width: stage(bar.width), bottom: stage(bar.bottom) }}
      />

      <SlideCounter
        activeIndex={activeIndex}
        count={count}
        className="absolute"
        style={{ left: stage(counter.left), bottom: stage(counter.bottom), fontSize: stageFont(96, 56) }}
      />
    </>
  );
};

export default CarouselControls;
