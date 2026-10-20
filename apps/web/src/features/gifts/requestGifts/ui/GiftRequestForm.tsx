import type { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import type { GiftBox } from "@/entities/giftBox";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatPhone, isCompletePhone, toApiPhone } from "@/shared/lib/phone";
import { Button, Text } from "uikit;/";
import { useCreateGiftRequestMutation } from "../api/requestGiftsApi";

interface IProps {
  gift: GiftBox;
  variant: "desktop" | "mobile";
}

interface IFormValues {
  company: string;
  contactName: string;
  phone: string;
  email: string;
}

/** Запрос сметы на подарки (POST /requests/gift): собранный ящик + компания, контакт, телефон и почта для сметы */
const GiftRequestForm: FC<IProps> = ({ gift, variant }) => {
  const isDesktop = variant === "desktop";
  const [create, { data, error, isLoading, reset }] = useCreateGiftRequestMutation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { company: "", contactName: "", phone: "", email: "" } });

  const onSubmit = (values: IFormValues) =>
    create({
      pack: gift.pack,
      bottles: gift.bottles,
      extras: gift.extras,
      ...(gift.engraving.trim() && { engraving: gift.engraving.trim() }),
      run: gift.run,
      company: values.company.trim(),
      contactName: values.contactName.trim(),
      phone: toApiPhone(values.phone),
      email: values.email.trim(),
      consents: { personalData: true },
    });

  const serverError = error ? (isApiError(error) ? error.data.message : "Запрос не ушёл — проверьте соединение и попробуйте ещё раз") : undefined;
  const errorText = errors.company?.message ?? errors.contactName?.message ?? errors.phone?.message ?? errors.email?.message ?? serverError;

  const label = cn("flex min-w-0 flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const input = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 font-system text-white outline-none transition-colors",
    "placeholder:text-cellar-400 focus:border-amber-350 aria-invalid:border-error",
    { "h-14 px-4.5 text-[17px]": isDesktop, "h-13 px-4 text-sm": !isDesktop }
  );
  const required = (message: string) => ({ validate: (value: string) => value.trim().length > 0 || message });

  return (
    <form
      noValidate
      aria-label="Запрос сметы на подарки"
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => (error || data) && reset()}
      className={cn({ "grid grid-cols-2 gap-4.5": isDesktop, "flex flex-col gap-3": !isDesktop })}
    >
      <label className={label}>
        <span>Компания</span>
        <input type="text" autoComplete="organization" placeholder="название" aria-invalid={errors.company ? true : undefined} className={input} {...register("company", required("Укажите компанию"))} />
      </label>
      <label className={label}>
        <span>Контактное лицо</span>
        <input type="text" autoComplete="name" placeholder="имя" aria-invalid={errors.contactName ? true : undefined} className={input} {...register("contactName", required("Укажите, к кому обращаться"))} />
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
        <span>E-mail</span>
        <input
          type="email"
          autoComplete="email"
          placeholder="для сметы"
          aria-invalid={errors.email ? true : undefined}
          className={input}
          {...register("email", { pattern: { value: /^\S+@\S+\.\S+$/, message: "Проверьте адрес почты — пришлём на него смету" }, ...required("Укажите почту для сметы") })}
        />
      </label>
      <div className={cn("flex", { "col-span-full items-center justify-between gap-5": isDesktop, "flex-col gap-3": !isDesktop })}>
        <span className={cn("text-cellar-400", { "text-micro": isDesktop, "order-last text-xs": !isDesktop })}>
          {data ? `Заявка ${data.number}. ` : ""}Отправляя запрос, вы соглашаетесь с{" "}
          <Link to={ROUTES.privacy} className="text-amber-200 hover:text-paper">
            политикой конфиденциальности
          </Link>
          .
        </span>
        <Button
          type="submit"
          size={isDesktop ? "xl" : "md"}
          disabled={isLoading || Boolean(data)}
          aria-busy={isLoading || undefined}
          className={cn({ "shrink-0": isDesktop, "h-13.5 w-full text-[17px]": !isDesktop })}
        >
          {data ? (isDesktop ? "Пришлём смету за день ✓" : "Пришлём смету ✓") : isLoading ? "Отправляем…" : isDesktop ? "Отправить запрос" : "Запросить предложение"}
        </Button>
      </div>
      {errorText ? (
        <Text role="alert" SIZE="SYSTEM" className="col-span-full text-error">
          {errorText}
        </Text>
      ) : null}
    </form>
  );
};

export default GiftRequestForm;
