import type { FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  /** Классы подсветки поверх фактуры (насыщенность, внутренняя тень) */
  overlayClassName?: string;
}

/**
 * Фактура газетной бумаги — подложка газетных листов, вырезок и первых полос в подшивке.
 * Кладётся первым ребёнком в `relative overflow-hidden`-контейнер, контент — следом с `relative`.
 */
const Newsprint: FC<IProps> = ({ overlayClassName }) => (
  <>
    <img
      src="/images/textures/newspaper.webp"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full object-cover"
    />
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bg-[rgba(250,245,234,0.4)] shadow-[inset_0_0_90px_rgba(120,85,35,0.22)]",
        overlayClassName
      )}
    />
  </>
);

export default Newsprint;
