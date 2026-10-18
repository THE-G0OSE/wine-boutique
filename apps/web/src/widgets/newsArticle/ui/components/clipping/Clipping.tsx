import { cn } from "@/shared/lib/cn";
import type { FC, ReactNode } from "react";
import { Newsprint } from "uikit;/";
import { TORN_EDGE } from "../../../model/decor";

interface IProps {
  children: ReactNode;
  /** Наклон вырезки на столе, градусы */
  rotate?: number;
  /** Внешний контейнер: ширина, отступы */
  className?: string;
  /** Поля внутри бумаги */
  paddingClassName?: string;
}

/** Газетная вырезка с рваным краем, лежащая на столе с тенью */
const Clipping: FC<IProps> = ({ children, rotate = 0, className, paddingClassName = "p-7" }) => (
  <div
    className={cn(
      "relative [filter:drop-shadow(0_26px_30px_rgba(0,0,0,0.55))_drop-shadow(0_3px_4px_rgba(0,0,0,0.4))]",
      className
    )}
    style={{ rotate: `${rotate}deg` }}
  >
    <div className={cn("relative overflow-hidden font-paper text-ink", paddingClassName)} style={{ clipPath: TORN_EDGE }}>
      <Newsprint />
      <div className="relative">{children}</div>
    </div>
  </div>
);

export default Clipping;
