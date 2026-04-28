-- CreateTable
CREATE TABLE "ClubTheme" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "panelColor" TEXT NOT NULL,
    "panelSoftColor" TEXT NOT NULL,
    "lineColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "mutedTextColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "accentColor2" TEXT NOT NULL,
    "shadowValue" TEXT NOT NULL,
    "radiusValue" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubTheme_clubId_key" ON "ClubTheme"("clubId");

-- AddForeignKey
ALTER TABLE "ClubTheme" ADD CONSTRAINT "ClubTheme_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
