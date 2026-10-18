import { cn } from "@/shared/lib/cn";
import type { FC, ReactNode } from "react";
import { Newsprint } from "uikit;/";

interface IProps {
  children: ReactNode;
  /** Сгиб посередине листа — у развёрнутой газеты на десктопе */
  folded?: boolean;
  className?: string;
}

/** Газетный лист: фактура бумаги, лёгкая подсветка, тёмная краска и тень на столе */
const PaperSheet: FC<IProps> = ({ children, folded = false, className }) => {
  return (
    <article className={cn("relative overflow-hidden font-paper text-ink", className)}>
      <Newsprint overlayClassName="shadow-[inset_0_0_60px_rgba(120,85,35,0.2)] lg:bg-[rgba(250,245,234,0.38)] lg:shadow-[inset_0_0_140px_rgba(120,85,35,0.2)]" />
      {folded && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-6.5 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(80,60,30,0.1)_45%,rgba(255,255,255,0.35)_52%,rgba(0,0,0,0)_100%)]"
        />
      )}
      <div className="relative">{children}</div>
    </article>
  );
};

export default PaperSheet;
