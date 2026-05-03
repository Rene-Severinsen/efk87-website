import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedFlightSchoolPage, getPublishedFlightSchoolDocuments } from "../../../lib/flightSchool/flightSchoolService";
import { getPublicInstructorContacts } from "../../../lib/members/instructorContactService";
import Link from "next/link";
import Avatar from "../../../components/shared/Avatar";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function FlyveskolePage({ params }: PageProps) {
  const { clubSlug } = await params;
  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);

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
      publicThemeMode={publicSettings?.publicThemeMode}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <p className="text-xl sm:text-2xl font-medium text-[var(--club-text)] leading-relaxed">
                  {page.intro}
                </p>
              </div>
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
              <h2 className="text-2xl font-bold mb-6 px-1 text-[var(--club-text)]">Instruktører</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instructors.map((instructor, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-5 p-5 rounded-2xl bg-[var(--public-card)] border border-[var(--public-card-border)] hover:bg-[var(--public-nav-hover)] transition-colors"
                  >
                    <Avatar 
                      imageUrl={instructor.profileImageUrl} 
                      name={instructor.displayName} 
                      size="lg"
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate text-[var(--club-text)]">{instructor.displayName}</div>
                      
                      <div className="flex flex-col gap-0.5 mt-1.5 text-sm">
                        {instructor.email && (
                          <div className="flex gap-2 items-baseline whitespace-nowrap">
                            <span className="opacity-50 flex-shrink-0 text-[var(--club-text)]">E-mail:</span>
                            <a href={`mailto:${instructor.email}`} className="text-[var(--club-text)] opacity-90 hover:opacity-100 hover:text-sky-400 transition-colors truncate block">
                              {instructor.email}
                            </a>
                          </div>
                        )}
                        {instructor.mobilePhone && (
                          <div className="flex gap-2 items-baseline whitespace-nowrap">
                            <span className="opacity-50 flex-shrink-0 text-[var(--club-text)]">Telefon:</span>
                            <a href={`tel:${instructor.mobilePhone}`} className="text-[var(--club-text)] opacity-90 hover:opacity-100 hover:text-sky-400 transition-colors truncate block">
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
              <h2 className="text-2xl font-bold mb-6 px-1 text-[var(--club-text)]">Dokumenter og Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {documents.map((doc) => (
                  <Link 
                    key={doc.id}
                    href={`/${clubSlug}/flyveskole/${doc.slug}`}
                    className="group flex flex-col p-6 rounded-2xl bg-[var(--public-card)] border border-[var(--public-card-border)] hover:border-sky-500/50 hover:bg-sky-500/10 transition-all h-auto min-h-0"
                  >
                    <h3 className="text-xl font-bold mb-3 group-hover:text-sky-400 transition-colors leading-tight text-[var(--club-text)]">
                      {doc.title}
                    </h3>
                    {doc.excerpt && (
                      <p className="text-base opacity-60 line-clamp-3 leading-relaxed mb-6 text-[var(--club-text)]">
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
