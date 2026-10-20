import type { FC } from "react";
import { cartActions, cartSelectors } from "@/entities/cart";
import type { WineSummary } from "@/entities/wine";
import { ROUTES } from "@/shared/config/routes";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { ButtonLink } from "uikit;/";

interface IProps {
  wine: WineSummary;
  qty?: number;
  className?: string;
}

/** «Забронировать» с карточки вина: если бутылки ещё нет в корзине — кладёт её и ведёт к брони */
const ReserveNowLink: FC<IProps> = ({ wine, qty = 1, className }) => {
  const dispatch = useAppDispatch();
  const inCart = useAppSelector((state) => cartSelectors.selectHasWine(state, wine.id));

  return (
    <ButtonLink
      to={ROUTES.reserve}
      size="xl"
      onClick={() => {
        if (!inCart) dispatch(cartActions.addItem({ wine, qty }));
      }}
      className={className}
    >
      Забронировать
    </ButtonLink>
  );
};

export default ReserveNowLink;
