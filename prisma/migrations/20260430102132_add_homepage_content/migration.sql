-- CreateEnum
CREATE TYPE "HomepageContentVisibility" AS ENUM ('PUBLIC', 'MEMBERS_ONLY');

-- CreateEnum
CREATE TYPE "HomepageContentSignupMode" AS ENUM ('NONE', 'ONE_PER_MEMBER', 'QUANTITY');

-- DropIndex
DROP INDEX "ClubForumThread_authorUserId_idx";

-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "HomepageContentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "visibleFrom" TIMESTAMP(3),
    "visibleUntil" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "signupMode" "HomepageContentSignupMode" NOT NULL DEFAULT 'NONE',
    "signupLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageContentSignup" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledByUserId" TEXT,

    CONSTRAINT "HomepageContentSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomepageContent_clubId_isActive_sortOrder_idx" ON "HomepageContent"("clubId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "HomepageContentSignup_clubId_idx" ON "HomepageContentSignup"("clubId");

-- CreateIndex
CREATE INDEX "HomepageContentSignup_contentId_idx" ON "HomepageContentSignup"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageContentSignup_contentId_userId_key" ON "HomepageContentSignup"("contentId", "userId");

-- AddForeignKey
ALTER TABLE "HomepageContent" ADD CONSTRAINT "HomepageContent_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageContentSignup" ADD CONSTRAINT "HomepageContentSignup_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "HomepageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageContentSignup" ADD CONSTRAINT "HomepageContentSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
