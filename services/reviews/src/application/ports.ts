import type { Letter, PublishedLetter } from "../domain/letter.js";

/** Хранилище писем — порт: сценарии не знают про Prisma */
export abstract class LetterRepository {
  /** Опубликованные — от свежих к старым */
  abstract listPublished(limit: number, offset: number): Promise<{ items: PublishedLetter[]; total: number }>;
  abstract listPending(): Promise<Letter[]>;
  abstract findById(id: string): Promise<Letter | null>;
  abstract create(letter: Omit<Letter, "id">): Promise<Letter>;
  abstract save(letter: Letter): Promise<void>;
}
