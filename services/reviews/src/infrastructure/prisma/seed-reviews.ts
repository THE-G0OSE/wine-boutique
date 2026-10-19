import { reviewsFixture } from "@wine/demo-data";
import type { PrismaClient } from "./generated/client.js";

/**
 * Опубликованные письма из @wine/demo-data — те же, что отдают моки фронта (плейсхолдеры макета как есть).
 * Повторный запуск безопасен: письма обновляются по ключу импорта.
 */
export const seedReviews = async (prisma: PrismaClient, now = new Date()): Promise<{ letters: number }> => {
  for (const [index, review] of reviewsFixture.entries()) {
    // Порядок ленты — как в моке: первое письмо фикстур — самое свежее
    const data = {
      authorName: review.author,
      city: review.city,
      text: review.text,
      status: "published" as const,
      receivedAt: review.receivedAt === null ? null : new Date(`${review.receivedAt}T00:00:00Z`),
      publishedAt: new Date(now.getTime() - index * 60_000),
      topic: review.topic,
      greeting: review.greeting,
      postscript: review.postscript,
      signature: review.signature,
    };
    await prisma.letter.upsert({ where: { importKey: review.id }, create: { importKey: review.id, ...data }, update: data });
  }
  return { letters: reviewsFixture.length };
};
