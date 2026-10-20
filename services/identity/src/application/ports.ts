import type { ProfileChanges } from "../domain/profile.js";
import type { ActiveSession } from "../domain/session.js";

/** Хранилище пользователей и сессий — порт; реализация — Prisma в infrastructure */
export abstract class SessionRepository {
  abstract createUser(name: string): Promise<{ id: string }>;
  abstract create(userId: string, tokenHash: Buffer, expiresAt: Date, now: Date, userAgent?: string | null): Promise<void>;
  /** Не отозванная и не истёкшая сессия по хешу токена */
  abstract findActive(tokenHash: Buffer, now: Date): Promise<ActiveSession | null>;
  abstract touch(sessionId: string, lastSeenAt: Date, expiresAt: Date): Promise<void>;
  abstract revoke(sessionId: string, now: Date): Promise<void>;
}

export interface StoredCode {
  id: string;
  codeHash: Buffer;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  createdAt: Date;
}

export interface GuestSummary {
  id: string;
  name: string;
  cardNumber: string | null;
}

export interface NewGuest {
  name: string;
  phone: string;
  birthDate: string;
  email: string | null;
  cardNumber: string;
  marketingConsent: boolean;
  consentAt: Date;
  consentVersion: string;
}

/** Коды входа, регистрации и пользователи по телефону — порт; реализация — Prisma */
export abstract class PhoneAuthRepository {
  /** Коды номера, выданные после `since`, от новых к старым */
  abstract codesSince(phone: string, since: Date): Promise<StoredCode[]>;
  abstract createCode(phone: string, codeHash: Buffer, expiresAt: Date, now: Date): Promise<void>;
  /** Неверная попытка: +1; вернуть, сколько попыток уже сделано */
  abstract failAttempt(codeId: string): Promise<number>;
  /** Код использован или сгорел. false — его уже использовали (гонка двух запросов) */
  abstract consumeCode(codeId: string, now: Date): Promise<boolean>;
  abstract findUserByPhone(phone: string): Promise<GuestSummary | null>;
  abstract createRegistration(tokenHash: Buffer, phone: string, expiresAt: Date): Promise<void>;
  /** Забрать регистрацию: действует и не использована — пометить и вернуть номер, иначе null */
  abstract takeRegistration(tokenHash: Buffer, now: Date): Promise<string | null>;
  /** Новый гость; номер уже занят (регистрация в двух вкладках) — null */
  abstract createGuest(guest: NewGuest): Promise<GuestSummary | null>;
}

/** Доставка кода гостю. Сейчас — в лог сервиса (SMS-провайдер — с сервисом notifications) */
export abstract class CodeSender {
  abstract send(phone: string, code: string): Promise<void>;
}

export interface StoredProfile {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: Date | null;
  cardNumber: string | null;
  favoriteBoutiqueId: string | null;
  tastes: string[];
  notifications: unknown;
  sessions: { id: string; tokenHash: Buffer; userAgent: string | null; lastSeenAt: Date }[];
}

/** Профиль гостя и его действующие сессии — порт; реализация — Prisma */
export abstract class ProfileRepository {
  /** Профиль и действующие сессии (не отозванные и не истёкшие), от свежих к старым; нет пользователя — null */
  abstract find(userId: string, now: Date): Promise<StoredProfile | null>;
  abstract update(userId: string, changes: ProfileChanges): Promise<void>;
  /** Удалить пользователя — сессии уходят каскадом */
  abstract delete(userId: string): Promise<void>;
  /** Отозвать все сессии пользователя */
  abstract revokeAll(userId: string, now: Date): Promise<void>;
}
