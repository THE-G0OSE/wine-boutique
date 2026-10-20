import type { FC } from "react";
import { crateStencil, type MonthlyCrate } from "@/entities/monthlyCrate";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/cn";

interface IProps {
  crate: MonthlyCrate;
  /** hero — большой ящик с месяцем и строкой «2026 · ТРИ ВИНА · ОСЕНЬ», thumb — ящик архива с сокращением и годом */
  size: "hero" | "thumb";
  className?: string;
}

/** Деревянный ящик с выжженным трафаретом месяца (макеты Monthly и MMonthly) */
const Crate: FC<IProps> = ({ crate, size, className }) => {
  const stencil = crateStencil(crate.month, crate.wines.length);
  const isHero = size === "hero";
  return (
    <span className={cn("@container relative block overflow-hidden rounded-md shadow-panel", className)}>
      <img src={asset("/images/textures/shelf.webp")} alt="" className="absolute inset-0 size-full object-cover brightness-95 saturate-80" />
      {/* Доски и торцевые планки */}
      {isHero ? (
        <>
          <span aria-hidden="true" className="absolute inset-x-0 top-1/3 h-0.75 bg-black/45" />
          <span aria-hidden="true" className="absolute inset-x-0 top-2/3 h-0.75 bg-black/45" />
          <span aria-hidden="true" className="absolute inset-y-0 left-[4%] w-[7%] bg-black/18 shadow-[inset_-2px_0_0_rgb(0_0_0/0.3)]" />
          <span aria-hidden="true" className="absolute inset-y-0 right-[4%] w-[7%] bg-black/18 shadow-[inset_2px_0_0_rgb(0_0_0/0.3)]" />
        </>
      ) : (
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-0.75 bg-black/45" />
      )}
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center font-paper-display text-note-ink/85 uppercase mix-blend-multiply">
        <span className="leading-none font-bold tracking-[0.08em]" style={{ fontSize: isHero ? "14cqw" : "19cqw" }}>
          {isHero ? stencil.month : stencil.short}
        </span>
        <span className="mt-[1cqw] tracking-[0.3em]" style={{ fontSize: isHero ? "4.4cqw" : "10cqw" }}>
          {isHero ? stencil.line : stencil.year}
        </span>
      </span>
    </span>
  );
};

export default Crate;
