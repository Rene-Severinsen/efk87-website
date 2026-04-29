/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the `ArticleCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ClubMemberMembershipType" AS ENUM ('SENIOR', 'JUNIOR', 'PASSIVE');

-- CreateEnum
CREATE TYPE "ClubMemberRoleType" AS ENUM ('REGULAR', 'BOARD_MEMBER', 'BOARD_SUPPLEANT', 'TREASURER', 'CHAIRMAN', 'VICE_CHAIRMAN');

-- CreateEnum
CREATE TYPE "ClubMemberSchoolStatus" AS ENUM ('APPROVED', 'STUDENT', 'NOT_APPROVED');

-- CreateEnum
CREATE TYPE "ClubMemberStatus" AS ENUM ('ACTIVE', 'RESIGNED', 'NEW');

-- CreateEnum
CREATE TYPE "ClubMemberCertificateType" AS ENUM ('A_CERTIFICATE', 'A_CONTROLLER', 'A_LARGE_MODEL', 'A_LARGE_MODEL_CONTROLLER', 'S_CERTIFICATE', 'S_CONTROLLER', 'S_LARGE_MODEL', 'S_LARGE_MODEL_CONTROLLER', 'H_CERTIFICATE', 'H_CONTROLLER', 'H_LARGE_MODEL', 'H_LARGE_MODEL_CONTROLLER', 'J_LARGE_MODEL', 'J_LARGE_MODEL_CONTROLLER');

-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleCategory" DROP CONSTRAINT "ArticleCategory_clubId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "ArticleCategory";

-- CreateTable
CREATE TABLE "ClubMemberProfile" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "mobilePhone" TEXT,
    "mdkNumber" TEXT,
    "profileImageUrl" TEXT,
    "membershipType" "ClubMemberMembershipType" NOT NULL DEFAULT 'SENIOR',
    "memberRoleType" "ClubMemberRoleType" NOT NULL DEFAULT 'REGULAR',
    "schoolStatus" "ClubMemberSchoolStatus" NOT NULL DEFAULT 'NOT_APPROVED',
    "memberStatus" "ClubMemberStatus" NOT NULL DEFAULT 'NEW',
    "isInstructor" BOOLEAN NOT NULL DEFAULT false,
    "birthDate" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3),
    "legacySource" TEXT,
    "legacyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubMemberProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMemberCertificate" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateType" "ClubMemberCertificateType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubMemberCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubMemberProfile_clubId_memberStatus_idx" ON "ClubMemberProfile"("clubId", "memberStatus");

-- CreateIndex
CREATE INDEX "ClubMemberProfile_clubId_membershipType_idx" ON "ClubMemberProfile"("clubId", "membershipType");

-- CreateIndex
CREATE INDEX "ClubMemberProfile_clubId_schoolStatus_idx" ON "ClubMemberProfile"("clubId", "schoolStatus");

-- CreateIndex
CREATE INDEX "ClubMemberProfile_clubId_memberRoleType_idx" ON "ClubMemberProfile"("clubId", "memberRoleType");

-- CreateIndex
CREATE INDEX "ClubMemberProfile_clubId_legacySource_legacyId_idx" ON "ClubMemberProfile"("clubId", "legacySource", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMemberProfile_clubId_userId_key" ON "ClubMemberProfile"("clubId", "userId");

-- CreateIndex
CREATE INDEX "ClubMemberCertificate_clubId_certificateType_idx" ON "ClubMemberCertificate"("clubId", "certificateType");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMemberCertificate_clubId_userId_certificateType_key" ON "ClubMemberCertificate"("clubId", "userId", "certificateType");

-- AddForeignKey
ALTER TABLE "ClubMemberProfile" ADD CONSTRAINT "ClubMemberProfile_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMemberProfile" ADD CONSTRAINT "ClubMemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMemberCertificate" ADD CONSTRAINT "ClubMemberCertificate_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMemberCertificate" ADD CONSTRAINT "ClubMemberCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
