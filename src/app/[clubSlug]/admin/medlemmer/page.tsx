import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { getAdminMemberOverview, getAdminMemberStats } from "@/lib/admin/memberAdminService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
    {children}
  </div>
);

const StatCard = ({ label, value, colorClass = "text-white" }: { label: string, value: number, colorClass?: string }) => (
  <GlassCard className="p-5 flex-1 min-w-[140px]">
    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
  </GlassCard>
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
      case 'REGULAR': return 'Almindelig';
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
      <div className="min-h-screen bg-[#0b1220] -m-6 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Medlemmer</h1>
              <p className="text-slate-400 text-lg">Overblik over klubbens medlemmer, medlemsstatus og certifikater.</p>
            </div>
            <Link 
              href={`/${clubSlug}/admin/medlemmer/ny`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-lg shadow-sky-900/20 gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Opret medlem
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4 mb-8">
            <StatCard label="Aktive" value={stats.active} colorClass="text-emerald-400" />
            <StatCard label="Nye" value={stats.new} colorClass="text-sky-400" />
            <StatCard label="Udmeldte" value={stats.resigned} colorClass="text-rose-400" />
            <StatCard label="Senior" value={stats.senior} />
            <StatCard label="Junior" value={stats.junior} />
            <StatCard label="Passive" value={stats.passive} />
            <StatCard label="Godkendte" value={stats.approved} colorClass="text-emerald-400" />
            <StatCard label="Elever" value={stats.student} colorClass="text-amber-400" />
            <StatCard label="Ikke godk." value={stats.notApproved} colorClass="text-rose-400" />
            <StatCard label="Instruktør" value={stats.instructors} colorClass="text-violet-400" />
          </div>

          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Navn / Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Medlemsnr. / MDK</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type / Rolle</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Skole / Instruktør</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cert.</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map((member) => (
                    <tr key={member.userId} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{member.displayName}</div>
                        <div className="text-sm text-slate-500">{member.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 font-mono text-sm">{member.memberNumber || '—'}</div>
                        <div className="text-xs text-slate-500 font-mono">{member.mdkNumber ? `MDK: ${member.mdkNumber}` : 'Ingen MDK'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 text-sm font-medium">{getMembershipLabel(member.membershipType)}</div>
                        <div className="text-xs text-slate-500">{getRoleLabel(member.memberRoleType)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${member.schoolStatus === 'APPROVED' ? 'text-emerald-400' : member.schoolStatus === 'STUDENT' ? 'text-amber-400' : 'text-slate-400'}`}>
                          {getSchoolStatusLabel(member.schoolStatus)}
                        </div>
                        {member.isInstructor && (
                          <div className="mt-1">
                            <span className="text-[10px] font-bold bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-violet-500/30">Instruktør</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          member.memberStatus === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : member.memberStatus === 'NEW' 
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {getStatusLabel(member.memberStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${member.certificateCount > 0 ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-slate-700'}`} />
                          <span className="text-slate-300 font-medium">{member.certificateCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/${clubSlug}/admin/medlemmer/${member.userId}/rediger`}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all border border-white/5 hover:border-white/10"
                        >
                          Rediger
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminShell>
  );
}
