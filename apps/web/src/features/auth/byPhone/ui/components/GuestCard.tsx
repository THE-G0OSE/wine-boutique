import type { FC } from "react";
import { formatCardNumber } from "@/entities/session";
import { cn } from "@/shared/lib/cn";

interface IProps {
  name: string;
  cardNumber: string | null;
  variant: "desktop" | "mobile";
}

/** Карта гостя: тёмный пластик с золотым тиснением, номер и имя */
const GuestCard: FC<IProps> = ({ name, cardNumber, variant }) => {
  const isDesktop = variant === "desktop";
  return (
    <div
      aria-label={`Карта гостя ${cardNumber ? formatCardNumber(cardNumber) : ""}`}
      role="img"
      className={cn("relative overflow-hidden border border-amber-200/50 bg-[linear-gradient(135deg,var(--color-cellar-900)_0%,var(--color-rack-800)_55%,var(--color-cellar-950)_100%)]", {
        "h-67.5 rounded-[18px] shadow-popover": isDesktop,
        "h-50 rounded-2xl": !isDesktop,
      })}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgb(232_184_120/0.05)_0_2px,transparent_2px_9px)]" />
      <span className={cn("absolute font-firm text-amber-200", { "top-5.5 left-6.5 text-lg": isDesktop, "top-4 left-4.5 text-caption": !isDesktop })}>
        Premium Wine Boutique
      </span>
      {isDesktop ? (
        <span aria-hidden="true" className="absolute top-6 right-6.5 h-10.5 w-14 rounded-lg bg-[linear-gradient(135deg,var(--color-amber-200),var(--color-amber-500)_60%,var(--color-amber-200))]" />
      ) : null}
      <span className={cn("absolute font-system text-paper", { "bottom-15 left-6.5 text-[22px] tracking-[0.18em]": isDesktop, "bottom-11.5 left-4.5 text-caption tracking-[0.14em]": !isDesktop })}>
        {cardNumber ? formatCardNumber(cardNumber) : "•••• •••• ••••"}
      </span>
      <span className={cn("absolute tracking-[0.12em] text-neutral-350 uppercase", { "bottom-6.5 left-6.5 text-sm": isDesktop, "bottom-4.5 left-4.5 text-[13px]": !isDesktop })}>
        {name} · Гость
      </span>
    </div>
  );
};

export default GuestCard;
