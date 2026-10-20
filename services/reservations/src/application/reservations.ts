import { Injectable } from "@nestjs/common";
import { holdUntilOf, isSlotAvailable, pickupDays, zonedInstant, type Boutique, type PickupDay } from "../domain/pickup.js";
import { CONSENT_VERSION, ReservationError, type Reservation, type ReservationItem } from "../domain/reservation.js";
import { BoutiqueRepository, CatalogUnavailable, ReservationRepository, WineCatalog } from "./ports.js";

/** Бутики по порядку: GET /boutiques */
@Injectable()
export class ListBoutiques {
  constructor(private readonly boutiques: BoutiqueRepository) {}

  execute(): Promise<Boutique[]> {
    return this.boutiques.list();
  }
}

/** Свободное время самовывоза на семь дней: GET /boutiques/{id}/slots; null — такого бутика нет */
@Injectable()
export class GetBoutiqueSlots {
  constructor(private readonly boutiques: BoutiqueRepository) {}

  async execute(id: string, now = new Date()): Promise<PickupDay[] | null> {
    const boutique = await this.boutiques.find(id);
    return boutique ? pickupDays(boutique, now) : null;
  }
}

export interface CreateReservationInput {
  boutiqueId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  items: { wineId: string; qty: number }[];
}

/**
 * Бронь: бутик и время — по правилам самовывоза, вина и цены — снимок из catalog одним вызовом.
 * Одно и то же вино в нескольких строках складывается.
 */
@Injectable()
export class CreateReservation {
  constructor(
    private readonly boutiques: BoutiqueRepository,
    private readonly reservations: ReservationRepository,
    private readonly catalog: WineCatalog
  ) {}

  async execute(input: CreateReservationInput, now = new Date()): Promise<{ reservation: Reservation; boutique: Boutique }> {
    const name = input.name.trim();
    const boutique = await this.boutiques.find(input.boutiqueId);
    if (!boutique || !name) throw new ReservationError("invalid_reservation", "Проверьте имя, телефон и отметьте обе галочки");
    if (!isSlotAvailable(boutique, input.date, input.time, now)) {
      throw new ReservationError("slot_unavailable", "Это время уже недоступно — выберите другое");
    }

    const qtyById = new Map<string, number>();
    for (const { wineId, qty } of input.items) qtyById.set(wineId, Math.min(12, (qtyById.get(wineId) ?? 0) + qty));

    let wines;
    try {
      wines = await this.catalog.snapshots([...qtyById.keys()]);
    } catch (error) {
      if (error instanceof CatalogUnavailable) {
        throw new ReservationError("catalog_unavailable", "Не удалось проверить бутылки — попробуйте через минуту");
      }
      throw error;
    }
    const unknown = [...qtyById.keys()].filter((id) => !wines.has(id));
    if (unknown.length) {
      throw new ReservationError("unknown_wines", "Некоторых бутылок уже нет на полках — уберите их из корзины", unknown);
    }

    const items: ReservationItem[] = [...qtyById].map(([wineId, qty]) => {
      const wine = wines.get(wineId)!;
      return { wineId, slug: wine.slug, name: wine.name, imageUrl: wine.imageUrl, qty, priceKopecks: wine.priceKopecks };
    });
    const reservation = await this.reservations.create({
      boutiqueId: boutique.id,
      pickupAt: zonedInstant(input.date, input.time, boutique.timezone),
      holdUntil: holdUntilOf(boutique, input.date),
      customerName: name,
      phone: input.phone,
      email: input.email?.trim() || null,
      comment: input.comment?.trim() || null,
      consentAt: now,
      consentVersion: CONSENT_VERSION,
      items,
    });
    return { reservation, boutique };
  }
}

/** Квитанция: GET /reservations/{id}; null — такой брони нет */
@Injectable()
export class GetReservation {
  constructor(
    private readonly reservations: ReservationRepository,
    private readonly boutiques: BoutiqueRepository
  ) {}

  async execute(id: string): Promise<{ reservation: Reservation; boutique: Boutique } | null> {
    const reservation = await this.reservations.find(id);
    if (!reservation) return null;
    const boutique = await this.boutiques.find(reservation.boutiqueId);
    return boutique ? { reservation, boutique } : null;
  }
}
