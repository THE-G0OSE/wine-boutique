import { Injectable } from "@nestjs/common";
import { BoutiqueRepository, ReservationRepository, type NewReservationRecord } from "../../application/ports.js";
import type { Boutique, OpeningHours } from "../../domain/pickup.js";
import type { Reservation } from "../../domain/reservation.js";
import type { Prisma } from "./generated/client.js";
import { ReservationsPrisma } from "./reservations-prisma.js";

const toBoutique = ({ position: _position, schedule, ...row }: Prisma.BoutiqueGetPayload<object>): Boutique => ({
  ...row,
  schedule: schedule as unknown as OpeningHours[],
});

type ReservationRow = Prisma.ReservationGetPayload<{ include: { items: true } }>;

const toReservation = (row: ReservationRow): Reservation => ({
  id: row.id,
  number: row.number,
  status: row.status,
  boutiqueId: row.boutiqueId,
  pickupAt: row.pickupAt,
  holdUntil: row.holdUntil,
  customerName: row.customerName,
  createdAt: row.createdAt,
  extended: row.extendedAt !== null,
  items: [...row.items]
    .sort((a, b) => a.position - b.position)
    .map(({ wineId, slug, name, imageUrl, qty, priceKopecks }) => ({ wineId, slug, name, imageUrl, qty, priceKopecks })),
});

@Injectable()
export class PrismaBoutiqueRepository extends BoutiqueRepository {
  constructor(private readonly prisma: ReservationsPrisma) {
    super();
  }

  async list(): Promise<Boutique[]> {
    return (await this.prisma.boutique.findMany({ orderBy: { position: "asc" } })).map(toBoutique);
  }

  async find(id: string): Promise<Boutique | null> {
    const row = await this.prisma.boutique.findUnique({ where: { id } });
    return row ? toBoutique(row) : null;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class PrismaReservationRepository extends ReservationRepository {
  constructor(private readonly prisma: ReservationsPrisma) {
    super();
  }

  async create({ items, ...record }: NewReservationRecord): Promise<Reservation> {
    const row = await this.prisma.reservation.create({
      data: { ...record, items: { create: items.map((item, position) => ({ ...item, position })) } },
      include: { items: true },
    });
    return toReservation(row);
  }

  async find(id: string): Promise<Reservation | null> {
    if (!UUID.test(id)) return null;
    const row = await this.prisma.reservation.findUnique({ where: { id }, include: { items: true } });
    return row ? toReservation(row) : null;
  }

  async listForUser(userId: string): Promise<Reservation[]> {
    const rows = await this.prisma.reservation.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: "desc" }, take: 100 });
    return rows.map(toReservation);
  }

  async findForUser(id: string, userId: string): Promise<Reservation | null> {
    if (!UUID.test(id)) return null;
    const row = await this.prisma.reservation.findFirst({ where: { id, userId }, include: { items: true } });
    return row ? toReservation(row) : null;
  }

  async extend(id: string, holdUntil: Date, now: Date): Promise<Reservation> {
    return toReservation(await this.prisma.reservation.update({ where: { id }, data: { holdUntil, extendedAt: now }, include: { items: true } }));
  }

  async cancel(id: string): Promise<Reservation> {
    return toReservation(await this.prisma.reservation.update({ where: { id }, data: { status: "cancelled" }, include: { items: true } }));
  }
}
