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
            className="admin-gallery-success-box"
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
            <div className="admin-muted text-sm">Albums</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalAlbums}</div>
          </div>
          <div className="admin-card">
            <div className="admin-muted text-sm">Billeder</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{stats.totalImages}</div>
          </div>
          <div className="admin-card">
            <div className="admin-muted text-sm">Publicerede albums</div>
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
                    className="admin-gallery-album-cover"
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
                        className="admin-gallery-empty-cover"
                      >
                        Ingen cover
                      </div>
                    )}

                    <div
                      className={isArchived ? "admin-gallery-cover-badge admin-gallery-cover-badge--archived" : "admin-gallery-cover-badge"}
                    >
                      {statusLabel(album.status)}
                    </div>

                    <div
                      className="admin-gallery-cover-badge admin-gallery-cover-badge--dark"
                    >
                      {visibilityLabel(album.visibility)}
                    </div>

                    {album.showOnPublicHomepage ? (
                      <div
                        className="admin-gallery-cover-badge admin-gallery-cover-badge--success"
                      >
                        Forside · {album.homepageSortOrder}
                      </div>
                    ) : null}
                  </div>
                  <div className="admin-gallery-card-body">
                    <div>
                      <h2 className="admin-gallery-card-title">
                        {album.title}
                      </h2>

                      {album.description ? (
                        <p className="admin-muted mt-1.5 text-sm leading-relaxed">
                          {album.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="admin-gallery-meta-grid">
                      <div>
                        <strong className="admin-strong">Billeder</strong>
                        <br />
                        {album.imageCount}
                      </div>
                      <div>
                        <strong className="admin-strong">Opdateret</strong>
                        <br />
                        {album.updatedAt.toLocaleDateString("da-DK")}
                      </div>
                      <div className="admin-gallery-meta-full">
                        <strong className="admin-strong">Oprettet af</strong>
                        <br />
                        {album.createdByName || album.createdByEmail || "-"}
                      </div>
                    </div>

                    <div className="admin-gallery-card-actions">
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
          <div className="admin-card admin-empty-state">
            Ingen albums fundet.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
