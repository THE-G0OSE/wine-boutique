import { plural } from "@/shared/lib/plural";

const MONTHS = ["ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ", "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"];
/** Сокращения на маленьких ящиках архива — как в макете */
const SHORT = ["ЯНВ", "ФЕВ", "МАРТ", "АПР", "МАЙ", "ИЮНЬ", "ИЮЛЬ", "АВГ", "СЕНТ", "ОКТ", "НОЯБ", "ДЕК"];
const SEASONS = ["ЗИМА", "ЗИМА", "ВЕСНА", "ВЕСНА", "ВЕСНА", "ЛЕТО", "ЛЕТО", "ЛЕТО", "ОСЕНЬ", "ОСЕНЬ", "ОСЕНЬ", "ЗИМА"];
const MONTHS_PREPOSITIONAL = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const COUNT_WORDS = ["", "ОДНО", "ДВА", "ТРИ", "ЧЕТЫРЕ", "ПЯТЬ", "ШЕСТЬ"];

const monthIndex = (month: string) => Number(month.slice(5, 7)) - 1;

/** Трафарет на ящике: «ОКТЯБРЬ» и «2026 · ТРИ ВИНА · ОСЕНЬ» */
export const crateStencil = (month: string, wines: number) => ({
  month: MONTHS[monthIndex(month)],
  short: SHORT[monthIndex(month)],
  year: month.slice(0, 4),
  line: `${month.slice(0, 4)} · ${COUNT_WORDS[wines] ?? wines} ${plural(wines, ["ВИНО", "ВИНА", "ВИН"])} · ${SEASONS[monthIndex(month)]}`,
});

/** «Тема октября» */
export const crateMonthGenitive = (month: string) => MONTHS_PREPOSITIONAL[monthIndex(month)];
