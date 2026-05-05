import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryAlbumStatus, PublicSurfaceVisibility } from "../../../../generated/prisma";
import ArchiveGalleryButton from "./ArchiveGalleryButton";
import { getAdminGalleryOverview } from "../../../../lib/admin/galleryAdminService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
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

function visibilityLabel(visibility: PublicSurfaceVisibility): string {
  switch (visibility) {
    case PublicSurfaceVisibility.PUBLIC:
      return "Offentlig";
    case PublicSurfaceVisibility.MEMBERS_ONLY:
      return "Kun medlemmer";
    default:
      return visibility;
  }
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
    `/${clubSlug}/admin/galleri`,
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
      <AdminPageHeader
        title="Galleri"
        description="Administrér medlemsgallerier, synlighed, status og billeder."
      />

      <div className="admin-gallery-page pt-6">

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
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)" }}>Albums</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalAlbums}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)" }}>Billeder</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalImages}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)" }}>Publicerede albums</div>
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
                          color: "var(--admin-text-muted)",
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

                    {album.showOnPublicHomepage ? (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          left: "10px",
                          borderRadius: "999px",
                          background: "rgba(16,185,129,0.9)",
                          color: "white",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          padding: "5px 9px",
                        }}
                      >
                        Forside · {album.homepageSortOrder}
                      </div>
                    ) : null}
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
                            color: "var(--admin-text-muted)",
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
                        color: "var(--admin-text-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--admin-text)" }}>Billeder</strong>
                        <br />
                        {album.imageCount}
                      </div>
                      <div>
                        <strong style={{ color: "var(--admin-text)" }}>Opdateret</strong>
                        <br />
                        {album.updatedAt.toLocaleDateString("da-DK")}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <strong style={{ color: "var(--admin-text)" }}>Oprettet af</strong>
                        <br />
                        {album.createdByName || album.createdByEmail || "-"}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      <Link href={`/${clubSlug}/admin/galleri/${album.id}`} className="admin-btn">
                        Åbn
                      </Link>

                      {!isArchived ? (
                        <ArchiveGalleryButton
                          clubSlug={clubSlug}
                          albumId={album.id}
                          albumTitle={album.title}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-card" style={{ padding: "32px", textAlign: "center", color: "var(--admin-text-muted)" }}>
            Ingen albums fundet.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
