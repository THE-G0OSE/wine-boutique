-- AlterTable
ALTER TABLE "monthly_subscriptions" ADD COLUMN     "skip_month" TEXT,
ADD COLUMN     "user_id" UUID;

-- AlterTable: остаток уже оформленных сертификатов — весь номинал
ALTER TABLE "certificates" ADD COLUMN     "balance" INTEGER,
ADD COLUMN     "owner_id" UUID;
UPDATE "certificates" SET "balance" = "nominal";
ALTER TABLE "certificates" ALTER COLUMN "balance" SET NOT NULL;

-- CreateIndex
CREATE INDEX "monthly_subscriptions_user_id_idx" ON "monthly_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "certificates_owner_id_idx" ON "certificates"("owner_id");

