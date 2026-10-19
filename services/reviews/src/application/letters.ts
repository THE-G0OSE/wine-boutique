import { Injectable } from "@nestjs/common";
import { acceptLetter, publishLetter, rejectLetter, LetterRuleError, type Editorial, type IncomingLetter, type Letter } from "../domain/letter.js";
import { LetterRepository } from "./ports.js";

/** Письма на сайте: лента опубликованных и новое письмо на модерацию */
@Injectable()
export class Letters {
  constructor(private readonly letters: LetterRepository) {}

  published(limit: number, offset: number) {
    return this.letters.listPublished(limit, offset);
  }

  /** Письмо с сайта — сразу в pending; опубликует его сомелье */
  async receive(incoming: IncomingLetter): Promise<void> {
    await this.letters.create(acceptLetter(incoming, new Date()));
  }
}

/** Модерация (CLI до появления админки) */
@Injectable()
export class Moderation {
  constructor(private readonly letters: LetterRepository) {}

  pending(): Promise<Letter[]> {
    return this.letters.listPending();
  }

  async publish(id: string, editorial: Editorial): Promise<Letter> {
    const letter = await this.find(id);
    const published = publishLetter(letter, editorial, new Date());
    await this.letters.save(published);
    return published;
  }

  async reject(id: string): Promise<Letter> {
    const rejected = rejectLetter(await this.find(id));
    await this.letters.save(rejected);
    return rejected;
  }

  private async find(id: string): Promise<Letter> {
    const letter = await this.letters.findById(id);
    if (!letter) throw new LetterRuleError("not_found", `Письма ${id} нет`);
    return letter;
  }
}
