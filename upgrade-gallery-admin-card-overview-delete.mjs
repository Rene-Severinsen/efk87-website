import fs from "fs";
import path from "path";

const root = process.cwd();

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

writeFile(
    "src/lib/admin/galleryAdminService.ts",
    `
import prisma from "../db/prisma";
import {
  GalleryAlbumStatus,
  GalleryImageStatus,
  PublicSurfaceVisibility,
} from "../../generated/prisma";

export interface AdminGalleryOverviewDTO {
  albums: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    status: GalleryAlbumStatus;
    visibility: PublicSurfaceVisibility;
    imageCount: number;
    legacySource: string | null;
    legacyId: string | null;
    createdByName: string | null;
    createdByEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  stats: {
    totalAlbums: number;
    totalImages: number;
    publishedAlbums: number;
  };
}

export interface AdminGalleryDetailDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: GalleryAlbumStatus;
  visibility: PublicSurfaceVisibility;
  coverImageUrl: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    title: string | null;
    caption: string | null;
    imageUrl: string;
    status: GalleryImageStatus;
    sizeBytes: number | null;
    uploadedByName: string | null;
    uploadedByEmail: string | null;
    uploadedAt: Date | null;
    createdAt: Date;
  }[];
}

export async function getAdminGalleryOverview(clubId: string): Promise<AdminGalleryOverviewDTO> {
  const albums = await prisma.galleryAlbum.findMany({
    where: { clubId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          images: {
            where: {
              status: GalleryImageStatus.ACTIVE,
            },
          },
        },
      },
    },
  });

  const totalImages = await prisma.galleryImage.count({
    where: {
      clubId,
      status: GalleryImageStatus.ACTIVE,
    },
  });

  const publishedAlbumsCount = albums.filter(
    (album) => album.status === GalleryAlbumStatus.PUBLISHED,
  ).length;

  return {
    albums: albums.map((album) => ({
      id: album.id,
      slug: album.slug,
      title: album.title,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      status: album.status,
      visibility: album.visibility,
      imageCount: album._count.images,
      legacySource: album.legacySource,
      legacyId: album.legacyId,
      createdByName: album.createdByName,
      createdByEmail: album.createdByEmail,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    })),
    stats: {
      totalAlbums: albums.length,
      totalImages,
      publishedAlbums: publishedAlbumsCount,
    },
  };
}

export async function getAdminGalleryDetail(
  clubId: string,
  albumId: string,
): Promise<AdminGalleryDetailDTO | null> {
  const album = await prisma.galleryAlbum.findFirst({
    where: {
      id: albumId,
      clubId,
    },
    include: {
      images: {
        orderBy: [
          { sortOrder: "asc" },
          { uploadedAt: "asc" },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
          title: true,
          caption: true,
          imageUrl: true,
          status: true,
          sizeBytes: true,
          uploadedByName: true,
          uploadedByEmail: true,
          uploadedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!album) {
    return null;
  }

  return {
    id: album.id,
    slug: album.slug,
    title: album.title,
    description: album.description,
    status: album.status,
    visibility: album.visibility,
    coverImageUrl: album.coverImageUrl,
    createdByName: album.createdByName,
    createdByEmail: album.createdByEmail,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
    images: album.images,
  };
}
`,
);

writeFile(
    "src/lib/admin/galleryAdminActions.ts",
    `
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  GalleryAlbumStatus,
  GalleryImageStatus,
  PublicSurfaceVisibility,
} from "../../generated/prisma";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import prisma from "../db/prisma";
import { requireClubBySlug } from "../tenancy/tenantService";

const galleryUpdateSchema = z.object({
  title: z.string().trim().min(1, "Titel skal udfyldes."),
  description: z.string().trim().optional(),
  status: z.nativeEnum(GalleryAlbumStatus),
  visibility: z.nativeEnum(PublicSurfaceVisibility),
});

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function revalidateGalleryPaths(clubSlug: string, albumId?: string) {
  revalidatePath(\`/\${clubSlug}/admin/galleri\`);

  if (albumId) {
    revalidatePath(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
  }

  revalidatePath(\`/\${clubSlug}/galleri\`);
  revalidatePath(\`/\${clubSlug}\`);
}

export async function updateAdminGalleryAction(
  clubSlug: string,
  albumId: string,
  formData: FormData,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
  );

  const parsed = galleryUpdateSchema.safeParse({
    title: getText(formData, "title"),
    description: getText(formData, "description"),
    status: getText(formData, "status"),
    visibility: getText(formData, "visibility"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Galleriet kunne ikke gemmes.");
  }

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      visibility: parsed.data.visibility,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
}

export async function archiveGalleryAdminAction(
  clubSlug: string,
  albumId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/galleri\`,
  );

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      status: GalleryAlbumStatus.ARCHIVED,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(\`/\${clubSlug}/admin/galleri?saved=deleted\`);
}

export async function hideGalleryImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
  );

  await prisma.galleryImage.updateMany({
    where: {
      id: imageId,
      clubId: club.id,
      albumId,
    },
    data: {
      status: GalleryImageStatus.HIDDEN,
    },
  });

  const firstActiveImage = await prisma.galleryImage.findFirst({
    where: {
      clubId: club.id,
      albumId,
      status: GalleryImageStatus.ACTIVE,
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      imageUrl: true,
    },
  });

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      coverImageUrl: firstActiveImage?.imageUrl || null,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
}

export async function showGalleryImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageId: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
  );

  await prisma.galleryImage.updateMany({
    where: {
      id: imageId,
      clubId: club.id,
      albumId,
    },
    data: {
      status: GalleryImageStatus.ACTIVE,
    },
  });

  const album = await prisma.galleryAlbum.findFirst({
    where: {
      id: albumId,
      clubId: club.id,
    },
    select: {
      coverImageUrl: true,
    },
  });

  if (!album?.coverImageUrl) {
    const image = await prisma.galleryImage.findFirst({
      where: {
        id: imageId,
        clubId: club.id,
        albumId,
      },
      select: {
        imageUrl: true,
      },
    });

    if (image?.imageUrl) {
      await prisma.galleryAlbum.updateMany({
        where: {
          id: albumId,
          clubId: club.id,
        },
        data: {
          coverImageUrl: image.imageUrl,
        },
      });
    }
  }

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
}

export async function setGalleryCoverImageAdminAction(
  clubSlug: string,
  albumId: string,
  imageUrl: string,
) {
  const club = await requireClubBySlug(clubSlug);
  await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
  );

  await prisma.galleryAlbum.updateMany({
    where: {
      id: albumId,
      clubId: club.id,
    },
    data: {
      coverImageUrl: imageUrl,
    },
  });

  revalidateGalleryPaths(clubSlug, albumId);
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}?saved=1\`);
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/galleri/page.tsx",
    `
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryAlbumStatus } from "../../../../generated/prisma";
import { archiveGalleryAdminAction } from "../../../../lib/admin/galleryAdminActions";
import { getAdminGalleryOverview } from "../../../../lib/admin/galleryAdminService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import AdminShell from "../../../../components/admin/AdminShell";
import "../../../../components/admin/AdminDashboard.css";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
  }>;
}

function statusLabel(status: GalleryAlbumStatus): string {
  switch (status) {
    case GalleryAlbumStatus.PUBLISHED:
      return "Publiceret";
    case GalleryAlbumStatus.DRAFT:
      return "Kladde";
    case GalleryAlbumStatus.ARCHIVED:
      return "Arkiveret";
    default:
      return status;
  }
}

function visibilityLabel(visibility: string): string {
  return visibility === "MEMBERS_ONLY" ? "Kun medlemmer" : "Offentlig";
}

export default async function Page({ params, searchParams }: PageProps) {
  const { clubSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const wasDeleted = resolvedSearchParams.saved === "deleted";

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/galleri\`,
  );

  const { albums, stats } = await getAdminGalleryOverview(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="admin-gallery-page">
        <div className="admin-header-section" style={{ marginBottom: "24px" }}>
          <h1 className="admin-section-title">Galleri</h1>
          <p className="admin-section-subtitle">
            Administrér medlemsgallerier, synlighed, status og billeder.
          </p>
        </div>

        {wasDeleted ? (
          <div
            style={{
              marginBottom: "24px",
              border: "1px solid rgba(16,185,129,0.25)",
              background: "rgba(16,185,129,0.12)",
              color: "#86efac",
              borderRadius: "12px",
              padding: "14px 16px",
              fontWeight: 700,
            }}
          >
            Galleriet er slettet/arkiveret.
          </div>
        ) : null}

        <div
          className="admin-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "#8c8c8c" }}>Albums</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalAlbums}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "#8c8c8c" }}>Billeder</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalImages}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "#8c8c8c" }}>Publicerede albums</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.publishedAlbums}</div>
          </div>
        </div>

        {albums.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {albums.map((album) => {
              const isArchived = album.status === GalleryAlbumStatus.ARCHIVED;

              return (
                <article
                  key={album.id}
                  className="admin-card"
                  style={{
                    overflow: "hidden",
                    padding: 0,
                    opacity: isArchived ? 0.58 : 1,
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "16 / 10",
                      background: "#0b1120",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        Ingen cover
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        borderRadius: "999px",
                        background: isArchived ? "#64748b" : "#0ea5e9",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "5px 9px",
                      }}
                    >
                      {statusLabel(album.status)}
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        borderRadius: "999px",
                        background: "rgba(15,23,42,0.82)",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "5px 9px",
                      }}
                    >
                      {visibilityLabel(album.visibility)}
                    </div>
                  </div>

                  <div style={{ padding: "16px", display: "grid", gap: "12px" }}>
                    <div>
                      <h2
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          color: "white",
                          margin: 0,
                        }}
                      >
                        {album.title}
                      </h2>

                      {album.description ? (
                        <p
                          style={{
                            marginTop: "6px",
                            color: "#94a3b8",
                            fontSize: "0.85rem",
                            lineHeight: 1.45,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {album.description}
                        </p>
                      ) : null}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#cbd5e1" }}>Billeder</strong>
                        <br />
                        {album.imageCount}
                      </div>
                      <div>
                        <strong style={{ color: "#cbd5e1" }}>Opdateret</strong>
                        <br />
                        {album.updatedAt.toLocaleDateString("da-DK")}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <strong style={{ color: "#cbd5e1" }}>Oprettet af</strong>
                        <br />
                        {album.createdByName || album.createdByEmail || "-"}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <Link href={\`/\${clubSlug}/admin/galleri/\${album.id}\`} className="admin-btn">
                        Åbn
                      </Link>

                      {!isArchived ? (
                        <form action={archiveGalleryAdminAction.bind(null, clubSlug, album.id)}>
                          <button
                            type="submit"
                            className="admin-btn"
                            style={{ color: "#fca5a5" }}
                          >
                            Slet galleri
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-card" style={{ padding: "32px", textAlign: "center", color: "#8c8c8c" }}>
            Ingen albums fundet.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
`,
);

console.log("");
console.log("Done.");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");