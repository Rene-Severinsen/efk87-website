-- CreateTable
CREATE TABLE "ClubForumCategory" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubForumCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubForumThread" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replyCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClubForumThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubForumReply" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClubForumReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubForumCategory_clubId_sortOrder_idx" ON "ClubForumCategory"("clubId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ClubForumCategory_clubId_slug_key" ON "ClubForumCategory"("clubId", "slug");

-- CreateIndex
CREATE INDEX "ClubForumThread_clubId_categoryId_lastActivityAt_idx" ON "ClubForumThread"("clubId", "categoryId", "lastActivityAt");

-- CreateIndex
CREATE INDEX "ClubForumThread_authorUserId_idx" ON "ClubForumThread"("authorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubForumThread_clubId_categoryId_slug_key" ON "ClubForumThread"("clubId", "categoryId", "slug");

-- CreateIndex
CREATE INDEX "ClubForumReply_clubId_threadId_createdAt_idx" ON "ClubForumReply"("clubId", "threadId", "createdAt");

-- CreateIndex
CREATE INDEX "ClubForumReply_authorUserId_idx" ON "ClubForumReply"("authorUserId");

-- AddForeignKey
ALTER TABLE "ClubForumCategory" ADD CONSTRAINT "ClubForumCategory_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubForumThread" ADD CONSTRAINT "ClubForumThread_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubForumThread" ADD CONSTRAINT "ClubForumThread_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ClubForumCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubForumThread" ADD CONSTRAINT "ClubForumThread_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubForumReply" ADD CONSTRAINT "ClubForumReply_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubForumReply" ADD CONSTRAINT "ClubForumReply_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ClubForumThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubForumReply" ADD CONSTRAINT "ClubForumReply_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
