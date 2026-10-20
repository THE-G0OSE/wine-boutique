import type { MonthlyCrate } from "../domain/requests.js";

export interface Consent {
  consentAt: Date;
  consentVersion: string;
}

export interface NewServiceRequest extends Consent {
  kind: "hall" | "gift";
  phone: string;
  contactName: string | null;
  email: string | null;
  company: string | null;
  details: Record<string, unknown>;
}

export interface NewSubscription extends Consent {
  userId: string | null;
  phone: string;
  name: string;
  plan: "duo" | "classic" | "cellar";
  boutiqueId: string;
}

export interface NewCertificate extends Consent {
  year: number;
  nominal: number;
  recipientName: string;
  senderName: string;
  message: string | null;
  format: "email" | "envelope";
  recipientEmail: string | null;
  phone: string;
  validUntil: string;
}

export interface StoredSubscription {
  number: number;
  plan: "duo" | "classic" | "cellar";
  boutiqueId: string;
  status: "active" | "paused" | "cancelled";
  skipMonth: string | null;
}

export interface OwnedCertificate {
  number: number;
  year: number;
  nominal: number;
  balance: number;
  validUntil: string;
  senderName: string;
  status: "awaiting_payment" | "active" | "redeemed" | "expired";
  ownerId: string | null;
}

export interface StoredCertificate {
  id: string;
  number: number;
  year: number;
  nominal: number;
  validUntil: string;
  status: "awaiting_payment" | "active" | "redeemed" | "expired";
}

export abstract class RequestsRepository {
  abstract createRequest(record: NewServiceRequest): Promise<{ id: string; number: number }>;
  /** Подписка по телефону: есть — обновить набор, имя и бутик */
  abstract upsertSubscription(record: NewSubscription): Promise<{ id: string; number: number }>;
  abstract createCertificate(record: NewCertificate): Promise<StoredCertificate>;
  abstract listCrates(upToMonth: string, limit: number): Promise<MonthlyCrate[]>;
  /** Подписка гостя (последняя, если их несколько) */
  abstract findSubscription(userId: string): Promise<StoredSubscription | null>;
  abstract updateSubscription(userId: string, changes: { status?: "active" | "paused"; skipMonth?: string | null }): Promise<StoredSubscription | null>;
  abstract listCertificates(ownerId: string): Promise<OwnedCertificate[]>;
  abstract findCertificate(year: number, number: number): Promise<OwnedCertificate | null>;
  /** Привязать к кабинету, если ещё ни к кому не привязан; false — опередили */
  abstract claimCertificate(year: number, number: number, ownerId: string): Promise<boolean>;
}
