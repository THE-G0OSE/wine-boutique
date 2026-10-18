import { useState } from "react";

/**
 * Последнее непустое значение. Нужно оверлеям: при закрытии данные уже null,
 * а содержимое должно остаться на экране, пока проигрывается анимация исчезновения.
 */
export const useLastDefined = <T>(value: T | null | undefined) => {
  const [last, setLast] = useState<T | null>(value ?? null);
  if (value != null && value !== last) setLast(value);
  return value ?? last;
};
