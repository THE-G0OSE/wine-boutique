import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./infrastructure/prisma/generated/client.js";
import { seedTastings } from "./infrastructure/prisma/seed-tastings.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL не задан");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const { tastings } = await seedTastings(prisma);
  console.log(`tastings: ${tastings} дегустаций в афише`);
} finally {
  await prisma.$disconnect();
}
