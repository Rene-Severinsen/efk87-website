import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { ACCESS_AUDIENCES, ACCESS_MODULES, hasAudience } from "../../../../lib/access/accessRegistry";
import type { AccessConfigurability } from "../../../../lib/access/accessTypes";
import "./AccessAdminPage.css";

interface AdminAccessPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

const configurabilityLabels: Record<AccessConfigurability, string> = {
  fixed: "Fast",
  contentVisibility: "Indholdsstyret",
  roleBased: "Rollebaseret",
  platformOnly: "Platform",
  future: "Senere",
};

const areaOrder = ["Public", "Member", "Club admin", "Platform admin"] as const;

export default async function AdminAccessPage({ params }: AdminAccessPageProps) {
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
    `/${clubSlug}/admin/adgang`,
  );

  const modulesByArea = areaOrder.map((area) => ({
    area,
    modules: ACCESS_MODULES.filter((module) => module.area === area),
  }));

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Adgangsmatrix"
        description="Read-only overblik over hvilke sider og moduler der er tiltænkt public, medlemmer, klubadministratorer og platform admin."
      />

      <div className="access-admin-container pt-6">

        <section className="access-admin-audience-grid">
          {ACCESS_AUDIENCES.map((audience) => (
            <article key={audience.key} className="access-admin-card">
              <h2>{audience.label}</h2>
              <p>{audience.description}</p>
            </article>
          ))}
        </section>

        <section className="access-admin-panel">
          <div className="access-admin-panel-header">
            <h2>Samlet matrix</h2>
            <p>
              Første version er kun overblik. Redigerbar visibility bygges senere på konkrete indholdstyper.
            </p>
          </div>

          <div className="access-admin-table-wrap">
            <table className="access-admin-table">
              <thead>
                <tr>
                  <th>Modul</th>
                  <th>Område</th>
                  {ACCESS_AUDIENCES.map((audience) => (
                    <th key={audience.key} className="access-admin-center">
                      {audience.shortLabel}
                    </th>
                  ))}
                  <th>Styring</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {ACCESS_MODULES.map((module) => (
                  <tr key={module.key}>
                    <td>
                      <div className="access-admin-module-title">{module.label}</div>
                      <div className="access-admin-module-description">{module.description}</div>
                    </td>
                    <td>{module.area}</td>
                    {ACCESS_AUDIENCES.map((audience) => {
                      const enabled = hasAudience(module, audience.key);

                      return (
                        <td key={audience.key} className="access-admin-center">
                          <span
                            className={enabled ? "access-admin-check" : "access-admin-empty"}
                            aria-label={enabled ? "Adgang" : "Ingen adgang"}
                          >
                            {enabled ? "✓" : "—"}
                          </span>
                        </td>
                      );
                    })}
                    <td>
                      <span className="access-admin-pill">
                        {configurabilityLabels[module.configurability]}
                      </span>
                    </td>
                    <td>
                      <div className="access-admin-note">{module.note}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="access-admin-area-grid">
          {modulesByArea.map((group) => (
            <article key={group.area} className="access-admin-card">
              <h2>{group.area}</h2>
              <div className="access-admin-area-list">
                {group.modules.map((module) => (
                  <div key={module.key} className="access-admin-area-item">
                    <div className="access-admin-area-item-top">
                      <div>
                        <h3>{module.label}</h3>
                        <p>{module.description}</p>
                      </div>
                      <span className="access-admin-pill">
                        {configurabilityLabels[module.configurability]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}
