
-- CreateEnum
CREATE TYPE "request_kind" AS ENUM ('hall', 'gift');

-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('new', 'contacted', 'closed');

-- CreateEnum
CREATE TYPE "monthly_plan" AS ENUM ('duo', 'classic', 'cellar');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'paused', 'cancelled');

-- CreateEnum
CREATE TYPE "certificate_format" AS ENUM ('email', 'envelope');

-- CreateEnum
CREATE TYPE "certificate_status" AS ENUM ('awaiting_payment', 'active', 'redeemed', 'expired');

-- CreateTable
CREATE TABLE "service_requests" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "kind" "request_kind" NOT NULL,
    "status" "request_status" NOT NULL DEFAULT 'new',
    "phone" TEXT NOT NULL,
    "contact_name" TEXT,
    "email" TEXT,
    "company" TEXT,
    "details" JSONB NOT NULL,
    "consent_at" TIMESTAMPTZ NOT NULL,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_crates" (
    "month" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "wines" TEXT[],
    "sommelier" TEXT NOT NULL,

    CONSTRAINT "monthly_crates_pkey" PRIMARY KEY ("month")
);

-- CreateTable
CREATE TABLE "monthly_subscriptions" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "monthly_plan" NOT NULL,
    "boutique_id" TEXT NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'active',
    "consent_at" TIMESTAMPTZ NOT NULL,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "monthly_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "nominal" INTEGER NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "message" TEXT,
    "format" "certificate_format" NOT NULL,
    "recipient_email" TEXT,
    "phone" TEXT NOT NULL,
    "status" "certificate_status" NOT NULL DEFAULT 'awaiting_payment',
    "valid_until" DATE NOT NULL,
    "consent_at" TIMESTAMPTZ NOT NULL,
    "consent_version" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_requests_number_key" ON "service_requests"("number");

-- CreateIndex
CREATE INDEX "service_requests_kind_status_created_at_idx" ON "service_requests"("kind", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_subscriptions_number_key" ON "monthly_subscriptions"("number");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_subscriptions_phone_key" ON "monthly_subscriptions"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_number_key" ON "certificates"("number");

