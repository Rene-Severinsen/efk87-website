import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedGalleryAlbumBySlug } from "../../../../lib/gallery/galleryService";
import { getServerViewerForClub } from "../../../../lib/auth/viewer";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    albumSlug: string;
  }>;
}

export default async function AlbumDetailPage({ params }: PageProps) {
  const { clubSlug, albumSlug } = await params;
  
  // Reuse the general page resolution to get theme/navigation etc.
  // "galleri" is the parent page, we use it to maintain context.
  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolvePublicPageForClub(clubSlug, "galleri");

  const viewer = await getServerViewerForClub(club.id);
  const album = await getPublishedGalleryAlbumBySlug(club.id, albumSlug, { isMember: viewer.isMember });

  if (!album) {
    notFound();
  }

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
      title={album.title}
      subtitle={album.description || undefined}
      currentPath={`/${clubSlug}/galleri/${albumSlug}`}
    >
      <div className="mb-6 sm:mb-8">
        <Link 
          href={`/${clubSlug}/galleri`}
          className="text-xs sm:text-sm opacity-70 hover:opacity-100 hover:text-[var(--club-accent)] no-underline flex items-center gap-2 mb-4 transition-opacity"
        >
          ← Tilbage til galleri
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {album.images.length > 0 ? (
          album.images.map((image) => (
            <div key={image.id} className="group">
              <ThemedSectionCard className="p-0 overflow-hidden h-full border-[var(--club-line)] hover:border-[var(--club-accent)] transition-colors">
                <div 
                  className="aspect-square bg-cover bg-center cursor-pointer hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: `url(${image.thumbnailUrl || image.imageUrl})` }}
                  title={image.title || ""}
                />
                {(image.title || image.caption) && (
                  <div className="p-2 sm:p-3">
                    {image.title && <h4 className="text-xs sm:text-sm font-semibold truncate">{image.title}</h4>}
                    {image.caption && <p className="text-[10px] sm:text-xs opacity-60 line-clamp-1">{image.caption}</p>}
                  </div>
                )}
              </ThemedSectionCard>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <ThemedSectionCard>
              <p className="text-center py-8 opacity-70">
                Dette album har endnu ingen billeder.
              </p>
            </ThemedSectionCard>
          </div>
        )}
      </div>
    </ThemedClubPageShell>
  );
}
