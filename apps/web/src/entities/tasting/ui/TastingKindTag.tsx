import type { FC } from "react";
import { cn } from "@/shared/lib/cn";
import { TASTING_KINDS } from "../model/lib/kinds";
import type { TastingKind } from "../model/types";

interface IProps {
  kind: TastingKind;
  /** md — панель дня (десктоп), sm — билет (мобильные) */
  size?: "md" | "sm";
  className?: string;
}

/** Бирка типа дегустации цветом её метки */
const TastingKindTag: FC<IProps> = ({ kind, size = "md", className }) => {
  return (
    <span
      className={cn(
        "inline-block self-start rounded-full text-cellar-950",
        TASTING_KINDS[kind].fill,
        { "px-3.5 py-1.5 text-micro": size === "md", "px-3 py-1 text-[13px]": size === "sm" },
        className
      )}
    >
      {TASTING_KINDS[kind].label}
    </span>
  );
};

export default TastingKindTag;
