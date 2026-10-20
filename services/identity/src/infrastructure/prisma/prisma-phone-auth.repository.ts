import { Injectable } from "@nestjs/common";
import { PhoneAuthRepository, type GuestSummary, type NewGuest, type StoredCode } from "../../application/ports.js";
import { Prisma } from "./generated/client.js";
import { IdentityPrisma } from "./identity-prisma.js";

const GUEST = { id: true, name: true, cardNumber: true } as const;

@Injectable()
export class PrismaPhoneAuthRepository extends PhoneAuthRepository {
  constructor(private readonly prisma: IdentityPrisma) {
    super();
  }

  async codesSince(phone: string, since: Date): Promise<StoredCode[]> {
    const rows = await this.prisma.phoneCode.findMany({ where: { phone, createdAt: { gt: since } }, orderBy: { createdAt: "desc" } });
    return rows.map(({ phone: _phone, codeHash, ...row }) => ({ ...row, codeHash: Buffer.from(codeHash) }));
  }

  async createCode(phone: string, codeHash: Buffer, expiresAt: Date, now: Date): Promise<void> {
    await this.prisma.phoneCode.create({ data: { phone, codeHash: new Uint8Array(codeHash), expiresAt, createdAt: now } });
  }

  async failAttempt(codeId: string): Promise<number> {
    const { attempts } = await this.prisma.phoneCode.update({ where: { id: codeId }, data: { attempts: { increment: 1 } }, select: { attempts: true } });
    return attempts;
  }

  async consumeCode(codeId: string, now: Date): Promise<boolean> {
    const { count } = await this.prisma.phoneCode.updateMany({ where: { id: codeId, consumedAt: null }, data: { consumedAt: now } });
    return count === 1;
  }

  findUserByPhone(phone: string): Promise<GuestSummary | null> {
    return this.prisma.user.findUnique({ where: { phone }, select: GUEST });
  }

  async createRegistration(tokenHash: Buffer, phone: string, expiresAt: Date): Promise<void> {
    await this.prisma.registration.create({ data: { tokenHash: new Uint8Array(tokenHash), phone, expiresAt } });
  }

  async takeRegistration(tokenHash: Buffer, now: Date): Promise<string | null> {
    const hash = new Uint8Array(tokenHash);
    const { count } = await this.prisma.registration.updateMany({ where: { tokenHash: hash, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
    if (count !== 1) return null;
    const registration = await this.prisma.registration.findUniqueOrThrow({ where: { tokenHash: hash }, select: { phone: true } });
    return registration.phone;
  }

  async createGuest({ birthDate, ...guest }: NewGuest): Promise<GuestSummary | null> {
    try {
      return await this.prisma.user.create({ data: { ...guest, birthDate: new Date(`${birthDate}T00:00:00Z`) }, select: GUEST });
    } catch (error) {
      // Номер уже зарегистрировали из другой вкладки
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return null;
      throw error;
    }
  }
}
