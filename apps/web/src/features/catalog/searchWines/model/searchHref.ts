import { ROUTES } from "@/shared/config/routes";

/** Минимум букв для подсказок: по одной букве совпадает полкаталога */
export const SUGGEST_MIN_LENGTH = 2;

/** Адрес страницы результатов: /search?q=пино */
export const searchHref = (q: string) => `${ROUTES.search}?${new URLSearchParams({ q: q.trim() })}`;
