import { useCallback, useEffect, useRef, useState } from "react";

/** Шаг бутылки на десктопной полке: 190 + 40 (макет Shop) */
export const SLOT_WIDTH = 230;
/** Стрелки листают полку на три бутылки */
export const SCROLL_SLOTS = 3;

/**
 * Прокрутка полки стрелками: можно ли листать назад/вперёд и сам шаг.
 * Полка — обычный горизонтальный скролл: на тачпаде и колесом с Shift она тоже листается.
 */
export const useTrackScroll = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const track = ref.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setEdges({ start: track.scrollLeft <= 1, end: track.scrollLeft >= max - 1 });
  }, []);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const scroll = (direction: 1 | -1) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollBy({ left: direction * SLOT_WIDTH * SCROLL_SLOTS, behavior: reduce ? "auto" : "smooth" });
  };

  return { ref, canPrev: !edges.start, canNext: !edges.end, prev: () => scroll(-1), next: () => scroll(1), measure };
};
