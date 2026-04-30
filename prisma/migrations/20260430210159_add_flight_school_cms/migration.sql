-- CreateTable
CREATE TABLE "FlightSchoolPage" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightSchoolPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightSchoolDocument" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "contentHtml" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightSchoolDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlightSchoolPage_clubId_key" ON "FlightSchoolPage"("clubId");

-- CreateIndex
CREATE INDEX "FlightSchoolDocument_clubId_sortOrder_idx" ON "FlightSchoolDocument"("clubId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FlightSchoolDocument_clubId_slug_key" ON "FlightSchoolDocument"("clubId", "slug");

-- AddForeignKey
ALTER TABLE "FlightSchoolPage" ADD CONSTRAINT "FlightSchoolPage_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightSchoolDocument" ADD CONSTRAINT "FlightSchoolDocument_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
