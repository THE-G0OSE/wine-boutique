import { useEffect, useState } from "react";

export const useCarousel = <T>({
  arr,
  showingNumber,
  autoChangeTimer,
  changeCooldown,
  onChange,
}: {
  arr: T[];
  showingNumber: number;
  autoChangeTimer: number;
  changeCooldown: number;
  onChange: (image: T) => void;
}) => {
  const [currentArr, setCurrentArr] = useState<T[]>(arr);
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const incrementProgress = () => {
    setProgress((p) => {
      if (p + 1 > 100) {
        nextHandler();
      }
      return p + 1;
    });
  };

  const nextHandler = () => {
    if (!isDisable) {
      setProgress(0);
      setCurrentArr((c) => {
        onChange(c[1]);
        return c.slice(1, c.length).concat(c[0]);
      });
      setIsDisable(true);
      setTimeout(() => setIsDisable(false), changeCooldown * 1000);
    }
  };

  const prevHandler = () => {
    if (!isDisable) {
      setProgress(0);
      setCurrentArr((c) => {
        onChange(c[c.length - 1])
        return [
          c[c.length - 1],
          ...c.slice(0, c.length - 1),
        ];
      });
      setIsDisable(true);
      setTimeout(() => setIsDisable(false), changeCooldown * 1000);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      incrementProgress();
    }, autoChangeTimer * 10);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    carouselArr: currentArr.slice(0, showingNumber),
    isDisable,
    progress,
    nextHandler,
    prevHandler,
  };
};
