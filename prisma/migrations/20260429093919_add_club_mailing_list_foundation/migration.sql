-- CreateEnum
CREATE TYPE "ClubMailingListPurpose" AS ENUM ('GENERAL', 'FLIGHT_INTENT', 'SCHOOL', 'TRIP', 'OTHER');

-- CreateTable
CREATE TABLE "ClubMailingList" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emailAddress" TEXT NOT NULL,
    "purpose" "ClubMailingListPurpose" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubMailingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubMailingList_clubId_purpose_idx" ON "ClubMailingList"("clubId", "purpose");

-- CreateIndex
CREATE INDEX "ClubMailingList_clubId_isActive_idx" ON "ClubMailingList"("clubId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMailingList_clubId_key_key" ON "ClubMailingList"("clubId", "key");

-- AddForeignKey
ALTER TABLE "ClubMailingList" ADD CONSTRAINT "ClubMailingList_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
