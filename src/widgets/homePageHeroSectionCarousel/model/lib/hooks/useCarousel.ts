import { animate, useMotionValue, type AnimationPlaybackControls } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Карусель с автопрокруткой.
 *
 * Активный элемент — первый в `ordered`. Прогресс таймера — MotionValue 0→1,
 * поэтому полоса прогресса не перерисовывает компонент на каждом кадре.
 *
 * @param items элементы карусели
 * @param interval сколько мс показывается слайд при автопрокрутке
 * @param cooldown пауза в мс после ручного переключения, пока идёт анимация
 * @param autoplay включена ли автопрокрутка (выключаем при «уменьшить движение»)
 */
export const useCarousel = <T>({
  items,
  interval,
  cooldown,
  autoplay = true,
}: {
  items: T[];
  interval: number;
  cooldown: number;
  autoplay?: boolean;
}) => {
  const count = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const lockedRef = useRef(false);
  const timerRef = useRef<AnimationPlaybackControls | null>(null);

  const shift = useCallback(
    (getIndex: (current: number) => number) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      window.setTimeout(() => {
        lockedRef.current = false;
      }, cooldown);
      setActiveIndex((current) => getIndex(current));
    },
    [cooldown]
  );

  const next = useCallback(() => shift((current) => (current + 1) % count), [shift, count]);
  const prev = useCallback(() => shift((current) => (current - 1 + count) % count), [shift, count]);
  const goTo = useCallback((index: number) => shift(() => index), [shift]);

  // Таймер текущего слайда: заполнил полосу — переходим дальше
  useEffect(() => {
    progress.set(0);
    if (!autoplay) return;

    const controls = animate(progress, 1, {
      duration: interval / 1000,
      ease: "linear",
      onComplete: () => setActiveIndex((current) => (current + 1) % count),
    });
    timerRef.current = controls;
    return () => controls.stop();
  }, [activeIndex, autoplay, interval, count, progress]);

  useEffect(() => {
    if (isPaused) timerRef.current?.pause();
    else timerRef.current?.play();
  }, [isPaused, activeIndex]);

  const ordered = useMemo(
    () => items.slice(activeIndex).concat(items.slice(0, activeIndex)),
    [items, activeIndex]
  );

  return {
    /** Элементы начиная с активного */
    ordered,
    active: items[activeIndex],
    activeIndex,
    count,
    progress,
    isPaused,
    setIsPaused,
    next,
    prev,
    goTo,
  };
};
