import { Injectable } from "@nestjs/common";
import {
  RequestsRepository,
  type NewCertificate,
  type NewServiceRequest,
  type NewSubscription,
  type OwnedCertificate,
  type StoredCertificate,
  type StoredSubscription,
} from "../../application/ports.js";
import type { MonthlyCrate } from "../../domain/requests.js";
import type { Prisma } from "./generated/client.js";
import { RequestsPrisma } from "./requests-prisma.js";

const SUBSCRIPTION = { number: true, plan: true, boutiqueId: true, status: true, skipMonth: true } as const;
const CERTIFICATE = { number: true, year: true, nominal: true, balance: true, validUntil: true, senderName: true, status: true, ownerId: true } as const;

const toOwned = ({ validUntil, ...row }: Prisma.CertificateGetPayload<{ select: typeof CERTIFICATE }>): OwnedCertificate => ({
  ...row,
  validUntil: validUntil.toISOString().slice(0, 10),
});

@Injectable()
export class PrismaRequestsRepository extends RequestsRepository {
  constructor(private readonly prisma: RequestsPrisma) {
    super();
  }

  async createRequest({ details, ...record }: NewServiceRequest): Promise<{ id: string; number: number }> {
    return this.prisma.serviceRequest.create({ data: { ...record, details: details as Prisma.InputJsonObject }, select: { id: true, number: true } });
  }

  async upsertSubscription({ phone, ...record }: NewSubscription): Promise<{ id: string; number: number }> {
    return this.prisma.monthlySubscription.upsert({
      where: { phone },
      create: { phone, ...record },
      update: { ...record, status: "active" },
      select: { id: true, number: true },
    });
  }

  async createCertificate({ validUntil, ...record }: NewCertificate): Promise<StoredCertificate> {
    const row = await this.prisma.certificate.create({ data: { ...record, balance: record.nominal, validUntil: new Date(`${validUntil}T00:00:00Z`) } });
    return {
      id: row.id,
      number: row.number,
      year: row.year,
      nominal: row.nominal,
      validUntil: row.validUntil.toISOString().slice(0, 10),
      status: row.status,
    };
  }

  async listCrates(upToMonth: string, limit: number): Promise<MonthlyCrate[]> {
    return this.prisma.monthlyCrate.findMany({ where: { month: { lte: upToMonth } }, orderBy: { month: "desc" }, take: limit });
  }

  async findSubscription(userId: string): Promise<StoredSubscription | null> {
    return this.prisma.monthlySubscription.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" }, select: SUBSCRIPTION });
  }

  async updateSubscription(userId: string, changes: { status?: "active" | "paused"; skipMonth?: string | null }): Promise<StoredSubscription | null> {
    const current = await this.prisma.monthlySubscription.findFirst({ where: { userId, status: { not: "cancelled" } }, orderBy: { updatedAt: "desc" }, select: { id: true } });
    if (!current) return null;
    return this.prisma.monthlySubscription.update({ where: { id: current.id }, data: changes, select: SUBSCRIPTION });
  }

  async listCertificates(ownerId: string): Promise<OwnedCertificate[]> {
    const rows = await this.prisma.certificate.findMany({ where: { ownerId }, orderBy: { validUntil: "asc" }, select: CERTIFICATE });
    return rows.map(toOwned);
  }

  async findCertificate(year: number, number: number): Promise<OwnedCertificate | null> {
    const row = await this.prisma.certificate.findFirst({ where: { year, number }, select: CERTIFICATE });
    return row ? toOwned(row) : null;
  }

  async claimCertificate(year: number, number: number, ownerId: string): Promise<boolean> {
    const { count } = await this.prisma.certificate.updateMany({ where: { year, number, ownerId: null }, data: { ownerId } });
    return count === 1;
  }
}
