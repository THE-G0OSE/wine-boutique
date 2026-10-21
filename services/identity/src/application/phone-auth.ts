import { Injectable } from "@nestjs/common";
import { localDate } from "@wine/service-kit";
import {
  AuthError,
  CODE_ATTEMPTS,
  CODE_RESEND_MS,
  CODE_TTL_MS,
  CODES_PER_HOUR,
  CONSENT_VERSION,
  hashCode,
  hashRegistrationToken,
  isAdult,
  newCardNumber,
  newCode,
  newRegistrationToken,
  REGISTRATION_TTL_MS,
  TIMEZONE,
} from "../domain/phone-auth.js";
import { CodeSender, PhoneAuthRepository, type GuestSummary } from "./ports.js";
import { IssueSession } from "./sessions.js";

const HOUR_MS = 60 * 60 * 1000;

/** Код входа: POST /auth/phone/code — не чаще раза в минуту и не больше 5 в час на номер */
@Injectable()
export class RequestPhoneCode {
  constructor(
    private readonly auth: PhoneAuthRepository,
    private readonly sender: CodeSender
  ) {}

  async execute(phone: string, now = new Date()): Promise<{ resendAfter: number; expiresIn: number; demoCode?: string }> {
    const recent = await this.auth.codesSince(phone, new Date(now.getTime() - HOUR_MS));
    const last = recent[0];
    if (last && now.getTime() - last.createdAt.getTime() < CODE_RESEND_MS) {
      const retryAfter = Math.ceil((last.createdAt.getTime() + CODE_RESEND_MS - now.getTime()) / 1000);
      throw new AuthError("too_many_requests", `Новый код можно запросить через ${retryAfter} с`, { retryAfter });
    }
    if (recent.length >= CODES_PER_HOUR) {
      const retryAfter = Math.ceil((recent[recent.length - 1].createdAt.getTime() + HOUR_MS - now.getTime()) / 1000);
      throw new AuthError("too_many_requests", "Слишком много кодов — попробуйте позже", { retryAfter });
    }
    const code = newCode();
    await this.auth.createCode(phone, hashCode(phone, code), new Date(now.getTime() + CODE_TTL_MS), now);
    await this.sender.send(phone, code);
    const sent = { resendAfter: CODE_RESEND_MS / 1000, expiresIn: CODE_TTL_MS / 1000 };
    return this.sender.revealsCode ? { ...sent, demoCode: code } : sent;
  }
}

export type Verification =
  | { status: "signed_in"; user: GuestSummary; session: { token: string; expiresAt: Date } }
  | { status: "needs_registration"; registrationToken: string };

/**
 * Проверка кода: POST /auth/phone/verify. Проверяется только последний код номера.
 * Номер с картой — сессия, новый — токен регистрации.
 */
@Injectable()
export class VerifyPhoneCode {
  constructor(
    private readonly auth: PhoneAuthRepository,
    private readonly sessions: IssueSession
  ) {}

  async execute(phone: string, code: string, now = new Date(), userAgent: string | null = null): Promise<Verification> {
    const [last] = await this.auth.codesSince(phone, new Date(now.getTime() - CODE_TTL_MS));
    if (!last || last.consumedAt || last.expiresAt <= now || last.attempts >= CODE_ATTEMPTS) {
      throw new AuthError("code_expired", "Код устарел — запросите новый");
    }
    if (!hashCode(phone, code).equals(last.codeHash)) {
      const attempts = await this.auth.failAttempt(last.id);
      const attemptsLeft = Math.max(0, CODE_ATTEMPTS - attempts);
      if (attemptsLeft === 0) {
        await this.auth.consumeCode(last.id, now);
        throw new AuthError("code_expired", "Попытки кончились — запросите новый код");
      }
      throw new AuthError("invalid_code", "Код не подошёл — проверьте цифры или запросите новый", { attemptsLeft });
    }
    if (!(await this.auth.consumeCode(last.id, now))) throw new AuthError("code_expired", "Код уже использован — запросите новый");

    const user = await this.auth.findUserByPhone(phone);
    if (user) return { status: "signed_in", user, session: await this.sessions.issue(user.id, now, userAgent) };

    const registrationToken = newRegistrationToken();
    await this.auth.createRegistration(hashRegistrationToken(registrationToken), phone, new Date(now.getTime() + REGISTRATION_TTL_MS));
    return { status: "needs_registration", registrationToken };
  }
}

export interface RegistrationInput {
  registrationToken: string;
  name: string;
  birthDate: string;
  email?: string;
  consents: { personalData: boolean; marketing: boolean };
}

/** Карта гостя: POST /auth/register — с 18 лет, после подтверждённого номера; сразу вход */
@Injectable()
export class RegisterGuest {
  constructor(
    private readonly auth: PhoneAuthRepository,
    private readonly sessions: IssueSession
  ) {}

  async execute(input: RegistrationInput, now = new Date(), userAgent: string | null = null) {
    const name = input.name.trim();
    if (!name) throw new AuthError("invalid_registration", "Напишите, как к вам обращаться");
    if (!isAdult(input.birthDate, localDate(now, TIMEZONE))) throw new AuthError("underage", "Кабинет доступен только с 18 лет");

    const phone = await this.auth.takeRegistration(hashRegistrationToken(input.registrationToken), now);
    if (!phone) throw new AuthError("registration_expired", "Подтвердите номер заново — прошло больше 15 минут");

    const guest =
      (await this.auth.createGuest({
        name,
        phone,
        birthDate: input.birthDate,
        email: input.email?.trim() || null,
        cardNumber: newCardNumber(),
        marketingConsent: input.consents.marketing,
        consentAt: now,
        consentVersion: CONSENT_VERSION,
      })) ?? (await this.auth.findUserByPhone(phone));
    if (!guest) throw new AuthError("registration_expired", "Подтвердите номер заново");
    return { user: guest, session: await this.sessions.issue(guest.id, now, userAgent) };
  }
}
