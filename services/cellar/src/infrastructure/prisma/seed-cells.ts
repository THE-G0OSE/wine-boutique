import { cellarCellFixtures } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/**
 * Стена из @wine/demo-data — та же, что отдают моки фронта. Новые ячейки создаются с занятостью из макета;
 * у существующих сид не трогает занятость — её меняет управляющий по договорам.
 */
export const seedCells = async (prisma: PrismaClient): Promise<{ cells: number }> => {
  for (const [index, { pricePerMonth, status, ...cell }] of cellarCellFixtures.entries()) {
    const data = { ...cell, position: (index % 8) + 1, priceKopecks: pricePerMonth === null ? null : pricePerMonth * 100 };
    await prisma.cell.upsert({ where: { number: cell.number }, create: { ...data, status }, update: data });
  }
  return { cells: cellarCellFixtures.length };
};
