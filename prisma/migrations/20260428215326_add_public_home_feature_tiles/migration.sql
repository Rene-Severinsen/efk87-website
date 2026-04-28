-- CreateTable
CREATE TABLE "PublicHomeFeatureTile" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicHomeFeatureTile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicHomeFeatureTile_clubId_sortOrder_idx" ON "PublicHomeFeatureTile"("clubId", "sortOrder");

-- CreateIndex
CREATE INDEX "PublicHomeFeatureTile_clubId_isActive_idx" ON "PublicHomeFeatureTile"("clubId", "isActive");

-- AddForeignKey
ALTER TABLE "PublicHomeFeatureTile" ADD CONSTRAINT "PublicHomeFeatureTile_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
