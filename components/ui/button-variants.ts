import { cva } from "class-variance-authority";

/**
 * Classes des boutons, à part de button.tsx : la page d'erreur, chargée sur
 * chaque page au cas où, s'en sert sans embarquer tailwind-merge ni Slot.
 * Règle qui en découle : aucune classe ne doit en contredire une autre (la
 * taille de texte vit dans `size`, pas dans la base), pour que la chaîne
 * produite soit juste même sans passer par cn().
 */
export const buttonVariants = cva(
  // Hotfix V1.3 §P5 : suppression de whitespace-nowrap (causait débordements
  // sur mobile avec libellés longs) + ajout max-w-full + text-center pour
  // que les boutons multi-mots se replient proprement sans dépasser la
  // viewport sur 375 px.
  "inline-flex items-center justify-center gap-2 max-w-full font-semibold text-center transition-[color,background-color,border-color,scale] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-ink focus-visible:ring-offset-2 focus-visible:ring-offset-mp-cream disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // CTA principal, orange flame, le bouton "conversion". À plat : le
        // survol change la couleur, sans ombre ni lévitation (DESIGN.md).
        primary:
          "bg-mp-orange-flame text-mp-green-darkest hover:bg-mp-orange-warm",
        // CTA secondaire, outline vert deep
        outline:
          "bg-transparent text-mp-green-deep border-2 border-mp-green-deep hover:bg-mp-green-deep hover:text-white",
        // Tertiaire, vert plein
        secondary:
          "bg-mp-green-deep text-white hover:bg-mp-green-mid",
        // Ghost, discret
        ghost:
          "bg-transparent text-mp-ink hover:bg-mp-beige-warm",
        // Lien
        link:
          "bg-transparent text-mp-green-deep underline-offset-4 hover:underline hover:text-mp-orange-flame",
        // Destructif (peu utilisé)
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-full",
        default: "h-11 px-6 text-sm rounded-full",
        lg: "h-14 px-7 text-base rounded-full",
        icon: "h-10 w-10 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);
