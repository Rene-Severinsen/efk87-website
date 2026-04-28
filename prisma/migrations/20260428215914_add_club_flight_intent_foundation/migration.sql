-- CreateEnum
CREATE TYPE "ClubFlightIntentType" AS ENUM ('FLYING', 'MAINTENANCE', 'WEATHER_DEPENDENT', 'TRAINING', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ClubFlightIntentStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClubFlightIntentSource" AS ENUM ('MANUAL', 'ADMIN_SEED', 'FUTURE_MEMBER_APP');

-- CreateEnum
CREATE TYPE "ClubFlightIntentVisibility" AS ENUM ('PUBLIC', 'MEMBERS_ONLY');

-- CreateTable
CREATE TABLE "ClubFlightIntent" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "message" TEXT,
    "activityType" "ClubFlightIntentType" NOT NULL,
    "status" "ClubFlightIntentStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "ClubFlightIntentSource" NOT NULL DEFAULT 'MANUAL',
    "visibility" "ClubFlightIntentVisibility" NOT NULL DEFAULT 'PUBLIC',
    "plannedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubFlightIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubFlightIntent_clubId_status_createdAt_idx" ON "ClubFlightIntent"("clubId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ClubFlightIntent_clubId_plannedAt_idx" ON "ClubFlightIntent"("clubId", "plannedAt");

-- CreateIndex
CREATE INDEX "ClubFlightIntent_clubId_activityType_createdAt_idx" ON "ClubFlightIntent"("clubId", "activityType", "createdAt");

-- CreateIndex
CREATE INDEX "ClubFlightIntent_clubId_source_createdAt_idx" ON "ClubFlightIntent"("clubId", "source", "createdAt");

-- AddForeignKey
ALTER TABLE "ClubFlightIntent" ADD CONSTRAINT "ClubFlightIntent_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
