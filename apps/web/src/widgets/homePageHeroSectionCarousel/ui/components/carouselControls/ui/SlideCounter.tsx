import { motion } from "motion/react";
import type { CSSProperties, FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  activeIndex: number;
  count: number;
  className?: string;
  style?: CSSProperties;
}

/** Номер слайда «01–09», который прокручивается барабаном */
const SlideCounter: FC<IProps> = ({ activeIndex, count, className, style }) => {
  return (
    <div
      aria-label={`Слайд ${activeIndex + 1} из ${count}`}
      className={cn("h-[0.875em] overflow-hidden font-firm leading-[0.875em] text-white", className)}
      style={style}
    >
      <motion.div
        aria-hidden="true"
        className="flex flex-col"
        initial={false}
        animate={{ y: `${(-activeIndex * 100) / count}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className="h-[0.875em]">
            {String(index + 1).padStart(2, "0")}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default SlideCounter;
