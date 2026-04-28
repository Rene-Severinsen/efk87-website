-- CreateTable
CREATE TABLE "PublicClubFooter" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "description" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "cvr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicClubFooter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSponsor" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "href" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicClubFooter_clubId_key" ON "PublicClubFooter"("clubId");

-- CreateIndex
CREATE INDEX "PublicSponsor_clubId_sortOrder_idx" ON "PublicSponsor"("clubId", "sortOrder");

-- CreateIndex
CREATE INDEX "PublicSponsor_clubId_isActive_idx" ON "PublicSponsor"("clubId", "isActive");

-- AddForeignKey
ALTER TABLE "PublicClubFooter" ADD CONSTRAINT "PublicClubFooter_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSponsor" ADD CONSTRAINT "PublicSponsor_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
