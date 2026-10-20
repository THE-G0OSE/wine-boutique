-- CreateTable
CREATE TABLE "cell_leases" (
    "id" UUID NOT NULL,
    "cell_number" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "paid_until" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cell_leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cell_bottles" (
    "id" UUID NOT NULL,
    "lease_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "since" DATE NOT NULL,
    "photos" INTEGER NOT NULL,
    "ready_from" INTEGER,
    "position" INTEGER NOT NULL,

    CONSTRAINT "cell_bottles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cell_preparations" (
    "lease_id" UUID NOT NULL,
    "bottle_ids" TEXT[],
    "visit_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cell_preparations_pkey" PRIMARY KEY ("lease_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cell_leases_cell_number_key" ON "cell_leases"("cell_number");

-- CreateIndex
CREATE INDEX "cell_leases_user_id_idx" ON "cell_leases"("user_id");

-- CreateIndex
CREATE INDEX "cell_bottles_lease_id_position_idx" ON "cell_bottles"("lease_id", "position");

-- AddForeignKey
ALTER TABLE "cell_leases" ADD CONSTRAINT "cell_leases_cell_number_fkey" FOREIGN KEY ("cell_number") REFERENCES "cells"("number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cell_bottles" ADD CONSTRAINT "cell_bottles_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "cell_leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cell_preparations" ADD CONSTRAINT "cell_preparations_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "cell_leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

