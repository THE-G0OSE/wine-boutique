import { useState, type FC, type FormEvent } from "react";
import { Link } from "react-router";
import {
  CERTIFICATE_FORMATS,
  CERTIFICATE_MAX,
  CERTIFICATE_MESSAGE_LENGTH,
  CERTIFICATE_MIN,
  CERTIFICATE_NAME_LENGTH,
  CERTIFICATE_NOMINALS,
  type Certificate,
  type CertificateDraft,
  type CertificateFormat,
} from "@/entities/certificate";
import { isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/formatPrice";
import { formatPhone, isCompletePhone, toApiPhone } from "@/shared/lib/phone";
import { Button, Text } from "uikit;/";
import { useCreateCertificateMutation } from "../api/issueCertificateApi";

interface IProps {
  draft: CertificateDraft;
  onDraftChange: (patch: Partial<CertificateDraft>) => void;
  onIssued: (certificate: Certificate) => void;
  variant: "desktop" | "mobile";
}

/**
 * Оформление сертификата (POST /certificates): номинал, кому, от кого, пожелание, формат — поля сразу видны на превью.
 * Онлайн-оплаты пока нет: по телефону покупателя пришлём ссылку на оплату.
 */
const IssueCertificateForm: FC<IProps> = ({ draft, onDraftChange, onIssued, variant }) => {
  const isDesktop = variant === "desktop";
  const [create, { data, error, isLoading, reset }] = useCreateCertificateMutation();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const nominalOk = draft.nominal !== null && draft.nominal >= CERTIFICATE_MIN && draft.nominal <= CERTIFICATE_MAX;
  const emailOk = draft.format !== "email" || /^\S+@\S+\.\S+$/.test(email.trim());
  const problem = !nominalOk
    ? `Своя сумма — от ${formatPrice(CERTIFICATE_MIN)} до ${formatPrice(CERTIFICATE_MAX)}`
    : !draft.to.trim() || !draft.from.trim()
      ? "Напишите, кому и от кого сертификат"
      : !emailOk
        ? "Для электронного сертификата нужен e-mail получателя"
        : !isCompletePhone(phone)
          ? "Проверьте телефон — пришлём на него ссылку на оплату"
          : null;

  const change = (patch: Partial<CertificateDraft>) => {
    if (error || data) reset();
    onDraftChange(patch);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (problem || draft.nominal === null) return;
    const result = await create({
      nominal: draft.nominal,
      to: draft.to.trim(),
      from: draft.from.trim(),
      ...(draft.message.trim() && { message: draft.message.trim() }),
      format: draft.format,
      ...(draft.format === "email" && { recipientEmail: email.trim() }),
      phone: toApiPhone(phone),
      consents: { personalData: true },
    });
    if ("data" in result && result.data) onIssued(result.data);
  };

  const pill = (checked: boolean) =>
    cn("flex cursor-pointer flex-col items-center justify-center border text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200", {
      "min-h-14 rounded-[14px] p-1.5": isDesktop,
      "min-h-12.5 rounded-xl text-[13px]": !isDesktop,
      "border-amber-350 bg-amber-350/18": checked,
      "border-cellar-700 bg-cellar-950 hover:border-amber-350/60": !checked,
    });
  const label = cn("flex min-w-0 flex-col text-neutral-350", { "gap-2 text-sm": isDesktop, "gap-1.5 text-micro": !isDesktop });
  const input = cn(
    "w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 font-system text-white outline-none transition-colors placeholder:text-cellar-400 focus:border-amber-350",
    { "h-14 px-4.5 text-[17px]": isDesktop, "h-13 px-4 text-sm": !isDesktop }
  );
  const heading = cn("font-semibold", { "text-caption": isDesktop });
  const serverError = error ? (isApiError(error) ? error.data.message : "Не получилось оформить — проверьте соединение и попробуйте ещё раз") : undefined;
  const errorText = (touched ? problem : null) ?? serverError;

  return (
    <form
      noValidate
      aria-label="Оформление сертификата"
      onSubmit={submit}
      className={cn("flex flex-col border border-amber-200/30 bg-cellar-900", { "gap-5 rounded-3xl p-9 shadow-panel": isDesktop, "gap-3.5 rounded-[20px] p-5": !isDesktop })}
    >
      <div className="flex flex-col gap-2.5">
        <span className={heading}>Номинал</span>
        <div role="radiogroup" aria-label="Номинал" className="grid grid-cols-4 gap-2.5">
          {CERTIFICATE_NOMINALS.map((nominal) => (
            <button
              key={nominal}
              type="button"
              role="radio"
              aria-checked={!draft.custom && draft.nominal === nominal}
              onClick={() => change({ nominal, custom: false })}
              className={cn(pill(!draft.custom && draft.nominal === nominal), "font-system")}
            >
              {new Intl.NumberFormat("ru-RU").format(nominal)}
            </button>
          ))}
          <button type="button" role="radio" aria-checked={draft.custom} onClick={() => change({ custom: true, nominal: null })} className={pill(draft.custom)}>
            Своя
          </button>
        </div>
        {draft.custom ? (
          <label className={label}>
            <span>Сумма, ₽ — от {new Intl.NumberFormat("ru-RU").format(CERTIFICATE_MIN)}</span>
            <input
              type="number"
              inputMode="numeric"
              min={CERTIFICATE_MIN}
              max={CERTIFICATE_MAX}
              step={500}
              placeholder="например, 15000"
              className={input}
              onChange={(event) => change({ nominal: event.target.value ? Math.round(Number(event.target.value)) : null })}
            />
          </label>
        ) : null}
      </div>
      <label className={label}>
        <span>Кому</span>
        <input type="text" maxLength={CERTIFICATE_NAME_LENGTH} value={draft.to} onChange={(event) => change({ to: event.target.value })} placeholder="Имя получателя" className={input} />
      </label>
      <label className={label}>
        <span>От кого</span>
        <input type="text" maxLength={CERTIFICATE_NAME_LENGTH} value={draft.from} onChange={(event) => change({ from: event.target.value })} placeholder="Ваше имя" className={input} />
      </label>
      {isDesktop ? (
        <label className={label}>
          <span>Пожелание</span>
          <textarea
            rows={2}
            maxLength={CERTIFICATE_MESSAGE_LENGTH}
            value={draft.message}
            onChange={(event) => change({ message: event.target.value })}
            placeholder="Пусть каждая бутылка будет поводом"
            className="resize-none rounded-[14px] border border-cellar-700 bg-cellar-950 px-4.5 py-3.5 font-system text-[17px] text-white outline-none placeholder:text-cellar-400 focus:border-amber-350"
          />
        </label>
      ) : null}
      <div className="flex flex-col gap-2.5">
        <span className={heading}>Формат</span>
        <div role="radiogroup" aria-label="Формат сертификата" className="grid grid-cols-2 gap-2.5">
          {(Object.keys(CERTIFICATE_FORMATS) as CertificateFormat[]).map((format) => (
            <button key={format} type="button" role="radio" aria-checked={draft.format === format} onClick={() => change({ format })} className={pill(draft.format === format)}>
              <span className="font-semibold">{CERTIFICATE_FORMATS[format].title}</span>
              <span className={cn("opacity-80", { "text-micro": isDesktop, "text-xs": !isDesktop })}>
                {isDesktop ? CERTIFICATE_FORMATS[format].note.desktop : CERTIFICATE_FORMATS[format].note.mobile}
              </span>
            </button>
          ))}
        </div>
      </div>
      {draft.format === "email" ? (
        <label className={label}>
          <span>E-mail получателя</span>
          <input type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@mail.ru" className={input} />
        </label>
      ) : null}
      <label className={label}>
        <span>Ваш телефон — для ссылки на оплату</span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          placeholder="+7 ___ ___-__-__"
          className={input}
        />
      </label>
      <Button type="submit" size={isDesktop ? "xl" : "md"} disabled={isLoading || Boolean(data)} aria-busy={isLoading || undefined} className={cn("w-full", { "h-13.5 text-[17px]": !isDesktop })}>
        {data ? "Сертификат оформлен ✓" : isLoading ? "Оформляем…" : "Оформить сертификат"}
      </Button>
      {errorText ? (
        <Text role="alert" SIZE="SYSTEM" className="text-center text-error">
          {errorText}
        </Text>
      ) : null}
      {data ? (
        <Text role="status" SIZE="SYSTEM" className="text-center text-amber-200">
          № {data.serial}. Ссылку на оплату пришлём SMS — после оплаты сертификат станет действующим.
        </Text>
      ) : null}
      <span className={cn("text-center text-cellar-400", { "text-micro leading-normal": isDesktop, "text-xs leading-normal": !isDesktop })}>
        {isDesktop ? "Алкоголь по сертификату выдаём только в бутике, по паспорту. " : "Алкоголь по сертификату — только в бутике, по паспорту. "}
        Оформляя, вы соглашаетесь с{" "}
        <Link to={ROUTES.privacy} className="text-amber-200 hover:text-paper">
          политикой конфиденциальности
        </Link>
        .
      </span>
    </form>
  );
};

export default IssueCertificateForm;
