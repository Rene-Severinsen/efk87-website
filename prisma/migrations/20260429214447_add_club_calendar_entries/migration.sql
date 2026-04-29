-- CreateTable
CREATE TABLE "ClubCalendarEntry" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionHtml" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "location" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "forceShowInMarquee" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubCalendarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubCalendarEntry_clubId_startsAt_idx" ON "ClubCalendarEntry"("clubId", "startsAt");

-- CreateIndex
CREATE INDEX "ClubCalendarEntry_clubId_isPublished_idx" ON "ClubCalendarEntry"("clubId", "isPublished");

-- AddForeignKey
ALTER TABLE "ClubCalendarEntry" ADD CONSTRAINT "ClubCalendarEntry_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
