import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./infrastructure/prisma/generated/client.js";
import { seedCrates } from "./infrastructure/prisma/seed-crates.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL не задан");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const { crates } = await seedCrates(prisma);
  console.log(`requests: ${crates} ящиков набора месяца`);
} finally {
  await prisma.$disconnect();
}
