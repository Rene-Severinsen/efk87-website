-- CreateTable
CREATE TABLE "PublicHomeInfoCard" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "badge1" TEXT,
    "badge2" TEXT,
    "badge3" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicHomeInfoCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicHomeInfoCard_clubId_sortOrder_idx" ON "PublicHomeInfoCard"("clubId", "sortOrder");

-- CreateIndex
CREATE INDEX "PublicHomeInfoCard_clubId_isActive_idx" ON "PublicHomeInfoCard"("clubId", "isActive");

-- AddForeignKey
ALTER TABLE "PublicHomeInfoCard" ADD CONSTRAINT "PublicHomeInfoCard_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
