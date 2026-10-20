import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, FC } from "react";
import { HALL_LAYOUTS, type HallLayout } from "@/entities/hall";
import { cn } from "@/shared/lib/cn";
import { planSwap } from "../../../model/animations";
import { HALL_PLANS, type PlanPiece } from "../../../model/mock";

interface IProps {
  layout: HallLayout;
  variant: "desktop" | "mobile";
}

/** Кегль, который сжимается с листом (ширина листа — 100cqw), но не меньше `min` */
const planFont = (px: number, width: number, min: number) => `clamp(${min}px, ${(px / width) * 100}cqw, ${px}px)`;

const hatch = "bg-[repeating-linear-gradient(45deg,color-mix(in_srgb,var(--color-blueprint-ink)_12%,transparent)_0_2px,transparent_2px_8px)]";

/**
 * Лист чертежа «Зал под сводами»: калька в клетку, арки, стеллажи, вход и мебель выбранной рассадки.
 * Координаты мебели — из макета, на странице — в процентах листа, поэтому чертёж сжимается целиком.
 */
const Blueprint: FC<IProps> = ({ layout, variant }) => {
  const isDesktop = variant === "desktop";
  const plan = HALL_PLANS[variant];
  const pct = (value: number, of: number) => `${(value / of) * 100}%`;
  const place = (piece: Pick<PlanPiece, "x" | "y" | "w" | "h">): CSSProperties => ({
    left: pct(piece.x, plan.width),
    top: pct(piece.y, plan.height),
    width: pct(piece.w, plan.width),
    height: pct(piece.h, plan.height),
  });
  const { title, capacity } = HALL_LAYOUTS[layout];

  return (
    <figure
      className={cn("relative m-0 bg-blueprint text-blueprint-ink", {
        "-rotate-[0.3deg] rounded-md p-9 shadow-panel": isDesktop,
        "rounded p-3.5 shadow-popover": !isDesktop,
      })}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-[inherit] bg-[linear-gradient(color-mix(in_srgb,var(--color-blueprint-ink)_9%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-blueprint-ink)_9%,transparent)_1px,transparent_1px)]",
          { "bg-size-[24px_24px]": isDesktop, "bg-size-[16px_16px]": !isDesktop }
        )}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_at_15%_10%,rgb(255_255_255/0.4),transparent_50%),radial-gradient(ellipse_at_90%_95%,rgb(120_80_40/0.25),transparent_55%)]"
      />
      <div
        role="img"
        aria-label={`План зала: ${title.toLowerCase()}, до ${capacity} гостей`}
        className={cn("@container relative border-blueprint-ink outline outline-blueprint-ink", {
          "border-3 outline-offset-6": isDesktop,
          "border-2 outline-offset-4": !isDesktop,
        })}
        style={{ aspectRatio: `${plan.width} / ${plan.height}` }}
      >
        {/* Своды, стеллажи по стенам, проём входа */}
        <div
          aria-hidden="true"
          className={cn("absolute inset-x-0 top-0 bg-repeat-x", {
            "h-10 bg-[radial-gradient(circle_at_50%_100%,transparent_38px,var(--color-blueprint-ink)_39px,var(--color-blueprint-ink)_41px,transparent_42px)] bg-size-[120px_80px]":
              isDesktop,
            "h-5.5 bg-[radial-gradient(circle_at_50%_100%,transparent_20px,var(--color-blueprint-ink)_21px,var(--color-blueprint-ink)_22px,transparent_23px)] bg-size-[60px_44px]":
              !isDesktop,
          })}
        />
        {(["left-0 border-r-2", "right-0 border-l-2"] as const).map((side) => (
          <div
            key={side}
            aria-hidden="true"
            className={cn("absolute border-blueprint-ink", side, {
              "top-17.5 bottom-17.5 w-8.5 bg-[repeating-linear-gradient(180deg,transparent_0_14px,color-mix(in_srgb,var(--color-blueprint-ink)_50%,transparent)_14px_16px)]": isDesktop,
              "top-10 bottom-10 w-4.5 bg-[repeating-linear-gradient(180deg,transparent_0_9px,color-mix(in_srgb,var(--color-blueprint-ink)_50%,transparent)_9px_10px)]": !isDesktop,
            })}
          />
        ))}
        {isDesktop ? (
          <span className="absolute font-paper italic" style={{ left: pct(48, plan.width), top: pct(54, plan.height), fontSize: planFont(16, plan.width, 11) }}>
            стеллажи с вином
          </span>
        ) : null}
        {isDesktop ? <div aria-hidden="true" className="absolute -bottom-0.75 left-1/2 h-1.5 w-[11%] -translate-x-1/2 bg-blueprint" /> : null}
        <span
          className={cn("absolute left-1/2 -translate-x-1/2 font-paper tracking-[0.2em] uppercase", { "bottom-3": isDesktop, "bottom-1.5 text-[11px]": !isDesktop })}
          style={isDesktop ? { fontSize: planFont(15, plan.width, 11) } : undefined}
        >
          вход
        </span>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={layout} variants={planSwap} initial="hidden" animate="visible" exit="hidden" className="absolute inset-0">
            {plan.pieces[layout].map((piece, index) => (
              <span
                key={index}
                aria-hidden="true"
                style={place(piece)}
                className={cn("absolute border-blueprint-ink", {
                  "rounded-md border-2 bg-blueprint-ink/12": piece.kind === "chair" && isDesktop,
                  "rounded border-[1.5px] bg-blueprint-ink/12": piece.kind === "chair" && !isDesktop,
                  [hatch]: piece.kind !== "chair",
                  "rounded-sm border-[2.5px]": piece.kind === "table" && isDesktop,
                  "rounded-[3px] border-2": piece.kind === "table" && !isDesktop,
                  "rounded-full border-[2.5px]": piece.kind === "round" && isDesktop,
                  "rounded-full border-2": piece.kind === "round" && !isDesktop,
                })}
              />
            ))}
            {plan.notes[layout].map((note) => (
              <span
                key={note.text}
                className="absolute font-paper whitespace-nowrap italic"
                style={{ left: pct(note.x, plan.width), top: pct(note.y, plan.height), fontSize: planFont(17, plan.width, 11) }}
              >
                {note.text}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <figcaption className={cn("relative flex justify-between font-paper", { "mt-4.5": isDesktop, "mt-2.5 text-micro": !isDesktop })}>
        {isDesktop ? (
          <>
            <span className="text-[22px] font-bold">
              Лист 1 · Зал под сводами · {title} · до {capacity} гостей
            </span>
            <span className="text-caption italic">М 1:50 · 86 м²</span>
          </>
        ) : (
          <>
            <b>
              {title} · до {capacity} гостей
            </b>
            <i>86 м²</i>
          </>
        )}
      </figcaption>
    </figure>
  );
};

export default Blueprint;
