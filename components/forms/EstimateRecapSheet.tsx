"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";

/**
 * Volet du détail chiffré, mobile et tablette (EstimateConfigurator). Module à
 * part, téléchargé au premier appui sur le total : la fenêtre Radix qu'il
 * embarque ne pèse pas sur le chargement du configurateur. Le récapitulatif
 * lui-même arrive en `children`, il sert aussi à la colonne desktop.
 */
export default function EstimateRecapSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        hideClose
        title="Détail de votre estimation"
        className="max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t-0 px-5 lg:hidden"
        style={{ paddingTop: "1.25rem", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
            Votre estimation
          </p>
          <SheetClose
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-mp-ink transition-colors hover:bg-mp-beige"
            aria-label="Fermer le détail"
          >
            <X className="h-5 w-5" aria-hidden />
          </SheetClose>
        </div>
        {children}
      </SheetContent>
    </Sheet>
  );
}
