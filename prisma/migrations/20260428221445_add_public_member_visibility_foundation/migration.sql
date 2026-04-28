-- CreateEnum
CREATE TYPE "PublicSurfaceVisibility" AS ENUM ('PUBLIC', 'MEMBERS_ONLY');

-- AlterTable
ALTER TABLE "PublicHomeFeatureTile" ADD COLUMN     "visibility" "PublicSurfaceVisibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "PublicHomeInfoCard" ADD COLUMN     "visibility" "PublicSurfaceVisibility" NOT NULL DEFAULT 'PUBLIC';

-- CreateIndex
CREATE INDEX "PublicHomeFeatureTile_clubId_visibility_isActive_idx" ON "PublicHomeFeatureTile"("clubId", "visibility", "isActive");

-- CreateIndex
CREATE INDEX "PublicHomeFeatureTile_clubId_visibility_sortOrder_idx" ON "PublicHomeFeatureTile"("clubId", "visibility", "sortOrder");

-- CreateIndex
CREATE INDEX "PublicHomeInfoCard_clubId_visibility_isActive_idx" ON "PublicHomeInfoCard"("clubId", "visibility", "isActive");

-- CreateIndex
CREATE INDEX "PublicHomeInfoCard_clubId_visibility_sortOrder_idx" ON "PublicHomeInfoCard"("clubId", "visibility", "sortOrder");
