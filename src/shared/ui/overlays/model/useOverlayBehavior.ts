import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = ["a[href]", "button:not([disabled])", "input:not([disabled])", "select", "textarea", "[tabindex]"]
  .map((selector) => `${selector}:not([tabindex="-1"])`)
  .join(", ");

/** Открытые оверлеи, последний — верхний: Esc закрывает только его */
const stack: symbol[] = [];

/**
 * Поведение модального слоя: блокирует скролл страницы, делает приложение (#root) inert —
 * Tab не уходит за пределы оверлея, — фокусирует первый интерактивный элемент
 * (или помеченный `data-autofocus`), закрывает по Esc и возвращает фокус после закрытия.
 */
export const useOverlayBehavior = ({
  open,
  onClose,
  containerRef,
}: {
  open: boolean;
  onClose?: () => void;
  containerRef: RefObject<HTMLElement | null>;
}) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const id = Symbol("overlay");
    const root = document.getElementById("root");
    const previouslyFocused = document.activeElement as HTMLElement | null;

    stack.push(id);
    document.documentElement.style.overflow = "hidden";
    root?.setAttribute("inert", "");

    const container = containerRef.current;
    const target =
      container?.querySelector<HTMLElement>("[data-autofocus]") ??
      container?.querySelector<HTMLElement>(FOCUSABLE) ??
      container?.querySelector<HTMLElement>('[role="dialog"]');
    target?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stack.at(-1) === id) onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      stack.splice(stack.indexOf(id), 1);
      if (stack.length === 0) {
        document.documentElement.style.overflow = "";
        root?.removeAttribute("inert");
      }
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [open, containerRef]);
};
