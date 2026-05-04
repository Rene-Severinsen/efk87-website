import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedGalleryAlbums } from "../../../lib/gallery/galleryService";
import { getServerViewerForClub } from "../../../lib/auth/viewer";
import { publicRoutes } from "../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function GalleriPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const pageSlug = "galleri";
  const { club, page, theme, footerData, navigationItems, actionItems, publicSettings } =
    await resolvePublicPageForClub(clubSlug, pageSlug);

  if (!page) {
    notFound();
  }

  const viewer = await getServerViewerForClub(club.id);
  const albums = await getPublishedGalleryAlbums(club.id, { isMember: viewer.isMember });

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
      title="Galleri"
      subtitle="Billeder og albums fra klubbens liv."
      currentPath={publicRoutes.gallery(clubSlug)}
      maxWidth="1120px"
    >
      {viewer.isMember ? (
        <div className="mb-6 flex justify-end">
          <Link href={publicRoutes.galleryNew(clubSlug)} className="public-primary-button">
            Opret galleri
          </Link>
        </div>
      ) : null}

      {albums.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={publicRoutes.galleryAlbum(clubSlug, album.slug)}
              className="group no-underline"
            >
              <ThemedSectionCard className="flex h-full overflow-hidden p-0 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="flex h-full w-full flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--public-surface)]">
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--public-text-muted)]">
                        Ingen billeder endnu
                      </div>
                    )}

                    {album.visibility === "MEMBERS_ONLY" ? (
                      <div className="absolute right-3 top-3 rounded-full bg-[var(--public-card)] px-3 py-1 text-xs font-bold text-[var(--public-primary)] shadow">
                        Kun medlemmer
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-xl font-bold leading-tight text-[var(--public-text)]">
                      {album.title}
                    </h2>

                    {album.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--public-text-muted)]">
                        {album.description}
                      </p>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between pt-5 text-xs font-medium text-[var(--public-text-muted)]">
                      <span>{album.imageCount} billeder</span>
                      <span>{album.updatedAt.toLocaleDateString("da-DK")}</span>
                    </div>
                  </div>
                </div>
              </ThemedSectionCard>
            </Link>
          ))}
        </div>
      ) : (
        <ThemedSectionCard>
          <p className="py-8 text-center text-[var(--public-text-muted)]">
            Der er endnu ingen albums i galleriet.
          </p>
        </ThemedSectionCard>
      )}
    </ThemedClubPageShell>
  );
}
