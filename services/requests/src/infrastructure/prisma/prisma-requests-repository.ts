import { Injectable } from "@nestjs/common";
import { RequestsRepository, type NewCertificate, type NewServiceRequest, type NewSubscription, type StoredCertificate } from "../../application/ports.js";
import type { MonthlyCrate } from "../../domain/requests.js";
import type { Prisma } from "./generated/client.js";
import { RequestsPrisma } from "./requests-prisma.js";

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
    const row = await this.prisma.certificate.create({ data: { ...record, validUntil: new Date(`${validUntil}T00:00:00Z`) } });
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
}
