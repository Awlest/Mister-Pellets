"use client";

import { Menu as MenuIcon } from "lucide-react";

/** Événement écouté par NavbarSticky : ouvre le volet Menu depuis un autre endroit de la page. */
export const OPEN_MENU_EVENT = "mp:open-menu";

// Le volet est téléchargé dès le doigt posé, comme depuis l'onglet de la barre du bas.
const preloadMenuSheet = () => {
  import("./MenuSheet").catch(() => {});
};

/**
 * Entrée « Menu » d'une barre d'action qui remplace la barre du bas (fiche
 * produit sous 1 024 px). Le volet reste celui de NavbarSticky, monté une
 * seule fois dans la page : ce bouton lui demande de s'ouvrir. 44 px de côté
 * au moins, pictogramme et libellé de 12 px.
 */
export function MenuTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Ouvrir le menu"
      aria-haspopup="dialog"
      onPointerDown={preloadMenuSheet}
      onFocus={preloadMenuSheet}
      onClick={() => window.dispatchEvent(new Event(OPEN_MENU_EVENT))}
      className={`flex min-h-11 min-w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold text-mp-ink-soft transition-colors hover:text-mp-green-deep ${className ?? ""}`}
    >
      <MenuIcon className="h-[18px] w-[18px]" aria-hidden />
      Menu
    </button>
  );
}
