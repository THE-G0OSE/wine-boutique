import { Injectable } from "@nestjs/common";
import { LetterRepository } from "../../application/ports.js";
import type { Letter, PublishedLetter } from "../../domain/letter.js";
import type { Letter as LetterRow } from "./generated/client.js";
import { ReviewsPrisma } from "./reviews-prisma.js";

const toLetter = ({ importKey: _key, createdAt: _c, updatedAt: _u, ...row }: LetterRow): Letter => row;

const editable = ({ id: _id, ...letter }: Letter) => letter;

@Injectable()
export class PrismaLetterRepository extends LetterRepository {
  constructor(private readonly prisma: ReviewsPrisma) {
    super();
  }

  async listPublished(limit: number, offset: number): Promise<{ items: PublishedLetter[]; total: number }> {
    const where = { status: "published" as const };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.letter.findMany({ where, orderBy: [{ publishedAt: "desc" }, { id: "desc" }], take: limit, skip: offset }),
      this.prisma.letter.count({ where }),
    ]);
    // Опубликованное письмо всегда с темой, обращением и подписью — это проверяет домен при публикации
    return { items: rows.map((row) => toLetter(row) as PublishedLetter), total };
  }

  async listPending(): Promise<Letter[]> {
    return (await this.prisma.letter.findMany({ where: { status: "pending" }, orderBy: { receivedAt: "asc" } })).map(toLetter);
  }

  async findById(id: string): Promise<Letter | null> {
    // Не UUID — такого письма точно нет (и Postgres не ругается на формат)
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const row = await this.prisma.letter.findUnique({ where: { id } });
    return row ? toLetter(row) : null;
  }

  async create(letter: Omit<Letter, "id">): Promise<Letter> {
    return toLetter(await this.prisma.letter.create({ data: letter }));
  }

  async save(letter: Letter): Promise<void> {
    await this.prisma.letter.update({ where: { id: letter.id }, data: editable(letter) });
  }
}
