import { useId, type FC } from "react";
import { useForm } from "react-hook-form";
import { isApiError } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { Newsprint } from "uikit;/";
import { useSendReviewMutation } from "../api/writeLetterApi";

interface IProps {
  /** desktop — лист под наклоном с подписями полей (Reviews); mobile — карточка с плейсхолдерами (MReviews) */
  variant: "desktop" | "mobile";
  className?: string;
}

interface IFormValues {
  name: string;
  city: string;
  text: string;
}

const sizes = {
  desktop: {
    form: "gap-4.5 px-14 py-12 shadow-[0_40px_70px_rgba(0,0,0,0.55)] -rotate-[0.8deg] text-letter-ink",
    title: "text-[44px]",
    field: "h-12 text-[28px]",
    // Строки «тетради» — под интерлиньяж 40px
    textarea: "text-[28px] leading-10 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_39px,rgba(31,42,68,0.18)_39px,rgba(31,42,68,0.18)_40px)]",
    line: "border-letter-label/50",
    submit: "h-13 self-start px-6.5 text-[17px]",
  },
  mobile: {
    form: "gap-3 px-5 py-6 shadow-[0_20px_30px_rgba(0,0,0,0.5)] text-note-ink",
    title: "text-[34px]",
    field: "h-12 px-1 text-2xl",
    textarea: "px-1 py-1.5 text-[22px] leading-8 bg-[repeating-linear-gradient(180deg,transparent_0_31px,rgba(43,76,140,0.25)_31px_32px)]",
    line: "border-note-ink",
    submit: "h-13.5 w-full justify-center text-sm",
  },
};

const label = "flex flex-col gap-1 font-paper text-micro tracking-[0.16em] text-letter-label uppercase";

/** «Напишите нам письмо» — письмо уходит сомелье на модерацию (POST /reviews) */
const WriteLetterForm: FC<IProps> = ({ variant, className }) => {
  const s = sizes[variant];
  const isDesktop = variant === "desktop";
  const id = useId();
  const titleId = `${id}-title`;
  const errorId = `${id}-error`;

  // Общий ключ: десктопная и мобильная форма — одно письмо, после смены раскладки «запечатано» не сбрасывается
  const [send, { isLoading, isSuccess, error, reset }] = useSendReviewMutation({ fixedCacheKey: "review-letter" });
  // Запечатанное письмо не правится. Блокирует сама форма: register управляет атрибутом disabled у полей
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { name: "", city: "", text: "" }, disabled: isSuccess });

  const errorMessage =
    errors.name?.message ??
    errors.text?.message ??
    (error ? (isApiError(error) ? error.data.message : "Письмо не ушло — попробуйте ещё раз") : undefined);

  const onSubmit = ({ name, city, text }: IFormValues) => {
    send({ name: name.trim(), text: text.trim(), ...(city.trim() && { city: city.trim() }) });
  };
  const clearServerError = () => error && reset();

  const input = cn(
    "w-full border-0 border-b bg-transparent font-hand text-inherit tracking-normal normal-case outline-none",
    "placeholder:text-cellar-400 focus-visible:border-primary-500 disabled:opacity-70",
    s.line,
    s.field
  );

  const fields = [
    {
      key: "name" as const,
      title: "Ваше имя",
      placeholder: isDesktop ? "как подписать конверт" : "Ваше имя",
      autoComplete: "name",
      options: { required: "Подпишите конверт — как вас зовут?", maxLength: { value: 80, message: "Имя длинновато для конверта" } },
    },
    {
      key: "city" as const,
      title: "Город",
      placeholder: isDesktop ? "откуда письмо" : "Город",
      autoComplete: "address-level2",
      options: { maxLength: { value: 80, message: "Название города длинновато" } },
    },
  ];

  return (
    <form
      noValidate
      aria-labelledby={titleId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn("relative flex flex-col overflow-hidden bg-letter", s.form, className)}
    >
      <Newsprint variant="letter" />
      <h2 id={titleId} className={cn("relative m-0 font-script font-normal", s.title)}>
        Напишите нам письмо
      </h2>

      {fields.map(({ key, title, placeholder, autoComplete, options }) => (
        <label key={key} className={cn("relative", label)}>
          <span className={cn({ "sr-only": !isDesktop })}>{title}</span>
          <input
            type="text"
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-invalid={Boolean(errors[key])}
            aria-describedby={errors[key] ? errorId : undefined}
            className={input}
            {...register(key, { ...options, onChange: clearServerError })}
          />
        </label>
      ))}

      <label className={cn("relative", label)}>
        <span className={cn({ "sr-only": !isDesktop })}>{isDesktop ? "Письмо" : "Текст письма"}</span>
        <textarea
          rows={isDesktop ? 5 : 4}
          placeholder={isDesktop ? "Расскажите, какое вино открыли и с кем…" : "Ваше письмо…"}
          aria-invalid={Boolean(errors.text)}
          aria-describedby={errors.text ? errorId : undefined}
          className={cn(input, "h-auto resize-none border-b-0", s.textarea)}
          {...register("text", {
            validate: (value) => value.trim().length >= 10 || "Напишите хотя бы пару строк",
            maxLength: { value: 3000, message: "Письмо длинновато — до 3000 знаков" },
            onChange: clearServerError,
          })}
        />
      </label>

      {errorMessage && (
        <span id={errorId} role="alert" className="relative font-paper text-micro text-primary-500 italic">
          {errorMessage}
        </span>
      )}

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className={cn(
          "relative inline-flex cursor-pointer items-center gap-3 rounded-full border-0 bg-primary-500 font-regular font-semibold text-paper transition-colors",
          "hover:bg-primary-650 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-500",
          "disabled:cursor-default disabled:hover:bg-primary-500",
          s.submit
        )}
      >
        {/* Сургучная печать */}
        <span
          aria-hidden="true"
          className={cn(
            "size-5.5 shrink-0 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.25)]",
            "bg-[radial-gradient(circle_at_35%_35%,var(--color-primary-200)_0%,var(--color-primary-500)_60%,var(--color-primary-800)_100%)]",
            { hidden: !isDesktop }
          )}
        />
        {isSuccess ? "Письмо запечатано ✓" : isLoading ? "Запечатываем…" : "Запечатать и отправить"}
      </button>
      {isSuccess && (
        <span role="status" className="relative font-hand text-2xl leading-tight">
          Спасибо! Сомелье прочтёт письмо и ответит, если в нём есть вопрос.
        </span>
      )}
    </form>
  );
};

export default WriteLetterForm;
