import { createHash, randomBytes } from "node:crypto";

/** Сессия живёт 30 дней с последнего продления */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Как часто продлевать сессию и отмечать использование */
export const SESSION_TOUCH_INTERVAL_MS = 60 * 60 * 1000;

/** Токен сессии для cookie: 256 бит случайности, base64url */
export const newSessionToken = (): string => randomBytes(32).toString("base64url");

/** В базе — только хеш токена: утечка таблицы не даёт войти чужими сессиями */
export const hashSessionToken = (token: string): Buffer => createHash("sha256").update(token).digest();

/** Похоже на наш токен: 32 байта в base64url — 43 символа. Иначе в базу не ходим */
export const isWellFormedToken = (token: string): boolean => /^[A-Za-z0-9_-]{43}$/.test(token);

export interface ActiveSession {
  sessionId: string;
  userId: string;
  userName: string;
  cardNumber: string | null;
  expiresAt: Date;
  lastSeenAt: Date;
}

/** Пора продлить: последнее использование было больше часа назад */
export const needsTouch = (session: ActiveSession, now: Date): boolean =>
  now.getTime() - session.lastSeenAt.getTime() >= SESSION_TOUCH_INTERVAL_MS;

/** Инициалы для шапки: «Анна Кузнецова» → «АК», «Анна» → «А» */
export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("ru"))
    .join("");
