import { useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

export const useIndexValue = (index: number) => {
  const indexSpring = useSpring(0);
  const y = useTransform(indexSpring, [0, 10], ["6rem", "-54rem"]);
  useEffect(() => {
    indexSpring.set(index);
  }, [index]);
  return {y}
};
