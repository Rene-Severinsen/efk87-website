import { notFound } from "next/navigation";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedPageHeader } from "../../../components/publicSite/ThemedBuildingBlocks";
import MemberApplicationForm from "./MemberApplicationForm";
import { publicRoutes } from "../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function BlivMedlemPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const pageSlug = "bliv-medlem";
  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolvePublicPageForClub(clubSlug, pageSlug);

  if (!club) {
    notFound();
  }

   // const proseText = "Udfyld formularen herunder, hvis du ønsker at blive medlem af EFK87. Når vi har modtaget din ansøgning, gennemgår vi oplysningerne og kontakter dig med næste skridt. Har du spørgsmål, er du altid velkommen til at kontakte klubben.";
  const proseText = (
      <>
        <b>Velkommen til EFK87</b>
          <br />
          <br />
          Udfyld formularen herunder, hvis du ønsker at blive medlem af klubben.
        <br />
        Før du kan blive medlem af EFK87, skal du først have oprettet medlemskab hos{" "}
        <a
            href="https://modelflyvningdanmark.dk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-300 underline underline-offset-4 decoration-2 hover:text-sky-100 transition-colors"
        >
          Modelflyvning Danmark
        </a>
        <br />
            Her får du dit MDK medlemsnummer, som skal bruges i formularen, hvis du søger Senior- eller Juniormedlemskab.

        <br />
        Når formularen er udfyldt, sender vi dig en mail med en faktura. Når fakturaen er betalt, gennemføres indmeldelsen automatisk, og du modtager en velkomstmail med yderligere information om klubben.
      </>
  );

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
      title="Bliv medlem"
      currentPath={publicRoutes.becomeMember(clubSlug)}
    >
      <div className="max-w-3xl mx-auto">

        <ThemedPageHeader
           subtitle={proseText}
        />

        <MemberApplicationForm clubSlug={clubSlug} />
      </div>
    </ThemedClubPageShell>
  );
}
