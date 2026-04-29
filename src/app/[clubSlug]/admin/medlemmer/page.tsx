import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import Link from "next/link";
import { getAdminMemberOverview, getAdminMemberStats } from "../../../../lib/admin/memberAdminService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

const StatCard = ({ label, value, color = "var(--admin-text)" }: { label: string, value: number, color?: string }) => (
  <div className="admin-card" style={{ padding: '1.5rem', flex: '1', minWidth: '150px' }}>
    <div style={{ fontSize: '0.875rem', color: 'var(--admin-muted)', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
  </div>
);

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/medlemmer`);

  const members = await getAdminMemberOverview(club.id);
  const stats = await getAdminMemberStats(club.id);

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'REGULAR': return 'Almindelig medlem';
      case 'BOARD_MEMBER': return 'Bestyrelsesmedlem';
      case 'BOARD_SUPPLEANT': return 'Bestyrelsessuppleant';
      case 'TREASURER': return 'Kasserer';
      case 'CHAIRMAN': return 'Formand';
      case 'VICE_CHAIRMAN': return 'Næstformand';
      default: return r;
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'Aktiv';
      case 'RESIGNED': return 'Udmeldt';
      case 'NEW': return 'Ny';
      default: return s;
    }
  };

  const getMembershipLabel = (m: string) => {
    switch (m) {
      case 'SENIOR': return 'Senior';
      case 'JUNIOR': return 'Junior';
      case 'PASSIVE': return 'Passiv';
      default: return m;
    }
  };

  const getSchoolStatusLabel = (s: string) => {
    switch (s) {
      case 'APPROVED': return 'Godkendt';
      case 'STUDENT': return 'Elev';
      case 'NOT_APPROVED': return 'Ikke godkendt';
      default: return s;
    }
  };

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">Medlemmer</h1>
          <p className="admin-description">Overblik over klubbens medlemmer, medlemsstatus og certifikater.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard label="Aktive" value={stats.active} color="#10b981" />
          <StatCard label="Nye" value={stats.new} color="#3b82f6" />
          <StatCard label="Udmeldte" value={stats.resigned} color="#ef4444" />
          <StatCard label="Senior" value={stats.senior} />
          <StatCard label="Junior" value={stats.junior} />
          <StatCard label="Passive" value={stats.passive} />
          <StatCard label="Godkendte" value={stats.approved} color="#10b981" />
          <StatCard label="Elever" value={stats.student} color="#f59e0b" />
          <StatCard label="Ikke godkendte" value={stats.notApproved} color="#ef4444" />
          <StatCard label="Instruktører" value={stats.instructors} color="#8b5cf6" />
        </div>

        <div className="admin-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Email</th>
                  <th>Medlemsnr.</th>
                  <th>MDK nr.</th>
                  <th>Medlemskab</th>
                  <th>Medlemstype</th>
                  <th>Skolestatus</th>
                  <th>Status</th>
                  <th>Instruktør</th>
                  <th>Certifikater</th>
                  <th>Handling</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.userId}>
                    <td style={{ fontWeight: '500' }}>{member.displayName}</td>
                    <td>{member.email}</td>
                    <td>{member.memberNumber || '—'}</td>
                    <td>{member.mdkNumber || '—'}</td>
                    <td>{getMembershipLabel(member.membershipType)}</td>
                    <td>{getRoleLabel(member.memberRoleType)}</td>
                    <td>{getSchoolStatusLabel(member.schoolStatus)}</td>
                    <td>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        backgroundColor: member.memberStatus === 'ACTIVE' ? '#dcfce7' : member.memberStatus === 'NEW' ? '#dbeafe' : '#fee2e2',
                        color: member.memberStatus === 'ACTIVE' ? '#166534' : member.memberStatus === 'NEW' ? '#1e40af' : '#991b1b'
                      }}>
                        {getStatusLabel(member.memberStatus)}
                      </span>
                    </td>
                    <td>{member.isInstructor ? 'Ja' : 'Nej'}</td>
                    <td>{member.certificateCount}</td>
                    <td>
                      <Link 
                        href={`/${clubSlug}/admin/medlemmer/${member.userId}/rediger`}
                        className="admin-action-link"
                        style={{ color: 'var(--admin-accent)', fontWeight: '500' }}
                      >
                        Rediger
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
