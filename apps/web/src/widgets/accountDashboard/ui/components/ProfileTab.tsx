import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router";
import { formatDots, NOTIFICATION_TOPICS, TASTES, type NotificationPrefs, type Profile, type TasteTag } from "@/entities/account";
import { useGetBoutiquesQuery } from "@/entities/boutique";
import { useDeleteProfileMutation, useSignOutEverywhereMutation, useUpdateProfileMutation } from "@/features/account/editProfile";
import { baseApi, isApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch";
import { formatPhone } from "@/shared/lib/phone";
import { Button, Text } from "uikit;/";
import { PANEL } from "../../model/tabs";

interface IProps {
  profile: Profile;
}

const formatSeen = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? "сейчас" : days === 1 ? "вчера" : formatDots(iso);
};

/** Профиль: имя, почта, любимый бутик и вкусы; уведомления по каналам; устройства, выход везде и удаление кабинета */
const ProfileTab: FC<IProps> = ({ profile }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: boutiques } = useGetBoutiquesQuery();
  const [update, updating] = useUpdateProfileMutation();
  const [signOutEverywhere, signingOut] = useSignOutEverywhereMutation();
  const [deleteProfile, deleting] = useDeleteProfileMutation();

  const [first, ...rest] = profile.name.split(/\s+/);
  const [firstName, setFirstName] = useState(first ?? "");
  const [lastName, setLastName] = useState(rest.join(" "));
  const [email, setEmail] = useState(profile.email ?? "");
  const [boutique, setBoutique] = useState(profile.favoriteBoutiqueId ?? "");
  const [tastes, setTastes] = useState<TasteTag[]>(profile.tastes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const emailOk = !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim());
  const leave = () => {
    // Чужие данные не должны остаться в кэше — следующий вход начнёт с чистого
    dispatch(baseApi.util.resetApiState());
    navigate(ROUTES.home, { replace: true });
  };

  const save = () =>
    update({
      name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" "),
      email: email.trim() || null,
      favoriteBoutiqueId: boutique || null,
      tastes,
    });

  const toggleNotification = (topic: keyof NotificationPrefs, channel: "sms" | "email") =>
    update({ notifications: { ...profile.notifications, [topic]: { ...profile.notifications[topic], [channel]: !profile.notifications[topic][channel] } } });

  const label = "flex min-w-0 flex-col gap-2 text-sm text-neutral-350";
  const field = "h-13 w-full min-w-0 rounded-[14px] border border-cellar-700 bg-cellar-950 px-4 font-system text-[17px] text-white outline-none transition-colors focus:border-amber-350";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:gap-10">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (firstName.trim() && emailOk) save();
        }}
        onChange={() => updating.reset()}
        className={cn(PANEL, "flex flex-col gap-4.5")}
      >
        <Text as="h2" FONT="FIRM" className="text-xl leading-10.5">
          Профиль
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Имя
            <input type="text" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className={field} />
          </label>
          <label className={label}>
            Фамилия
            <input type="text" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className={field} />
          </label>
        </div>
        <div className={label}>
          Телефон — вход в кабинет
          <span className="flex items-center gap-3">
            <input type="tel" readOnly value={profile.phone ? formatPhone(profile.phone) : "—"} aria-label="Телефон" className={cn(field, "text-neutral-350")} />
            <Link to={ROUTES.auth} className="shrink-0 text-amber-200 hover:text-paper">
              Сменить
            </Link>
          </span>
        </div>
        <label className={label}>
          E-mail
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={emailOk ? undefined : true}
            className={cn(field, "aria-invalid:border-error")}
          />
        </label>
        {profile.birthDate ? (
          <div className="flex flex-wrap justify-between gap-2 rounded-[14px] bg-cellar-800 px-4 py-3 text-sm">
            <span>Дата рождения: {formatDots(profile.birthDate)}</span>
            <span className="text-sage">18+</span>
          </div>
        ) : null}
        <label className={label}>
          Любимый бутик
          <select value={boutique} onChange={(event) => setBoutique(event.target.value)} className={cn(field, "cursor-pointer")}>
            <option value="">— не выбран —</option>
            {boutiques?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2.5">
          <span className="text-sm text-neutral-350">Что вы любите — сомелье учтёт в подборках</span>
          <div role="group" aria-label="Вкусы" className="flex flex-wrap gap-2">
            {(Object.keys(TASTES) as TasteTag[]).map((taste) => {
              const on = tastes.includes(taste);
              return (
                <button
                  key={taste}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTastes((prev) => (on ? prev.filter((item) => item !== taste) : [...prev, taste]))}
                  className={cn("h-10 cursor-pointer rounded-full border px-4 text-micro transition-colors", {
                    "border-amber-350 bg-amber-350/20 text-amber-200": on,
                    "border-cellar-700 bg-cellar-950 text-white hover:border-amber-350/60": !on,
                  })}
                >
                  {TASTES[taste]}
                </button>
              );
            })}
          </div>
        </div>
        <Button type="submit" size="lg" disabled={!firstName.trim() || !emailOk || updating.isLoading} className="self-start">
          {updating.isSuccess ? "Сохранено ✓" : updating.isLoading ? "Сохраняем…" : "Сохранить"}
        </Button>
        {updating.error ? (
          <Text role="alert" SIZE="SYSTEM" className="text-error">
            {isApiError(updating.error) ? updating.error.data.message : "Не получилось сохранить"}
          </Text>
        ) : null}
      </form>

      <div className="flex flex-col gap-6">
        <section aria-labelledby="notifications-title" className={cn(PANEL, "flex flex-col gap-3")}>
          <Text as="h2" id="notifications-title" FONT="FIRM" className="text-xl leading-10.5">
            Уведомления
          </Text>
          <div aria-hidden="true" className="grid grid-cols-[1fr_64px_64px] text-center text-xs text-cellar-400 uppercase">
            <span />
            <span>SMS</span>
            <span>Почта</span>
          </div>
          {(Object.keys(NOTIFICATION_TOPICS) as (keyof NotificationPrefs)[]).map((topic) => (
            <div key={topic} className="grid grid-cols-[1fr_64px_64px] items-center gap-y-2 text-sm">
              <span>{NOTIFICATION_TOPICS[topic]}</span>
              {(["sms", "email"] as const).map((channel) => {
                const on = profile.notifications[topic][channel];
                return (
                  <button
                    key={channel}
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`${NOTIFICATION_TOPICS[topic]}, ${channel === "sms" ? "SMS" : "почта"}`}
                    disabled={updating.isLoading}
                    onClick={() => toggleNotification(topic, channel)}
                    className={cn("relative h-7.5 w-13 cursor-pointer justify-self-center rounded-full border-0 p-0 transition-colors", { "bg-amber-350": on, "bg-cellar-700": !on })}
                  >
                    <span className={cn("absolute top-0.75 size-6 rounded-full bg-paper transition-[left] duration-200", { "left-6.25": on, "left-0.75": !on })} />
                  </button>
                );
              })}
            </div>
          ))}
        </section>

        <section aria-labelledby="security-title" className={cn(PANEL, "flex flex-col gap-3")}>
          <span id="security-title" className="font-semibold">
            Безопасность
          </span>
          {profile.sessions.map((session) => (
            <div key={session.id} className="flex justify-between gap-3 border-b border-cellar-800 pb-2.5 text-sm">
              <span>
                {session.device}
                {session.current ? " · это устройство" : ""}
              </span>
              <span className="text-neutral-350">{formatSeen(session.lastSeenAt)}</span>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Button
              variant="link"
              disabled={signingOut.isLoading}
              onClick={async () => {
                await signOutEverywhere();
                leave();
              }}
              className="text-sm"
            >
              Выйти на всех устройствах
            </Button>
            <Button variant="link" onClick={() => setConfirmDelete(true)} className="text-sm text-primary-200 hover:text-primary-350">
              Удалить аккаунт
            </Button>
          </div>
          {confirmDelete ? (
            <div role="alert" className="rounded-[14px] border border-primary-500/50 bg-primary-500/10 p-4 text-sm leading-normal">
              Удалим кабинет и бонусы. Бутылки в ячейке останутся вашими — заберите их в бутике.{" "}
              <Button
                variant="link"
                disabled={deleting.isLoading}
                onClick={async () => {
                  await deleteProfile();
                  leave();
                }}
                className="text-sm text-primary-200"
              >
                Да, удалить
              </Button>{" "}
              ·{" "}
              <Button variant="link" onClick={() => setConfirmDelete(false)} className="text-sm text-neutral-350">
                Отмена
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default ProfileTab;
