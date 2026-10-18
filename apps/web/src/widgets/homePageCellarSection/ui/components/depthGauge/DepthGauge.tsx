import { stage } from "@/shared/lib/stage";
import { motion, useTransform, type MotionValue } from "motion/react";
import type { FC } from "react";
import { DEPTH_LABELS } from "../../../model/content";

interface IProps {
  /** Насколько глубоко посетитель «спустился» по секции, 0→1 */
  progress: MotionValue<number>;
}

const LINE_TOP = 200;
const LINE_HEIGHT = 2260;

/** Шкала глубины слева: янтарная линия растёт по мере прокрутки, точка показывает текущую глубину */
const DepthGauge: FC<IProps> = ({ progress }) => {
  const fill = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div aria-hidden="true">
      <div className="absolute w-0.5 bg-neutral-350/25" style={{ left: stage(64), top: stage(LINE_TOP), height: stage(LINE_HEIGHT) }}>
        <motion.div className="absolute inset-x-0 top-0 bg-amber-350" style={{ height: fill }} />
        <motion.div
          className="absolute -left-1.5 size-3.5 -translate-y-1/2 rounded-full bg-amber-350 shadow-[0_0_16px_rgba(210,140,60,0.7)]"
          style={{ top: fill }}
        />
      </div>
      {DEPTH_LABELS.map(([label, top]) => (
        <span key={label} className="absolute font-system text-[13px] text-neutral-350" style={{ left: stage(84), top: stage(top) }}>
          {label}
        </span>
      ))}
    </div>
  );
};

export default DepthGauge;
