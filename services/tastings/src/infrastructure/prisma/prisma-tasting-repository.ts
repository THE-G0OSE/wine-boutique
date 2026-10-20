import { Injectable } from "@nestjs/common";
import { TastingRepository, type GuestRecord } from "../../application/ports.js";
import type { Tasting } from "../../domain/tasting.js";
import type { Prisma } from "./generated/client.js";
import { TastingsPrisma } from "./tastings-prisma.js";

const toTasting = ({ createdAt: _createdAt, updatedAt: _updatedAt, ...row }: Prisma.TastingGetPayload<object>): Tasting => row;

@Injectable()
export class PrismaTastingRepository extends TastingRepository {
  constructor(private readonly prisma: TastingsPrisma) {
    super();
  }

  async listBetween(from: Date, to: Date): Promise<Tasting[]> {
    const rows = await this.prisma.tasting.findMany({
      where: { startsAt: { gte: from, lt: to } },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    });
    return rows.map(toTasting);
  }

  async find(id: string): Promise<Tasting | null> {
    const row = await this.prisma.tasting.findUnique({ where: { id } });
    return row ? toTasting(row) : null;
  }

  async book(record: GuestRecord, now: Date): Promise<{ bookingId: string; tasting: Tasting } | null> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.$executeRaw`
        UPDATE tastings
        SET seats_taken = seats_taken + ${record.guests}, updated_at = now()
        WHERE id = ${record.tastingId} AND starts_at > ${now} AND seats_taken + ${record.guests} <= capacity`;
      if (updated === 0) return null;
      const booking = await tx.booking.create({ data: record });
      const tasting = await tx.tasting.findUniqueOrThrow({ where: { id: record.tastingId } });
      return { bookingId: booking.id, tasting: toTasting(tasting) };
    });
  }

  async listForUser(userId: string): Promise<{ tasting: Tasting; kind: "booking" | "waitlist"; guests: number }[]> {
    const [bookings, waitlist] = await Promise.all([
      this.prisma.booking.findMany({ where: { userId }, include: { tasting: true } }),
      this.prisma.waitlistEntry.findMany({ where: { userId }, include: { tasting: true } }),
    ]);
    return [
      ...bookings.map((booking) => ({ tasting: toTasting(booking.tasting), kind: "booking" as const, guests: booking.guests })),
      ...waitlist.map((entry) => ({ tasting: toTasting(entry.tasting), kind: "waitlist" as const, guests: entry.guests })),
    ];
  }

  async wait({ tastingId, phone, ...rest }: GuestRecord): Promise<void> {
    await this.prisma.waitlistEntry.upsert({
      where: { tastingId_phone: { tastingId, phone } },
      create: { tastingId, phone, ...rest },
      update: rest,
    });
  }
}
