import { notFound } from "next/navigation";
import Link from "next/link";
import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getPublishedGalleryAlbumBySlug } from "../../../../lib/gallery/galleryService";
import { getServerViewerForClub } from "../../../../lib/auth/viewer";
import { publicRoutes } from "../../../../lib/publicRoutes";
import GalleryLightbox from "../../../../components/gallery/GalleryLightbox";
import GalleryAddImagesForm from "../../../../components/gallery/GalleryAddImagesForm";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    albumSlug: string;
  }>;
}

export default async function AlbumDetailPage({ params }: PageProps) {
  const { clubSlug, albumSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } =
    await resolvePublicPageForClub(clubSlug, "galleri");

  const viewer = await getServerViewerForClub(club.id);
  const album = await getPublishedGalleryAlbumBySlug(club.id, albumSlug, {
    isMember: viewer.isMember,
  });

  if (!album) {
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
      title={album.title}
      subtitle={album.description || undefined}
      currentPath={publicRoutes.galleryAlbum(clubSlug, albumSlug)}
      maxWidth="1120px"
    >
      <div className="mb-6">
        <Link href={publicRoutes.gallery(clubSlug)} className="public-link">
          ← Tilbage til galleri
        </Link>
      </div>

      <ThemedSectionCard className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--public-text-muted)]">
              {album.imageCount} billeder
              {album.createdByName ? <> · Oprettet af {album.createdByName}</> : null}
            </p>
            {album.visibility === "MEMBERS_ONLY" ? (
              <p className="mt-2 inline-flex rounded-full bg-[var(--public-primary-soft)] px-3 py-1 text-xs font-bold text-[var(--public-primary)]">
                Kun for medlemmer
              </p>
            ) : null}
          </div>

          {album.updatedAt ? (
            <p className="text-sm text-[var(--public-text-muted)]">
              Opdateret {album.updatedAt.toLocaleDateString("da-DK")}
            </p>
          ) : null}
        </div>
      </ThemedSectionCard>

      {album.images.length > 0 ? (
        <GalleryLightbox
          images={album.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            title: image.title,
            caption: image.caption,
          }))}
        />
      ) : (
        <ThemedSectionCard>
          <p className="py-8 text-center text-[var(--public-text-muted)]">
            Dette album har endnu ingen billeder.
          </p>
        </ThemedSectionCard>
      )}

      {viewer.isMember ? (
        <div className="mt-8">
          <GalleryAddImagesForm clubSlug={clubSlug} albumSlug={albumSlug} />
        </div>
      ) : null}
    </ThemedClubPageShell>
  );
}
