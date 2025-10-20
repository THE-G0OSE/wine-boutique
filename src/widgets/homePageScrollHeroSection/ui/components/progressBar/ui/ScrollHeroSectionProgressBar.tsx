import { cardsMock } from "@/entities/heroPageScrollCards";
import { progressBarVar } from "../model/animations";
import ProgressBarItem from "./ProgressBarItem";
import { motion, MotionValue } from "motion/react";
import type { FC } from "react";

interface IProps {
  isOpen: boolean;
  y: MotionValue<number>
}

const ScrollHeroSectionProgressBar: FC<IProps> = ({ isOpen, y }) => {
  return (
    <div className="top-10 absolute flex justify-center w-full">
      <motion.div variants={progressBarVar} initial="hide" style={{x: y}} animate={isOpen ? "show" : "hide"} className="relative bg-neutral-500 shadow-black shadow-xl rounded-full w-140 h-4 overflow-hidden">
        {cardsMock.map((c, index) => (
          <ProgressBarItem
            card={c}
            color={index % 2 === 1 ? "bg-primary-350" : "bg-secondary-350"}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ScrollHeroSectionProgressBar;
