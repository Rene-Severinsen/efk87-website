import { notFound, redirect } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { getServerViewerForClub } from "../../../../lib/auth/viewer";
import { publicRoutes } from "../../../../lib/publicRoutes";
import NewGalleryForm from "./NewGalleryForm";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function NewGalleryPage({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await getServerViewerForClub(club.id);

  if (!viewer.isMember) {
    redirect(publicRoutes.login(clubSlug));
  }

  const {
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, "galleri");

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={publicSettings?.displayName || club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Opret galleri"
      subtitle="Del billeder fra klubben, flyvning og arrangementer."
      currentPath={publicRoutes.gallery(clubSlug)}
      maxWidth="960px"
    >
      <NewGalleryForm clubSlug={clubSlug} />
    </ThemedClubPageShell>
  );
}
