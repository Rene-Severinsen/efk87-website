import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { getAdminCalendarEntries } from "../../../../lib/admin/calendarAdminService";
import Link from "next/link";
import { toggleCalendarEntryPublishedAction, deleteCalendarEntryAction } from "../../../../lib/admin/calendarActions";
import DeleteCalendarEntryForm from "../../../../components/admin/calendar/DeleteCalendarEntryForm";
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

export default async function AdminCalendarPage({ params }: PageProps) {
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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/kalender`);
  const entries = await getAdminCalendarEntries(club.id);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Kalender</h1>
              <p className="text-slate-400 text-lg">Administrer klubbens kalenderindslag.</p>
            </div>
            <Link 
              href={`/${clubSlug}/admin/kalender/ny`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all shadow-lg shadow-sky-900/20 gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Opret kalenderindslag
            </Link>
          </div>

          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dato & Tid</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Titel</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Synlighed</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Marquee</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {entries.length > 0 ? entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{formatDate(entry.startsAt)}</div>
                        <div className="text-sm text-slate-500">{formatTime(entry.startsAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-semibold">{entry.title}</div>
                        <div className="text-xs text-slate-500">{entry.location || 'Ingen lokation'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          entry.isPublished 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {entry.isPublished ? 'Publiceret' : 'Kladde'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                          {visibilityLabel(entry.visibility)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {entry.forceShowInMarquee && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            Gennemtvinges
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/${clubSlug}/admin/kalender/${entry.id}/rediger`}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all border border-white/5 hover:border-white/10"
                          >
                            Rediger
                          </Link>
                          <form action={toggleCalendarEntryPublishedAction.bind(null, clubSlug, entry.id, !entry.isPublished)}>
                            <button 
                              type="submit" 
                              className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                                entry.isPublished 
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                            >
                              {entry.isPublished ? 'Afpublicer' : 'Publicer'}
                            </button>
                          </form>
                          <DeleteCalendarEntryForm 
                            clubSlug={clubSlug} 
                            entryId={entry.id} 
                            action={deleteCalendarEntryAction}
                          >
                            <button 
                              type="submit" 
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-sm font-semibold transition-all"
                            >
                              Slet
                            </button>
                          </DeleteCalendarEntryForm>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Ingen kalenderindslag fundet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminShell>
  );
}
