import { useState, type FC } from "react";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { Button, Text } from "uikit;/";
import { confirmAge } from "../model/slice";

interface IProps {
  /** id заголовка и описания — для aria-labelledby / aria-describedby диалога */
  titleId: string;
  descriptionId: string;
}

/** Вопрос «Вам есть 18?»: «Да» запоминает ответ, «Нет» — экран отказа с возвратом */
const AgeConfirmPanel: FC<IProps> = ({ titleId, descriptionId }) => {
  const dispatch = useAppDispatch();
  const [denied, setDenied] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3.5 rounded-2xl border border-amber-200/18 px-5.5 pt-8 pb-6.5 text-center lg:gap-4.5 lg:rounded-[18px] lg:px-16 lg:pt-13 lg:pb-11">
      <span
        aria-hidden="true"
        className="flex size-19 items-center justify-center rounded-full border-2 border-amber-350 font-system text-[26px] font-semibold text-amber-200 lg:size-24 lg:text-[34px]"
      >
        18+
      </span>

      {denied ? (
        <>
          <Text as="h2" id={titleId} FONT="FIRM" className="text-[32px] leading-[1.4] lg:text-[46px]">
            Извините
          </Text>
          <Text id={descriptionId} COLOR="MUTED" className="text-sm leading-[1.55] lg:text-md">
            Сайт доступен только совершеннолетним посетителям.
          </Text>
          <Button variant="link" onClick={() => setDenied(false)} className="mt-2 h-12 text-[15px] lg:text-[17px]" data-autofocus>
            Я ошибся, вернуться
          </Button>
        </>
      ) : (
        <>
          <Text as="h2" id={titleId} FONT="FIRM" className="text-[34px] leading-[1.4] lg:text-[52px]">
            Добро пожаловать
          </Text>
          <Text id={descriptionId} COLOR="MUTED" className="text-sm leading-[1.55] lg:text-md">
            На сайте есть информация об алкогольной продукции. Подтвердите, пожалуйста, что вам уже исполнилось 18 лет.
          </Text>
          <div className="mt-1 flex w-full flex-col gap-3 lg:mt-3.5 lg:flex-row lg:gap-4">
            <Button size="xl" onClick={() => dispatch(confirmAge())} className="w-full lg:flex-1 lg:text-[19px]" data-autofocus>
              Да, мне есть 18
            </Button>
            <Button variant="outline" size="xl" onClick={() => setDenied(true)} className="w-full lg:flex-1 lg:text-[19px]">
              Нет
            </Button>
          </div>
          <span className="text-xs leading-[1.5] text-cellar-400 lg:text-micro">
            Мы запомним ответ на этом устройстве. Продажа алкоголя лицам младше 18 лет запрещена.
          </span>
        </>
      )}
    </div>
  );
};

export default AgeConfirmPanel;
