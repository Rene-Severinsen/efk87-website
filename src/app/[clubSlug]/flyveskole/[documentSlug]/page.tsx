import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedFlightSchoolDocumentBySlug } from "../../../../lib/flightSchool/flightSchoolService";
import PrintButton from "./PrintButton";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    documentSlug: string;
  }>;
}

export default async function FlightSchoolDocumentPage({ params }: PageProps) {
  const { clubSlug, documentSlug } = await params;
  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  const document = await getPublishedFlightSchoolDocumentBySlug(club.id, documentSlug);

  if (!document) {
    notFound();
  }

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={document.title}
      eyebrow="Flyveskole Dokument"
      currentPath={`/${clubSlug}/flyveskole/${documentSlug}`}
    >
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link 
          href={`/${clubSlug}/flyveskole`} 
          className="text-sm opacity-60 hover:opacity-100 hover:text-sky-400 flex items-center gap-1 h-auto min-h-0 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Tilbage til flyveskolen
        </Link>
        <PrintButton />
      </div>

      <ThemedSectionCard className="print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        <div className="prose prose-invert max-w-none print:prose-neutral print:max-w-none">
          {document.excerpt && (
            <p className="text-xl opacity-90 leading-relaxed mb-8 italic border-l-4 border-sky-500 print:border-slate-300 pl-6 py-2">
              {document.excerpt}
            </p>
          )}
          
          <div 
            dangerouslySetInnerHTML={{ __html: document.contentHtml }} 
            className="print:text-black"
          />
        </div>
      </ThemedSectionCard>
      
      <style dangerouslySetInnerHTML={{ __html: `
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
          /* Hide Shell navigation/footer/topbar */
          .efk-neutralized-topbar,
          .themed-footer,
          nav,
          footer,
          .print\\:hidden {
            display: none !important;
          }
          /* Ensure main content takes full width */
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
            color: #666 !important;
          }
          .prose {
             color: black !important;
             max-width: 100% !important;
          }
          .prose h1, .prose h2, .prose h3, .prose h4 {
             color: black !important;
          }
          .prose a {
             color: black !important;
             text-decoration: underline;
          }
          /* Prevent page breaks inside cards or important sections if needed */
          p, h2, h3 {
            orphans: 3;
            widows: 3;
          }
          h2, h3 {
            page-break-after: avoid;
          }
        }
      ` }} />
    </ThemedClubPageShell>
  );
}
