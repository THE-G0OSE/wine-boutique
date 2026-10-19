/**
 * Наполнение базы catalog демо-данными из макетов (однократно при первом запуске):
 *   DATABASE_URL=… node dist/seed.js
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./infrastructure/prisma/generated/client.js";
import { seedCatalog } from "./infrastructure/prisma/seed-catalog.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Нужна переменная DATABASE_URL");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const { wines, varieties } = await seedCatalog(prisma);
  console.log(`catalog: ${wines} вин, ${varieties} сортов`);
} finally {
  await prisma.$disconnect();
}
