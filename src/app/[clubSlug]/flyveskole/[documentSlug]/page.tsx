import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedFlightSchoolDocumentBySlug } from "../../../../lib/flightSchool/flightSchoolService";
import PrintButton from "./PrintButton";
import Link from "next/link";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    documentSlug: string;
  }>;
}

export default async function FlightSchoolDocumentPage({ params }: PageProps) {
  const { clubSlug, documentSlug } = await params;

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolveClubContext(clubSlug);

  const document = await getPublishedFlightSchoolDocumentBySlug(
      club.id,
      documentSlug
  );

  if (!document) {
    notFound();
  }

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
          title={document.title}
          eyebrow="Flyveskole dokument"
          currentPath={publicRoutes.flightSchoolDocument(clubSlug, documentSlug)}
      >
        <div className="mb-6 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <Link
              href={publicRoutes.flightSchool(clubSlug)}
              className="flight-school-action-button"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Tilbage til flyveskolen
          </Link>

          <PrintButton />
        </div>

        <div className="space-y-8">
          {document.excerpt && (
              <ThemedSectionCard className="p-5 print:m-0 print:border-none print:p-0 print:shadow-none">
                <p className="text-base font-medium leading-relaxed text-[var(--public-text)] sm:text-lg print:text-lg print:text-black">
                  {document.excerpt}
                </p>
              </ThemedSectionCard>
          )}

          <ThemedSectionCard className="p-5 sm:p-8 print:m-0 print:border-none print:bg-white print:p-0 print:text-black print:shadow-none">
            <div
                className="article-detail-prose"
                dangerouslySetInnerHTML={{ __html: document.contentHtml }}
            />
          </ThemedSectionCard>
        </div>

        <style
            dangerouslySetInnerHTML={{
              __html: `
        @media print {
          @page {
            margin: 2cm;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .public-home {
            background: white !important;
            color: black !important;
          }

          .shell {
            padding: 0 !important;
          }

          .efk-neutralized-topbar,
          .themed-footer,
          nav,
          footer,
          .print\\:hidden {
            display: none !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }

          .card {
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            color: black !important;
          }

          .themed-page-header {
            margin-bottom: 1cm !important;
          }

          .themed-page-header h1 {
            color: black !important;
            font-size: 24pt !important;
          }

          .themed-page-header .eyebrow {
            color: #666 !important; /* THEME_EXCEPTION: Print-only hardcoded color for better legibility on paper */
          }

          .article-detail-prose {
            color: black !important;
            max-width: 100% !important;
          }

          .article-detail-prose h1,
          .article-detail-prose h2,
          .article-detail-prose h3,
          .article-detail-prose h4 {
            color: black !important;
          }

          .article-detail-prose a {
            color: black !important;
            text-decoration: underline;
          }

          p,
          h2,
          h3 {
            orphans: 3;
            widows: 3;
          }

          h2,
          h3 {
            page-break-after: avoid;
          }
        }
      `,
            }}
        />
      </ThemedClubPageShell>
  );
}