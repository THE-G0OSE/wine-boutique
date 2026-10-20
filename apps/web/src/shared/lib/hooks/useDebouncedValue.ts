import { useEffect, useState } from "react";

/** Значение, которое обновляется не чаще, чем раз в `delay` мс (подсказки поиска — не на каждую букву) */
export const useDebouncedValue = <T,>(value: T, delay = 200) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
