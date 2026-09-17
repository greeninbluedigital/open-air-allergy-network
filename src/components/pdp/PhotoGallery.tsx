"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Main photo (narrow left column) + short bio and secondary photo strip
 * (wide right column), PDP-only (Full Profile+, Section 3). Owns the whole
 * two-column block, not just the images, so a click on any photo — main or
 * secondary — opens the same lightbox with prev/next through all of them.
 */
export function PhotoGallery({
  mainPhoto,
  secondaryPhotos,
  shortBio,
  alt,
}: {
  mainPhoto: string | null;
  secondaryPhotos: string[];
  shortBio: string;
  alt: string;
}) {
  const allPhotos = [mainPhoto, ...secondaryPhotos].filter((url): url is string => Boolean(url));
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % allPhotos.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + allPhotos.length) % allPhotos.length));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, allPhotos.length]);

  return (
    <div className="flex flex-col gap-4 px-6 pt-5 sm:px-10 md:flex-row">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded bg-bg-alt md:w-52 md:shrink-0">
        {mainPhoto && (
          <button
            type="button"
            onClick={() => setOpenIndex(0)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label="View full-size photo"
          >
            <Image src={mainPhoto} alt={alt} fill className="object-cover" />
          </button>
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm whitespace-pre-line text-foreground/80">{shortBio}</p>
        {secondaryPhotos.length > 0 && (
          <div className="mt-3.5 flex gap-2.5">
            {secondaryPhotos.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setOpenIndex(i + 1)}
                className="relative aspect-4/3 flex-1 cursor-zoom-in overflow-hidden rounded bg-bg-alt"
                aria-label="View full-size photo"
              >
                <Image src={url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 right-4 text-2xl leading-none text-white"
            aria-label="Close"
          >
            ×
          </button>
          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i - 1 + allPhotos.length) % allPhotos.length));
                }}
                className="absolute left-4 text-3xl text-white"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % allPhotos.length));
                }}
                className="absolute right-4 text-3xl text-white"
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image src={allPhotos[openIndex]} alt={alt} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
