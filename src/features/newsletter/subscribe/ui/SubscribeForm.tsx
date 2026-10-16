import { useId, type FC } from "react";
import { useForm } from "react-hook-form";
import { isApiError } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { Button, TextField } from "uikit;/";
import { useSubscribeNewsletterMutation } from "../api/newsletterApi";

interface IProps {
  /** row — поле и кнопка в строку, с подсказкой (десктоп); stack — столбиком (мобильные) */
  layout?: "row" | "stack";
  className?: string;
}

interface IFormValues {
  email: string;
}

/** Подписка на закрытый канал анонсов (футер) */
const SubscribeForm: FC<IProps> = ({ layout = "row", className }) => {
  const id = useId();
  const emailId = `${id}-email`;
  const errorId = `${id}-error`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>();
  // Общий ключ: у десктопной и мобильной формы футера одно состояние подписки
  const [subscribe, { isLoading, isSuccess, error, reset }] = useSubscribeNewsletterMutation({
    fixedCacheKey: "newsletter-subscription",
  });

  const errorMessage =
    errors.email?.message ??
    (error ? (isApiError(error) ? error.data.message : "Не получилось подписаться — попробуйте ещё раз") : undefined);

  const onSubmit = ({ email }: IFormValues) => {
    subscribe({ email: email.trim() });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-2.5", className)}>
      <label htmlFor={emailId} className={cn("font-semibold", layout === "row" ? "text-caption" : "text-sm")}>
        {layout === "row" ? "Закрытый канал с анонсами новинок" : "Закрытый канал с анонсами"}
      </label>
      {layout === "row" && (
        <span className="text-[15px] leading-[1.4] text-neutral-350">
          Новые поставки, аукционные позиции и приглашения на дегустации — раньше всех.
        </span>
      )}
      <div className={cn("flex gap-3", layout === "row" ? "mt-1.5" : "flex-col gap-2.5")}>
        <TextField
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="ваш email"
          disabled={isSuccess}
          invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          className={cn(layout === "row" && "flex-1")}
          {...register("email", {
            required: "Введите email",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Проверьте адрес — кажется, в нём опечатка" },
            onChange: () => error && reset(),
          })}
        />
        <Button type="submit" size="md" disabled={isLoading || isSuccess} className="disabled:bg-amber-200 disabled:text-black">
          {isSuccess ? "Вы подписаны ✓" : isLoading ? "Подписываем…" : "Подписаться"}
        </Button>
      </div>
      {errorMessage && (
        <span id={errorId} role="alert" className="text-micro text-error">
          {errorMessage}
        </span>
      )}
    </form>
  );
};

export default SubscribeForm;
