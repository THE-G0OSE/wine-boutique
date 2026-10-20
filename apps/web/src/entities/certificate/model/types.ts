import type { ApiSchemas } from "@/shared/api";

export type Certificate = ApiSchemas["Certificate"];
export type CertificateFormat = ApiSchemas["CertificateFormat"];

/** Сертификат, который гость заполняет: превью и тело заявки */
export interface CertificateDraft {
  /** Номинал в рублях; null — «своя сумма» ещё не введена */
  nominal: number | null;
  custom: boolean;
  to: string;
  from: string;
  message: string;
  format: CertificateFormat;
}
