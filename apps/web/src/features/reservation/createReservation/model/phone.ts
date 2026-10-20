/**
 * Телефон в поле — «+7 916 123-45-67», в API — «+79161234567».
 * Первая восьмёрка или семёрка — код страны; номер без них дополняется семёркой.
 */
export const phoneDigits = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits && !digits.startsWith("7")) digits = `7${digits}`;
  return digits.slice(0, 11);
};

export const formatPhone = (value: string) => {
  const digits = phoneDigits(value);
  if (!digits) return "";
  const rest = digits.slice(1);
  const parts = [rest.slice(0, 3), rest.slice(3, 6), rest.slice(6, 8), rest.slice(8, 10)];
  let result = "+7";
  if (parts[0]) result += ` ${parts[0]}`;
  if (parts[1]) result += ` ${parts[1]}`;
  if (parts[2]) result += `-${parts[2]}`;
  if (parts[3]) result += `-${parts[3]}`;
  return result;
};

export const isCompletePhone = (value: string) => phoneDigits(value).length === 11;

export const toApiPhone = (value: string) => `+${phoneDigits(value)}`;
