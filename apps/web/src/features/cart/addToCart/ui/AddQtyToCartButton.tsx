import { useEffect, useState, type FC } from "react";
import { cartActions } from "@/entities/cart";
import type { WineSummary } from "@/entities/wine";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { cn } from "@/shared/lib/cn";

interface IProps {
  wine: WineSummary;
  qty: number;
  className?: string;
}

/** Сколько держится «Добавлено ✓» на кнопке (макет Product) */
const CONFIRM_MS = 1600;

/** «В корзину» на карточке вина: кладёт выбранное количество, на пару секунд показывает «Добавлено ✓» */
const AddQtyToCartButton: FC<IProps> = ({ wine, qty, className }) => {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        dispatch(cartActions.addItem({ wine, qty }));
        setAdded(true);
      }}
      className={cn(
        "cursor-pointer rounded-full border border-amber-350 bg-cellar-950/70 font-regular font-semibold text-white transition-colors hover:bg-amber-350/15",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
        className
      )}
    >
      <span aria-live="polite">{added ? "Добавлено ✓" : "В корзину"}</span>
    </button>
  );
};

export default AddQtyToCartButton;
