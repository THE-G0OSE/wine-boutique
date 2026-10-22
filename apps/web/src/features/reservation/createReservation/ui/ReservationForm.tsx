import { useEffect, useId, type FC, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  formatPickupDate,
  formatPickupMoment,
  formatPickupWeekday,
  useGetBoutiqueSlotsQuery,
  useGetBoutiquesQuery,
} from "@/entities/boutique";
import { cartActions, cartSelectors } from "@/entities/cart";
import { formatWinePrice } from "@/entities/wine";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/formatPrice";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { useAppSelector } from "@/shared/lib/hooks/useAppSelector";
import { plural } from "@/shared/lib/plural";
import { Button, Text } from "uikit;/";
import { useCreateReservationMutation } from "../api/createReservationApi";
import { formatPhone, isCompletePhone, toApiPhone } from "@/shared/lib/phone";

interface IProps {
  /** desktop — форма слева и сводка справа (Reserve), mobile — сводка сверху, кнопка внизу (MReserve) */
  variant: "desktop" | "mobile";
  /** Бутик, выбранный заранее (ссылка «Забронировать сюда» со страницы самовывоза) */
  initialBoutiqueId?: string;
  className?: string;
}

interface IFormValues {
  name: string;
  phone: string;
  email: string;
  boutiqueId: string;
  date: string;
  time: string;
  comment: string;
  adult: boolean;
  personalData: boolean;
}

const bottles = (n: number) => `${n} ${plural(n, ["бутылка", "бутылки", "бутылок"])}`;

const pill = (checked: boolean) =>
  cn("cursor-pointer border text-white transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-amber-200", {
    "border-amber-350 bg-amber-350/18": checked,
    "border-cellar-700 bg-cellar-950 hover:border-amber-350/60": !checked,
  });

const SERVER_MESSAGES: Record<string, string> = {
  catalog_unavailable: "Не удалось проверить бутылки — попробуйте через минуту",
  too_many_requests: "Слишком много попыток — попробуйте чуть позже",
};

/**
 * Бронь бутылок из корзины (POST /reservations): контакты, бутик, день и время самовывоза, пожелания,
 * две обязательные галочки. Принятая бронь очищает корзину и открывает квитанцию.
 */
const ReservationForm: FC<IProps> = ({ variant, initialBoutiqueId, className }) => {
  const isDesktop = variant === "desktop";
  const id = useId();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(cartSelectors.selectItems);
  const total = useAppSelector(cartSelectors.selectTotal);
  const count = useAppSelector(cartSelectors.selectCount);
  const { data: boutiques } = useGetBoutiquesQuery();
  const [create, { isLoading, error, reset }] = useCreateReservationMutation();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IFormValues>({
    defaultValues: { name: "", phone: "", email: "", boutiqueId: "", date: "", time: "", comment: "", adult: false, personalData: false },
  });
  const [boutiqueId, date, time, adult, personalData] = useWatch({ control, name: ["boutiqueId", "date", "time", "adult", "personalData"] });

  const boutique = boutiques?.find((item) => item.id === boutiqueId);
  const { data: days, refetch: refetchSlots } = useGetBoutiqueSlotsQuery(boutiqueId, { skip: !boutiqueId });
  const day = days?.find((item) => item.date === date);

  // Первый бутик — по умолчанию; свободные день и время подбираются, когда меняется бутик или ушло время
  useEffect(() => {
    if (boutiqueId || !boutiques?.length) return;
    const initial = boutiques.find((item) => item.id === initialBoutiqueId) ?? boutiques[0];
    setValue("boutiqueId", initial.id);
  }, [boutiqueId, boutiques, initialBoutiqueId, setValue]);
  useEffect(() => {
    if (!days) return;
    const current = days.find((item) => item.date === date && item.times.length > 0);
    const target = current ?? days.find((item) => item.times.length > 0);
    if (!target) return;
    if (target.date !== date) setValue("date", target.date);
    if (!target.times.includes(time)) setValue("time", target.times[0]);
  }, [days, date, time, setValue]);

  const canSubmit = adult && personalData && Boolean(date && time) && count > 0;

  const onSubmit = async (values: IFormValues) => {
    const body = {
      boutiqueId: values.boutiqueId,
      date: values.date,
      time: values.time,
      name: values.name.trim(),
      phone: toApiPhone(values.phone),
      ...(values.email.trim() && { email: values.email.trim() }),
      ...(values.comment.trim() && { comment: values.comment.trim() }),
      items: items.map(({ wine, qty }) => ({ wineId: wine.id, qty })),
      consents: { adult: true as const, personalData: true as const },
    };
    const result = await create(body);
    if ("data" in result && result.data) {
      dispatch(cartActions.clear());
      navigate(ROUTES.reservation(result.data.id), { replace: true });
    } else if (isApiError(result.error) && result.error.data.code === "slot_unavailable") {
      refetchSlots();
    }
  };

  const serverError = error
    ? isApiError(error)
      ? (SERVER_MESSAGES[error.data.code] ?? error.data.message)
      : "Бронь не ушла — проверьте соединение и попробуйте ещё раз"
    : undefined;
  const fieldError = errors.name?.message ?? errors.phone?.message ?? errors.email?.message;

  const fieldset = cn("m-0 min-w-0 border border-cellar-700 bg-cellar-900/85", {
    "rounded-3xl px-10 py-9": isDesktop,
    "rounded-[20px] p-4.5": !isDesktop,
  });
  const legend = cn("px-2.5 font-firm text-amber-200", { "text-xl": isDesktop, "text-[22px]": !isDesktop });
  const label = cn("flex flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const input = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 px-4.5 font-system text-white outline-none transition-colors",
    "placeholder:text-cellar-400 focus:border-amber-350 aria-invalid:border-error",
    { "h-14 text-[17px]": isDesktop, "h-13 text-sm": !isDesktop }
  );

  const checkbox = (name: "adult" | "personalData", text: string) => (
    <label className={cn("flex cursor-pointer gap-3.5 text-white", { "min-h-11 items-center text-[17px]": isDesktop, "min-h-11 items-start text-[15px]": !isDesktop })}>
      <input type="checkbox" className="peer sr-only" {...register(name)} />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-amber-350 font-bold text-black",
          "peer-checked:bg-amber-350 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-200"
        )}
      >
        {(name === "adult" ? adult : personalData) ? "✓" : ""}
      </span>
      <span>{text}</span>
    </label>
  );

  const contacts = (
    <fieldset className={fieldset}>
      <legend className={legend}>1 · Контакты</legend>
      <div className={cn({ "grid grid-cols-3 gap-5": isDesktop, "flex flex-col gap-3": !isDesktop })}>
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
          rules={{ validate: (value) => isCompletePhone(value) || "Проверьте телефон — пришлём на него SMS с номером брони" }}
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
        {isDesktop ? (
          <label className={label}>
            <span>E-mail (необязательно)</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="для квитанции"
              aria-invalid={errors.email ? true : undefined}
              className={input}
              {...register("email", { pattern: { value: /^\S+@\S+\.\S+$/, message: "Проверьте адрес почты" } })}
            />
          </label>
        ) : null}
      </div>
    </fieldset>
  );

  const boutiquePicker = (
    <fieldset className={fieldset}>
      <legend className={legend}>2 · Бутик</legend>
      <div className={cn({ "grid grid-cols-2 gap-5": isDesktop, "flex flex-col gap-2.5": !isDesktop })}>
        {boutiques?.map((item) => {
          const checked = item.id === boutiqueId;
          return (
            <label key={item.id} className="relative">
              <input type="radio" value={item.id} className="peer sr-only" {...register("boutiqueId")} />
              <span className={cn(pill(checked), "flex", { "items-start gap-4 rounded-[18px] px-6 py-5.5": isDesktop, "flex-col gap-1 rounded-2xl px-4 py-3.5": !isDesktop })}>
                {isDesktop ? (
                  <span
                    aria-hidden="true"
                    className={cn("mt-0.75 flex size-5.5 shrink-0 items-center justify-center rounded-full border-2 border-amber-350", {
                      "after:size-2.5 after:rounded-full after:bg-amber-350": checked,
                    })}
                  />
                ) : null}
                <span className="flex flex-col gap-1.5 text-left">
                  <span className={cn("font-semibold", { "text-md": isDesktop, "text-sm": !isDesktop })}>{item.name}</span>
                  <span className={cn("text-neutral-350", { "text-sm": isDesktop, "text-[13px]": !isDesktop })}>
                    {item.address}
                    {isDesktop ? null : ` · ${item.hours}`}
                  </span>
                  {isDesktop ? <span className="text-[15px] text-amber-200">{item.hours}</span> : null}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );

  const when = (
    <fieldset className={fieldset}>
      <legend className={legend}>{isDesktop ? "3 · Когда заберёте" : "3 · Когда"}</legend>
      {isDesktop ? <span className="text-sm text-neutral-350">День</span> : null}
      <div
        role="radiogroup"
        aria-label="День самовывоза"
        className={cn({ "mt-2.5 grid grid-cols-7 gap-3": isDesktop, "flex gap-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none]": !isDesktop })}
      >
        {days?.map((item, index) => {
          const checked = item.date === date;
          const closed = item.times.length === 0;
          const { day: dayNumber, month } = formatPickupDate(item.date);
          return (
            <label key={item.date} className={cn("relative", { "shrink-0": !isDesktop })}>
              <input type="radio" value={item.date} disabled={closed} className="peer sr-only" {...register("date")} />
              <span
                className={cn(pill(checked), "flex flex-col items-center justify-center", {
                  "h-26 gap-0.5 rounded-2xl": isDesktop,
                  "h-18 w-16 rounded-[14px]": !isDesktop,
                  "cursor-not-allowed opacity-40": closed,
                })}
                title={closed ? "Бутик закрыт или время на сегодня вышло" : undefined}
              >
                <span className={cn("opacity-80", { "text-[15px]": isDesktop, "text-xs": !isDesktop })}>{formatPickupWeekday(item.date, index)}</span>
                <span className={cn("font-system font-semibold", { "text-lg": isDesktop, "text-md": !isDesktop })}>{dayNumber}</span>
                {isDesktop ? <span className="text-micro opacity-80">{month}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
      {isDesktop ? <span className="mt-6 block text-sm text-neutral-350">Время</span> : null}
      <div
        role="radiogroup"
        aria-label="Время самовывоза"
        className={cn({ "mt-2.5 flex flex-wrap gap-2.5": isDesktop, "mt-3 grid grid-cols-4 gap-2": !isDesktop })}
      >
        {day?.times.map((item) => {
          const checked = item === time;
          return (
            <label key={item} className="relative">
              <input type="radio" value={item} className="peer sr-only" {...register("time")} />
              <span
                className={cn(pill(checked), "flex items-center justify-center rounded-full font-system", {
                  "h-12 px-5.5 text-sm": isDesktop,
                  "h-11 text-micro": !isDesktop,
                })}
              >
                {item}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );

  const wishes = (
    <fieldset className={cn(fieldset, "flex flex-col gap-4.5")}>
      <legend className={legend}>4 · Пожелания</legend>
      <label className={label}>
        <span>Комментарий для сомелье (необязательно)</span>
        <textarea
          rows={3}
          placeholder="Например: упакуйте в подарочную коробку"
          className="resize-y rounded-[14px] border border-cellar-700 bg-cellar-950 px-4.5 py-4 font-system text-[17px] text-white outline-none placeholder:text-cellar-400 focus:border-amber-350"
          {...register("comment", { maxLength: { value: 500, message: "Комментарий — не длиннее 500 знаков" } })}
        />
      </label>
      {checkbox("adult", "Мне исполнилось 18 лет. При получении покажу паспорт.")}
      {checkbox("personalData", "Согласен с обработкой персональных данных и правилами брони")}
    </fieldset>
  );

  const errorText = fieldError ?? serverError;
  const hint = canSubmit
    ? isDesktop
      ? "Пришлём SMS с номером брони. Отменить можно в любой момент."
      : "Пришлём SMS с номером брони."
    : isDesktop
      ? "Отметьте обе галочки, чтобы подтвердить бронь."
      : "Отметьте обе галочки.";

  const submit = (
    <>
      <Button type="submit" size="xl" disabled={!canSubmit || isLoading} aria-busy={isLoading || undefined} className="w-full">
        {isLoading ? "Отправляем бронь…" : "Подтвердить бронь"}
      </Button>
      {errorText ? (
        <Text role="alert" SIZE="SYSTEM" className="text-center text-error">
          {errorText}
        </Text>
      ) : null}
      <span className={cn("text-center text-cellar-400", { "text-micro leading-[1.5]": isDesktop, "text-[13px]": !isDesktop })}>{hint}</span>
    </>
  );

  const itemsList = (thumb: string, img: string) => (
    <ul className="m-0 flex list-none flex-col p-0">
      {items.map(({ wine, qty }) => (
        <li
          key={wine.id}
          className={cn("grid items-center border-cellar-800", {
            "grid-cols-[48px_minmax(0,1fr)_auto] gap-3.5 border-b py-3": isDesktop,
            "grid-cols-[34px_1fr_auto] gap-2.5 border-t py-2": !isDesktop,
          })}
        >
          <span className={thumb}>
            <img src={wine.image} alt="" className={img} />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className={cn("truncate font-semibold", { "text-[17px]": isDesktop, "text-[15px]": !isDesktop })}>{wine.name}</span>
            <span className={cn("text-neutral-350", { "text-micro": isDesktop, "text-xs": !isDesktop })}>{bottles(qty)}</span>
          </span>
          <span className={cn("font-system font-semibold text-amber-200", { "text-sm": isDesktop, "text-micro": !isDesktop })}>
            {wine.price === null ? formatWinePrice(null) : formatPrice(wine.price * qty)}
          </span>
        </li>
      ))}
    </ul>
  );

  const totalText = total === null ? "[сумма] ₽" : formatPrice(total);
  const errorProps = { onChange: () => error && reset() };

  if (!isDesktop) {
    return (
      <form aria-labelledby={`${id}-title`} noValidate onSubmit={handleSubmit(onSubmit)} {...errorProps} className={cn("flex flex-col gap-4", className)}>
        <span id={`${id}-title`} className="sr-only">
          Бронирование
        </span>
        <details open className="rounded-[20px] border border-cellar-700 bg-cellar-950/82 px-4.5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
            <span className="font-firm text-[22px]">Ваш заказ · {count} бут.</span>
            <span className="font-system font-semibold text-amber-200">{totalText}</span>
          </summary>
          <div className="mt-2.5">{itemsList("flex justify-center", "h-13 w-auto")}</div>
        </details>
        {contacts}
        {boutiquePicker}
        {when}
        {checkbox("adult", "Мне есть 18 лет, при получении покажу паспорт")}
        {checkbox("personalData", "Согласен с обработкой персональных данных")}
        {submit}
      </form>
    );
  }

  const summaryRow = (label: string, value: ReactNode) => (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );

  return (
    <form
      aria-labelledby={`${id}-title`}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      {...errorProps}
      className={cn("grid grid-cols-[minmax(0,1fr)_minmax(420px,560px)] items-start gap-16", className)}
    >
      <div className="flex min-w-0 flex-col gap-7">
        <span id={`${id}-title`} className="sr-only">
          Бронирование
        </span>
        {contacts}
        {boutiquePicker}
        {when}
        {wishes}
      </div>

      <aside
        aria-label="Ваш заказ"
        className="sticky top-25 flex flex-col gap-4.5 rounded-3xl border border-amber-200/30 bg-cellar-900 px-9 pt-9 pb-8 shadow-panel"
      >
        <Text as="h2" FONT="FIRM" SIZE="H2" className="leading-13">
          Ваш заказ
        </Text>
        {itemsList("flex h-19 w-12 items-end justify-center rounded-[10px] bg-cellar-800", "h-16.5 w-auto")}
        <div className="flex flex-col gap-2.5 text-sm text-neutral-350">
          {summaryRow("Бутик", boutique?.name ?? "—")}
          {summaryRow("Самовывоз", date && time ? formatPickupMoment(date, time) : "—")}
          {summaryRow("Бронь хранится", "3 дня")}
          {summaryRow("Оплата", "в бутике, картой или наличными")}
        </div>
        <div className="flex items-baseline justify-between border-t border-cellar-700 pt-4">
          <span className="text-caption text-neutral-350">Итого</span>
          <span className="font-system text-xl font-semibold">{totalText}</span>
        </div>
        {submit}
      </aside>
    </form>
  );
};

export default ReservationForm;
