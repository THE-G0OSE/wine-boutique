-- CreateEnum
CREATE TYPE "news_rubric" AS ENUM ('supply', 'harvest', 'tasting', 'events');

-- CreateEnum
CREATE TYPE "story_placement" AS ENUM ('lead', 'second_wide', 'second_column');

-- CreateTable
CREATE TABLE "issues" (
    "id" UUID NOT NULL,
    "number" INTEGER,
    "published_at" DATE NOT NULL,
    "front_rubric" "news_rubric" NOT NULL,
    "front_title" TEXT NOT NULL,
    "front_image" TEXT NOT NULL,
    "front_article_id" UUID,
    "city" TEXT,
    "weather" TEXT,
    "quote_text" TEXT,
    "quote_author" TEXT,
    "next_issue_teaser" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "issue_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "rubric" "news_rubric" NOT NULL,
    "kicker" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "standfirst" TEXT,
    "byline" TEXT,
    "reading_minutes" INTEGER,
    "image_src" TEXT,
    "image_alt" TEXT,
    "image_caption" TEXT,
    "body" TEXT[],
    "pull_quote_text" TEXT,
    "pull_quote_after_paragraph" INTEGER,
    "related_wine_id" UUID,
    "text_pending" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_stories" (
    "id" UUID NOT NULL,
    "issue_id" UUID NOT NULL,
    "article_id" UUID NOT NULL,
    "placement" "story_placement" NOT NULL,
    "rubric" "news_rubric" NOT NULL,
    "kicker" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "standfirst" TEXT,
    "byline" TEXT,
    "reading_minutes" INTEGER,
    "image_src" TEXT,
    "image_alt" TEXT,
    "image_caption" TEXT,
    "body" TEXT[],
    "has_event" BOOLEAN NOT NULL DEFAULT false,
    "event_starts_at" TIMESTAMPTZ,
    "event_seats" INTEGER,

    CONSTRAINT "issue_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "briefs" (
    "id" UUID NOT NULL,
    "issue_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "rubric" "news_rubric" NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" UUID NOT NULL,
    "issue_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "kicker" TEXT,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "image" TEXT,
    "emphasis" BOOLEAN NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "afisha_items" (
    "id" UUID NOT NULL,
    "issue_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "starts_at" TIMESTAMPTZ,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "capacity_limited" BOOLEAN NOT NULL,
    "seats" INTEGER,

    CONSTRAINT "afisha_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "issues_number_key" ON "issues"("number");

-- CreateIndex
CREATE UNIQUE INDEX "issues_published_at_key" ON "issues"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "issues_front_article_id_key" ON "issues"("front_article_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_issue_id_idx" ON "articles"("issue_id");

-- CreateIndex
CREATE UNIQUE INDEX "issue_stories_issue_id_placement_key" ON "issue_stories"("issue_id", "placement");

-- CreateIndex
CREATE UNIQUE INDEX "briefs_issue_id_position_key" ON "briefs"("issue_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ads_issue_id_position_key" ON "ads"("issue_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "afisha_items_issue_id_position_key" ON "afisha_items"("issue_id", "position");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_front_article_id_fkey" FOREIGN KEY ("front_article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_stories" ADD CONSTRAINT "issue_stories_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_stories" ADD CONSTRAINT "issue_stories_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "afisha_items" ADD CONSTRAINT "afisha_items_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
