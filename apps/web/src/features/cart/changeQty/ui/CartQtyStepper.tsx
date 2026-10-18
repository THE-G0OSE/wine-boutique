import type { FC } from "react";
import { CART_MAX_QTY, cartActions, type CartItem } from "@/entities/cart";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { QtyStepper } from "uikit;/";

interface IProps {
  item: CartItem;
  size?: "sm" | "md";
  className?: string;
}

const CartQtyStepper: FC<IProps> = ({ item, size, className }) => {
  const dispatch = useAppDispatch();
  const change = (delta: number) => dispatch(cartActions.changeQty({ wineId: item.wine.id, delta }));

  return (
    <QtyStepper
      value={item.qty}
      max={CART_MAX_QTY}
      onDecrement={() => change(-1)}
      onIncrement={() => change(1)}
      decrementLabel={`Меньше: ${item.wine.name}`}
      incrementLabel={`Больше: ${item.wine.name}`}
      size={size}
      className={className}
    />
  );
};

export default CartQtyStepper;
