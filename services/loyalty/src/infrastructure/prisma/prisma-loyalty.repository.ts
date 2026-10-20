import { Injectable } from "@nestjs/common";
import { LoyaltyRepository } from "../../application/ports.js";
import type { BonusEntry } from "../../domain/loyalty.js";
import { LoyaltyPrisma } from "./loyalty-prisma.js";

@Injectable()
export class PrismaLoyaltyRepository extends LoyaltyRepository {
  constructor(private readonly prisma: LoyaltyPrisma) {
    super();
  }

  async grantOnce(userId: string, reference: string, amount: number, title: string): Promise<void> {
    await this.prisma.bonusEntry.createMany({ data: [{ userId, reference, amount, title }], skipDuplicates: true });
  }

  async balance(userId: string): Promise<number> {
    const { _sum } = await this.prisma.bonusEntry.aggregate({ where: { userId }, _sum: { amount: true } });
    return _sum.amount ?? 0;
  }

  async history(userId: string, limit: number): Promise<BonusEntry[]> {
    return this.prisma.bonusEntry.findMany({ where: { userId }, orderBy: { at: "desc" }, take: limit, select: { id: true, at: true, title: true, amount: true } });
  }

  async favoriteIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.favorite.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { wineId: true } });
    return rows.map((row) => row.wineId);
  }

  async addFavorite(userId: string, wineId: string): Promise<void> {
    await this.prisma.favorite.createMany({ data: [{ userId, wineId }], skipDuplicates: true });
  }

  async removeFavorite(userId: string, wineId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, wineId } });
  }
}
