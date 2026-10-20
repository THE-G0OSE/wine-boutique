import { Injectable } from "@nestjs/common";
import { DEFAULT_NOTIFICATIONS, deviceOf, TASTES, type NotificationPrefs, type Profile, type ProfileChanges, type Taste } from "../domain/profile.js";
import { ProfileRepository } from "./ports.js";

const isTaste = (value: string): value is Taste => (TASTES as readonly string[]).includes(value);

/** Профиль кабинета: GET /me. Текущее устройство — по хешу токена из cookie */
@Injectable()
export class GetProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(userId: string, currentTokenHash: Buffer | null, now = new Date()): Promise<Profile | null> {
    const stored = await this.profiles.find(userId, now);
    if (!stored) return null;
    return {
      id: stored.id,
      name: stored.name,
      phone: stored.phone,
      email: stored.email,
      birthDate: stored.birthDate ? stored.birthDate.toISOString().slice(0, 10) : null,
      cardNumber: stored.cardNumber,
      favoriteBoutiqueId: stored.favoriteBoutiqueId,
      tastes: stored.tastes.filter(isTaste),
      notifications: { ...DEFAULT_NOTIFICATIONS, ...((stored.notifications as Partial<NotificationPrefs> | null) ?? {}) },
      sessions: stored.sessions.map((session) => ({
        id: session.id,
        device: deviceOf(session.userAgent),
        current: currentTokenHash !== null && session.tokenHash.equals(currentTokenHash),
        lastSeenAt: session.lastSeenAt,
      })),
    };
  }
}

/** Изменение профиля: PATCH /me — имя, почта, любимый бутик, вкусы, уведомления */
@Injectable()
export class UpdateProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(userId: string, changes: ProfileChanges): Promise<void> {
    await this.profiles.update(userId, {
      ...changes,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(changes.email !== undefined && { email: changes.email?.trim() || null }),
      ...(changes.tastes && { tastes: [...new Set(changes.tastes)] }),
    });
  }
}

/** Удаление кабинета и выход отовсюду */
@Injectable()
export class CloseAccount {
  constructor(private readonly profiles: ProfileRepository) {}

  delete(userId: string): Promise<void> {
    return this.profiles.delete(userId);
  }

  signOutEverywhere(userId: string, now = new Date()): Promise<void> {
    return this.profiles.revokeAll(userId, now);
  }
}
