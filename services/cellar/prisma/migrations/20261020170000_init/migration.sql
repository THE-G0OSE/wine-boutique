
-- CreateEnum
CREATE TYPE "cell_tier" AS ENUM ('small', 'medium', 'large');

-- CreateEnum
CREATE TYPE "cell_status" AS ENUM ('free', 'busy');

-- CreateEnum
CREATE TYPE "storage_term" AS ENUM ('3m', '1y', '3y');

-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('new', 'contacted', 'closed');

-- CreateTable
CREATE TABLE "cells" (
    "number" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "tier" "cell_tier" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "cell_status" NOT NULL DEFAULT 'free',
    "price_kopecks" INTEGER,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cells_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "cell_requests" (
    "id" UUID NOT NULL,
    "cell_number" TEXT NOT NULL,
    "term" "storage_term" NOT NULL,
    "status" "request_status" NOT NULL DEFAULT 'new',
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "bottles" INTEGER,
    "consent_at" TIMESTAMPTZ NOT NULL,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cell_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cells_row_position_key" ON "cells"("row", "position");

-- CreateIndex
CREATE INDEX "cell_requests_status_created_at_idx" ON "cell_requests"("status", "created_at");

-- AddForeignKey
ALTER TABLE "cell_requests" ADD CONSTRAINT "cell_requests_cell_number_fkey" FOREIGN KEY ("cell_number") REFERENCES "cells"("number") ON DELETE RESTRICT ON UPDATE CASCADE;

