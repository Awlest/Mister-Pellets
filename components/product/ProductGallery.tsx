"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt?: string;
}

interface ProductGalleryProps {
  /** Image principale du produit (mainImage Payload). Optionnelle. */
  mainImage?: GalleryImage;
  /** Galerie additionnelle (galleryImages Payload). Jusqu'à 8 entrées. */
  galleryImages?: GalleryImage[];
  /** Nom du produit, pour l'alt par défaut quand l'image n'a pas de alt. */
  productName: string;
}

/**
 * Galerie interactive d'un produit :
 * - Affiche l'image actuellement sélectionnée en grand
 * - Affiche les vignettes cliquables (4 par ligne)
 * - Au clic sur une vignette, l'image principale change
 * - Clic sur l'image principale ouvre un lightbox plein écran
 * - Le thumbnail actif a un ring orange visible
 * - Esc ferme le lightbox
 *
 * Toutes les images viennent de Payload (mainImage + galleryImages).
 * Si aucune image n'est dispo, on affiche un placeholder Flame.
 */
export function ProductGallery({
  mainImage,
  galleryImages = [],
  productName,
}: ProductGalleryProps) {
  // Construit la liste complète : mainImage en premier, puis la galerie.
  const allImages: GalleryImage[] = [
    ...(mainImage ? [mainImage] : []),
    ...galleryImages,
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Esc ferme le lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % allImages.length);
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length);
      }
    }
    window.addEventListener("keydown", handleKey);
    // Bloque le scroll body quand lightbox ouvert
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, allImages.length]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  // Pas d'images → placeholder
  if (allImages.length === 0) {
    return (
      <div>
        <div className="relative aspect-square rounded-3xl bg-mp-beige-warm border border-mp-sand/40 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-10">
              <Flame className="h-16 w-16 mx-auto text-mp-orange-flame mb-4" />
              <p className="text-mp-ink-soft text-sm">
                Photo en cours de préparation
                <br />
                (image disponible sur demande de devis)
              </p>
            </div>
          </div>
        </div>
        {/* Cases vides pour la cohérence visuelle */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-mp-beige border border-mp-sand/40"
            />
          ))}
        </div>
      </div>
    );
  }

  // allImages.length >= 1 ici (early return ci-dessus). On clamp l'index
  // pour rester safe vis-à-vis de noUncheckedIndexedAccess.
  const active = allImages[activeIndex] ?? allImages[0];
  if (!active) return null;

  return (
    <>
      <div>
        {/* Image principale — clic pour ouvrir le lightbox */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square w-full rounded-3xl bg-mp-beige-warm border border-mp-sand/40 overflow-hidden cursor-zoom-in group focus:outline-none focus:ring-2 focus:ring-mp-orange-flame focus:ring-offset-2"
          aria-label="Agrandir la photo"
        >
          <Image
            src={active.url}
            alt={active.alt || productName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {/* Indicateur loupe en haut à droite, visible au hover */}
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-mp-ink/80 px-2.5 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Agrandir
          </span>
        </button>

        {/* Vignettes cliquables — 4 par ligne, max 8 (donc 2 lignes possibles) */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {allImages.slice(0, 8).map((img, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative aspect-square rounded-xl bg-mp-beige border overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-mp-orange-flame focus:ring-offset-1",
                  isActive
                    ? "border-mp-orange-flame ring-2 ring-mp-orange-flame"
                    : "border-mp-sand/40 hover:border-mp-orange-flame/60"
                )}
                aria-label={`Voir la photo ${i + 1}`}
                aria-pressed={isActive}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} — vue ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 25vw, 12vw"
                  className="object-cover"
                />
              </button>
            );
          })}
          {/* Cases vides pour la cohérence visuelle si moins de 4 images */}
          {Array.from({ length: Math.max(0, 4 - allImages.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square rounded-xl bg-mp-beige border border-mp-sand/40"
            />
          ))}
        </div>
      </div>

      {/* Lightbox plein écran */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
        >
          {/* Bouton close */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer la photo agrandie"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Flèches navigation si plusieurs images */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i - 1 + allImages.length) % allImages.length);
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Photo précédente"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((i) => (i + 1) % allImages.length);
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Photo suivante"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Image agrandie — bloque la propagation du clic pour ne pas
              fermer en cliquant dessus */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl w-full aspect-square md:aspect-[4/3]"
          >
            <Image
              src={active.url}
              alt={active.alt || productName}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-contain"
              priority
            />
          </div>

          {/* Compteur en bas */}
          {allImages.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-sm text-white">
              {activeIndex + 1} / {allImages.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
