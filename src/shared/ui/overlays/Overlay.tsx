import { AnimatePresence, motion } from "motion/react";
import { useRef, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/cn";
import { useOverlayBehavior } from "./model/useOverlayBehavior";

interface IProps {
  open: boolean;
  /** Без onClose оверлей нельзя закрыть кликом по фону и Esc (например, 18+) */
  onClose?: () => void;
  closeLabel?: string;
  backdropClassName?: string;
  className?: string;
  children: ReactNode;
}

/** Портал в body с затемнением фона. Основа для Modal и Drawer */
const Overlay: FC<IProps> = ({ open, onClose, closeLabel = "Закрыть", backdropClassName, className, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior({ open, onClose, containerRef });

  return createPortal(
    <AnimatePresence>
      {open && (
        <div ref={containerRef} className={cn("fixed inset-0 z-50", className)}>
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label={closeLabel}
            disabled={!onClose}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "absolute inset-0 size-full cursor-pointer border-0 bg-[rgba(8,6,5,0.6)] p-0 backdrop-blur-[3px] disabled:cursor-default",
              backdropClassName
            )}
          />
          {children}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Overlay;
