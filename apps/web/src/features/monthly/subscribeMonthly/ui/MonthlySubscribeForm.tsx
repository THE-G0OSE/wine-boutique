import type { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { useGetBoutiquesQuery } from "@/entities/boutique";
import type { MonthlyPlan } from "@/entities/monthlyCrate";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatPhone, isCompletePhone, toApiPhone } from "@/shared/lib/phone";
import { Button, Text } from "uikit;/";
import { useCreateMonthlySubscriptionMutation } from "../api/subscribeMonthlyApi";

interface IProps {
  plan: MonthlyPlan;
  variant: "desktop" | "mobile";
}

interface IFormValues {
  name: string;
  phone: string;
  boutiqueId: string;
}

/**
 * Подписка на набор месяца (POST /monthly/subscriptions): имя, телефон и бутик, где ждёт ящик.
 * На мобильных бутика в форме нет (как в MMonthly) — ящик ждёт в первом.
 */
const MonthlySubscribeForm: FC<IProps> = ({ plan, variant }) => {
  const isDesktop = variant === "desktop";
  const { data: boutiques } = useGetBoutiquesQuery();
  const [subscribe, { data, error, isLoading, reset }] = useCreateMonthlySubscriptionMutation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { name: "", phone: "", boutiqueId: "" } });

  const onSubmit = (values: IFormValues) => {
    const boutiqueId = values.boutiqueId || boutiques?.[0]?.id;
    if (!boutiqueId) return;
    subscribe({ plan, name: values.name.trim(), phone: toApiPhone(values.phone), boutiqueId, consents: { personalData: true } });
  };

  const serverError = error ? (isApiError(error) ? error.data.message : "Подписка не ушла — проверьте соединение и попробуйте ещё раз") : undefined;
  const errorText = errors.name?.message ?? errors.phone?.message ?? serverError;

  const label = cn("flex min-w-0 flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const input = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 font-system text-white outline-none transition-colors",
    "placeholder:text-cellar-400 focus:border-amber-350 aria-invalid:border-error",
    { "h-14 px-4.5 text-[17px]": isDesktop, "h-13 px-4 text-sm": !isDesktop }
  );

  return (
    <div className="flex flex-col gap-3.5">
      <form
        noValidate
        aria-label="Подписка на набор месяца"
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => (error || data) && reset()}
        className={cn("border border-cellar-700", {
          "grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-4.5 rounded-3xl bg-cellar-950/80 px-9 py-7.5": isDesktop,
          "flex flex-col gap-3 rounded-[20px] bg-cellar-950/82 p-5": !isDesktop,
        })}
      >
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
          rules={{ validate: (value) => isCompletePhone(value) || "Проверьте телефон — пришлём SMS, когда ящик соберут" }}
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
            <span>Бутик</span>
            <select className={cn(input, "cursor-pointer")} {...register("boutiqueId")}>
              {boutiques?.map((boutique) => (
                <option key={boutique.id} value={boutique.id}>
                  {boutique.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <Button
          type="submit"
          size={isDesktop ? "xl" : "md"}
          disabled={isLoading || Boolean(data) || !boutiques?.length}
          aria-busy={isLoading || undefined}
          className={cn({ "h-13.5 w-full text-[17px]": !isDesktop })}
        >
          {data ? "Ящик отложим ✓" : isLoading ? "Отправляем…" : "Откладывать каждый месяц"}
        </Button>
        {isDesktop ? null : <MonthlyNote variant={variant} number={data?.number} />}
      </form>
      {errorText ? (
        <Text role="alert" SIZE="SYSTEM" className="text-error">
          {errorText}
        </Text>
      ) : null}
      {isDesktop ? <MonthlyNote variant={variant} number={data?.number} /> : null}
    </div>
  );
};

const MonthlyNote: FC<{ variant: "desktop" | "mobile"; number?: string }> = ({ variant, number }) => (
  <span className={cn("text-cellar-400", { "text-[15px]": variant === "desktop", "text-xs": variant === "mobile" })}>
    {number ? `Подписка ${number}. ` : ""}
    {variant === "desktop"
      ? "Ящик ждёт вас 7 дней с начала месяца. Оплата при получении. Пропустить месяц или отменить — одной SMS. "
      : "Ящик ждёт 7 дней с начала месяца. Оплата при получении. "}
    Подписываясь, вы соглашаетесь с{" "}
    <Link to={ROUTES.privacy} className="text-amber-200 hover:text-paper">
      политикой конфиденциальности
    </Link>
    .
  </span>
);

export default MonthlySubscribeForm;
