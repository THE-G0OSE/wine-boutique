-- CreateEnum
CREATE TYPE "tasting_kind" AS ENUM ('vertical', 'blind', 'dinner', 'masterclass');

-- CreateTable
CREATE TABLE "tastings" (
    "id" TEXT NOT NULL,
    "kind" "tasting_kind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "wines" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "seats_taken" INTEGER NOT NULL DEFAULT 0,
    "price_kopecks" INTEGER,
    "host" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tastings_pkey" PRIMARY KEY ("id"),
    -- Записи прибавляют места условным UPDATE; ограничение — последняя линия обороны от перебора
    CONSTRAINT "tastings_seats_taken_check" CHECK ("seats_taken" >= 0 AND "seats_taken" <= "capacity")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "tasting_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "consent_at" TIMESTAMPTZ NOT NULL,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" UUID NOT NULL,
    "tasting_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "consent_at" TIMESTAMPTZ NOT NULL,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tastings_starts_at_idx" ON "tastings"("starts_at");

-- CreateIndex
CREATE INDEX "bookings_tasting_id_idx" ON "bookings"("tasting_id");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_tasting_id_phone_key" ON "waitlist_entries"("tasting_id", "phone");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tasting_id_fkey" FOREIGN KEY ("tasting_id") REFERENCES "tastings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_tasting_id_fkey" FOREIGN KEY ("tasting_id") REFERENCES "tastings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

