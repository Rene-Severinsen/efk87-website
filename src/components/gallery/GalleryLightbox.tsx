"use client";

import { useEffect, useState } from "react";

interface GalleryLightboxImage {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
}

interface GalleryLightboxProps {
  images: GalleryLightboxImage[];
}

export default function GalleryLightbox({ images }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeImage = activeIndex === null ? null : images[activeIndex];

  function open(index: number) {
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
  }

  function previous() {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? images.length - 1 : current - 1;
    });
  }

  function next() {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === images.length - 1 ? 0 : current + 1;
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (activeIndex === null) return;

      if (event.key === "Escape") {
        close();
      }

      if (event.key === "ArrowLeft") {
        previous();
      }

      if (event.key === "ArrowRight") {
        next();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => open(index)}
            className="group overflow-hidden rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-card)] text-left shadow-[var(--public-card-shadow)] transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="aspect-square overflow-hidden bg-[var(--public-surface)]">
              <img
                src={image.imageUrl}
                alt={image.title || image.caption || "Galleribillede"}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            {(image.title || image.caption) ? (
              <div className="p-3">
                {image.title ? (
                  <h4 className="truncate text-sm font-semibold text-[var(--public-text)]">
                    {image.title}
                  </h4>
                ) : null}

                {image.caption ? (
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--public-text-muted)]">
                    {image.caption}
                  </p>
                ) : null}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {activeImage && activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div
            className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-3">
              <div className="min-w-0 text-white">
                <p className="truncate text-sm font-bold">
                  {activeImage.title || activeImage.caption || "Galleribillede"}
                </p>
                <p className="text-xs text-white/60">
                  {activeIndex + 1} / {images.length}
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Luk
              </button>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.title || activeImage.caption || "Galleribillede"}
                className="max-h-[82vh] w-full object-contain"
              />

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={previous}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-xl font-bold text-white transition hover:bg-black/80"
                    aria-label="Forrige billede"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-xl font-bold text-white transition hover:bg-black/80"
                    aria-label="Næste billede"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
