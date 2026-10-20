import type { FC } from "react";
import { TASTING_KIND_ORDER, TASTING_KINDS, type TastingKind } from "@/entities/tasting";
import { cn } from "@/shared/lib/cn";

interface IProps {
  hidden: TastingKind[];
  onToggle: (kind: TastingKind) => void;
  className?: string;
}

/** Легенда типов — она же фильтр: нажатый тип скрывается из календаря и панели дня */
const KindLegend: FC<IProps> = ({ hidden, onToggle, className }) => {
  return (
    <div role="group" aria-label="Типы дегустаций" className={cn("flex gap-2.5", className)}>
      {TASTING_KIND_ORDER.map((kind) => {
        const shown = !hidden.includes(kind);
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={shown}
            onClick={() => onToggle(kind)}
            className={cn(
              "inline-flex h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-full border bg-cellar-950/75 px-4.5 text-white transition-opacity",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
              { "border-cellar-700": shown, "border-cellar-800 opacity-45": !shown }
            )}
          >
            <span aria-hidden="true" className={cn("size-3 rounded-full", TASTING_KINDS[kind].fill)} />
            {TASTING_KINDS[kind].label}
          </button>
        );
      })}
    </div>
  );
};

export default KindLegend;
