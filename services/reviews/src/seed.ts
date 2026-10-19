/**
 * Наполнение базы reviews демо-данными из макетов (однократно при первом запуске):
 *   DATABASE_URL=… node dist/seed.js
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./infrastructure/prisma/generated/client.js";
import { seedReviews } from "./infrastructure/prisma/seed-reviews.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Нужна переменная DATABASE_URL");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const { letters } = await seedReviews(prisma);
  console.log(`reviews: ${letters} опубликованных писем`);
} finally {
  await prisma.$disconnect();
}
