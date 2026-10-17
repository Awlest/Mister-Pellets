"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      // Voile en aplat sombre, sans flou (DESIGN.md, « Interdits »).
      "fixed inset-0 z-50 bg-mp-ink/40 data-[state=open]:animate-[fade-in_var(--mp-duration-enter)_var(--mp-ease-out)] data-[state=closed]:animate-[fade-out_var(--mp-duration-exit)_var(--mp-ease-out)_forwards]",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const sheetVariants = cva(
  // Ouverture en --mp-duration-enter, fermeture plus courte (--mp-duration-exit).
  "fixed z-50 gap-4 bg-mp-cream shadow-lg",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=open]:animate-[slide-in-from-top_var(--mp-duration-enter)_var(--mp-ease-out)] data-[state=closed]:animate-[slide-out-to-top_var(--mp-duration-exit)_var(--mp-ease-out)_forwards]",
        bottom: "inset-x-0 bottom-0 border-t data-[state=open]:animate-[slide-in-from-bottom_var(--mp-duration-enter)_var(--mp-ease-out)] data-[state=closed]:animate-[slide-out-to-bottom_var(--mp-duration-exit)_var(--mp-ease-out)_forwards]",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=open]:animate-[slide-in-from-left_var(--mp-duration-enter)_var(--mp-ease-out)] data-[state=closed]:animate-[slide-out-to-left_var(--mp-duration-exit)_var(--mp-ease-out)_forwards] sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=open]:animate-[slide-in-from-right_var(--mp-duration-enter)_var(--mp-ease-out)] data-[state=closed]:animate-[slide-out-to-right_var(--mp-duration-exit)_var(--mp-ease-out)_forwards] sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /**
   * Retire la croix intégrée quand le contenu pose la sienne : le menu mobile
   * affichait deux croix l'une sous l'autre (spec mobile V1 : une seule croix,
   * en haut à droite, 44 × 44 px).
   */
  hideClose?: boolean;
  /** Titre annoncé par les lecteurs d'écran à l'ouverture (masqué à l'écran). */
  title?: string;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, hideClose = false, title = "Menu", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Title className="sr-only">{title}</SheetPrimitive.Title>
      {children}
      {!hideClose && (
        <SheetPrimitive.Close className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-mp-ink transition-colors hover:bg-mp-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-ink disabled:pointer-events-none">
          <X className="h-5 w-5" aria-hidden />
          <span className="sr-only">Fermer</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent };
