import type { FC, ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { HALL_LAYOUTS, type HallLayout } from "@/entities/hall";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { boutiqueToday, shiftDate } from "@/shared/lib/date";
import { formatPhone, isCompletePhone, toApiPhone } from "@/shared/lib/phone";
import { Button, Text } from "uikit;/";
import { useCreateHallRequestMutation } from "../api/requestHallApi";

interface IProps {
  layout: HallLayout;
  variant: "desktop" | "mobile";
  /** Цена за вечер — между полями и кнопкой, как в макете */
  priceRow: ReactNode;
}

interface IFormValues {
  date: string;
  guests: string;
  phone: string;
}

/** Заявка на зал (POST /requests/hall): дата, гостей не больше вместимости рассадки, телефон — перезвоним */
const HallRequestForm: FC<IProps> = ({ layout, variant, priceRow }) => {
  const isDesktop = variant === "desktop";
  const [create, { data, error, isLoading, reset }] = useCreateHallRequestMutation();
  const capacity = HALL_LAYOUTS[layout].capacity;
  const today = boutiqueToday();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { date: "", guests: "", phone: "" } });

  const onSubmit = (values: IFormValues) =>
    create({ layout, date: values.date, guests: Number(values.guests), phone: toApiPhone(values.phone), consents: { personalData: true } });

  const serverError = error ? (isApiError(error) ? error.data.message : "Заявка не ушла — проверьте соединение и попробуйте ещё раз") : undefined;
  const errorText = errors.date?.message ?? errors.guests?.message ?? errors.phone?.message ?? serverError;

  const label = cn("flex min-w-0 flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const input = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 font-system text-white outline-none transition-colors [color-scheme:dark]",
    "placeholder:text-cellar-400 focus:border-amber-350 aria-invalid:border-error",
    { "h-14 px-4.5 text-[17px]": isDesktop, "h-13 px-4 text-sm": !isDesktop }
  );

  return (
    <form noValidate aria-label="Заявка на зал" onSubmit={handleSubmit(onSubmit)} onChange={() => (error || data) && reset()} className="flex flex-col gap-3">
      <div className={cn("grid grid-cols-2", { "gap-3": isDesktop, "gap-2.5": !isDesktop })}>
        <label className={label}>
          <span>Дата</span>
          <input
            type="date"
            min={shiftDate(today, 1)}
            max={shiftDate(today, 365)}
            aria-invalid={errors.date ? true : undefined}
            className={input}
            {...register("date", {
              validate: (value) => (value > today && value <= shiftDate(today, 365)) || "Выберите дату с завтрашнего дня и не дальше чем через год",
            })}
          />
        </label>
        <label className={label}>
          <span>Гостей</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={capacity}
            placeholder={isDesktop ? "сколько человек" : "сколько"}
            aria-invalid={errors.guests ? true : undefined}
            className={input}
            {...register("guests", {
              validate: (value) => (Number(value) >= 1 && Number(value) <= capacity) || `В этой рассадке — до ${capacity} гостей`,
            })}
          />
        </label>
      </div>
      <Controller
        control={control}
        name="phone"
        rules={{ validate: (value) => isCompletePhone(value) || "Проверьте телефон — перезвоним по нему" }}
        render={({ field }) => (
          <label className={label}>
            <span>Телефон</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 ___ ___-__-__"
              aria-invalid={errors.phone ? true : undefined}
              className={input}
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(formatPhone(event.target.value))}
            />
          </label>
        )}
      />
      {priceRow}
      <Button type="submit" size={isDesktop ? "xl" : "md"} disabled={isLoading || Boolean(data)} aria-busy={isLoading || undefined} className={cn("w-full", { "h-13.5 text-[17px]": !isDesktop })}>
        {data ? "Перезвоним в течение часа ✓" : isLoading ? "Отправляем…" : "Забронировать зал"}
      </Button>
      {errorText ? (
        <Text role="alert" SIZE="SYSTEM" className="text-center text-error">
          {errorText}
        </Text>
      ) : null}
      <span className={cn("text-center text-cellar-400", { "text-micro": isDesktop, "text-xs": !isDesktop })}>
        {data ? `Заявка ${data.number}. ` : ""}Отправляя заявку, вы соглашаетесь с{" "}
        <Link to={ROUTES.privacy} className="text-amber-200 hover:text-paper">
          политикой конфиденциальности
        </Link>
        .
      </span>
    </form>
  );
};

export default HallRequestForm;
