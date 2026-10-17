import { cn } from "@/shared/lib/cn";
import type { FC, ReactNode } from "react";
import { Link } from "react-router";

interface IProps {
  to: string;
  tone: "yellow" | "pink";
  rotate: number;
  className?: string;
  children: ReactNode;
}

/** Стикер-записка от руки, приклеенный рядом с вырезкой. Это ссылка: на полку, на дегустацию */
const StickyNote: FC<IProps> = ({ to, tone, rotate, className, children }) => (
  <Link
    to={to}
    className={cn(
      "block font-hand text-note-ink no-underline shadow-[0_18px_30px_rgba(0,0,0,0.5)] transition-[translate] duration-200 hover:-translate-y-1",
      "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200",
      tone === "yellow" ? "bg-note-yellow" : "bg-note-pink",
      className
    )}
    style={{ rotate: `${rotate}deg` }}
  >
    {children}
  </Link>
);

export default StickyNote;
