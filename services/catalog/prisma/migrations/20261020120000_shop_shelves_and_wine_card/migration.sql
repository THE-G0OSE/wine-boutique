-- Поиск подстрокой по триграммам; pg_trgm — доверенное расширение, владелец базы может его создать
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "wine_shelf" AS ENUM ('red', 'white', 'sparkling', 'aged');

-- CreateEnum
CREATE TYPE "bottle_shape" AS ENUM ('red', 'white', 'sweet', 'sparkling', 'burgundy', 'flute', 'black', 'prosecco', 'port', 'tokaji');

-- AlterTable
ALTER TABLE "wines" ADD COLUMN     "abv" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "aging" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "appellation" TEXT,
ADD COLUMN     "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "bottle" "bottle_shape" NOT NULL DEFAULT 'red',
ADD COLUMN     "food" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "notes" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "potential" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "producer" TEXT,
ADD COLUMN     "profile" JSONB,
ADD COLUMN     "search_text" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "serve" JSONB,
ADD COLUMN     "sommelier_note" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "shelves" (
    "id" "wine_shelf" NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelf_wines" (
    "shelf_id" "wine_shelf" NOT NULL,
    "wine_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "shelf_wines_pkey" PRIMARY KEY ("shelf_id","wine_id")
);

-- CreateTable
CREATE TABLE "wine_relations" (
    "wine_id" UUID NOT NULL,
    "related_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "wine_relations_pkey" PRIMARY KEY ("wine_id","related_id")
);

-- CreateIndex
CREATE INDEX "shelf_wines_wine_id_idx" ON "shelf_wines"("wine_id");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_wines_shelf_id_position_key" ON "shelf_wines"("shelf_id", "position");

-- CreateIndex
CREATE INDEX "wine_relations_related_id_idx" ON "wine_relations"("related_id");

-- CreateIndex
CREATE INDEX "wines_grapes_idx" ON "wines" USING GIN ("grapes");

-- CreateIndex
CREATE INDEX "wines_country_idx" ON "wines"("country");

-- CreateIndex
CREATE INDEX "wines_search_text_trgm_idx" ON "wines" USING GIN ("search_text" gin_trgm_ops);

-- AddForeignKey
ALTER TABLE "shelf_wines" ADD CONSTRAINT "shelf_wines_shelf_id_fkey" FOREIGN KEY ("shelf_id") REFERENCES "shelves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelf_wines" ADD CONSTRAINT "shelf_wines_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wine_relations" ADD CONSTRAINT "wine_relations_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wine_relations" ADD CONSTRAINT "wine_relations_related_id_fkey" FOREIGN KEY ("related_id") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

