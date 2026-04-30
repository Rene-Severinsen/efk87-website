import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
import { getHomepageContentById, getSignupsForContent } from "../../../../../../lib/homepageContent/homepageContentService";
import SignupList from "./SignupList";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    contentId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug, contentId } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/forside-indhold/${contentId}/tilmeldinger`);
  
  const content = await getHomepageContentById(contentId, club.id);
  if (!content) {
    notFound();
  }

  const signups = await getSignupsForContent(contentId, club.id);

  // Calculate stats
  const activeSignups = signups.filter(s => !s.cancelledAt);
  const totalQuantity = activeSignups.reduce((sum, s) => sum + s.quantity, 0);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link href={`/${clubSlug}/admin/forside-indhold`} style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={16} />
              Tilbage
            </Link>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Tilmeldinger</h1>
          <p style={{ color: 'rgba(238, 245, 255, 0.6)', marginTop: '4px' }}>Deltagerliste for &quot;{content.title}&quot;</p>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>Aktive tilmeldinger</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{activeSignups.length}</div>
        </div>
        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>Total antal/kuverter</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{totalQuantity}</div>
        </div>
        <div className="admin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>Aflyste</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--admin-text-muted)' }}>{signups.length - activeSignups.length}</div>
        </div>
      </div>

      <SignupList signups={signups as (typeof signups)} clubSlug={clubSlug} />
    </AdminShell>
  );
}
