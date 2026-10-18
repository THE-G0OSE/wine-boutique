import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

/**
 * true, когда окно прокручено дальше `threshold` px. Перерисовывает компонент
 * только при пересечении порога, а не на каждый пиксель скролла.
 */
export const useScrollThreshold = (threshold: number) => {
  const { scrollY } = useScroll();
  const [isPast, setIsPast] = useState(() => scrollY.get() > threshold);

  useMotionValueEvent(scrollY, "change", (value) => setIsPast(value > threshold));

  return isPast;
};
