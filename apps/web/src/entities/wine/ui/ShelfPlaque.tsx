import type { FC, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface IProps {
  children: ReactNode;
  /** lg — десктоп (Pacifico 30), sm — мобильные (Pacifico 20) */
  size?: "lg" | "sm";
  as?: "span" | "h2";
  id?: string;
  className?: string;
}

/** Латунная табличка с названием полки */
const ShelfPlaque: FC<IProps> = ({ children, size = "lg", as: Tag = "span", id, className }) => {
  return (
    <Tag
      id={id}
      className={cn(
        "m-0 inline-block rounded-md bg-linear-to-b from-amber-200 via-amber-300 to-amber-500 font-firm font-normal text-note-ink shadow-plaque",
        "text-shadow-engraved",
        { "px-7 pt-1.5 pb-2.5 text-xl leading-11": size === "lg", "px-4 pt-1 pb-1.5 text-md leading-7.5": size === "sm" },
        className
      )}
    >
      {children}
    </Tag>
  );
};

export default ShelfPlaque;
