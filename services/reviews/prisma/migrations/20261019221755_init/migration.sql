-- CreateEnum
CREATE TYPE "review_topic" AS ENUM ('tasting', 'gift', 'reserve', 'hall', 'collection');

-- CreateEnum
CREATE TYPE "letter_status" AS ENUM ('pending', 'published', 'rejected');

-- CreateTable
CREATE TABLE "letters" (
    "id" UUID NOT NULL,
    "author_name" TEXT NOT NULL,
    "city" TEXT,
    "text" TEXT NOT NULL,
    "status" "letter_status" NOT NULL DEFAULT 'pending',
    "received_at" TIMESTAMPTZ,
    "published_at" TIMESTAMPTZ,
    "topic" "review_topic",
    "greeting" TEXT,
    "postscript" TEXT,
    "signature" TEXT,
    "import_key" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "letters_import_key_key" ON "letters"("import_key");

-- CreateIndex
CREATE INDEX "letters_status_published_at_idx" ON "letters"("status", "published_at");
