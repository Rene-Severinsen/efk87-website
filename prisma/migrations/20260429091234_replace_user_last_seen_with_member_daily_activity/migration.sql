/*
  Warnings:

  - Added the required column `userId` to the `ClubFlightIntent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClubFlightIntent" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MemberDailyActivity" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberDailyActivity_clubId_activityDate_idx" ON "MemberDailyActivity"("clubId", "activityDate");

-- CreateIndex
CREATE INDEX "MemberDailyActivity_userId_activityDate_idx" ON "MemberDailyActivity"("userId", "activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "MemberDailyActivity_clubId_userId_activityDate_key" ON "MemberDailyActivity"("clubId", "userId", "activityDate");

-- CreateIndex
CREATE INDEX "ClubFlightIntent_userId_idx" ON "ClubFlightIntent"("userId");

-- AddForeignKey
ALTER TABLE "ClubFlightIntent" ADD CONSTRAINT "ClubFlightIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDailyActivity" ADD CONSTRAINT "MemberDailyActivity_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberDailyActivity" ADD CONSTRAINT "MemberDailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
