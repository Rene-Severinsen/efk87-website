"use client";

import { useState } from "react";
import Link from "next/link";
import { HomepageGalleryPreviewDTO } from "../../../lib/gallery/galleryService";
import { publicRoutes } from "../../../lib/publicRoutes";

interface HomeGalleryToggleProps {
  clubSlug: string;
  galleryPreview: HomepageGalleryPreviewDTO;
}

export default function HomeGalleryToggle({
  clubSlug,
  galleryPreview,
}: HomeGalleryToggleProps) {
  const [mode, setMode] = useState<"images" | "albums">("images");

  const hasImages = galleryPreview.latestImages.length > 0;
  const hasAlbums = galleryPreview.latestAlbums.length > 0;

  return (
    <article className="home-v2-card home-v2-section-card">
      <div className="home-v2-section-head">
        <h2>{mode === "images" ? "Seneste billeder" : "Seneste gallerier"}</h2>
        <Link className="home-v2-link-soft" href={publicRoutes.gallery(clubSlug)}>
          Åbn galleri
        </Link>
      </div>

      <div className="home-v2-gallery-toggle">
        <button
          type="button"
          className={mode === "images" ? "home-v2-gallery-toggle-active" : ""}
          onClick={() => setMode("images")}
        >
          Seneste billeder
        </button>
        <button
          type="button"
          className={mode === "albums" ? "home-v2-gallery-toggle-active" : ""}
          onClick={() => setMode("albums")}
        >
          Seneste gallerier
        </button>
      </div>

      {mode === "images" ? (
        hasImages ? (
          <div className="home-v2-gallery-grid">
            {galleryPreview.latestImages.map((image) => (
              <Link
                key={image.id}
                href={publicRoutes.galleryAlbum(clubSlug, image.albumSlug)}
                className="home-v2-gallery-item"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title || image.caption || image.albumTitle}
                  className="home-v2-gallery-image-img"
                />
                <div className="home-v2-gallery-label">
                  {image.title || image.albumTitle}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="home-v2-compact-empty">Ingen billeder endnu</div>
        )
      ) : hasAlbums ? (
        <div className="home-v2-gallery-grid">
          {galleryPreview.latestAlbums.map((album) => (
            <Link
              key={album.id}
              href={publicRoutes.galleryAlbum(clubSlug, album.slug)}
              className="home-v2-gallery-item"
            >
              {album.coverImageUrl ? (
                <img
                  src={album.coverImageUrl}
                  alt={album.title}
                  className="home-v2-gallery-image-img"
                />
              ) : (
                <div className="home-v2-gallery-image home-v2-gallery-image-empty" />
              )}
              <div className="home-v2-gallery-label">
                {album.title} · {album.imageCount} billeder
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="home-v2-compact-empty">Ingen gallerier endnu</div>
      )}
    </article>
  );
}
