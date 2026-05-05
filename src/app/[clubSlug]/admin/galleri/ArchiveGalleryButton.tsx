"use client";

import { archiveGalleryAdminAction } from "../../../../lib/admin/galleryAdminActions";

interface ArchiveGalleryButtonProps {
  clubSlug: string;
  albumId: string;
  albumTitle: string;
}

export default function ArchiveGalleryButton({
  clubSlug,
  albumId,
  albumTitle,
}: ArchiveGalleryButtonProps) {
  async function archiveGallery() {
    const confirmed = window.confirm(
      `Er du sikker på, at du vil slette/arkivere galleriet "${albumTitle}"?\n\nGalleriet fjernes fra public visning, men data slettes ikke permanent.`,
    );

    if (!confirmed) {
      return;
    }

    await archiveGalleryAdminAction(clubSlug, albumId);
  }

  return (
    <button
      type="button"
      onClick={archiveGallery}
      className="admin-btn admin-btn-danger"
    >
      Slet galleri
    </button>
  );
}
