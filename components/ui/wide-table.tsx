"use client";

import { useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Conteneur d'un tableau qui peut dépasser l'écran (articles du blog).
 *
 * Sur téléphone, un tableau de cinq colonnes défilait bien, mais rien ne le
 * disait : la dernière colonne était coupée net au bord (recette du
 * 11/11/2026). Quand le contenu dépasse, une ligne de texte l'annonce
 * au-dessus du tableau, et le conteneur devient atteignable au clavier
 * (flèches gauche et droite). Ni dégradé ni ombre : DESIGN.md.
 *
 * Mesuré dans le navigateur : la mention n'apparaît que si le tableau
 * dépasse vraiment, jamais sur ordinateur ni pour un tableau étroit.
 */
export function WideTable({
  label,
  className,
  children,
}: {
  /** Nom du tableau pour les lecteurs d'écran (« Tableau : … »). */
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    // L'observateur appelle une première fois dès l'observation, puis à
    // chaque changement de largeur (rotation, polices chargées).
    const observer = new ResizeObserver(() => setOverflows(box.scrollWidth > box.clientWidth + 1));
    observer.observe(box);
    if (box.firstElementChild) observer.observe(box.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {overflows && (
        <p className="mb-2 flex items-center gap-2 text-xs text-mp-ink-soft">
          <MoveHorizontal className="h-4 w-4 shrink-0" aria-hidden />
          Tableau plus large que l&apos;écran : faites-le glisser.
        </p>
      )}
      <div
        ref={ref}
        className={cn("overflow-x-auto", className)}
        {...(overflows ? { tabIndex: 0, role: "region", "aria-label": label } : {})}
      >
        {children}
      </div>
    </>
  );
}
