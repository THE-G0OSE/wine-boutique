-- CreateEnum
CREATE TYPE "wine_category" AS ENUM ('red', 'white', 'sparkling', 'sweet');

-- CreateEnum
CREATE TYPE "grape_type" AS ENUM ('red', 'white');

-- CreateTable
CREATE TABLE "wines" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" "wine_category"[],
    "region" TEXT NOT NULL,
    "country" TEXT,
    "grapes" TEXT[],
    "volume_ml" INTEGER NOT NULL,
    "vintage" INTEGER,
    "cellared_at" DATE,
    "price_kopecks" INTEGER,
    "image_url" TEXT NOT NULL,
    "popularity_rank" INTEGER NOT NULL,
    "arrived_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grape_varieties" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "grape_type" NOT NULL,
    "origin" TEXT NOT NULL,
    "taste" TEXT NOT NULL,
    "harvest" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "plantation" TEXT,
    "image_url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "grape_varieties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grape_variety_wines" (
    "variety_id" UUID NOT NULL,
    "wine_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "grape_variety_wines_pkey" PRIMARY KEY ("variety_id","wine_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wines_slug_key" ON "wines"("slug");

-- CreateIndex
CREATE INDEX "wines_categories_idx" ON "wines" USING GIN ("categories");

-- CreateIndex
CREATE INDEX "wines_price_kopecks_idx" ON "wines"("price_kopecks");

-- CreateIndex
CREATE INDEX "wines_vintage_idx" ON "wines"("vintage");

-- CreateIndex
CREATE INDEX "wines_arrived_at_idx" ON "wines"("arrived_at");

-- CreateIndex
CREATE INDEX "wines_popularity_rank_idx" ON "wines"("popularity_rank");

-- CreateIndex
CREATE UNIQUE INDEX "grape_varieties_slug_key" ON "grape_varieties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "grape_variety_wines_variety_id_position_key" ON "grape_variety_wines"("variety_id", "position");

-- AddForeignKey
ALTER TABLE "grape_variety_wines" ADD CONSTRAINT "grape_variety_wines_variety_id_fkey" FOREIGN KEY ("variety_id") REFERENCES "grape_varieties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grape_variety_wines" ADD CONSTRAINT "grape_variety_wines_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
