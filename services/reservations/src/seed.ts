import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./infrastructure/prisma/generated/client.js";
import { seedBoutiques } from "./infrastructure/prisma/seed-boutiques.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL не задан");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const { boutiques } = await seedBoutiques(prisma);
  console.log(`reservations: ${boutiques} бутика`);
} finally {
  await prisma.$disconnect();
}
