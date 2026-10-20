import { createHash, randomBytes, randomInt } from "node:crypto";

/**
 * Вход по телефону:
 * - код из 4 цифр живёт 5 минут, на него 5 попыток, после — сгорает;
 * - новый код — не раньше чем через минуту и не больше 5 в час на номер;
 * - новый номер после кода получает токен регистрации на 15 минут;
 * - карта гостя — с 18 лет (по дате рождения и сегодняшней дате по Москве).
 * Правила совпадают с моками фронта (@wine/demo-data не нужен: коды там фиксированные — 1988 и 2015).
 */

export const CODE_TTL_MS = 5 * 60 * 1000;
export const CODE_RESEND_MS = 60 * 1000;
export const CODES_PER_HOUR = 5;
export const CODE_ATTEMPTS = 5;
export const REGISTRATION_TTL_MS = 15 * 60 * 1000;
export const ADULT_AGE = 18;
export const TIMEZONE = "Europe/Moscow";
/** Версия текста согласия на обработку ПДн — сохраняется с картой гостя (152-ФЗ) */
export const CONSENT_VERSION = "2026-10-20";

export const newCode = (): string => String(randomInt(0, 10_000)).padStart(4, "0");

/** Хеш кода привязан к номеру: тот же код для другого номера не подойдёт даже при совпадении хеша */
export const hashCode = (phone: string, code: string): Buffer => createHash("sha256").update(`${phone}:${code}`).digest();

export const newRegistrationToken = (): string => randomBytes(32).toString("base64url");
export const hashRegistrationToken = (token: string): Buffer => createHash("sha256").update(`registration:${token}`).digest();

/** Номер карты гостя: 12 случайных цифр, первая — не ноль */
export const newCardNumber = (): string => String(randomInt(1, 10)) + Array.from({ length: 11 }, () => randomInt(0, 10)).join("");

/** Исполнилось ли 18 к сегодняшней дате «2026-10-20» */
export const isAdult = (birthDate: string, today: string): boolean => {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const age = ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
  return age >= ADULT_AGE && age < 130;
};

export type AuthErrorCode =
  | "invalid_phone"
  | "too_many_requests"
  | "code_expired"
  | "invalid_code"
  | "registration_expired"
  | "underage"
  | "invalid_registration";

export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}
