import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import {
  getPublishedFlightSchoolPage,
  getPublishedFlightSchoolDocuments,
} from "../../../lib/flightSchool/flightSchoolService";
import { getPublicInstructorContacts } from "../../../lib/members/instructorContactService";
import Link from "next/link";
import Avatar from "../../../components/shared/Avatar";
import { publicRoutes } from "../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function FlyveskolePage({ params }: PageProps) {
  const { clubSlug } = await params;

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolveClubContext(clubSlug);

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
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
          theme={theme}
          publicThemeMode={publicSettings?.publicThemeMode}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title={title}
          eyebrow="Uddannelse"
          currentPath={publicRoutes.flightSchool(clubSlug)}
      >
        {!page ? (
            <ThemedSectionCard className="p-6 sm:p-8">
              <div className="py-12 text-center">
                <h2 className="mb-2 text-xl font-bold text-[var(--public-text)]">
                  Flyveskolen er snart klar
                </h2>
                <p className="text-[var(--public-text-muted)]">
                  Der er endnu ikke udgivet information om flyveskolen for{" "}
                  {club.name}.
                </p>
              </div>
            </ThemedSectionCard>
        ) : (
            <div className="space-y-10">
              {page.intro && (
                  <ThemedSectionCard className="p-5 sm:p-6">
                    <p className="max-w-4xl text-base font-medium leading-relaxed text-[var(--public-text)] sm:text-lg">
                      {page.intro}
                    </p>
                  </ThemedSectionCard>
              )}

              <ThemedSectionCard className="p-5 sm:p-7">
                <div
                    className="article-detail-prose"
                    dangerouslySetInnerHTML={{ __html: page.contentHtml }}
                />
              </ThemedSectionCard>

              {instructors.length > 0 && (
                  <section>
                    <h2 className="mb-5 px-1 text-2xl font-bold tracking-tight text-[var(--public-text)]">
                      Instruktører
                    </h2>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {instructors.map((instructor) => (
                          <div
                              key={instructor.id ?? instructor.displayName}
                              className="flight-school-contact-card flex items-start gap-5 rounded-3xl p-5 transition hover:border-[var(--public-primary)]"
                          >
                            <Avatar
                                imageUrl={instructor.profileImageUrl}
                                name={instructor.displayName}
                                size="lg"
                                className="flight-school-contact-avatar mt-1"
                            />

                            <div className="flight-school-contact-details">
                              <div className="flight-school-contact-name truncate text-base">
                                {instructor.displayName}
                              </div>

                              <div className="flight-school-contact-lines">
                                {instructor.email && (
                                    <div className="flight-school-contact-row">
                                      <span className="flight-school-contact-label">E-mail:</span>
                                      <a
                                          href={`mailto:${instructor.email}`}
                                          className="flight-school-contact-link truncate"
                                      >
                                        {instructor.email}
                                      </a>
                                    </div>
                                )}

                                {instructor.mobilePhone && (
                                    <div className="flight-school-contact-row">
                                      <span className="flight-school-contact-label">Telefon:</span>
                                      <a
                                          href={`tel:${instructor.mobilePhone}`}
                                          className="flight-school-contact-link truncate"
                                      >
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
                    <h2 className="mb-5 px-1 text-2xl font-bold tracking-tight text-[var(--public-text)]">
                      Dokumenter og information
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {documents.map((doc) => (
                          <Link
                              key={doc.id}
                              href={publicRoutes.flightSchoolDocument(clubSlug, doc.slug)}
                              className="group flex min-h-[170px] flex-col rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-6 shadow-[var(--public-shadow)] transition hover:border-[var(--public-primary)] hover:bg-[var(--public-surface)]"
                          >
                            <h3 className="mb-3 text-lg font-bold leading-tight text-[var(--public-text)] transition-colors group-hover:text-[var(--public-primary)]">
                              {doc.title}
                            </h3>

                            {doc.excerpt && (
                                <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-[var(--public-text-muted)]">
                                  {doc.excerpt}
                                </p>
                            )}

                            <div className="mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--public-primary)]">
                              Læs dokument
                              <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="transition-transform group-hover:translate-x-1"
                              >
                                <path d="M5 12h14M12 5l7 7-7 7" />
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