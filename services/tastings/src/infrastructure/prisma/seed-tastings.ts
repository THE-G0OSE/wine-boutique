import { tastingFixtures } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/**
 * Афиша из @wine/demo-data на текущий месяц и два следующих — та же, что отдают моки фронта.
 * Повторный запуск обновляет описание дегустаций, но не трогает занятые места: их меняют записи гостей.
 */
export const seedTastings = async (prisma: PrismaClient, now = new Date()): Promise<{ tastings: number }> => {
  const fixtures = tastingFixtures(now);
  for (const { seatsTaken, ...fixture } of fixtures) {
    await prisma.tasting.upsert({ where: { id: fixture.id }, create: { ...fixture, seatsTaken }, update: fixture });
  }
  return { tastings: fixtures.length };
};
