import { useEffect, type RefObject } from "react";

/**
 * Закрыть выпадающую панель (фильтр, сортировка, подсказки): клик или фокус вне `ref` и Escape.
 * Модальные окна и шторки — через Modal/Drawer из uikit, у них своя логика фокуса.
 */
export const useDismiss = (ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
};
