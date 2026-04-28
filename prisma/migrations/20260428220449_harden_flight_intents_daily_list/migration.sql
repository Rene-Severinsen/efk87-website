/*
  Warnings:

  - Added the required column `flightDate` to the `ClubFlightIntent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClubFlightIntent" ADD COLUMN "flightDate" TIMESTAMP(3);

-- Update existing rows (use plannedAt if available, otherwise createdAt)
UPDATE "ClubFlightIntent" SET "flightDate" = date_trunc('day', COALESCE("plannedAt", "createdAt"));

-- Make it NOT NULL
ALTER TABLE "ClubFlightIntent" ALTER COLUMN "flightDate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ClubFlightIntent_clubId_flightDate_status_idx" ON "ClubFlightIntent"("clubId", "flightDate", "status");

-- CreateIndex
CREATE INDEX "ClubFlightIntent_clubId_flightDate_visibility_idx" ON "ClubFlightIntent"("clubId", "flightDate", "visibility");
