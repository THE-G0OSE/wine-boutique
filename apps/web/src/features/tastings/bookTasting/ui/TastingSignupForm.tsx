import { useId, useState, type FC } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import type { Tasting, TastingBooking } from "@/entities/tasting";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatPhone, isCompletePhone, toApiPhone } from "@/shared/lib/phone";
import { Button, QtyStepper, Text } from "uikit;/";
import { useCreateTastingBookingMutation, useJoinTastingWaitlistMutation } from "../api/bookTastingApi";

/** Гостей в одной записи — как в контракте */
const MAX_GUESTS = 6;

interface IProps {
  tasting: Tasting;
  /** book — запись на свободные места, waitlist — лист ожидания, когда мест нет */
  mode: "book" | "waitlist";
  variant: "desktop" | "mobile";
  onBooked: (booking: TastingBooking) => void;
  onWaitlisted: () => void;
  onCancel: () => void;
}

interface IFormValues {
  name: string;
  phone: string;
  personalData: boolean;
}

const SERVER_MESSAGES: Record<string, string> = {
  tasting_closed: "Дегустация уже началась — выберите другой день",
  seats_available: "Место освободилось — обновили афишу, можно записаться",
  too_many_requests: "Слишком много попыток — попробуйте чуть позже",
};

/**
 * Запись на дегустацию (POST /tastings/{id}/bookings) или в лист ожидания (…/waitlist):
 * имя, телефон, число гостей и согласие на обработку данных
 */
const TastingSignupForm: FC<IProps> = ({ tasting, mode, variant, onBooked, onWaitlisted, onCancel }) => {
  const isDesktop = variant === "desktop";
  const id = useId();
  const [guests, setGuests] = useState(Math.min(2, mode === "book" ? tasting.seatsLeft : MAX_GUESTS));
  const [book, booking] = useCreateTastingBookingMutation();
  const [wait, waiting] = useJoinTastingWaitlistMutation();
  const { error, isLoading, reset } = mode === "book" ? booking : waiting;
  const maxGuests = mode === "book" ? Math.min(MAX_GUESTS, tasting.seatsLeft) : MAX_GUESTS;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { name: "", phone: "", personalData: false } });
  const personalData = useWatch({ control, name: "personalData" });

  const onSubmit = async (values: IFormValues) => {
    const body = { name: values.name.trim(), phone: toApiPhone(values.phone), guests, consents: { personalData: true as const } };
    if (mode === "book") {
      const result = await book({ id: tasting.id, body });
      if ("data" in result && result.data) onBooked(result.data);
    } else {
      const result = await wait({ id: tasting.id, body });
      if (!("error" in result)) onWaitlisted();
    }
  };

  const serverError = error
    ? isApiError(error)
      ? (SERVER_MESSAGES[error.data.code] ?? error.data.message)
      : "Запись не ушла — проверьте соединение и попробуйте ещё раз"
    : undefined;
  const errorText = errors.name?.message ?? errors.phone?.message ?? serverError;

  const label = cn("flex flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const input = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 px-4.5 font-system text-white outline-none transition-colors",
    "placeholder:text-cellar-400 focus:border-amber-350 aria-invalid:border-error",
    { "h-14 text-[17px]": isDesktop, "h-13 text-sm": !isDesktop }
  );

  return (
    <form
      aria-labelledby={`${id}-title`}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => error && reset()}
      className={cn("flex flex-col", { "gap-3.5": isDesktop, "gap-3": !isDesktop })}
    >
      <Text as="h3" id={`${id}-title`} FONT="FIRM" className={cn({ "text-xl leading-10.5": isDesktop, "text-lg leading-8": !isDesktop })}>
        {mode === "book" ? "Запись" : "Лист ожидания"}: {tasting.title}
      </Text>
      {mode === "waitlist" ? (
        <Text COLOR="MUTED" className={cn({ "text-sm": isDesktop, "text-micro": !isDesktop })}>
          Позвоним, если место освободится.
        </Text>
      ) : null}
      <label className={label}>
        <span>Имя</span>
        <input
          type="text"
          autoComplete="name"
          placeholder="Как к вам обращаться"
          aria-invalid={errors.name ? true : undefined}
          className={input}
          {...register("name", { validate: (value) => value.trim().length > 0 || "Напишите, как к вам обращаться" })}
        />
      </label>
      <Controller
        control={control}
        name="phone"
        rules={{ validate: (value) => isCompletePhone(value) || "Проверьте телефон — напомним о дегустации SMS" }}
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
      <div className="flex items-center justify-between">
        <span className={cn({ "text-[17px]": isDesktop, "text-[15px]": !isDesktop })}>Гостей</span>
        <QtyStepper
          size="form"
          value={guests}
          min={1}
          max={maxGuests}
          onDecrement={() => setGuests((value) => Math.max(1, value - 1))}
          onIncrement={() => setGuests((value) => Math.min(maxGuests, value + 1))}
          decrementLabel="Меньше гостей"
          incrementLabel="Больше гостей"
        />
      </div>
      <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 text-white", { "text-[15px]": isDesktop, "text-micro": !isDesktop })}>
        <input type="checkbox" className="peer sr-only" {...register("personalData")} />
        <span
          aria-hidden="true"
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-amber-350 font-bold text-black",
            "peer-checked:bg-amber-350 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-200"
          )}
        >
          {personalData ? "✓" : ""}
        </span>
        <span>
          Согласен с{" "}
          <Link to={ROUTES.privacy} className="text-amber-200 underline underline-offset-2 hover:text-paper">
            обработкой персональных данных
          </Link>
        </span>
      </label>
      <Button type="submit" size="xl" disabled={!personalData || isLoading} aria-busy={isLoading || undefined} className="w-full">
        {isLoading ? "Отправляем…" : mode === "book" ? "Подтвердить запись" : "Встать в лист ожидания"}
      </Button>
      {errorText ? (
        <Text role="alert" SIZE="SYSTEM" className="text-center text-error">
          {errorText}
        </Text>
      ) : null}
      <Button variant="link" onClick={onCancel} className="h-11 self-center text-neutral-350">
        Отмена
      </Button>
    </form>
  );
};

export default TastingSignupForm;
