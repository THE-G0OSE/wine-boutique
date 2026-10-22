import { clamp, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef, useState } from "react";

/**
 * Липкая секция историй: прогресс считается от самой секции (а не от абсолютного scrollY),
 * поэтому не зависит от высоты окна и того, что стоит выше на странице.
 *
 * @param count сколько историй — на каждую приходится один экран прокрутки
 * @param offsetCoef во сколько раз ослабить «покачивание» от скорости скролла
 * @param maxFloat предел «покачивания», px — рывок колеса не уносит бумагу далеко
 */
export const useScrollHeroSection = (count: number, offsetCoef: number, maxFloat = 24) => {
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

  // Скорость колеса — ступеньками: каждый щелчок даёт пик в тысячи px/с. Поэтому сначала предел, потом пружина
  // на самом смещении — бумага плавно отстаёт и возвращается, а не прыгает на десятки пикселей за кадр
  const rawFloat = useTransform(useVelocity(scrollY), (velocity) => clamp(-maxFloat, maxFloat, velocity / offsetCoef));
  const floatY = useSpring(rawFloat, { stiffness: 120, damping: 24, mass: 0.8 });

  return { ref, activeIndex, isPinned, floatY, progress: scrollYProgress };
};
