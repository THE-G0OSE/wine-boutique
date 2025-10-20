import { useMotionChange } from "@/shared/lib/hooks/useMotionChange";
import { useWindowSize } from "@/shared/lib/hooks/useWindowSize";
import { useMotionValue, useScroll, useSpring, useVelocity } from "motion/react";
import { useEffect } from "react";

/**
 * custom hook for home page hero section scroll feature with some configs
 * 
 * @param offsetCoef coeficient that represents relation of scroll and offset
 */

export const useScrollHeroSection = (offsetCoef: number) => {
  const { height } = useWindowSize();
  const { scrollY } = useScroll();
  const positionClassName = useMotionChange<number, string>(
    scrollY,
    (value) => (value > height ? " fixed top-0 " : " absolute "),
    scrollY.get() > height ? " absolute " : " fixed top-0 ",
    0
  );
  const isProgressBarShowen = useMotionChange<number, boolean>(
    scrollY,
    (value) => value > height,
    false,
    50
  );
  const scrollVelocity = useVelocity(useSpring(scrollY));
  const yOffset = useMotionValue(0);

  useEffect(() => {
    const unsubscribe = scrollVelocity.on("change", (value) => {
      yOffset.set(value / offsetCoef);
    });
    return unsubscribe;
  }, []);


  return {positionClassName, isProgressBarShowen, yOffset, scrollY}

};
