import { useEffect } from "react";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { selectWineMode } from "../../slice";

/**
 * Пробрасывает режим вина в атрибут `data-wine` на <html>: от него переключаются
 * CSS-переменные `--color-wine-accent*` (base.css), и любой элемент красится утилитой `bg-wine-accent`.
 */
export const useApplyWineMode = () => {
  const mode = useAppSelector(selectWineMode);

  useEffect(() => {
    document.documentElement.dataset.wine = mode;
  }, [mode]);
};
