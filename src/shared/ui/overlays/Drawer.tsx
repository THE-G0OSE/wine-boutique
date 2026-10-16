import { motion } from "motion/react";
import type { FC, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import Overlay from "./Overlay";

interface IProps {
  open: boolean;
  onClose: () => void;
  /** right — панель справа (десктоп), bottom — нижняя шторка (мобильные) */
  side?: "right" | "bottom";
  label: string;
  closeLabel?: string;
  className?: string;
  children: ReactNode;
}

const sideToMotion = {
  right: { initial: { x: "100%" }, animate: { x: 0 } },
  bottom: { initial: { y: "100%" }, animate: { y: 0 } },
};

const sideToClass = {
  right: "top-0 right-0 bottom-0 w-full max-w-140 border-l border-amber-200/25 shadow-[-40px_0_80px_rgba(0,0,0,0.6)]",
  bottom: "inset-x-0 bottom-0 max-h-[86%] rounded-t-[26px] border-t border-amber-200/30 shadow-[0_-30px_60px_rgba(0,0,0,0.6)]",
};

/** Выезжающая панель (корзина) */
const Drawer: FC<IProps> = ({ open, onClose, side = "right", label, closeLabel, className, children }) => {
  return (
    <Overlay open={open} onClose={onClose} closeLabel={closeLabel}>
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        initial={sideToMotion[side].initial}
        animate={sideToMotion[side].animate}
        exit={sideToMotion[side].initial}
        transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
        className={cn("absolute flex flex-col bg-cellar-900 outline-none", sideToClass[side], className)}
      >
        {children}
      </motion.aside>
    </Overlay>
  );
};

export default Drawer;
