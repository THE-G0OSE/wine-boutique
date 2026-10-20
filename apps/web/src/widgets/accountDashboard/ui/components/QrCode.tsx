import type { FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  value: string;
  label: string;
  dimmed?: boolean;
  className?: string;
}

const SIZE = 21;

/** Простой детерминированный хеш строки — узор не меняется между рендерами */
const seedOf = (value: string) => [...value].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 2166136261);

/** Квадраты-маркеры по трём углам, как у QR */
const isFinder = (x: number, y: number) => {
  const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
  return inBox(0, 0) || inBox(SIZE - 7, 0) || inBox(0, SIZE - 7);
};
const finderCell = (x: number, y: number) => {
  const local = (v: number) => (v >= SIZE - 7 ? v - (SIZE - 7) : v);
  const lx = local(x);
  const ly = local(y);
  return lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
};

/**
 * Узор кода брони для кассы бутика. Кассир находит бронь по номеру под кодом; настоящий QR-кодировщик —
 * вместе с кассовой интеграцией, пока узор детерминированный по номеру брони
 */
const QrCode: FC<IProps> = ({ value, label, dimmed = false, className }) => {
  let seed = seedOf(value);
  const cells: boolean[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (isFinder(x, y)) cells.push(finderCell(x, y));
      else {
        seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
        cells.push((seed >>> 16) % 2 === 0);
      }
    }
  }
  return (
    <div role="img" aria-label={label} className={cn("grid aspect-square bg-paper p-2.5 transition-opacity", { "opacity-20": dimmed }, className)} style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
      {cells.map((on, index) => (
        <span key={index} className={cn({ "bg-ink": on })} />
      ))}
    </div>
  );
};

export default QrCode;
