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

function revalidateGalleryPaths(clubSlug: string, albumId: string) {
  revalidatePath(\`/\${clubSlug}/admin/galleri\`);
  revalidatePath(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
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
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
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
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
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
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
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
  redirect(\`/\${clubSlug}/admin/galleri/\${albumId}\`);
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/galleri/[albumId]/page.tsx",
    `
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GalleryAlbumStatus,
  PublicSurfaceVisibility,
} from "../../../../../generated/prisma";
import AdminShell from "../../../../../components/admin/AdminShell";
import {
  hideGalleryImageAdminAction,
  setGalleryCoverImageAdminAction,
  showGalleryImageAdminAction,
  updateAdminGalleryAction,
} from "../../../../../lib/admin/galleryAdminActions";
import { getAdminGalleryDetail } from "../../../../../lib/admin/galleryAdminService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import "../../../../../components/admin/AdminDashboard.css";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    albumId: string;
  }>;
}

function formatFileSize(sizeBytes: number | null): string {
  if (!sizeBytes) return "-";
  if (sizeBytes < 1024) return \`\${sizeBytes} B\`;
  if (sizeBytes < 1024 * 1024) return \`\${Math.round(sizeBytes / 1024)} KB\`;

  return \`\${(sizeBytes / (1024 * 1024)).toFixed(1)} MB\`;
}

export default async function AdminGalleryDetailPage({ params }: PageProps) {
  const { clubSlug, albumId } = await params;

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
    \`/\${clubSlug}/admin/galleri/\${albumId}\`,
  );

  const album = await getAdminGalleryDetail(club.id, albumId);

  if (!album) {
    notFound();
  }

  const updateAction = updateAdminGalleryAction.bind(null, clubSlug, albumId);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="admin-gallery-detail-page">
        <div className="admin-header-section" style={{ marginBottom: "24px" }}>
          <Link href={\`/\${clubSlug}/admin/galleri\`} className="admin-btn" style={{ marginBottom: "16px" }}>
            ← Tilbage
          </Link>

          <h1 className="admin-section-title">{album.title}</h1>

          <p className="admin-section-subtitle">
            {album.images.length} billeder · {album.createdByName || album.createdByEmail || "Ukendt opretter"}
          </p>
        </div>

        <form action={updateAction} className="admin-card" style={{ marginBottom: "32px", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Titel</label>
              <input
                name="title"
                defaultValue={album.title}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Status</label>
              <select
                name="status"
                defaultValue={album.status}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              >
                <option value={GalleryAlbumStatus.PUBLISHED}>Publiceret</option>
                <option value={GalleryAlbumStatus.DRAFT}>Kladde</option>
                <option value={GalleryAlbumStatus.ARCHIVED}>Arkiveret/skjult</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Synlighed</label>
              <select
                name="visibility"
                defaultValue={album.visibility}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              >
                <option value={PublicSurfaceVisibility.PUBLIC}>Offentlig</option>
                <option value={PublicSurfaceVisibility.MEMBERS_ONLY}>Kun medlemmer</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Slug</label>
              <input
                value={album.slug}
                readOnly
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9", opacity: 0.7 }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Beskrivelse</label>
              <textarea
                name="description"
                defaultValue={album.description || ""}
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d9d9d9" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              Gem galleri
            </button>
          </div>
        </form>

        <div className="admin-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "20px" }}>Billeder</h2>

          {album.images.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
              {album.images.map((image) => {
                const isCover = album.coverImageUrl === image.imageUrl;
                const isActive = image.status === "ACTIVE";

                return (
                  <div
                    key={image.id}
                    style={{
                      border: isCover ? "2px solid #38bdf8" : "1px solid #263244",
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#101827",
                      opacity: isActive ? 1 : 0.55,
                    }}
                  >
                    <div style={{ aspectRatio: "1 / 1", background: "#0b1120", position: "relative" }}>
                      <img
                        src={image.imageUrl}
                        alt={image.title || image.caption || ""}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {isCover ? (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            borderRadius: "999px",
                            background: "#0ea5e9",
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            padding: "4px 8px",
                          }}
                        >
                          Cover
                        </div>
                      ) : null}

                      {!isActive ? (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            borderRadius: "999px",
                            background: "#64748b",
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            padding: "4px 8px",
                          }}
                        >
                          Skjult
                        </div>
                      ) : null}
                    </div>

                    <div style={{ padding: "12px", display: "grid", gap: "8px" }}>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        {image.status} · {formatFileSize(image.sizeBytes)}
                      </div>

                      <form action={setGalleryCoverImageAdminAction.bind(null, clubSlug, album.id, image.imageUrl)}>
                        <button
                          type="submit"
                          className="admin-btn"
                          disabled={!isActive || isCover}
                          style={{ width: "100%", opacity: !isActive || isCover ? 0.55 : 1 }}
                        >
                          {isCover ? "Valgt cover" : "Brug som cover"}
                        </button>
                      </form>

                      {isActive ? (
                        <form action={hideGalleryImageAdminAction.bind(null, clubSlug, album.id, image.id)}>
                          <button type="submit" className="admin-btn" style={{ width: "100%", color: "#fca5a5" }}>
                            Skjul billede
                          </button>
                        </form>
                      ) : (
                        <form action={showGalleryImageAdminAction.bind(null, clubSlug, album.id, image.id)}>
                          <button type="submit" className="admin-btn" style={{ width: "100%", color: "#86efac" }}>
                            Gør synlig
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#8c8c8c" }}>Ingen billeder i dette galleri.</p>
          )}
        </div>
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