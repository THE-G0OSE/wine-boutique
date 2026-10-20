import { boutiqueFixtures } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/** Бутики из @wine/demo-data — те же, что отдают моки фронта. Повторный запуск обновляет их по id */
export const seedBoutiques = async (prisma: PrismaClient): Promise<{ boutiques: number }> => {
  for (const [position, boutique] of boutiqueFixtures.entries()) {
    const data = { ...boutique, position };
    await prisma.boutique.upsert({ where: { id: boutique.id }, create: data, update: data });
  }
  return { boutiques: boutiqueFixtures.length };
};
