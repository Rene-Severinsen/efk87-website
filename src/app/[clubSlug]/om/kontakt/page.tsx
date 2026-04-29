import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard, ThemedPageHeader } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getPublicInstructorContacts } from "../../../../lib/members/instructorContactService";

interface ContactPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "kontakt";
  const { club, theme, footerData, navigationItems, actionItems } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const instructors = await getPublicInstructorContacts(club.id);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Kontakt"
      currentPath={`/${clubSlug}/om/kontakt`}
    >
      <ThemedPageHeader 
        title="Kontakt" 
        subtitle="Find klubbens instruktører og kontaktpersoner." 
      />

      {instructors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {instructors.map((instructor, index) => (
            <ThemedSectionCard key={index} className="flex flex-col h-full p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                  {instructor.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={instructor.profileImageUrl} 
                      alt={instructor.displayName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">{instructor.displayName}</h3>
                  {instructor.memberRoleType && instructor.memberRoleType !== 'REGULAR' && (
                    <p className="text-sky-400 text-[11px] sm:text-sm font-medium mt-0.5 sm:mt-1 truncate">
                      {instructor.memberRoleType === 'CHAIRMAN' ? 'Formand' :
                       instructor.memberRoleType === 'VICE_CHAIRMAN' ? 'Næstformand' :
                       instructor.memberRoleType === 'BOARD_MEMBER' ? 'Bestyrelsesmedlem' :
                       instructor.memberRoleType === 'TREASURER' ? 'Kasserer' :
                       instructor.memberRoleType === 'BOARD_SUPPLEANT' ? 'Suppleant' :
                       instructor.memberRoleType}
                    </p>
                  )}
                  <p className="text-emerald-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5 sm:mt-1">Instruktør</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mt-auto">
                {instructor.email && (
                  <a 
                    href={`mailto:${instructor.email}`}
                    className="flex items-center gap-2.5 sm:gap-3 text-slate-300 hover:text-white transition-colors group"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm truncate">{instructor.email}</span>
                  </a>
                )}
                {instructor.mobilePhone && (
                  <a 
                    href={`tel:${instructor.mobilePhone}`}
                    className="flex items-center gap-2.5 sm:gap-3 text-slate-300 hover:text-white transition-colors group"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm">{instructor.mobilePhone}</span>
                  </a>
                )}
              </div>
            </ThemedSectionCard>
          ))}
        </div>
      ) : (
        <ThemedSectionCard className="mt-8 text-center py-12">
          <p className="text-slate-400 text-lg italic">
            Der er endnu ikke registreret instruktører til offentlig visning.
          </p>
        </ThemedSectionCard>
      )}
    </ThemedClubPageShell>
  );
}
