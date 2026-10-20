import type { FC } from "react";
import { Link, useSearchParams } from "react-router";
import { cartSelectors } from "@/entities/cart";
import { ReservationForm } from "@/features/reservation/createReservation";
import { ROUTES } from "@/shared/config/routes";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { MEDIA, useMediaQuery } from "@/shared/lib/hooks/useMediaQuery";
import { ButtonLink, Text } from "uikit;/";

/** Бронирование (/reserve, макеты Reserve и MReserve): вступление и форма; пустая корзина — ссылка к полкам */
const ReserveCheckout: FC = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const count = useAppSelector(cartSelectors.selectCount);
  const [params] = useSearchParams();

  return (
    <div className="mx-4 pb-10 lg:mx-auto lg:max-w-480 lg:px-10 lg:pb-30 2xl:px-30">
      <Link to={ROUTES.shop} className="text-[15px] text-amber-200 no-underline hover:text-paper lg:text-[17px]">
        ← Назад к полкам
      </Link>
      <Text as="h1" FONT="FIRM" className="mt-3.5 text-title leading-15 text-shadow-lg lg:text-[80px] lg:leading-27 lg:text-shadow-none">
        Бронирование
      </Text>
      <Text COLOR="MUTED" className="mt-2 max-w-215 text-sm leading-[1.55] lg:text-md">
        {isDesktop
          ? "Мы не доставляем алкоголь — откладываем бутылки на ваше имя. Вы приходите в бутик, показываете паспорт и оплачиваете на месте."
          : "Мы не доставляем алкоголь — откладываем бутылки на ваше имя. Оплата и выдача в бутике по паспорту."}
      </Text>

      {count === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-3xl border border-cellar-700 bg-cellar-950/82 p-6 lg:mt-10 lg:max-w-180 lg:p-10">
          <Text as="h2" FONT="FIRM" className="text-[28px] leading-10 lg:text-title lg:leading-15">
            Корзина пока пуста
          </Text>
          <Text COLOR="MUTED">Выберите бутылки на полках — и возвращайтесь сюда, чтобы отложить их на своё имя.</Text>
          <ButtonLink to={ROUTES.shop} size="lg">
            К полкам
          </ButtonLink>
        </div>
      ) : (
        <ReservationForm variant={isDesktop ? "desktop" : "mobile"} initialBoutiqueId={params.get("boutique") ?? undefined} className="mt-7" />
      )}
    </div>
  );
};

export default ReserveCheckout;
