import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./infrastructure/prisma/generated/client.js";
import { seedCells } from "./infrastructure/prisma/seed-cells.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL не задан");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const { cells } = await seedCells(prisma);
  console.log(`cellar: ${cells} ячеек на стене`);
} finally {
  await prisma.$disconnect();
}
