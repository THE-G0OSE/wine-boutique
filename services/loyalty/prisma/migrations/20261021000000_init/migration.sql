
-- CreateTable
CREATE TABLE "bonus_entries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonus_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" UUID NOT NULL,
    "wine_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","wine_id")
);

-- CreateIndex
CREATE INDEX "bonus_entries_user_id_at_idx" ON "bonus_entries"("user_id", "at");

-- CreateIndex
CREATE UNIQUE INDEX "bonus_entries_user_id_reference_key" ON "bonus_entries"("user_id", "reference");

-- CreateIndex
CREATE INDEX "favorites_user_id_created_at_idx" ON "favorites"("user_id", "created_at");

