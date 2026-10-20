-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "extended_at" TIMESTAMPTZ,
ADD COLUMN     "user_id" UUID;

-- CreateIndex
CREATE INDEX "reservations_user_id_created_at_idx" ON "reservations"("user_id", "created_at");

