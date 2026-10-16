import type { FC, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  children: ReactNode;
  /** Цвет черты: amber — тёмная тема, wine — акцент текущего вина, muted — нейтральная */
  tone?: "amber" | "wine" | "muted";
  /** row — черта слева от подписи, column — черта над подписью */
  direction?: "row" | "column";
  /** lg — черта 40×3 и подпись 24px (десктоп), sm — 28×2 и 15px (мобильные) */
  size?: "lg" | "sm";
  className?: string;
  labelClassName?: string;
}

const toneToClass = {
  amber: "bg-amber-350",
  wine: "bg-wine-accent transition-colors duration-500",
  muted: "bg-neutral-350",
};

const sizeToClass = {
  lg: { dash: "h-[3px] w-10", label: "text-lg", gap: { row: "gap-3.5", column: "gap-3" } },
  sm: { dash: "h-0.5 w-7", label: "text-[15px]", gap: { row: "gap-2.5", column: "gap-2" } },
};

/** Черта + подпись над заголовком секции */
const Eyebrow: FC<IProps> = ({ children, tone = "amber", direction = "row", size = "lg", className, labelClassName }) => {
  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "items-center" : "flex-col",
        sizeToClass[size].gap[direction],
        className
      )}
    >
      <span aria-hidden="true" className={cn("block shrink-0", sizeToClass[size].dash, toneToClass[tone])} />
      <span className={cn("text-neutral-350", sizeToClass[size].label, labelClassName)}>{children}</span>
    </div>
  );
};

export default Eyebrow;
