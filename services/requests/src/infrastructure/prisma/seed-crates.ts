import { monthlyCrateFixtures } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/** Ящики «Набора месяца» из @wine/demo-data — те же, что отдают моки фронта. Повторный запуск обновляет их по месяцу */
export const seedCrates = async (prisma: PrismaClient): Promise<{ crates: number }> => {
  for (const crate of monthlyCrateFixtures) {
    await prisma.monthlyCrate.upsert({ where: { month: crate.month }, create: crate, update: crate });
  }
  return { crates: monthlyCrateFixtures.length };
};
