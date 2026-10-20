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
import { RequestsRepository, type StoredCertificate } from "./ports.js";

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

  execute(input: { plan: "duo" | "classic" | "cellar"; name: string; phone: string; boutiqueId: string }, now = new Date()) {
    const name = input.name.trim();
    if (!name) throw new InvalidRequest("Напишите, как к вам обращаться");
    return this.requests.upsertSubscription({ plan: input.plan, name, phone: input.phone, boutiqueId: input.boutiqueId.trim(), ...consent(now) });
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
