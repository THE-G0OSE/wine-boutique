import { useEffect, useRef, useState, type FC } from "react";
import { cn } from "@/shared/lib/cn";
import { Text } from "uikit;/";

interface IProps {
  variant: "desktop" | "mobile";
  phoneLabel: string;
  /** Когда можно попросить новый код (мс эпохи) */
  resendAt: number;
  error: string | null;
  busy: boolean;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  onEdit: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/** Код из SMS: четыре клетки, экранная клавиатура и обычная (скрытое поле с one-time-code), таймер нового кода */
const CodeStep: FC<IProps> = ({ variant, phoneLabel, resendAt, error, busy, onSubmit, onResend, onBack, onEdit }) => {
  const isDesktop = variant === "desktop";
  const [code, setCode] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => input.current?.focus(), []);
  // Неверный код — клетки очищаются для новой попытки
  useEffect(() => {
    if (error) setCode("");
  }, [error]);

  // Четыре цифры — сразу проверяем (и с клавиатуры, и с экранных кнопок)
  useEffect(() => {
    if (code.length === 4) onSubmit(code);
  }, [code, onSubmit]);

  const change = (next: string) => {
    setCode(next.replace(/\D/g, "").slice(0, 4));
    onEdit();
  };
  const press = (key: string) => {
    setCode((prev) => (prev.length < 4 ? prev + key : prev));
    onEdit();
  };
  const left = Math.max(0, Math.ceil((resendAt - now) / 1000));

  return (
    <>
      <button type="button" onClick={onBack} className={cn("cursor-pointer self-start border-0 bg-transparent p-0 text-amber-200 hover:text-paper", { "h-9 text-sm": isDesktop, "h-8 text-[15px]": !isDesktop })}>
        ← Изменить номер
      </button>
      <Text as="h2" id="auth-title" FONT="FIRM" className={cn({ "text-title leading-15": isDesktop, "text-[32px] leading-11.5": !isDesktop })}>
        Код из SMS
      </Text>
      <Text COLOR="MUTED" className={cn({ "text-[17px]": isDesktop, "text-sm leading-[1.55]": !isDesktop })}>
        Отправили на {phoneLabel}
      </Text>
      <label className="relative block">
        <span className="sr-only">Код из 4 цифр</span>
        <input
          ref={input}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          value={code}
          disabled={busy}
          onChange={(event) => change(event.target.value)}
          className="peer absolute inset-0 size-full cursor-text opacity-0"
        />
        <span aria-hidden="true" className={cn("grid grid-cols-4", { "gap-3.5": isDesktop, "gap-2.5": !isDesktop })}>
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn("flex h-19 items-center justify-center rounded-2xl border-2 bg-cellar-950 font-system text-[34px] font-semibold text-white", {
                "border-primary-200": error,
                "border-amber-350": !error && index === code.length,
                "border-amber-200": !error && index < code.length,
                "border-cellar-700": !error && index > code.length,
              })}
            >
              {code[index] ?? ""}
            </span>
          ))}
        </span>
      </label>
      {error ? (
        <Text role="alert" className={cn("text-primary-200", { "text-[15px]": isDesktop, "text-micro": !isDesktop })}>
          {error}
        </Text>
      ) : null}
      <div role="group" aria-label="Цифровая клавиатура" className={cn("grid grid-cols-5", { "gap-2": isDesktop, "gap-1.5": !isDesktop })}>
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={busy}
            onClick={() => press(key)}
            className="h-12 cursor-pointer rounded-xl border border-cellar-700 bg-cellar-950 font-system text-lg text-white transition-colors hover:border-amber-350 disabled:opacity-50"
          >
            {key}
          </button>
        ))}
      </div>
      <div className={cn("flex items-center justify-between text-cellar-400", { "text-[15px]": isDesktop, "text-micro": !isDesktop })}>
        {left > 0 ? (
          <span aria-live="off">
            Новый код через {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        ) : (
          <button type="button" onClick={onResend} className="cursor-pointer border-0 bg-transparent p-0 text-amber-200 hover:text-paper">
            Отправить код ещё раз
          </button>
        )}
        <button type="button" onClick={() => change("")} className="cursor-pointer border-0 bg-transparent p-0 text-neutral-350 underline">
          Стереть
        </button>
      </div>
    </>
  );
};

export default CodeStep;
