import { Injectable } from "@nestjs/common";
import { localDate } from "@wine/service-kit";
import {
  certificateValidUntil,
  CONSENT_VERSION,
  HALL_CAPACITY,
  InvalidRequest,
  isHallDateAllowed,
  MONTHLY_ARCHIVE_SIZE,
  TIMEZONE,
  type HallLayout,
  type MonthlyCrate,
} from "../domain/requests.js";
import { RequestsRepository, type OwnedCertificate, type StoredCertificate, type StoredSubscription } from "./ports.js";

const consent = (now: Date) => ({ consentAt: now, consentVersion: CONSENT_VERSION });
const optional = (value: string | undefined) => value?.trim() || null;

/** Заявка на зал: POST /requests/hall */
@Injectable()
export class RequestHall {
  constructor(private readonly requests: RequestsRepository) {}

  execute(input: { layout: HallLayout; date: string; guests: number; phone: string }, now = new Date()) {
    if (input.guests > HALL_CAPACITY[input.layout]) throw new InvalidRequest(`В этой рассадке — до ${HALL_CAPACITY[input.layout]} гостей`);
    if (!isHallDateAllowed(input.date, now)) throw new InvalidRequest("Выберите дату с завтрашнего дня и не дальше чем через год");
    return this.requests.createRequest({
      kind: "hall",
      phone: input.phone,
      contactName: null,
      email: null,
      company: null,
      details: { layout: input.layout, date: input.date, guests: input.guests },
      ...consent(now),
    });
  }
}

export interface GiftInput {
  pack: string;
  bottles: number;
  extras: string[];
  engraving?: string;
  run: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
}

/** Запрос сметы на подарки: POST /requests/gift */
@Injectable()
export class RequestGifts {
  constructor(private readonly requests: RequestsRepository) {}

  execute(input: GiftInput, now = new Date()) {
    const company = input.company.trim();
    const contactName = input.contactName.trim();
    if (!company || !contactName) throw new InvalidRequest("Укажите компанию и контактное лицо");
    return this.requests.createRequest({
      kind: "gift",
      phone: input.phone,
      contactName,
      email: input.email.trim(),
      company,
      details: { pack: input.pack, bottles: input.bottles, extras: [...new Set(input.extras)], engraving: optional(input.engraving), run: input.run },
      ...consent(now),
    });
  }
}

/** Набор месяца: GET /monthly; null — ящиков ещё нет */
@Injectable()
export class GetMonthlyCrates {
  constructor(private readonly requests: RequestsRepository) {}

  async execute(now = new Date()): Promise<{ current: MonthlyCrate; archive: MonthlyCrate[] } | null> {
    const [current, ...archive] = await this.requests.listCrates(localDate(now, TIMEZONE).slice(0, 7), MONTHLY_ARCHIVE_SIZE + 1);
    return current ? { current, archive } : null;
  }
}

/** Подписка на набор месяца: POST /monthly/subscriptions */
@Injectable()
export class SubscribeMonthly {
  constructor(private readonly requests: RequestsRepository) {}

  execute(input: { plan: "duo" | "classic" | "cellar"; name: string; phone: string; boutiqueId: string; userId?: string | null }, now = new Date()) {
    const name = input.name.trim();
    if (!name) throw new InvalidRequest("Напишите, как к вам обращаться");
    return this.requests.upsertSubscription({ plan: input.plan, name, phone: input.phone, boutiqueId: input.boutiqueId.trim(), userId: input.userId ?? null, ...consent(now) });
  }
}

export interface CertificateInput {
  nominal: number;
  to: string;
  from: string;
  message?: string;
  format: "email" | "envelope";
  recipientEmail?: string;
  phone: string;
}

/** Сертификат: POST /certificates — ждёт оплаты, действует год */
@Injectable()
export class IssueCertificate {
  constructor(private readonly requests: RequestsRepository) {}

  execute(input: CertificateInput, now = new Date()): Promise<StoredCertificate> {
    const recipientName = input.to.trim();
    const senderName = input.from.trim();
    const recipientEmail = optional(input.recipientEmail);
    if (!recipientName || !senderName) throw new InvalidRequest("Напишите, кому и от кого сертификат");
    if (input.format === "email" && !recipientEmail) throw new InvalidRequest("Для электронного сертификата нужен e-mail получателя");
    return this.requests.createCertificate({
      year: Number(localDate(now, TIMEZONE).slice(0, 4)),
      nominal: input.nominal,
      recipientName,
      senderName,
      message: optional(input.message),
      format: input.format,
      recipientEmail: input.format === "email" ? recipientEmail : null,
      phone: input.phone,
      validUntil: certificateValidUntil(now),
      ...consent(now),
    });
  }
}

/** Следующий месяц по Москве: «2026-11» */
const nextMonth = (now: Date) => {
  const [y, m] = localDate(now, TIMEZONE).split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
};

/** Подписка в кабинете: GET и PATCH /me/monthly — пауза и пропуск следующего месяца */
@Injectable()
export class MyMonthly {
  constructor(private readonly requests: RequestsRepository) {}

  /** Пропуск в прошлом уже не действует — показываем как «не пропускаем» */
  private present(subscription: StoredSubscription | null, now: Date): StoredSubscription | null {
    if (!subscription || subscription.status === "cancelled") return null;
    const current = localDate(now, TIMEZONE).slice(0, 7);
    return subscription.skipMonth && subscription.skipMonth < current ? { ...subscription, skipMonth: null } : subscription;
  }

  async get(userId: string, now = new Date()) {
    return this.present(await this.requests.findSubscription(userId), now);
  }

  async update(userId: string, changes: { status?: "active" | "paused"; skipNext?: boolean }, now = new Date()) {
    const updated = await this.requests.updateSubscription(userId, {
      ...(changes.status && { status: changes.status }),
      ...(changes.skipNext !== undefined && { skipMonth: changes.skipNext ? nextMonth(now) : null }),
    });
    if (!updated) throw new InvalidRequest("Подписки нет");
    return this.present(updated, now);
  }
}

export class CertificateUnavailable extends Error {}
export class CertificateNotFound extends Error {}

/** Сертификаты в кабинете: GET /me/certificates и привязка по номеру POST /me/certificates */
@Injectable()
export class MyCertificates {
  constructor(private readonly requests: RequestsRepository) {}

  list(userId: string): Promise<OwnedCertificate[]> {
    return this.requests.listCertificates(userId);
  }

  async claim(userId: string, serial: string): Promise<OwnedCertificate> {
    const [, year, number] = /^WB-(\d{4})-(\d{6})$/.exec(serial) ?? [];
    const certificate = year ? await this.requests.findCertificate(Number(year), Number(number)) : null;
    if (!certificate) throw new CertificateNotFound("Такого сертификата нет — проверьте номер");
    if (certificate.ownerId === userId) return certificate;
    if (certificate.ownerId) throw new CertificateUnavailable("Сертификат уже привязан к другому кабинету");
    if (certificate.status !== "active") throw new CertificateUnavailable(certificate.status === "awaiting_payment" ? "Сертификат ещё не оплачен" : "Сертификат уже не действует");
    if (!(await this.requests.claimCertificate(Number(year), Number(number), userId))) throw new CertificateUnavailable("Сертификат уже привязан к другому кабинету");
    return { ...certificate, ownerId: userId };
  }
}
