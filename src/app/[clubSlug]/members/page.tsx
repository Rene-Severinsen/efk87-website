import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../lib/publicRoutes";
import { getMemberDirectoryForClub } from "../../../lib/members/memberProfileService";
import MembersDirectory from "./MembersDirectory";

interface MembersPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "members";

  const {
    club,
    page,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const members = await getMemberDirectoryForClub(club.id);

  const introText =
      page?.body && page.body !== "Member access foundation will be added later."
          ? page.body
          : "";

  return (
      <ThemedClubPageShell
          clubSlug={clubSlug}
          clubName={club.name}
          clubDisplayName={publicSettings?.displayName || club.name}
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
          theme={theme}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title="Medlemmer"
          subtitle="Her finder du klubbens medlemmer og deres kontaktoplysninger."
          currentPath={publicRoutes.members(clubSlug)}
      >
        <div className="mt-6 space-y-8">
          {introText ? (
              <section>
                <ThemedSectionCard className="p-5 sm:p-6">
                  <p className="max-w-4xl text-sm font-normal leading-relaxed text-[var(--public-text)] sm:text-base">
                    {introText}
                  </p>
                </ThemedSectionCard>
              </section>
          ) : null}

          <MembersDirectory members={members} />
        </div>
      </ThemedClubPageShell>
  );
}