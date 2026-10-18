import { useLayoutEffect, useRef, useState } from "react";

/** Размер элемента, обновляется через ResizeObserver */
export const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
};
