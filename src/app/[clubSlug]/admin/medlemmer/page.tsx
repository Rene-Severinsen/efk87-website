import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { 
  getAdminMemberRows 
} from "@/lib/admin/memberAdminService";
import { 
  MEMBER_ADMIN_FILTERS, 
  MemberAdminFilterKey, 
  filterMembersForAdmin, 
  getMemberAdminStats, 
  sortMembersForAdmin 
} from "@/lib/admin/members/memberAdminFilters";
import { MEMBERSHIP_TYPE_LABELS, SCHOOL_STATUS_LABELS, MEMBER_STATUS_LABELS, ROLE_TYPE_LABELS } from "@/lib/members/memberConstants";
import { ClubMemberMembershipType, ClubMemberSchoolStatus, ClubMemberStatus, ClubMemberRoleType } from "@/generated/prisma";
import { AdminPageHeader, AdminPageSection, AdminStatTile, AdminStatTileGrid } from "@/components/admin/AdminPagePrimitives";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    direction?: string;
    filter?: string;
    debugMembers?: string;
  }>;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <AdminPageSection className={`admin-table-card ${className}`}>
    {children}
  </AdminPageSection>
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
    <th className={`admin-sort-header ${className}`}>
      <Link href={href} className="admin-sort-link group">
        {label}
        <span className={`admin-sort-icon ${isActive ? "is-active" : ""}`}>
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
  const { sort = "name", direction = "asc", filter, debugMembers } = await searchParams;
  const isDebug = process.env.NODE_ENV === "development" && debugMembers === "1";

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

  const allMembers = await getAdminMemberRows(club.id);
  const stats = getMemberAdminStats(allMembers);
  const filtered = filterMembersForAdmin(allMembers, filter);
  const members = sortMembersForAdmin(filtered, sort, direction as "asc" | "desc");

  const activeFilterDef = filter && filter in MEMBER_ADMIN_FILTERS 
    ? MEMBER_ADMIN_FILTERS[filter as MemberAdminFilterKey] 
    : null;

  const getRoleLabel = (r: string | null) => {
    if (!r) return "—";
    return ROLE_TYPE_LABELS[r as ClubMemberRoleType] || r;
  };

  const getStatusLabel = (s: string | null) => {
    if (!s) return "—";
    return MEMBER_STATUS_LABELS[s as ClubMemberStatus] || s;
  };

  const getMembershipLabel = (m: string | null) => {
    if (!m) return "—";
    return MEMBERSHIP_TYPE_LABELS[m as ClubMemberMembershipType] || m;
  };

  const getSchoolStatusLabel = (s: string | null) => {
    if (!s) return "—";
    return SCHOOL_STATUS_LABELS[s as ClubMemberSchoolStatus] || s;
  };

  const tiles = [
    { ...MEMBER_ADMIN_FILTERS.active, value: stats.active },
    { ...MEMBER_ADMIN_FILTERS.senior, value: stats.senior },
    { ...MEMBER_ADMIN_FILTERS.junior, value: stats.junior },
    { ...MEMBER_ADMIN_FILTERS.passive, value: stats.passive },
    { ...MEMBER_ADMIN_FILTERS.approved, value: stats.approved },
    { ...MEMBER_ADMIN_FILTERS.notApproved, value: stats.notApproved },
    { ...MEMBER_ADMIN_FILTERS.student, value: stats.student },
    { ...MEMBER_ADMIN_FILTERS.instructor, value: stats.instructors },
    { ...MEMBER_ADMIN_FILTERS.resigned, value: stats.resigned },
  ];

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Medlemmer"
        description="Overblik over klubbens medlemmer, medlemsstatus og certifikater."
        action={{
          label: "Opret medlem",
          href: `/${clubSlug}/admin/medlemmer/ny`,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )
        }}
      />

      <div className="admin-page-content">
        <div className="max-w-[1600px] mx-auto">
          <AdminStatTileGrid columns="nine">
            {tiles.map((tile) => {
              const isActive = filter === tile.key;
              const newFilter = isActive ? undefined : tile.key;
              
              const searchParams = new URLSearchParams();
              if (newFilter) searchParams.set('filter', newFilter);
              if (sort) searchParams.set('sort', sort);
              if (direction) searchParams.set('direction', direction);
              
              const href = `/${clubSlug}/admin/medlemmer${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
              
              return (
                <AdminStatTile
                  key={tile.key}
                  label={tile.label}
                  value={tile.value}
                  href={href}
                  active={isActive}
                  tone={tile.key === "resigned" ? "rose" : tile.key === "instructor" ? "violet" : tile.key === "student" ? "amber" : tile.key === "active" || tile.key === "approved" ? "green" : "blue"}
                />
              );
            })}
          </AdminStatTileGrid>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
            <div className="flex items-center gap-3">
              {filter ? (
                <div className="admin-filter-pill">
                  <span className="admin-meta-label">Filter:</span>
                  <span className="admin-strong text-sm">
                    {activeFilterDef?.label || filter}
                  </span>
                </div>
              ) : (
                <div className="admin-filter-pill">
                  <span className="admin-meta-label">Viser:</span>
                  <span className="admin-strong text-sm">Alle medlemmer</span>
                </div>
              )}
              {filter && (
                <Link
                  href={`/${clubSlug}/admin/medlemmer?sort=${sort}&direction=${direction}`}
                  className="admin-link text-xs flex items-center gap-1.5"
                >
                  Nulstil
                </Link>
              )}
            </div>


          </div>

          {isDebug && (
            <div className="admin-debug-panel">
              <h3 className="admin-kicker mb-2">DEBUG: Member Diagnostics</h3>
              <div className="mb-4">
                <p>Filter: {filter || 'none'}</p>
                <p>Sort: {sort} ({direction})</p>
                <p>Rows: {members.length}</p>
                <details>
                  <summary className="admin-link cursor-pointer">KPI Stats JSON</summary>
                  <pre>{JSON.stringify(stats, null, 2)}</pre>
                </details>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="admin-debug-row">
                    <th className="p-1">Name</th>
                    <th className="p-1">Status (Raw)</th>
                    <th className="p-1">Type (Raw)</th>
                    <th className="p-1">School (Raw)</th>
                    <th className="p-1">Instr</th>
                    <th className="p-1">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const partial = {
                      memberStatus: m.memberStatus as ClubMemberStatus,
                      membershipType: m.membershipType as ClubMemberMembershipType,
                      schoolStatus: m.schoolStatus as ClubMemberSchoolStatus,
                      isInstructor: m.isInstructor
                    };
                    const isActive = partial.memberStatus === ClubMemberStatus.ACTIVE;
                    const isNew = partial.memberStatus === ClubMemberStatus.NEW;
                    const isResigned = partial.memberStatus === ClubMemberStatus.RESIGNED;
                    
                    return (
                      <tr key={m.id} className="admin-debug-row">
                        <td className="p-1">{m.displayName}</td>
                        <td className="p-1">{m.memberStatus}</td>
                        <td className="p-1">{m.membershipType}</td>
                        <td className="p-1">{m.schoolStatus}</td>
                        <td className="p-1">{m.isInstructor ? 'Y' : 'N'}</td>
                        <td className="p-1">
                          {[
                            isActive && "ACT",
                            isNew && "NEW",
                            isResigned && "RES",
                            m.userId ? "HAS_USER" : "NO_USER"
                          ].filter(Boolean).join(", ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <GlassCard>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr className="admin-debug-row">
                    <SortableHeader label="Navn / Info" sortKey="name" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Medlemsnr." sortKey="memberNumber" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="MDK" sortKey="mdkNumber" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Type" sortKey="membershipType" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Klubrolle" sortKey="memberRoleType" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Skole" sortKey="schoolStatus" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Instruktør" sortKey="instructorStatus" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Status" sortKey="memberStatus" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <SortableHeader label="Cert." sortKey="certificateCount" currentSort={sort} currentDirection={direction} clubSlug={clubSlug} currentFilter={filter} />
                    <th className="admin-sort-header text-right">Handling</th>
                  </tr>
                </thead>
                <tbody >
                  {members.map((member) => (
                    <tr key={member.id} className="group">
                      <td className="px-6 py-4">
                        <div className="admin-strong">{member.displayName}</div>
                        <div className="admin-muted text-sm">{member.email || member.mobilePhone || "Intet medlemsinfo"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="admin-strong font-mono text-sm">{member.memberNumber || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="admin-muted font-mono text-xs">{member.mdkNumber || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="admin-strong text-sm font-medium">{getMembershipLabel(member.membershipType)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="admin-muted text-xs">{getRoleLabel(member.memberRoleType)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="admin-strong text-sm font-medium">
                          {getSchoolStatusLabel(member.schoolStatus)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.isInstructor ? (
                          <span className="admin-badge admin-badge-violet">Instruktør</span>
                        ) : (
                          <span className="admin-soft">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`admin-badge ${member.memberStatus === "ACTIVE" ? "admin-badge-success" : member.memberStatus === "NEW" ? "admin-badge-info" : "admin-badge-danger"}`}>
                          {getStatusLabel(member.memberStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`admin-cert-dot ${member.certificateCount > 0 ? "is-active" : ""}`} />
                          <span className="admin-strong font-medium">{member.certificateCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {member.userId ? (
                          <Link 
                            href={`/${clubSlug}/admin/medlemmer/${member.userId}/rediger`}
                            className="admin-btn"
                          >
                            Rediger
                          </Link>
                        ) : (
                          <span className="admin-form-help italic px-4 py-2">—</span>
                        )}
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
