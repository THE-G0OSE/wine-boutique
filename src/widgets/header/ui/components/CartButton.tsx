import type { FC } from "react";
import { LuShoppingBag } from "react-icons/lu";
import { cartActions, cartSelectors } from "@/entities/cart";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { cn } from "@/shared/lib/cn";
import { iconButtonClasses } from "uikit;/";

interface IProps {
  /** pill — кнопка с подписью (десктоп), icon — круглая с бейджем (мобильная) */
  variant: "pill" | "icon";
}

/** Кнопка корзины в шапке: показывает число бутылок и открывает шторку */
const CartButton: FC<IProps> = ({ variant }) => {
  const dispatch = useAppDispatch();
  const count = useAppSelector(cartSelectors.selectCount);
  const label = `Открыть корзину, бутылок: ${count}`;

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => dispatch(cartActions.open())}
        className={iconButtonClasses({ className: "border-amber-200/40 bg-cellar-950/50" })}
      >
        <LuShoppingBag size={20} aria-hidden="true" />
        <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-amber-350 px-1.25 text-center font-system text-[11px] leading-5 font-semibold text-black">
          {count}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => dispatch(cartActions.open())}
      className={cn(
        "flex h-11 cursor-pointer items-center gap-2.5 rounded-full border border-amber-200/45 bg-cellar-950/45 pr-4.5 pl-3.5 font-regular text-sm font-semibold text-white transition-colors hover:border-amber-200/80",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
      )}
    >
      <LuShoppingBag size={20} aria-hidden="true" />
      <span className="hidden xl:inline">Корзина</span>
      <span className="h-5.5 min-w-5.5 rounded-full bg-amber-350 px-1.5 text-center font-system text-xs leading-5.5 text-black">
        {count}
      </span>
    </button>
  );
};

export default CartButton;
