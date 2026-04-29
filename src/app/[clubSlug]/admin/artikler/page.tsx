import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { getAdminArticleOverview } from "../../../../lib/admin/articleAdminService";
import Link from "next/link";

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
      <div className="admin-page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Artikler</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>Administrer klubbens nyheder og historier.</p>
        </div>
        <Link href={`/${clubSlug}/admin/artikler/ny`} className="admin-btn admin-btn-primary">
          Opret artikel
        </Link>
      </div>

      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px' }}>Publicerede</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{kpis.published}</div>
        </div>
        <div className="admin-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px' }}>Kladder</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{kpis.drafts}</div>
        </div>
        <div className="admin-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px' }}>Fremhævet</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{kpis.featured}</div>
        </div>
        <div className="admin-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '8px' }}>Arkiverede</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{kpis.archived}</div>
        </div>
      </div>

      <div className="admin-card" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Titel</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Synlighed</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Kategori</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Publiceret</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Opdateret</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Handling</th>
            </tr>
          </thead>
          <tbody>
            {articles.length > 0 ? articles.map((article) => (
              <tr key={article.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: '500' }}>{article.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>{article.slug}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    background: article.status === 'PUBLISHED' ? '#e6f7ff' : article.status === 'DRAFT' ? '#fff7e6' : '#f5f5f5',
                    color: article.status === 'PUBLISHED' ? '#1890ff' : article.status === 'DRAFT' ? '#fa8c16' : '#8c8c8c'
                  }}>
                    {article.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{article.visibility}</td>
                <td style={{ padding: '12px 16px' }}>{article.category?.name || '-'}</td>
                <td style={{ padding: '12px 16px' }}>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('da-DK') : '-'}</td>
                <td style={{ padding: '12px 16px' }}>{new Date(article.updatedAt).toLocaleDateString('da-DK')}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <Link href={`/${clubSlug}/admin/artikler/${article.id}/rediger`} style={{ color: '#1890ff', fontSize: '0.875rem' }}>
                    Rediger
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                  Ingen artikler fundet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
