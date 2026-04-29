-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "status" "ArticleStatus" NOT NULL,
    "visibility" "PublicSurfaceVisibility" NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "authorName" TEXT,
    "readingMinutes" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "legacySource" TEXT,
    "legacyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "legacySource" TEXT,
    "legacyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTagAssignment" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ArticleTagAssignment_pkey" PRIMARY KEY ("articleId","tagId")
);

-- CreateIndex
CREATE INDEX "Article_clubId_status_visibility_idx" ON "Article"("clubId", "status", "visibility");

-- CreateIndex
CREATE INDEX "Article_clubId_isFeatured_idx" ON "Article"("clubId", "isFeatured");

-- CreateIndex
CREATE INDEX "Article_clubId_publishedAt_idx" ON "Article"("clubId", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_clubId_legacySource_legacyId_idx" ON "Article"("clubId", "legacySource", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_clubId_slug_key" ON "Article"("clubId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_clubId_slug_key" ON "ArticleCategory"("clubId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleTag_clubId_slug_key" ON "ArticleTag"("clubId", "slug");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTag" ADD CONSTRAINT "ArticleTag_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTagAssignment" ADD CONSTRAINT "ArticleTagAssignment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTagAssignment" ADD CONSTRAINT "ArticleTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ArticleTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
