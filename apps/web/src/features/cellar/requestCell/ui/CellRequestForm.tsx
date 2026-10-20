import type { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import type { CellarCell, CellarTerm } from "@/entities/cellarCell";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatPhone, isCompletePhone, toApiPhone } from "@/shared/lib/phone";
import { Button, Text } from "uikit;/";
import { useCreateCellarRequestMutation } from "../api/requestCellApi";

interface IProps {
  /** Выбранная ячейка; нет — кнопка неактивна */
  cell: CellarCell | undefined;
  term: CellarTerm;
  variant: "desktop" | "mobile";
  /** Ячейку заняли, пока гость заполнял, — стену нужно перечитать */
  onCellBusy: () => void;
  className?: string;
}

interface IFormValues {
  name: string;
  phone: string;
  bottles: string;
  email: string;
}

/**
 * Заявка на ячейку (POST /cellar/requests): имя, телефон, примерное число бутылок, почта для описи.
 * Согласие с политикой — отправкой формы, как в макете.
 */
const CellRequestForm: FC<IProps> = ({ cell, term, variant, onCellBusy, className }) => {
  const isDesktop = variant === "desktop";
  const [create, { data, error, isLoading, reset }] = useCreateCellarRequestMutation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { name: "", phone: "", bottles: "", email: "" } });

  const onSubmit = async (values: IFormValues) => {
    if (!cell) return;
    const bottles = Number.parseInt(values.bottles, 10);
    const result = await create({
      cellNumber: cell.number,
      term,
      name: values.name.trim(),
      phone: toApiPhone(values.phone),
      ...(bottles > 0 && { bottles: Math.min(500, bottles) }),
      ...(values.email.trim() && { email: values.email.trim() }),
      consents: { personalData: true },
    });
    if ("error" in result && isApiError(result.error) && result.error.data.code === "cell_busy") onCellBusy();
  };

  const sent = Boolean(data) && data?.cellNumber === cell?.number && data?.term === term;
  const serverError = error ? (isApiError(error) ? error.data.message : "Заявка не ушла — проверьте соединение и попробуйте ещё раз") : undefined;
  const errorText = errors.name?.message ?? errors.phone?.message ?? errors.email?.message ?? serverError;

  const label = cn("flex flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const input = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 font-system text-white outline-none transition-colors",
    "placeholder:text-cellar-400 focus:border-amber-350 aria-invalid:border-error",
    { "h-14 px-4.5 text-[17px]": isDesktop, "h-13 px-4 text-sm": !isDesktop }
  );

  const consent = (
    <span className={cn("text-cellar-400", { "text-micro": isDesktop, "text-xs": !isDesktop })}>
      Отправляя заявку, вы соглашаетесь с{" "}
      <Link to={ROUTES.privacy} className="text-amber-200 hover:text-paper">
        политикой конфиденциальности
      </Link>
      .
    </span>
  );

  return (
    <form
      noValidate
      aria-label="Заявка на ячейку"
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => error && reset()}
      className={cn({ "grid grid-cols-2 gap-4.5": isDesktop, "flex flex-col gap-3": !isDesktop }, className)}
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
      <label className={label}>
        <span>Сколько бутылок</span>
        <input type="text" inputMode="numeric" placeholder="примерно" className={input} {...register("bottles")} />
      </label>
      {isDesktop ? (
        <label className={label}>
          <span>E-mail (необязательно)</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="для описи"
            aria-invalid={errors.email ? true : undefined}
            className={input}
            {...register("email", { pattern: { value: /^\S+@\S+\.\S+$/, message: "Проверьте адрес почты" } })}
          />
        </label>
      ) : null}
      <div className={cn("flex", { "col-span-full mt-1.5 items-center justify-between gap-5": isDesktop, "flex-col gap-3": !isDesktop })}>
        {isDesktop ? consent : null}
        <Button
          type="submit"
          size={isDesktop ? "xl" : "md"}
          disabled={!cell || isLoading || sent}
          aria-busy={isLoading || undefined}
          className={cn({ "shrink-0": isDesktop, "h-13.5 w-full text-[17px]": !isDesktop })}
        >
          {sent ? "Заявка отправлена ✓" : isLoading ? "Отправляем…" : "Отправить заявку"}
        </Button>
        {isDesktop ? null : consent}
      </div>
      {errorText ? (
        <Text role="alert" SIZE="SYSTEM" className="col-span-full text-error">
          {errorText}
        </Text>
      ) : null}
      {sent ? (
        <Text role="status" COLOR="MUTED" className={cn("col-span-full", { "text-sm": isDesktop, "text-micro": !isDesktop })}>
          Перезвоним, ответим на вопросы и договоримся, когда привезти бутылки.
        </Text>
      ) : null}
    </form>
  );
};

export default CellRequestForm;
