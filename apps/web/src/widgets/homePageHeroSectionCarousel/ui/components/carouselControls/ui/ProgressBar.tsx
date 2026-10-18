import { motion, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties, FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  activeIndex: number;
  count: number;
  /** Таймер текущего слайда, 0→1 */
  progress: MotionValue<number>;
  className?: string;
  style?: CSSProperties;
}

/**
 * Полоса прогресса: заливка до текущего слайда (как в дизайне — позиция в карусели)
 * плюс сегмент, который дорастает по таймеру автопрокрутки. Цвет — акцент текущего вина.
 */
const ProgressBar: FC<IProps> = ({ activeIndex, count, progress, className, style }) => {
  const segment = useTransform(progress, [0, 1], ["0%", `${100 / count}%`]);

  return (
    <div aria-hidden="true" className={cn("flex h-[3px] bg-white/35", className)} style={style}>
      <div
        className="h-full bg-wine-accent transition-[width,background-color] duration-500"
        style={{ width: `${(activeIndex / count) * 100}%` }}
      />
      <motion.div className="h-full bg-wine-accent transition-colors duration-500" style={{ width: segment }} />
    </div>
  );
};

export default ProgressBar;
