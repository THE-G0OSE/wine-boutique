import type { FC } from "react";
import { LuCheck, LuPlus } from "react-icons/lu";
import { cartActions, cartSelectors } from "@/entities/cart";
import type { WineSummary } from "@/entities/wine";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { cn } from "@/shared/lib/cn";

interface IProps {
  wine: WineSummary;
  className?: string;
}

/** Круглая «+» на полке: кладёт бутылку в корзину; если вино уже там — «✓» и открывает корзину */
const AddToCartButton: FC<IProps> = ({ wine, className }) => {
  const dispatch = useAppDispatch();
  const inCart = useAppSelector((state) => cartSelectors.selectHasWine(state, wine.id));

  const handleClick = () => {
    if (inCart) dispatch(cartActions.open());
    else dispatch(cartActions.addItem({ wine }));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={inCart ? `В корзине: ${wine.name}. Открыть корзину` : `Добавить в корзину: ${wine.name}`}
      className={cn(
        "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-0 text-black transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
        inCart ? "bg-amber-200" : "bg-amber-350 hover:bg-amber-200",
        className
      )}
    >
      {inCart ? <LuCheck size={20} strokeWidth={2.4} aria-hidden="true" /> : <LuPlus size={20} strokeWidth={2.4} aria-hidden="true" />}
    </button>
  );
};

export default AddToCartButton;
