import type { Tasting } from "../domain/tasting.js";

export interface GuestRecord {
  tastingId: string;
  customerName: string;
  phone: string;
  guests: number;
  consentAt: Date;
  consentVersion: string;
}

export abstract class TastingRepository {
  /** Дегустации с началом в [from, to), по времени начала */
  abstract listBetween(from: Date, to: Date): Promise<Tasting[]>;
  abstract find(id: string): Promise<Tasting | null>;
  /**
   * Занять места и записать гостя одной транзакцией. Места прибавляются условным UPDATE:
   * не началась и хватает мест. Не вышло (опередили) — null, ничего не записано
   */
  abstract book(record: GuestRecord, now: Date): Promise<{ bookingId: string; tasting: Tasting } | null>;
  /** Лист ожидания: тот же телефон на ту же дегустацию — обновить имя и гостей */
  abstract wait(record: GuestRecord): Promise<void>;
}
