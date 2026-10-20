import type { FC } from "react";
import { CELLAR_TIERS, type CellarCell } from "@/entities/cellarCell";
import { cn } from "@/shared/lib/cn";

interface IProps {
  cell: CellarCell;
  selected: boolean;
  variant: "desktop" | "mobile";
  onSelect: (number: string) => void;
}

/** Высота ячейки по размеру: малые ниже, большие выше (макеты: 92/120/150 и 64/80/100) */
const HEIGHT = {
  desktop: { small: "h-23", medium: "h-30", large: "h-37.5" },
  mobile: { small: "h-16", medium: "h-20", large: "h-25" },
};

/**
 * Ячейка на стене: латунная табличка с номером; свободная подсвечена изнутри, выбранная светится янтарём,
 * в занятой видны горлышки бутылок
 */
const CellButton: FC<IProps> = ({ cell, selected, variant, onSelect }) => {
  const busy = cell.status === "busy";
  const isDesktop = variant === "desktop";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`Ячейка ${cell.number}, ${CELLAR_TIERS[cell.tier].title.toLowerCase()}, ${busy ? "занята" : "свободна"}`}
      disabled={busy}
      onClick={() => onSelect(cell.number)}
      className={cn(
        "relative overflow-hidden rounded-md border p-0 inset-shadow-cell transition-[background,box-shadow] duration-250",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
        HEIGHT[variant][cell.tier],
        {
          "cursor-not-allowed border-cellar-700 bg-cellar-950": busy,
          "cursor-pointer border-amber-200/55 bg-[radial-gradient(ellipse_at_50%_90%,rgba(232,184,120,0.45)_0%,rgba(232,184,120,0.12)_60%,rgba(21,14,10,0.9)_100%)] hover:border-amber-200":
            !busy && !selected,
          "cursor-pointer border-amber-200 bg-[radial-gradient(ellipse_at_50%_80%,var(--color-amber-200)_0%,var(--color-amber-350)_60%,var(--color-amber-500)_100%)] shadow-cell-glow":
            selected,
        }
      )}
    >
      <span
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-[3px] bg-linear-to-b from-amber-200 to-amber-500 font-system font-semibold whitespace-nowrap text-note-ink",
          { "top-2 px-2 py-0.5 text-[11px]": isDesktop, "top-1.5 px-1.5 py-px text-[10px]": !isDesktop }
        )}
      >
        № {cell.number}
      </span>
      {busy ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-[12%] bottom-2.5 h-6.5 bg-[radial-gradient(circle_at_50%_50%,var(--color-rack-neck)_0_9px,transparent_10px)] bg-size-[25%_100%] bg-repeat-x"
        />
      ) : null}
    </button>
  );
};

export default CellButton;
