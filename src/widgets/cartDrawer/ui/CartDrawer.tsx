import type { FC } from "react";
import { Link } from "react-router";
import { LuHouse, LuX } from "react-icons/lu";
import { cartActions, cartSelectors, type CartItem } from "@/entities/cart";
import { formatWinePrice, formatWineRegionVolume } from "@/entities/wine";
import { CartQtyStepper } from "@/features/cart/changeQty";
import { RemoveFromCartButton } from "@/features/cart/removeFromCart";
import { ROUTES } from "@/shared/config/routes";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { formatPrice } from "@/shared/lib/formatPrice";
import { plural } from "@/shared/lib/plural";
import { cn } from "@/shared/lib/cn";
import { ButtonLink, Drawer, IconButton, Text } from "uikit;/";

const CartLine: FC<{ item: CartItem }> = ({ item }) => (
  <li className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-cellar-800 px-1 py-3 lg:grid-cols-[64px_minmax(0,1fr)_auto] lg:gap-4 lg:px-3 lg:py-3.5">
    <span className="flex h-19 w-12 items-end justify-center rounded-[10px] bg-cellar-800 lg:h-25 lg:w-16 lg:rounded-xl">
      <img
        src={item.wine.image}
        alt=""
        className="h-16.5 w-auto max-w-14 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] lg:h-22"
      />
    </span>
    <span className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-semibold lg:text-caption">{item.wine.name}</span>
      <span className="hidden text-micro text-neutral-350 lg:inline">{formatWineRegionVolume(item.wine)}</span>
      <CartQtyStepper item={item} size="sm" className="lg:mt-1" />
    </span>
    <span className="flex flex-col items-end gap-1.5 lg:gap-2.5">
      <span className="font-system text-[15px] font-semibold whitespace-nowrap text-amber-200 lg:text-[17px]">
        {formatWinePrice(item.wine.price === null ? null : item.wine.price * item.qty)}
      </span>
      <RemoveFromCartButton wine={item.wine} />
    </span>
  </li>
);

/**
 * Корзина-шторка: справа на десктопе, снизу на мобильных.
 * Доставки нет — бутылки бронируются на 3 дня и выдаются в бутике.
 */
const CartDrawer = () => {
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const isOpen = useAppSelector(cartSelectors.selectIsOpen);
  const items = useAppSelector(cartSelectors.selectItems);
  const count = useAppSelector(cartSelectors.selectCount);
  const total = useAppSelector(cartSelectors.selectTotal);

  const close = () => dispatch(cartActions.close());

  return (
    <Drawer open={isOpen} onClose={close} side={isDesktop ? "right" : "bottom"} label="Корзина" closeLabel="Закрыть корзину">
      {!isDesktop && <span aria-hidden="true" className="mt-2.5 h-1.25 w-11 self-center rounded-full bg-cellar-700" />}

      <div className="flex items-baseline justify-between px-5 pt-3 pb-2.5 lg:items-center lg:border-b lg:border-cellar-700 lg:px-9 lg:pt-7 lg:pb-5">
        <div className="flex items-baseline gap-3.5">
          <Text as="h2" FONT="FIRM" className="text-xl leading-11 lg:text-[40px] lg:leading-14">
            Корзина
          </Text>
          <span className="text-micro text-neutral-350 lg:text-sm">
            {count} {plural(count, ["бутылка", "бутылки", "бутылок"])}
          </span>
        </div>
        <IconButton label="Закрыть корзину" variant="outlineDark" onClick={close} className="hidden lg:inline-flex">
          <LuX size={20} aria-hidden="true" />
        </IconButton>
      </div>

      <ul className="m-0 flex flex-1 list-none flex-col overflow-auto px-4 lg:gap-1.5 lg:px-6 lg:py-3">
        {items.map((item) => (
          <CartLine key={item.wine.id} item={item} />
        ))}
        {items.length === 0 && (
          <li className="flex flex-col items-center gap-2 px-2.5 py-10 text-center text-neutral-350 lg:gap-3 lg:px-5 lg:py-15">
            <span className="font-firm text-[26px] text-white lg:text-xl">Здесь пока пусто</span>
            <span className="text-[15px] leading-[1.5] lg:text-[17px]">
              Загляните на полки — там ждут бутылки, которые уже готовы к открытию.
            </span>
          </li>
        )}
      </ul>

      <div className="flex flex-col gap-3 border-t border-cellar-700 px-5 pt-4 pb-7 lg:gap-4 lg:px-9 lg:pt-6 lg:pb-8">
        <div className="flex gap-3 text-[13px] leading-[1.45] text-neutral-350 lg:rounded-[14px] lg:bg-cellar-800 lg:px-4 lg:py-3.5 lg:text-[15px]">
          <LuHouse size={22} aria-hidden="true" className="mt-px hidden shrink-0 text-amber-200 lg:block" />
          <span>Бронируем бутылки на 3 дня — заберите их в бутике и, если хотите, попробуйте перед покупкой.</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-neutral-350 lg:text-caption">Итого</span>
          <span className="font-system text-[22px] font-semibold lg:text-[26px]">
            {total === null ? "[сумма] ₽" : formatPrice(total)}
          </span>
        </div>
        <ButtonLink
          to={ROUTES.reserve}
          onClick={close}
          size="lg"
          aria-disabled={items.length === 0}
          className={cn("h-13.5 lg:h-14", items.length === 0 && "pointer-events-none bg-cellar-700 text-neutral-500")}
        >
          Забронировать
        </ButtonLink>
        <Link
          to={ROUTES.shop}
          onClick={close}
          className="hidden self-center text-sm text-amber-200 underline underline-offset-4 hover:text-paper lg:inline"
        >
          Продолжить выбор
        </Link>
      </div>
    </Drawer>
  );
};

export default CartDrawer;
