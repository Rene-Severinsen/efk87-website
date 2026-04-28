-- CreateEnum
CREATE TYPE "PublicPageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "PublicPage" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "status" "PublicPageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicPage_clubId_idx" ON "PublicPage"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicPage_clubId_slug_key" ON "PublicPage"("clubId", "slug");

-- AddForeignKey
ALTER TABLE "PublicPage" ADD CONSTRAINT "PublicPage_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
