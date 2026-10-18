import type { FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  /** newspaper — фактура с белёсой подсветкой (газета, вырезки); letter — фактура проступает сквозь цвет листа (письма, конверты) */
  variant?: "newspaper" | "letter";
  /** Классы подсветки поверх фактуры (насыщенность, внутренняя тень) — только для newspaper */
  overlayClassName?: string;
}

/**
 * Фактура газетной бумаги — подложка газетных листов, вырезок, первых полос в подшивке и писем.
 * Кладётся первым ребёнком в `relative overflow-hidden`-контейнер, контент — следом с `relative`.
 * Для letter цвет листа задаёт сам контейнер (`bg-letter`), фактура ложится на него умножением.
 */
const Newsprint: FC<IProps> = ({ variant = "newspaper", overlayClassName }) => (
  <>
    <img
      src="/images/textures/newspaper.webp"
      alt=""
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 size-full object-cover",
        { "opacity-55 mix-blend-multiply": variant === "letter" }
      )}
    />
    {variant === "newspaper" && (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-[rgba(250,245,234,0.4)] shadow-[inset_0_0_90px_rgba(120,85,35,0.22)]",
          overlayClassName
        )}
      />
    )}
  </>
);

export default Newsprint;
