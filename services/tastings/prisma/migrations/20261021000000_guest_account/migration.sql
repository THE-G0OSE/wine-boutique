-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "user_id" UUID;

-- AlterTable
ALTER TABLE "waitlist_entries" ADD COLUMN     "user_id" UUID;

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "waitlist_entries_user_id_idx" ON "waitlist_entries"("user_id");

