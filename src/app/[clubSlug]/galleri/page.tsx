import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedGalleryAlbums } from "../../../lib/gallery/galleryService";
import { getServerViewerForClub } from "../../../lib/auth/viewer";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function GalleriPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const pageSlug = "galleri";
  const { club, page, theme, footerData, navigationItems, actionItems } = await resolvePublicPageForClub(clubSlug, pageSlug);

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
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Galleri"
      subtitle="Billeder og albums fra klubbens liv."
      currentPath={`/${clubSlug}/galleri`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.length > 0 ? (
          albums.map((album) => (
            <Link key={album.id} href={`/${clubSlug}/galleri/${album.slug}`} className="no-underline group">
              <ThemedSectionCard className="h-full hover:scale-[1.02] transition-transform duration-200">
                {album.coverImageUrl && (
                  <div 
                    className="w-full h-48 bg-cover bg-center rounded-t-lg -mx-6 -mt-6 mb-6" 
                    style={{ backgroundImage: `url(${album.coverImageUrl})` }}
                  />
                )}
                <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--club-accent)] transition-colors">
                  {album.title}
                </h3>
                {album.description && (
                  <p className="text-sm opacity-80 line-clamp-2 mb-4">
                    {album.description}
                  </p>
                )}
                <div className="mt-auto flex justify-between items-center text-xs opacity-60">
                  <span>{album.imageCount} billeder</span>
                  {album.publishedAt && (
                    <span>{new Date(album.publishedAt).toLocaleDateString('da-DK')}</span>
                  )}
                </div>
              </ThemedSectionCard>
            </Link>
          ))
        ) : (
          <div className="col-span-full">
            <ThemedSectionCard>
              <p className="text-center py-8 opacity-70">
                Der er endnu ingen albums i galleriet.
              </p>
            </ThemedSectionCard>
          </div>
        )}
      </div>
    </ThemedClubPageShell>
  );
}
