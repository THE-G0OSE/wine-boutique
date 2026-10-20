import { Injectable } from "@nestjs/common";
import { CellRepository, type NewCellRequestRecord } from "../../application/ports.js";
import type { Cell, CellRequest, StorageTerm } from "../../domain/cell.js";
import { StorageTerm as DbTerm, type Prisma } from "./generated/client.js";
import { CellarPrisma } from "./cellar-prisma.js";

/** Срок в API («3m») ↔ в Prisma (m3): идентификатор enum не может начинаться с цифры */
const TO_DB: Record<StorageTerm, DbTerm> = { "3m": DbTerm.m3, "1y": DbTerm.y1, "3y": DbTerm.y3 };
const FROM_DB: Record<DbTerm, StorageTerm> = { m3: "3m", y1: "1y", y3: "3y" };

const toCell = ({ updatedAt: _updatedAt, ...row }: Prisma.CellGetPayload<object>): Cell => row;

@Injectable()
export class PrismaCellRepository extends CellRepository {
  constructor(private readonly prisma: CellarPrisma) {
    super();
  }

  async list(): Promise<Cell[]> {
    return (await this.prisma.cell.findMany({ orderBy: [{ row: "asc" }, { position: "asc" }] })).map(toCell);
  }

  async find(number: string): Promise<Cell | null> {
    const row = await this.prisma.cell.findUnique({ where: { number } });
    return row ? toCell(row) : null;
  }

  async createRequest({ term, ...record }: NewCellRequestRecord): Promise<CellRequest> {
    const row = await this.prisma.cellRequest.create({ data: { ...record, term: TO_DB[term] }, include: { cell: { select: { tier: true } } } });
    return { id: row.id, cellNumber: row.cellNumber, tier: row.cell.tier, term: FROM_DB[row.term] };
  }
}
