import { Injectable } from "@nestjs/common";
import { ProfileRepository, type StoredProfile } from "../../application/ports.js";
import type { ProfileChanges } from "../../domain/profile.js";
import type { Prisma } from "./generated/client.js";
import { IdentityPrisma } from "./identity-prisma.js";

@Injectable()
export class PrismaProfileRepository extends ProfileRepository {
  constructor(private readonly prisma: IdentityPrisma) {
    super();
  }

  async find(userId: string, now: Date): Promise<StoredProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: { where: { revokedAt: null, expiresAt: { gt: now } }, orderBy: { lastSeenAt: "desc" } } },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      birthDate: user.birthDate,
      cardNumber: user.cardNumber,
      favoriteBoutiqueId: user.favoriteBoutiqueId,
      tastes: user.tastes,
      notifications: user.notifications,
      sessions: user.sessions.map((session) => ({
        id: session.id,
        tokenHash: Buffer.from(session.tokenHash),
        userAgent: session.userAgent,
        lastSeenAt: session.lastSeenAt,
      })),
    };
  }

  async update(userId: string, { notifications, ...changes }: ProfileChanges): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { ...changes, ...(notifications && { notifications: notifications as unknown as Prisma.InputJsonObject }) },
    });
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.user.deleteMany({ where: { id: userId } });
  }

  async revokeAll(userId: string, now: Date): Promise<void> {
    await this.prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } });
  }
}
