import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedFlightSchoolPage, getPublishedFlightSchoolDocuments } from "../../../lib/flightSchool/flightSchoolService";
import { getPublicInstructorContacts } from "../../../lib/members/instructorContactService";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function FlyveskolePage({ params }: PageProps) {
  const { clubSlug } = await params;
  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  const [page, documents, instructors] = await Promise.all([
    getPublishedFlightSchoolPage(club.id),
    getPublishedFlightSchoolDocuments(club.id),
    getPublicInstructorContacts(club.id),
  ]);

  const title = page?.title || "Flyveskole";

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={title}
      eyebrow="Uddannelse"
      currentPath={`/${clubSlug}/flyveskole`}
    >
      {!page ? (
        <ThemedSectionCard>
          <div className="py-12 text-center">
            <h2 className="text-xl font-medium mb-2">Flyveskolen er snart klar</h2>
            <p className="opacity-70">Der er endnu ikke udgivet information om flyveskolen for {club.name}.</p>
          </div>
        </ThemedSectionCard>
      ) : (
        <div className="space-y-12">
          {page.intro && (
            <ThemedSectionCard className="border-l-4 border-l-sky-400/50">
              <p className="text-xl sm:text-2xl font-medium text-sky-100/90 leading-relaxed">
                {page.intro}
              </p>
            </ThemedSectionCard>
          )}

          <ThemedSectionCard>
            <div 
              className="article-detail-prose"
              dangerouslySetInnerHTML={{ __html: page.contentHtml }} 
            />
          </ThemedSectionCard>

          {instructors.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 px-1 text-white">Instruktører</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instructors.map((instructor, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/10 mt-1">
                      {instructor.profileImageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={instructor.profileImageUrl} 
                          alt={instructor.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold opacity-30">
                          {instructor.displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate text-white mb-1">{instructor.displayName}</div>
                      
                      <div className="flex flex-col gap-1.5 mt-3 text-sm">
                        {instructor.email && (
                          <div className="flex gap-2 items-baseline">
                            <span className="opacity-50 flex-shrink-0 w-[55px]">E-mail:</span>
                            <a href={`mailto:${instructor.email}`} className="opacity-90 hover:opacity-100 hover:text-sky-400 transition-colors truncate block h-auto min-h-0">
                              {instructor.email}
                            </a>
                          </div>
                        )}
                        {instructor.mobilePhone && (
                          <div className="flex gap-2 items-baseline">
                            <span className="opacity-50 flex-shrink-0 w-[55px]">Telefon:</span>
                            <a href={`tel:${instructor.mobilePhone}`} className="opacity-90 hover:opacity-100 hover:text-sky-400 transition-colors block h-auto min-h-0">
                              {instructor.mobilePhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {documents.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 px-1 text-white">Dokumenter og Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {documents.map((doc) => (
                  <Link 
                    key={doc.id}
                    href={`/${clubSlug}/flyveskole/${doc.slug}`}
                    className="group flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 transition-all h-auto min-h-0"
                  >
                    <h3 className="text-xl font-bold mb-3 group-hover:text-sky-400 transition-colors leading-tight text-white">
                      {doc.title}
                    </h3>
                    {doc.excerpt && (
                      <p className="text-base opacity-60 line-clamp-3 leading-relaxed mb-6">
                        {doc.excerpt}
                      </p>
                    )}
                    <div className="mt-auto text-sm font-semibold text-sky-400 flex items-center gap-2 uppercase tracking-wider">
                      Læs dokument 
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </ThemedClubPageShell>
  );
}
