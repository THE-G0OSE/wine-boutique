import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState, type FC } from "react";
import { Link } from "react-router";
import { isApiError, type ApiSchemas } from "@/shared/api";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { ButtonLink, Text } from "uikit;/";
import { useRegisterGuestMutation, useRequestPhoneCodeMutation, useVerifyPhoneCodeMutation } from "../api/authApi";
import { stepSwap } from "../model/animations";
import { formatNational, nationalDigits } from "../model/format";
import CodeStep from "./components/CodeStep";
import GuestCard from "./components/GuestCard";
import RegistrationStep, { type IRegistrationValues } from "./components/RegistrationStep";

interface IProps {
  variant: "desktop" | "mobile";
}

type Step = "phone" | "code" | "registration" | "done";
const ORDER: Step[] = ["phone", "code", "registration"];

const messageOf = (error: unknown, fallback: string) => (isApiError(error) ? error.data.message : fallback);

/**
 * Вход и регистрация по телефону (макеты Auth и MAuth): номер → код из SMS → «Знакомимся» (новый гость) →
 * «Карта готова!» / «С возвращением!». Сессию ставит сервер (httpOnly-cookie), шапка перечитывает её сама.
 */
const PhoneAuthCard: FC<IProps> = ({ variant }) => {
  const isDesktop = variant === "desktop";
  const [step, setStep] = useState<Step>("phone");
  const [digits, setDigits] = useState("");
  const [resendAt, setResendAt] = useState(0);
  // Демо-версия без SMS-провайдера: сервер возвращает сам код — показываем его на шаге ввода
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState("");
  const [result, setResult] = useState<{ user: ApiSchemas["SessionUser"]; returning: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [requestCode, codeRequest] = useRequestPhoneCodeMutation();
  const [verifyCode, verification] = useVerifyPhoneCodeMutation();
  const [register, registration] = useRegisterGuestMutation();

  const phone = `+7${digits}`;
  const phoneLabel = `+7 ${formatNational(digits)}`;

  const sendCode = async () => {
    setError(null);
    const response = await requestCode({ phone });
    if ("data" in response && response.data) {
      setResendAt(Date.now() + response.data.resendAfter * 1000);
      setDemoCode(response.data.demoCode ?? null);
      setStep("code");
    } else {
      const retryAfter = isApiError(response.error) ? (response.error.data.details as { retryAfter?: number } | undefined)?.retryAfter : undefined;
      // Код уже отправлен недавно — им можно воспользоваться
      if (retryAfter && step === "phone") {
        setResendAt(Date.now() + retryAfter * 1000);
        setStep("code");
      }
      setError(messageOf(response.error, "Не получилось отправить код — проверьте соединение"));
    }
  };

  const checkCode = useCallback(async (code: string) => {
    setError(null);
    const response = await verifyCode({ phone, code });
    if ("data" in response && response.data) {
      if (response.data.status === "signed_in") {
        setResult({ user: response.data.user, returning: true });
        setStep("done");
      } else {
        setRegistrationToken(response.data.registrationToken);
        setStep("registration");
      }
    } else {
      setError(messageOf(response.error, "Не получилось проверить код — попробуйте ещё раз"));
    }
  }, [phone, verifyCode]);

  const clearError = useCallback(() => setError(null), []);

  const createCard = async (values: IRegistrationValues) => {
    setError(null);
    const response = await register({
      registrationToken,
      name: values.name,
      birthDate: values.birthDate,
      ...(values.email && { email: values.email }),
      consents: { personalData: true, marketing: values.marketing },
    });
    if ("data" in response && response.data?.user) {
      setResult({ user: response.data.user, returning: false });
      setStep("done");
    } else if (isApiError(response.error) && response.error.data.code === "registration_expired") {
      setStep("phone");
      setError(response.error.data.message);
    } else {
      setError(messageOf(response.error, "Не получилось завести карту — попробуйте ещё раз"));
    }
  };

  const active = Math.min(ORDER.indexOf(step === "done" ? "registration" : step), 2);
  const title = cn({ "text-title leading-15": isDesktop, "text-[32px] leading-11.5": !isDesktop });
  const muted = cn({ "text-[17px] leading-normal": isDesktop, "text-sm leading-[1.55]": !isDesktop });

  const content =
    step === "phone" ? (
      <form
        noValidate
        aria-labelledby="auth-title"
        onSubmit={(event) => {
          event.preventDefault();
          if (digits.length === 10) sendCode();
        }}
        className={cn("flex flex-col", { "gap-4.5": isDesktop, "gap-3.5": !isDesktop })}
      >
        <Text as="h2" id="auth-title" FONT="FIRM" className={title}>
          Вход и регистрация
        </Text>
        <Text COLOR="MUTED" className={muted}>
          {isDesktop ? "Пришлём SMS с кодом. Если вы у нас впервые — заведём карту гостя." : "Пришлём SMS с кодом. Впервые у нас — заведём карту гостя."}
        </Text>
        <label className={cn("flex flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop })}>
          <span className={cn({ "sr-only": !isDesktop })}>Номер телефона</span>
          <span className={cn("flex", { "gap-2.5": isDesktop, "gap-2": !isDesktop })}>
            <span
              className={cn("flex items-center rounded-[14px] border border-cellar-700 bg-cellar-950 font-system text-white", {
                "h-15 px-4.5 text-[19px]": isDesktop,
                "h-13.5 px-3.5 text-[17px]": !isDesktop,
              })}
            >
              +7
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={formatNational(digits)}
              onChange={(event) => {
                setDigits(nationalDigits(event.target.value));
                setError(null);
              }}
              placeholder="___ ___-__-__"
              className={cn("min-w-0 flex-1 rounded-[14px] border border-amber-350 bg-cellar-950 font-system tracking-[0.04em] text-white outline-none placeholder:text-cellar-400", {
                "h-15 px-4.5 text-md": isDesktop,
                "h-13.5 px-3.5 text-caption": !isDesktop,
              })}
            />
          </span>
        </label>
        <button
          type="submit"
          disabled={digits.length !== 10 || codeRequest.isLoading}
          aria-busy={codeRequest.isLoading || undefined}
          className={cn(
            "inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-amber-350 font-semibold text-black transition-colors hover:bg-amber-200 disabled:cursor-default disabled:bg-cellar-700 disabled:text-neutral-500",
            { "h-15 text-caption": isDesktop, "h-13.5 text-[17px]": !isDesktop }
          )}
        >
          {codeRequest.isLoading ? "Отправляем…" : "Получить код"}
        </button>
        {error ? (
          <Text role="alert" SIZE="SYSTEM" className="text-error">
            {error}
          </Text>
        ) : null}
        <span className={cn("leading-normal text-cellar-400", { "text-micro": isDesktop, "text-xs": !isDesktop })}>
          Нажимая кнопку, вы соглашаетесь с{" "}
          <Link to={ROUTES.privacy} className="text-amber-200 hover:text-paper">
            {isDesktop ? "политикой конфиденциальности" : "политикой"}
          </Link>
          .
        </span>
      </form>
    ) : step === "code" ? (
      <div className={cn("flex flex-col", { "gap-4.5": isDesktop, "gap-3.5": !isDesktop })}>
        <CodeStep
          variant={variant}
          phoneLabel={phoneLabel}
          resendAt={resendAt}
          error={error}
          busy={verification.isLoading}
          onSubmit={checkCode}
          onResend={sendCode}
          onEdit={clearError}
          onBack={() => {
            setError(null);
            setStep("phone");
          }}
        />
        {demoCode ? (
          <Text role="status" SIZE="SYSTEM" className={cn("text-cellar-400", { "text-[15px]": isDesktop, "text-micro": !isDesktop })}>
            Демо-версия сайта — SMS не отправляем. Ваш код:{" "}
            <span className="font-semibold tracking-[0.2em] text-amber-200">{demoCode}</span>
          </Text>
        ) : null}
        {env.apiMocks ? (
          <span className={cn("text-cellar-400", { "text-[13px]": isDesktop, "text-xs": !isDesktop })}>
            Для превью: код 1988 — новый гость, 2015 — уже зарегистрирован.
          </span>
        ) : null}
      </div>
    ) : step === "registration" ? (
      <RegistrationStep variant={variant} error={error} busy={registration.isLoading} onSubmit={createCard} />
    ) : result ? (
      <div className={cn("flex flex-col", { "gap-4.5": isDesktop, "gap-3.5": !isDesktop })}>
        <Text as="h2" id="auth-title" FONT="FIRM" className={title}>
          {result.returning ? "С возвращением!" : "Карта готова!"}
        </Text>
        <GuestCard name={result.user.name} cardNumber={result.user.cardNumber} variant={variant} />
        <Text COLOR="MUTED" className={muted}>
          {result.returning
            ? "Рады снова видеть вас в погребе."
            : "Мы начислили 500 приветственных бонусов. Карта работает и в бутике — назовите номер телефона."}
        </Text>
        <ButtonLink to={ROUTES.account} size="xl" className={cn("w-full", { "h-13.5 text-[17px]": !isDesktop })}>
          Перейти в кабинет
        </ButtonLink>
      </div>
    ) : null;

  return (
    <section
      role="dialog"
      aria-labelledby="auth-title"
      className={cn("relative border border-amber-200/35 bg-cellar-900", {
        "rounded-[28px] p-3.5 shadow-panel": isDesktop,
        "rounded-3xl px-5 py-6 shadow-popover": !isDesktop,
      })}
    >
      <div className={cn("flex flex-col", { "gap-4.5 rounded-[18px] border border-amber-200/16 px-12 pt-11 pb-9.5": isDesktop, "gap-3.5": !isDesktop })}>
        <div aria-hidden="true" className={cn("flex", { "gap-2": isDesktop, "gap-1.5": !isDesktop })}>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={cn("h-1 rounded-sm transition-all duration-300", {
                "w-10": index === active,
                "w-4.5": index !== active,
                "bg-amber-350": index <= active,
                "bg-cellar-700": index > active,
              })}
            />
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} variants={stepSwap} initial="hidden" animate="visible" exit="exit">
            {content}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PhoneAuthCard;
