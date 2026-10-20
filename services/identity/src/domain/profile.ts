/** Профиль гостя: вкусы, уведомления, устройства */

export const TASTES = ["red_dry", "white_mineral", "sparkling", "sweet", "aged", "burgundy", "italy", "natural"] as const;
export type Taste = (typeof TASTES)[number];

export interface Channels {
  sms: boolean;
  email: boolean;
}

export interface NotificationPrefs {
  reservations: Channels;
  tastings: Channels;
  arrivals: Channels;
  cell: Channels;
  monthly: Channels;
}

/** Уведомления новой карты: о брони, ячейке и наборе — SMS и почта, о поставках — только почта */
export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  reservations: { sms: true, email: true },
  tastings: { sms: true, email: false },
  arrivals: { sms: false, email: true },
  cell: { sms: true, email: true },
  monthly: { sms: true, email: false },
};

/** «Chrome · Windows» по User-Agent — для списка устройств; не распознали — «Браузер» */
export const deviceOf = (userAgent: string | null): string => {
  if (!userAgent) return "Браузер";
  const ua = userAgent;
  const browser = /YaBrowser/.test(ua)
    ? "Яндекс Браузер"
    : /Edg\//.test(ua)
      ? "Edge"
      : /OPR\//.test(ua)
        ? "Opera"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Браузер";
  const system = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : null;
  return system ? `${browser} · ${system}` : browser;
};

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  cardNumber: string | null;
  favoriteBoutiqueId: string | null;
  tastes: Taste[];
  notifications: NotificationPrefs;
  sessions: { id: string; device: string; current: boolean; lastSeenAt: Date }[];
}

export interface ProfileChanges {
  name?: string;
  email?: string | null;
  favoriteBoutiqueId?: string | null;
  tastes?: Taste[];
  notifications?: NotificationPrefs;
}
