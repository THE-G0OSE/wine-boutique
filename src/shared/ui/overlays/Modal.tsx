import { motion } from "motion/react";
import type { FC, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import Overlay from "./Overlay";

interface IProps {
  open: boolean;
  onClose?: () => void;
  /** Доступное имя диалога: либо `label`, либо id заголовка в `labelledBy` */
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  className?: string;
  backdropClassName?: string;
  children: ReactNode;
}

/** Диалог по центру экрана; появляется «подъёмом» (wbRise из дизайна) */
const Modal: FC<IProps> = ({ open, onClose, label, labelledBy, describedBy, className, backdropClassName, children }) => {
  return (
    <Overlay
      open={open}
      onClose={onClose}
      backdropClassName={backdropClassName}
      className="flex items-center justify-center p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        className={cn("relative max-h-full overflow-auto outline-none", className)}
      >
        {children}
      </motion.div>
    </Overlay>
  );
};

export default Modal;
