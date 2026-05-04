import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../../../lib/auth/accessGuards";
import { getForumCategoryBySlug } from "../../../../../lib/forum/forumService";
import ThreadForm from "../../../../../components/forum/ThreadForm";
import { createForumThread } from "../../../../../lib/forum/actions/memberForumActions";
import { publicRoutes } from "../../../../../lib/publicRoutes";

interface CreateThreadPageProps {
  params: Promise<{
    clubSlug: string;
    categorySlug: string;
  }>;
}

export default async function CreateThreadPage({ params }: CreateThreadPageProps) {
  const { clubSlug, categorySlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);

  // Ensure user is an active member
  const currentPath = publicRoutes.home(clubSlug) + `/forum/${categorySlug}/ny`;
  await requireActiveMemberForClub(club.id, club.slug, currentPath);

  const category = await getForumCategoryBySlug(club.id, categorySlug);

  if (!category) {
    notFound();
  }

  const createAction = createForumThread.bind(null, clubSlug, categorySlug);

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
      title="Opret ny tråd"
      subtitle={`I kategorien ${category.title}`}
      eyebrow="Forum"
      currentPath={currentPath}
    >
      <ThreadForm 
        clubSlug={clubSlug} 
        categorySlug={categorySlug} 
        categoryTitle={category.title}
        action={createAction}
      />
    </ThemedClubPageShell>
  );
}
