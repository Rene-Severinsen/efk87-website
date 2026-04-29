-- CreateEnum
CREATE TYPE "GalleryAlbumStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GalleryImageStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'ARCHIVED');

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "status" "GalleryAlbumStatus" NOT NULL,
    "visibility" "PublicSurfaceVisibility" NOT NULL DEFAULT 'PUBLIC',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "legacySource" TEXT,
    "legacyId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "GalleryImageStatus" NOT NULL,
    "legacySource" TEXT,
    "legacyId" TEXT,
    "takenAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryAlbum_clubId_status_visibility_idx" ON "GalleryAlbum"("clubId", "status", "visibility");

-- CreateIndex
CREATE INDEX "GalleryAlbum_clubId_legacySource_legacyId_idx" ON "GalleryAlbum"("clubId", "legacySource", "legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAlbum_clubId_slug_key" ON "GalleryAlbum"("clubId", "slug");

-- CreateIndex
CREATE INDEX "GalleryImage_clubId_albumId_status_idx" ON "GalleryImage"("clubId", "albumId", "status");

-- CreateIndex
CREATE INDEX "GalleryImage_clubId_legacySource_legacyId_idx" ON "GalleryImage"("clubId", "legacySource", "legacyId");

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
