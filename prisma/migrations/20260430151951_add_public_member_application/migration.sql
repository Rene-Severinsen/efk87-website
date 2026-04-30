-- CreateTable
CREATE TABLE "PublicMemberApplication" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "mobilePhone" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "membershipType" "ClubMemberMembershipType" NOT NULL,
    "memberNumber" INTEGER,
    "status" "ClubMemberStatus" NOT NULL DEFAULT 'NEW',
    "schoolStatus" "ClubMemberSchoolStatus" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicMemberApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicMemberApplication_clubId_status_idx" ON "PublicMemberApplication"("clubId", "status");

-- CreateIndex
CREATE INDEX "PublicMemberApplication_clubId_createdAt_idx" ON "PublicMemberApplication"("clubId", "createdAt");

-- AddForeignKey
ALTER TABLE "PublicMemberApplication" ADD CONSTRAINT "PublicMemberApplication_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
