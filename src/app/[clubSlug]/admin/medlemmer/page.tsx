import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { getAdminMemberOverview, getAdminMemberStats } from "@/lib/admin/memberAdminService";
import { MEMBER_ADMIN_FILTERS, MemberAdminFilterKey } from "@/lib/admin/members/memberAdminFilters";
import { MEMBERSHIP_TYPE_LABELS, SCHOOL_STATUS_LABELS, MEMBER_STATUS_LABELS, ROLE_TYPE_LABELS } from "@/lib/members/memberConstants";
import { ClubMemberMembershipType, ClubMemberSchoolStatus, ClubMemberStatus, ClubMemberRoleType } from "@/generated/prisma";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    direction?: string;
    filter?: string;
  }>;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
    {children}
  </div>
);

const StatCard = ({ label, value, colorClass = "text-white", href, isActive }: { label: string, value: number, colorClass?: string, href: string, isActive: boolean }) => (
  <Link href={href} className="flex-1 min-w-[140px] group">
    <GlassCard className={`p-5 h-full transition-all duration-300 hover:bg-white/10 ${isActive ? 'ring-2 ring-sky-500/50 bg-sky-500/20 border-sky-500/30' : 'hover:border-white/20'}`}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1 group-hover:text-slate-300 transition-colors">{label}</div>
      <div className={`text-3xl font-black ${colorClass} tracking-tight`}>{value}</div>
      {isActive && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.8)] animate-pulse" />
        </div>
      )}
    </GlassCard>
  </Link>
);

const SortableHeader = ({ label, sortKey, currentSort, currentDirection, clubSlug, currentFilter, className = "" }: { label: string, sortKey: string, currentSort: string, currentDirection: string, clubSlug: string, currentFilter?: string, className?: string }) => {
  const isActive = currentSort === sortKey;
  const newDirection = isActive && currentDirection === 'asc' ? 'desc' : 'asc';
  
  const searchParams = new URLSearchParams();
  searchParams.set('sort', sortKey);
  searchParams.set('direction', newDirection);
  if (currentFilter) searchParams.set('filter', currentFilter);
  
  const href = `/${clubSlug}/admin/medlemmer?${searchParams.toString()}`;
  
  return (
    <th className={`px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${className}`}>
      <Link href={href} className="inline-flex items-center gap-1.5 hover:text-white transition-colors group">
        {label}
        <span className={`transition-all duration-200 ${isActive ? 'text-sky-500 scale-110' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`}>
          {isActive ? (currentDirection === 'asc' ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          )) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 10l5 5 5-5" /></svg>
          )}
        </span>
      </Link>
    </th>
  );
};

export default async function Page({ params, searchParams }: PageProps) {
  const { clubSlug } = await params;
  const { sort = "name", direction = "asc", filter } = await searchParams;

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

  const members = await getAdminMemberOverview(club.id, { 
    sort, 
    direction: direction as "asc" | "desc", 
    filter 
  });
  const stats = await getAdminMemberStats(club.id);

  const activeFilterDef = filter && filter in MEMBER_ADMIN_FILTERS 
    ? MEMBER_ADMIN_FILTERS[filter as MemberAdminFilterKey] 
    : null;

  const getRoleLabel = (r: string) => {
    return ROLE_TYPE_LABELS[r as ClubMemberRoleType] || r;
  };

  const getStatusLabel = (s: string) => {
    return MEMBER_STATUS_LABELS[s as ClubMemberStatus] || s;
  };

  const getMembershipLabel = (m: string) => {
    return MEMBERSHIP_TYPE_LABELS[m as ClubMemberMembershipType] || m;
  };

  const getSchoolStatusLabel = (s: string) => {
    return SCHOOL_STATUS_LABELS[s as ClubMemberSchoolStatus] || s;
  };

  const tiles = [
    { ...MEMBER_ADMIN_FILTERS.active, value: stats.active },
    { ...MEMBER_ADMIN_FILTERS.senior, value: stats.senior },
    { ...MEMBER_ADMIN_FILTERS.junior, value: stats.junior },
    { ...MEMBER_ADMIN_FILTERS.passive, value: stats.passive },
    { ...MEMBER_ADMIN_FILTERS.approved, value: stats.approved },
    { ...MEMBER_ADMIN_FILTERS.not_approved, value: stats.notApproved },
    { ...MEMBER_ADMIN_FILTERS.student, value: stats.student },
    { ...MEMBER_ADMIN_FILTERS.instructor, value: stats.instructors },
    { ...MEMBER_ADMIN_FILTERS.resigned, value: stats.resigned },
    { ...MEMBER_ADMIN_FILTERS.under_creation, value: stats.new },
  ];

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
            {tiles.map((tile) => {
              const isActive = filter === tile.key;
              const newFilter = isActive ? undefined : tile.key;
              
              const searchParams = new URLSearchParams();
              if (newFilter) searchParams.set('filter', newFilter);
              if (sort) searchParams.set('sort', sort);
              if (direction) searchParams.set('direction', direction);
              
              const href = `/${clubSlug}/admin/medlemmer${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
              
              return (
                <StatCard 
                  key={tile.key}
                  label={tile.label} 
                  value={tile.value} 
                  colorClass={tile.colorClass}
                  isActive={isActive}
                  href={href}
                />
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
            <div className="flex items-center gap-3">
              {filter ? (
                <div className="flex items-center gap-2 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Filter:</span>
                  <span className={`text-sm font-black ${activeFilterDef?.colorClass || 'text-white'}`}>
                    {activeFilterDef?.label || filter}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Viser:</span>
                  <span className="text-sm font-black text-slate-300">Alle medlemmer</span>
                </div>
              )}
              {filter && (
                <Link
                  href={`/${clubSlug}/admin/medlemmer?sort=${sort}&direction=${direction}`}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 underline decoration-slate-700 underline-offset-4 hover:decoration-sky-500"
                >
                  Nulstil
                </Link>
              )}
            </div>


          </div>

          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <SortableHeader label="Navn / Info" sortKey="name" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Medlemsnr." sortKey="memberNumber" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="MDK" sortKey="mdkNumber" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Type" sortKey="membershipType" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Klubrolle" sortKey="memberRoleType" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Skole" sortKey="schoolStatus" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Instruktør" sortKey="instructorStatus" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Status" sortKey="memberStatus" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Cert." sortKey="certificateCount" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
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
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-mono">{member.mdkNumber || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300 text-sm font-medium">{getMembershipLabel(member.membershipType)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500">{getRoleLabel(member.memberRoleType)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${member.schoolStatus === 'APPROVED' ? 'text-emerald-400' : member.schoolStatus === 'STUDENT' ? 'text-amber-400' : 'text-slate-400'}`}>
                          {getSchoolStatusLabel(member.schoolStatus)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.isInstructor ? (
                          <span className="text-[10px] font-bold bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-violet-500/30">Instruktør</span>
                        ) : (
                          <span className="text-slate-600">—</span>
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
