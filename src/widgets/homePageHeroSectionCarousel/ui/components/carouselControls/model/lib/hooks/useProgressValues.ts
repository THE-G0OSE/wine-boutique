import { useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

export const useProgressValues = (progress: number) => {
  const progressValue = useMotionValue(0);

  useEffect(() => {
    progressValue.setWithVelocity(progressValue.get(), progress, 16);
  }, [progress]);

  const width = useTransform(progressValue, [0, 85, 100], ["0%", "100%", "0%"]);
  const x = useTransform(progressValue, [0, 85, 100], ["0%", "0%", "100%"]);

  return {width, x}
};
