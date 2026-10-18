import type { KeyboardEvent } from "react";

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** Стрелки переключают вкладки месяцев (WAI-ARIA tabs): фокус и выбор переходят на соседнюю */
export const onTablistKeyDown = (event: KeyboardEvent<HTMLElement>) => {
  const step = STEP[event.key];
  if (!step) return;
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const current = tabs.indexOf(event.target as HTMLButtonElement);
  if (current === -1) return;
  event.preventDefault();
  const next = tabs[(current + step + tabs.length) % tabs.length];
  next.focus();
  next.click();
};
