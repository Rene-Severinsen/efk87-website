import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

writeFile(
    "src/lib/members/memberProfileIdentityService.ts",
    `
import prisma from "../db/prisma";

export interface MemberProfileIdentity {
  id: string;
  displayName: string | null;
  email: string | null;
}

function buildDisplayName(firstName: string | null, lastName: string | null): string | null {
  const fullName = [firstName, lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || null;
}

export async function getMemberProfileIdentity(
  clubId: string,
  userId: string,
): Promise<MemberProfileIdentity | null> {
  const profile = await prisma.clubMemberProfile.findUnique({
    where: {
      clubId_userId: {
        clubId,
        userId,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    displayName: buildDisplayName(profile.firstName, profile.lastName) || profile.user.name || profile.user.email,
    email: profile.user.email,
  };
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/nyt/upload/route.ts",
    `
import { NextResponse } from "next/server";
import { PublicSurfaceVisibility } from "../../../../../generated/prisma";
import { getServerViewerForClub } from "../../../../../lib/auth/viewer";
import { createMemberGalleryWithImages } from "../../../../../lib/gallery/galleryMemberService";
import { getMemberProfileIdentity } from "../../../../../lib/members/memberProfileIdentityService";
import { publicRoutes } from "../../../../../lib/publicRoutes";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function normalizeVisibility(value: string): PublicSurfaceVisibility {
  return value === PublicSurfaceVisibility.MEMBERS_ONLY
    ? PublicSurfaceVisibility.MEMBERS_ONLY
    : PublicSurfaceVisibility.PUBLIC;
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await getServerViewerForClub(club.id);

    if (!viewer.isMember || !viewer.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at oprette galleri.",
        },
        { status: 403 },
      );
    }

    const memberIdentity = await getMemberProfileIdentity(club.id, viewer.userId);

    if (!memberIdentity) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke finde din medlemsprofil.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const title = getText(formData, "title");
    const description = getText(formData, "description");
    const visibility = normalizeVisibility(getText(formData, "visibility"));
    const coverImageIndex = Number.parseInt(getText(formData, "coverImageIndex"), 10);
    const files = getFiles(formData, "images");

    const gallery = await createMemberGalleryWithImages({
      clubId: club.id,
      clubSlug,
      title,
      description,
      visibility,
      files,
      coverImageIndex,
      memberProfileId: memberIdentity.id,
      memberName: memberIdentity.displayName,
      memberEmail: memberIdentity.email,
    });

    return NextResponse.json({
      success: true,
      galleryUrl: publicRoutes.galleryAlbum(clubSlug, gallery.slug),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Galleriet kunne ikke oprettes.",
      },
      { status: 500 },
    );
  }
}
`,
);

writeFile(
    "src/app/[clubSlug]/galleri/[albumSlug]/upload/route.ts",
    `
import { NextResponse } from "next/server";
import { getServerViewerForClub } from "../../../../../lib/auth/viewer";
import { addMemberImagesToGallery } from "../../../../../lib/gallery/galleryMemberService";
import { getMemberProfileIdentity } from "../../../../../lib/members/memberProfileIdentityService";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
    albumSlug: string;
  }>;
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug, albumSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await getServerViewerForClub(club.id);

    if (!viewer.isMember || !viewer.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at tilføje billeder.",
        },
        { status: 403 },
      );
    }

    const memberIdentity = await getMemberProfileIdentity(club.id, viewer.userId);

    if (!memberIdentity) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke finde din medlemsprofil.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const files = getFiles(formData, "images");

    await addMemberImagesToGallery({
      clubId: club.id,
      clubSlug,
      albumSlug,
      files,
      memberProfileId: memberIdentity.id,
      memberName: memberIdentity.displayName,
      memberEmail: memberIdentity.email,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Billederne kunne ikke uploades.",
      },
      { status: 500 },
    );
  }
}
`,
);

const sqlPath = path.join(root, ".tmp-fix-gallery-member-display-name.sql");

const sql = `
UPDATE "GalleryAlbum" AS ga
SET
  "createdByName" = COALESCE(
    NULLIF(TRIM(CONCAT_WS(' ', cmp."firstName", cmp."lastName")), ''),
    u."name",
    u."email",
    ga."createdByName"
  ),
  "createdByEmail" = COALESCE(u."email", ga."createdByEmail")
FROM "ClubMemberProfile" AS cmp
LEFT JOIN "User" AS u ON u."id" = cmp."userId"
WHERE ga."createdByMemberProfileId" = cmp."id";

UPDATE "GalleryImage" AS gi
SET
  "uploadedByName" = COALESCE(
    NULLIF(TRIM(CONCAT_WS(' ', cmp."firstName", cmp."lastName")), ''),
    u."name",
    u."email",
    gi."uploadedByName"
  ),
  "uploadedByEmail" = COALESCE(u."email", gi."uploadedByEmail")
FROM "ClubMemberProfile" AS cmp
LEFT JOIN "User" AS u ON u."id" = cmp."userId"
WHERE gi."uploadedByMemberProfileId" = cmp."id";
`;

fs.writeFileSync(sqlPath, sql.trimStart(), "utf8");

try {
    execSync(`npx prisma db execute --file ${sqlPath}`, {
        stdio: "inherit",
    });
} finally {
    if (fs.existsSync(sqlPath)) {
        fs.unlinkSync(sqlPath);
    }
}

console.log("");
console.log("Done.");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");