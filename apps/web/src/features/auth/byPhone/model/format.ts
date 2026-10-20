/** Месяцы для выбора даты рождения */
export const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Исполнилось ли 18 к сегодняшнему дню «2026-10-20» — как проверяет сервис identity */
export const isAdult = (birthDate: string, today: string) => {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0) >= 18;
};

/** Номер без +7 для поля: «9165550188» → «916 555-01-88» */
export const formatNational = (digits: string) => {
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  return [parts[0], parts[1] && ` ${parts[1]}`, parts[2] && `-${parts[2]}`, parts[3] && `-${parts[3]}`].filter(Boolean).join("");
};

/** Цифры номера без кода страны: лишние 7/8 в начале отбрасываем, не больше 10 */
export const nationalDigits = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 10 && (digits.startsWith("7") || digits.startsWith("8"))) digits = digits.slice(1);
  return digits.slice(0, 10);
};
