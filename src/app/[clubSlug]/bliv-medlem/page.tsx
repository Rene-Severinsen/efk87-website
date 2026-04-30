import { notFound } from "next/navigation";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedPageHeader } from "../../../components/publicSite/ThemedBuildingBlocks";
import MemberApplicationForm from "./MemberApplicationForm";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function BlivMedlemPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const pageSlug = "bliv-medlem";
  const { club, theme, footerData, navigationItems, actionItems } = await resolvePublicPageForClub(clubSlug, pageSlug);

  if (!club) {
    notFound();
  }

  const proseText = "Udfyld formularen herunder, hvis du ønsker at blive medlem af EFK87. Når vi har modtaget din ansøgning, gennemgår vi oplysningerne og kontakter dig med næste skridt. Har du spørgsmål, er du altid velkommen til at kontakte klubben.";

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Bliv medlem"
      currentPath={`/${clubSlug}/bliv-medlem`}
    >
      <div className="max-w-3xl mx-auto">
        <ThemedPageHeader 
          title={`Bliv medlem af ${club.settings?.shortName || club.name}`}
          subtitle={proseText}
        />
        
        <MemberApplicationForm clubSlug={clubSlug} />
      </div>
    </ThemedClubPageShell>
  );
}
