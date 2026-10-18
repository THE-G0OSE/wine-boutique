import type { ButtonHTMLAttributes, FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** solid — активный залит янтарём (табы каталога), soft — янтарная обводка и подсветка (рубрики, фильтры) */
  variant?: "solid" | "soft";
}

const variantToClass = {
  solid: {
    on: "border-amber-350 bg-amber-350 font-semibold text-black",
    off: "border-cellar-700 bg-transparent text-neutral-350 hover:border-amber-350/60 hover:text-white",
  },
  soft: {
    on: "border-amber-350 bg-amber-350/20 text-amber-200",
    off: "border-cellar-700 bg-cellar-950/72 text-white hover:border-amber-350/60",
  },
};

/** Пилюля для табов и фильтров. Роль (tab, radio) и aria-атрибуты передаёт вызывающий */
const Chip: FC<IProps> = ({ active = false, variant = "solid", className, type = "button", ...props }) => {
  return (
    <button
      type={type}
      className={cn(
        "h-11 cursor-pointer rounded-full border px-5 font-regular text-sm transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
        active ? variantToClass[variant].on : variantToClass[variant].off,
        className
      )}
      {...props}
    />
  );
};

export default Chip;
