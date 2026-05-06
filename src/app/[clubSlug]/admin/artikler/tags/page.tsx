import { notFound } from "next/navigation";

import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../components/admin/AdminShell";
import {
  AdminPageHeader,
  AdminPageSection,
} from "../../../../../components/admin/AdminPagePrimitives";
import { getAdminArticleTags } from "../../../../../lib/admin/articleTagAdminService";
import {
  createArticleTagAction,
  deleteArticleTagAction,
  updateArticleTagAction,
} from "../../../../../lib/admin/articleTagActions";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ArticleTagsPage({ params }: PageProps) {
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

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/artikler/tags`,
  );

  const tags = await getAdminArticleTags(club.id);
  const createAction = createArticleTagAction.bind(null, clubSlug);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Artikel-tags"
        description="Opret og vedligehold tags, som kan knyttes til artikler."
        action={{
          label: "Tilbage til artikler",
          href: `/${clubSlug}/admin/artikler`,
        }}
      />

      <div className="admin-page-content">
        <AdminPageSection>
          <div style={{ marginBottom: "20px" }}>
            <h2 className="admin-section-title">Opret tag</h2>
          </div>

          <form action={createAction} className="admin-form-grid">
            <div className="admin-form-field">
              <label className="admin-label" htmlFor="name">
                Navn
              </label>
              <input
                id="name"
                name="name"
                className="admin-input"
                required
                placeholder="Fx Konkurrence"
              />
              <p className="admin-form-help">
                Slug dannes automatisk ud fra navnet.
              </p>
            </div>

            <div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Opret tag
              </button>
            </div>
          </form>
        </AdminPageSection>

        <AdminPageSection className="admin-table-card">
          <div style={{ padding: "20px 24px 12px" }}>
            <h2 className="admin-section-title">Eksisterende tags</h2>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Artikler</th>
                  <th>Opdateret</th>
                  <th style={{ width: "220px", minWidth: "220px", textAlign: "right" }}>Handling</th>
                </tr>
              </thead>
              <tbody>
                {tags.length > 0 ? (
                  tags.map((tag) => {
                    const updateAction = updateArticleTagAction.bind(null, clubSlug, tag.id);
                    const deleteAction = deleteArticleTagAction.bind(null, clubSlug, tag.id);
                    const updateFormId = `update-tag-${tag.id}`;

                    return (
                      <tr key={tag.id}>
                        <td>
                          <form id={updateFormId} action={updateAction}>
                            <input
                              name="name"
                              className="admin-input"
                              defaultValue={tag.name}
                              required
                            />
                          </form>
                        </td>

                        <td>
                          <span className="admin-badge admin-badge-muted">
                            {tag._count.articles}
                          </span>
                        </td>

                        <td>{tag.updatedAt.toLocaleDateString("da-DK")}</td>

                        <td style={{ width: "220px", textAlign: "right" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: "8px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <button
                              type="submit"
                              form={updateFormId}
                              className="admin-btn admin-btn-secondary"
                            >
                              Gem
                            </button>

                            {tag._count.articles === 0 ? (
                              <form
                                action={deleteAction}
                                style={{
                                  display: "inline-flex",
                                  margin: 0,
                                }}
                              >
                                <button type="submit" className="admin-btn admin-btn-danger">
                                  Slet
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="admin-empty-cell">
                      Ingen tags oprettet endnu.
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
