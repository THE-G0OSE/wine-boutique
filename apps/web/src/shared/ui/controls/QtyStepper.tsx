import type { FC } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementLabel: string;
  incrementLabel: string;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "form";
  className?: string;
}

const sizeToClass = {
  sm: { button: "h-9 w-10 text-lg", value: "h-9 w-9 text-micro" },
  md: { button: "h-9 w-11 text-md", value: "h-9 min-w-10 text-[15px]" },
  // Карточка вина: 52×56, на тёмной подложке
  lg: { button: "h-14 w-13 bg-cellar-950/70 text-lg", value: "h-14 w-14 bg-cellar-950/70 text-caption" },
  // Формы записи: 48×48 на фоне погреба
  form: { button: "h-12 w-12 bg-cellar-950 text-[22px]", value: "h-12 w-13 text-[17px]" },
};

/** Счётчик «− n +» из трёх сегментов */
const QtyStepper: FC<IProps> = ({
  value,
  onDecrement,
  onIncrement,
  decrementLabel,
  incrementLabel,
  min = 1,
  max = 99,
  size = "md",
  className,
}) => {
  const button =
    "cursor-pointer border border-cellar-700 bg-transparent p-0 text-white transition-colors hover:border-amber-350 disabled:cursor-default disabled:text-neutral-500 disabled:hover:border-cellar-700";

  return (
    <div className={cn("flex items-center", className)}>
      <button
        type="button"
        aria-label={decrementLabel}
        onClick={onDecrement}
        disabled={value <= min}
        className={cn(button, "rounded-l-full", sizeToClass[size].button)}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={cn(
          "flex items-center justify-center border-y border-cellar-700 px-1 font-system",
          sizeToClass[size].value
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={incrementLabel}
        onClick={onIncrement}
        disabled={value >= max}
        className={cn(button, "rounded-r-full", sizeToClass[size].button)}
      >
        +
      </button>
    </div>
  );
};

export default QtyStepper;
