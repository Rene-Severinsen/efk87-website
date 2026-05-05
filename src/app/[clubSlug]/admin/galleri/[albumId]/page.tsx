import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GalleryAlbumStatus,
  PublicSurfaceVisibility,
} from "../../../../../generated/prisma";
import {
  hideGalleryImageAdminAction,
  setGalleryCoverImageAdminAction,
  showGalleryImageAdminAction,
  updateAdminGalleryAction,
} from "../../../../../lib/admin/galleryAdminActions";
import { getAdminGalleryDetail } from "../../../../../lib/admin/galleryAdminService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import AdminShell from "../../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../../components/admin/AdminPagePrimitives";
import "../../../../../components/admin/AdminDashboard.css";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    albumId: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
  }>;
}

function formatFileSize(sizeBytes: number | null): string {
  if (!sizeBytes) return "-";
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminGalleryDetailPage({ params, searchParams }: PageProps) {
  const { clubSlug, albumId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const wasSaved = resolvedSearchParams.saved === "1";

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
    `/${clubSlug}/admin/galleri/${albumId}`,
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
      <AdminPageHeader
        title="Rediger galleri"
        description="Administrér medlemsgallerier, synlighed, status og billeder."
      />

      <div className="admin-gallery-detail-page pt-6">

        {wasSaved ? (
          <div
            className="admin-gallery-success-box"
          >
            Galleriet er gemt.
          </div>
        ) : null}

        <form action={updateAction} className="admin-card" style={{ marginBottom: "32px", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Titel</label>
              <input
                name="title"
                defaultValue={album.title}
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--admin-card-border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Status</label>
              <select
                name="status"
                defaultValue={album.status}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--admin-card-border)" }}
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
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--admin-card-border)" }}
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
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--admin-card-border)", opacity: 0.7 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Public forside</label>
              <label
                className="admin-gallery-upload-row"
              >
                <input
                  name="showOnPublicHomepage"
                  type="checkbox"
                  value="true"
                  defaultChecked={album.showOnPublicHomepage}
                  style={{ width: "18px", height: "18px" }}
                />
                <span>Vis som udvalgt galleri på public forside</span>
              </label>
              <p className="admin-muted mt-1.5 text-xs">
                Public forsiden viser maks. 3 valgte, publicerede og offentlige albums.
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Forside sortering</label>
              <input
                name="homepageSortOrder"
                type="number"
                min="0"
                defaultValue={album.homepageSortOrder}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--admin-card-border)" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: "8px" }}>Beskrivelse</label>
              <textarea
                name="description"
                defaultValue={album.description || ""}
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--admin-card-border)" }}
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
                    className={isCover ? "admin-gallery-image-card is-cover" : "admin-gallery-image-card"}
                  >
                    <div className="admin-gallery-image-frame">
                      <img
                        src={image.imageUrl}
                        alt={image.title || image.caption || ""}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {isCover ? (
                        <div
                          className="admin-gallery-cover-badge admin-gallery-cover-badge--small"
                        >
                          Cover
                        </div>
                      ) : null}

                      {!isActive ? (
                        <div
                          className="admin-gallery-cover-badge admin-gallery-cover-badge--small admin-gallery-cover-badge--archived admin-gallery-cover-badge--right"
                        >
                          Skjult
                        </div>
                      ) : null}
                    </div>

                    <div style={{ padding: "12px", display: "grid", gap: "8px" }}>
                      <div className="admin-muted text-xs">
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
                          <button type="submit" className="admin-btn admin-btn-danger" style={{ width: "100%" }}>
                            Skjul billede
                          </button>
                        </form>
                      ) : (
                        <form action={showGalleryImageAdminAction.bind(null, clubSlug, album.id, image.id)}>
                          <button type="submit" className="admin-btn admin-btn-success w-full">
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
            <p className="admin-muted">Ingen billeder i dette galleri.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
