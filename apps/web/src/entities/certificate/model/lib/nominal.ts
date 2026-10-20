import { plural } from "@/shared/lib/plural";
import type { CertificateDraft, CertificateFormat } from "../types";

/** Готовые номиналы (макет Certificates) и границы своей суммы — как в контракте */
export const CERTIFICATE_NOMINALS = [5_000, 10_000, 25_000];
export const CERTIFICATE_MIN = 3_000;
export const CERTIFICATE_MAX = 300_000;
export const CERTIFICATE_NAME_LENGTH = 24;
export const CERTIFICATE_MESSAGE_LENGTH = 90;

export const CERTIFICATE_FORMATS: Record<CertificateFormat, { title: string; note: { desktop: string; mobile: string }; caption: string }> = {
  email: {
    title: "Электронный",
    note: { desktop: "PDF на e-mail сразу", mobile: "PDF на e-mail" },
    caption: "Электронный сертификат: придёт на e-mail получателя в выбранный день.",
  },
  envelope: {
    title: "В конверте",
    note: { desktop: "с сургучом, забрать в бутике", mobile: "забрать в бутике" },
    caption: "Печатный сертификат на плотной бумаге в конверте с сургучной печатью.",
  },
};

/** Как в макете: 10 000, в конверте; имена и пожелание — подсказки на превью, пока гость не написал своё */
export const DEFAULT_CERTIFICATE: CertificateDraft = { nominal: 10_000, custom: false, to: "", from: "", message: "", format: "envelope" };
export const CERTIFICATE_SAMPLE = { to: "Анне", from: "Михаила", message: "Пусть каждая бутылка будет поводом." };

const ONES = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const ONES_FEMININE = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
const TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
const HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

const triad = (n: number, feminine: boolean) => {
  const words = [HUNDREDS[Math.floor(n / 100)]];
  const rest = n % 100;
  if (rest >= 10 && rest < 20) words.push(TEENS[rest - 10]);
  else words.push(TENS[Math.floor(rest / 10)], (feminine ? ONES_FEMININE : ONES)[rest % 10]);
  return words.filter(Boolean).join(" ");
};

/** 25 000 → «двадцать пять тысяч рублей» — строка прописью на сертификате (до 999 999) */
export const rublesInWords = (rubles: number) => {
  const thousands = Math.floor(rubles / 1000);
  const units = rubles % 1000;
  const parts: string[] = [];
  if (thousands) parts.push(`${triad(thousands, true)} ${plural(thousands, ["тысяча", "тысячи", "тысяч"])}`);
  if (units) parts.push(triad(units, false));
  return `${parts.join(" ") || "ноль"} ${plural(rubles, ["рубль", "рубля", "рублей"])}`;
};

/** Действителен год: «20.10.2027» */
export const formatValidUntil = (date: string) => date.split("-").reverse().join(".");
