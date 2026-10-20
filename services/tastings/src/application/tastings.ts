import { Injectable } from "@nestjs/common";
import { zonedInstant } from "@wine/service-kit";
import { CELLAR_TIMEZONE, CONSENT_VERSION, nextMonth, seatsLeft, statusOf, TastingError, type Tasting } from "../domain/tasting.js";
import { TastingRepository } from "./ports.js";

/** Афиша месяца «2026-10»: GET /tastings?month= */
@Injectable()
export class ListTastings {
  constructor(private readonly tastings: TastingRepository) {}

  execute(month: string): Promise<Tasting[]> {
    return this.tastings.listBetween(
      zonedInstant(`${month}-01`, "00:00", CELLAR_TIMEZONE),
      zonedInstant(`${nextMonth(month)}-01`, "00:00", CELLAR_TIMEZONE)
    );
  }
}

export interface GuestInput {
  userId?: string | null;
  name: string;
  phone: string;
  guests: number;
}

const INVALID = "Проверьте имя и телефон и отметьте согласие";

/** Дегустация, на которую ещё можно записаться или встать в лист: есть и не началась */
const upcoming = async (tastings: TastingRepository, id: string, now: Date) => {
  const tasting = await tastings.find(id);
  if (!tasting) throw new TastingError("not_found", "Такой дегустации нет");
  if (statusOf(tasting, now) === "past") throw new TastingError("tasting_closed", "Дегустация уже началась");
  return tasting;
};

const notEnoughSeats = (left: number) =>
  new TastingError("not_enough_seats", left ? `Осталось мест: ${left}` : "Мест не осталось — запишитесь в лист ожидания", { seatsLeft: left });

/** Запись: POST /tastings/{id}/bookings */
@Injectable()
export class BookTasting {
  constructor(private readonly tastings: TastingRepository) {}

  async execute(id: string, input: GuestInput, now = new Date()): Promise<{ bookingId: string; tasting: Tasting; guests: number; customerName: string }> {
    const customerName = input.name.trim();
    if (!customerName) throw new TastingError("invalid_booking", INVALID);
    const tasting = await upcoming(this.tastings, id, now);
    if (seatsLeft(tasting) < input.guests) throw notEnoughSeats(seatsLeft(tasting));

    const booked = await this.tastings.book(
      { tastingId: id, userId: input.userId ?? null, customerName, phone: input.phone, guests: input.guests, consentAt: now, consentVersion: CONSENT_VERSION },
      now
    );
    if (!booked) {
      // Места заняли между проверкой и записью — отвечаем по свежему состоянию
      const fresh = await upcoming(this.tastings, id, now);
      throw notEnoughSeats(seatsLeft(fresh));
    }
    return { ...booked, guests: input.guests, customerName };
  }
}

/** Лист ожидания: POST /tastings/{id}/waitlist — только когда мест нет */
@Injectable()
export class JoinWaitlist {
  constructor(private readonly tastings: TastingRepository) {}

  async execute(id: string, input: GuestInput, now = new Date()): Promise<void> {
    const customerName = input.name.trim();
    if (!customerName) throw new TastingError("invalid_booking", INVALID);
    const tasting = await upcoming(this.tastings, id, now);
    if (seatsLeft(tasting) > 0) throw new TastingError("seats_available", "Место освободилось — можно записаться");
    await this.tastings.wait({
      tastingId: id,
      userId: input.userId ?? null,
      customerName,
      phone: input.phone,
      guests: input.guests,
      consentAt: now,
      consentVersion: CONSENT_VERSION,
    });
  }
}

/** Мои дегустации: GET /me/tastings — предстоящие по времени, затем прошедшие от свежих; записи на одну дегустацию складываются */
@Injectable()
export class ListMyTastings {
  constructor(private readonly tastings: TastingRepository) {}

  async execute(userId: string, now = new Date()) {
    const merged = new Map<string, { tasting: Tasting; kind: "booking" | "waitlist"; guests: number }>();
    for (const entry of await this.tastings.listForUser(userId)) {
      const key = `${entry.tasting.id}:${entry.kind}`;
      const known = merged.get(key);
      merged.set(key, known ? { ...known, guests: known.guests + entry.guests } : entry);
    }
    const list = [...merged.values()];
    const upcoming = list.filter(({ tasting }) => tasting.startsAt > now).sort((a, b) => a.tasting.startsAt.getTime() - b.tasting.startsAt.getTime());
    const past = list.filter(({ tasting }) => tasting.startsAt <= now).sort((a, b) => b.tasting.startsAt.getTime() - a.tasting.startsAt.getTime());
    return [...upcoming, ...past];
  }
}
