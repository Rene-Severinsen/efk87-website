/*
  Warnings:

  - A unique constraint covering the columns `[clubId,memberNumber]` on the table `ClubMemberProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ClubMemberProfile" ADD COLUMN     "memberNumber" INTEGER;

-- CreateIndex
CREATE INDEX "ClubMemberProfile_clubId_memberNumber_idx" ON "ClubMemberProfile"("clubId", "memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMemberProfile_clubId_memberNumber_key" ON "ClubMemberProfile"("clubId", "memberNumber");
