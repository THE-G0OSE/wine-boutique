-- CreateEnum
CREATE TYPE "reservation_status" AS ENUM ('active', 'completed', 'cancelled', 'expired');

-- CreateTable
CREATE TABLE "boutiques" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "boutiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'active',
    "boutique_id" TEXT NOT NULL,
    "pickup_at" TIMESTAMPTZ NOT NULL,
    "hold_until" TIMESTAMPTZ NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "comment" TEXT,
    "consent_at" TIMESTAMPTZ NOT NULL,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_items" (
    "reservation_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "wine_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price_kopecks" INTEGER,

    CONSTRAINT "reservation_items_pkey" PRIMARY KEY ("reservation_id","position")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservations_number_key" ON "reservations"("number");

-- CreateIndex
CREATE INDEX "reservations_boutique_id_pickup_at_idx" ON "reservations"("boutique_id", "pickup_at");

-- CreateIndex
CREATE INDEX "reservations_status_hold_until_idx" ON "reservations"("status", "hold_until");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_boutique_id_fkey" FOREIGN KEY ("boutique_id") REFERENCES "boutiques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

