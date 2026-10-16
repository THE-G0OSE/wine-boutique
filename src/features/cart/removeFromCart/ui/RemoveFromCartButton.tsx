import type { FC } from "react";
import { cartActions, type CartWine } from "@/entities/cart";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { cn } from "@/shared/lib/cn";

interface IProps {
  wine: CartWine;
  className?: string;
}

const RemoveFromCartButton: FC<IProps> = ({ wine, className }) => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      onClick={() => dispatch(cartActions.removeItem(wine.id))}
      aria-label={`Убрать из корзины: ${wine.name}`}
      className={cn(
        "h-8 cursor-pointer border-0 bg-transparent px-1 font-regular text-micro text-neutral-350 underline underline-offset-2 hover:text-white",
        className
      )}
    >
      Убрать
    </button>
  );
};

export default RemoveFromCartButton;
