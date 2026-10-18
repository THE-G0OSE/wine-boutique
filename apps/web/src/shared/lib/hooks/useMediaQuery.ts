import { useCallback, useSyncExternalStore } from "react";

/** Брейкпоинты Tailwind, которые нужны в JS (раскладку по-прежнему переключаем CSS-классами) */
export const MEDIA = {
  desktop: "(min-width: 64rem)",
} as const;

export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};
