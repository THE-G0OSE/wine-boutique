import { demoCell } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/**
 * Договор хранения: ячейка переходит гостю и отмечается занятой. С `demo` — опись из макета кабинета (Анна, № 204).
 * Пока нет админки — так ячейку оформляет управляющий (CLI) и сквозные тесты.
 */
export const assignLease = async (
  prisma: PrismaClient,
  { userId, cellNumber, paidUntil, demo = false }: { userId: string; cellNumber: string; paidUntil: string; demo?: boolean }
): Promise<{ leaseId: string }> =>
  prisma.$transaction(async (tx) => {
    await tx.cell.update({ where: { number: cellNumber }, data: { status: "busy" } });
    const lease = await tx.cellLease.create({ data: { userId, cellNumber, paidUntil: new Date(`${paidUntil}T00:00:00Z`) } });
    if (demo) {
      const { bottles } = demoCell(new Date());
      await tx.cellBottle.createMany({
        data: bottles.map(({ id: _id, image, since, ...bottle }, position) => ({
          ...bottle,
          leaseId: lease.id,
          imageUrl: image,
          since: new Date(`${since}T00:00:00Z`),
          position,
        })),
      });
    }
    return { leaseId: lease.id };
  });
