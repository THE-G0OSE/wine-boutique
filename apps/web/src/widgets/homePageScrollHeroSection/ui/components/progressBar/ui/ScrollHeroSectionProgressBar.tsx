import { progressBarVar } from "../model/animations";
import ProgressBarItem from "./ProgressBarItem";
import { motion, MotionValue } from "motion/react";
import type { FC } from "react";

interface IProps {
  count: number;
  /** Прогресс секции, 0→1 */
  progress: MotionValue<number>;
  isOpen: boolean;
  y: MotionValue<number>;
}

/** Полоса из сегментов по числу историй; выезжает сверху, пока экран прилип. Ниже шапки (64 / 80px) */
const ScrollHeroSectionProgressBar: FC<IProps> = ({ count, progress, isOpen, y }) => {
  return (
    <div aria-hidden="true" className="absolute top-20 z-10 flex w-full justify-center px-5 lg:top-28 lg:px-0">
      <motion.div
        variants={progressBarVar}
        initial="hide"
        style={{ x: y }}
        animate={isOpen ? "show" : "hide"}
        className="relative flex h-2.5 w-full max-w-140 overflow-hidden rounded-full bg-neutral-500 shadow-xl lg:h-4"
      >
        {Array.from({ length: count }, (_, index) => (
          <ProgressBarItem
            key={index}
            index={index}
            count={count}
            progress={progress}
            className={index % 2 === 1 ? "bg-primary-350" : "bg-secondary-350"}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ScrollHeroSectionProgressBar;
