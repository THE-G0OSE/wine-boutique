import { useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef, useState } from "react";

/**
 * Липкая секция историй: прогресс считается от самой секции (а не от абсолютного scrollY),
 * поэтому не зависит от высоты окна и того, что стоит выше на странице.
 *
 * @param count сколько историй — на каждую приходится один экран прокрутки
 * @param offsetCoef во сколько раз ослабить «покачивание» от скорости скролла
 */
export const useScrollHeroSection = (count: number, offsetCoef: number) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  // 0 — верх секции у верха окна, 1 — низ секции у низа окна (липкий экран отпускается)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Пока секция въезжает снизу: первая история появляется, когда секция прошла полэкрана
  const { scrollYProgress: enterProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPinned, setIsPinned] = useState(false);

  const update = () => {
    const progress = scrollYProgress.get();
    if (progress > 0) setActiveIndex(Math.min(count - 1, Math.floor(progress * count)));
    else setActiveIndex(enterProgress.get() > 0.5 ? 0 : -1);
    setIsPinned(progress > 0 && progress < 1);
  };
  useMotionValueEvent(scrollYProgress, "change", update);
  useMotionValueEvent(enterProgress, "change", update);

  const floatY = useTransform(useVelocity(useSpring(scrollY)), (velocity) => velocity / offsetCoef);

  return { ref, activeIndex, isPinned, floatY, progress: scrollYProgress };
};
