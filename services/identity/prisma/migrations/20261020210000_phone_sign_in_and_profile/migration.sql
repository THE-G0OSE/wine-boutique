-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birth_date" DATE,
ADD COLUMN     "card_number" TEXT,
ADD COLUMN     "consent_at" TIMESTAMPTZ,
ADD COLUMN     "consent_version" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "phone_codes" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" BYTEA NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" UUID NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "phone" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phone_codes_phone_created_at_idx" ON "phone_codes"("phone", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_token_hash_key" ON "registrations"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_card_number_key" ON "users"("card_number");


-- AlterTable
ALTER TABLE "users" ADD COLUMN     "favorite_boutique_id" TEXT,
ADD COLUMN     "notifications" JSONB,
ADD COLUMN     "tastes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "user_agent" TEXT;

