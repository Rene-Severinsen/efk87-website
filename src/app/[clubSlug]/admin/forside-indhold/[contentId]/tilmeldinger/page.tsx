import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPagePrimitives";
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
      <AdminPageHeader
        title="Tilmeldinger"
        description="Se og administrer tilmeldinger til forsideopslaget."
      />

      <div className="pt-6">
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="admin-card" style={{ padding: '20px' }}>
            <div className="admin-muted mb-2 text-sm">Aktive tilmeldinger</div>
            <div className="admin-stat-value">{activeSignups.length}</div>
          </div>
          <div className="admin-card" style={{ padding: '20px' }}>
            <div className="admin-muted mb-2 text-sm">Total antal/kuverter</div>
            <div className="admin-stat-value">{totalQuantity}</div>
          </div>
          <div className="admin-card" style={{ padding: '20px' }}>
            <div className="admin-muted mb-2 text-sm">Aflyste</div>
            <div className="admin-stat-value admin-muted">{signups.length - activeSignups.length}</div>
          </div>
        </div>

        <SignupList signups={signups as (typeof signups)} clubSlug={clubSlug} />
      </div>
    </AdminShell>
  );
}
