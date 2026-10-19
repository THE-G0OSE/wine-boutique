-- Регистронезависимый email; citext — доверенное расширение, владелец базы может его создать
CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'unsubscribed');

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL,
    "consent_at" TIMESTAMPTZ,
    "consent_version" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_email_key" ON "subscriptions"("email");
