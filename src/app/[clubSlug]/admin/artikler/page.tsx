import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import {
  AdminPageHeader,
  AdminPageSection,
  AdminStatTile,
  AdminStatTileGrid,
} from "../../../../components/admin/AdminPagePrimitives";
import { getAdminArticleOverview } from "../../../../lib/admin/articleAdminService";
import Link from "next/link";
import { PublicSurfaceVisibility } from "../../../../generated/prisma";

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

function statusLabel(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "Publiceret";
    case "DRAFT":
      return "Kladde";
    case "ARCHIVED":
      return "Arkiveret";
    default:
      return status;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "admin-badge admin-badge-info";
    case "DRAFT":
      return "admin-badge admin-badge-warning";
    case "ARCHIVED":
      return "admin-badge admin-badge-archived";
    default:
      return "admin-badge admin-badge-muted";
  }
}

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/artikler`);
  const { articles, kpis } = await getAdminArticleOverview(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Artikler"
        description="Administrer klubbens nyheder, historier og publiceret indhold."
        action={{
          label: "Opret artikel",
          href: `/${clubSlug}/admin/artikler/ny`,
        }}
      />

      <div className="admin-page-content">
        <AdminStatTileGrid columns="four">
          <AdminStatTile label="Publicerede" value={kpis.published} tone="blue" />
          <AdminStatTile label="Kladder" value={kpis.drafts} tone="amber" />
          <AdminStatTile label="Fremhævet" value={kpis.featured} tone="green" />
          <AdminStatTile label="Arkiverede" value={kpis.archived} tone="slate" />
        </AdminStatTileGrid>

        <div className="admin-row-actions">
          <Link href={`/${clubSlug}/admin/artikler/tags`} className="admin-btn admin-btn-secondary">
            Vedligehold tags
          </Link>
        </div>

        <div style={{ height: "24px" }} />

        <AdminPageSection className="admin-table-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Status</th>
                  <th>Synlighed</th>
                  <th>Publiceret</th>
                  <th>Opdateret</th>
                  <th style={{ textAlign: "right" }}>Handling</th>
                </tr>
              </thead>
              <tbody>
                {articles.length > 0 ? articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className="admin-strong">{article.title}</div>
                      <div className="admin-table-meta">{article.slug}</div>
                    </td>
                    <td>
                      <span className={statusBadgeClass(article.status)}>
                        {statusLabel(article.status)}
                      </span>
                    </td>
                    <td>{visibilityLabel(article.visibility)}</td>
                    <td>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("da-DK") : "—"}</td>
                    <td>{new Date(article.updatedAt).toLocaleDateString("da-DK")}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/${clubSlug}/admin/artikler/${article.id}/rediger`}
                        className="admin-link"
                      >
                        Rediger
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="admin-empty-cell">
                      Ingen artikler fundet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminPageSection>
      </div>
    </AdminShell>
  );
}
