import type { Boutique } from "../domain/pickup.js";
import type { Reservation, ReservationItem } from "../domain/reservation.js";

export abstract class BoutiqueRepository {
  abstract list(): Promise<Boutique[]>;
  abstract find(id: string): Promise<Boutique | null>;
}

export interface NewReservationRecord {
  /** Вошедший гость — бронь появится в кабинете; null — без входа */
  userId: string | null;
  boutiqueId: string;
  pickupAt: Date;
  holdUntil: Date;
  customerName: string;
  phone: string;
  email: string | null;
  comment: string | null;
  consentAt: Date;
  consentVersion: string;
  items: ReservationItem[];
}

export abstract class ReservationRepository {
  abstract create(record: NewReservationRecord): Promise<Reservation>;
  abstract find(id: string): Promise<Reservation | null>;
  /** Брони гостя от новых к старым */
  abstract listForUser(userId: string): Promise<Reservation[]>;
  /** Бронь гостя по id; чужая или нет — null */
  abstract findForUser(id: string, userId: string): Promise<Reservation | null>;
  abstract extend(id: string, holdUntil: Date, now: Date): Promise<Reservation>;
  abstract cancel(id: string): Promise<Reservation>;
}

/** Вино с полки — для снимка в брони */
export interface WineSnapshot {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  priceKopecks: number | null;
}

/**
 * Каталог вин — другой сервис (gRPC catalog), один пакетный вызов с дедлайном.
 * Не ответил — бросает CatalogUnavailable: бронь без проверки вин не создаём.
 */
export abstract class WineCatalog {
  abstract snapshots(ids: string[]): Promise<Map<string, WineSnapshot>>;
}

export class CatalogUnavailable extends Error {}
