import { cn } from "@/lib/utils";
import compact from "./logo/mister-pellets-logo-compact.svg";
import fullInverse from "./logo/mister-pellets-logo-inverse.svg";
import line from "./logo/mister-pellets-logo-ligne.svg";
import mascot from "./logo/mister-pellets-personnage.svg";

type LogoImage = { src: string; width: number; height: number };

/**
 * Logo de Mister Pellets, en famille de formats (planche de marque du
 * 14/11/2026, vectorisée ; originaux, PNG et favicon hors du dépôt, dossier
 * « mister-pellets-logo-2026-11-14 » d'Awlest). Même système que Mister Bois :
 *
 * - variant "compact" : la tête de la mascotte et « Mister Pellets » sur deux
 *   lignes (2,8:1). En-tête ordinateur, 52 px de haut.
 * - variant "ligne" : la tête et le nom sur une ligne (6:1). Bandeau mobile,
 *   36 px de haut : le nom se lit d'un coup d'œil.
 * - variant "complet" : la mascotte en pied et le nom sur deux lignes, mot en
 *   crème, pour le vert du pied de page. Jamais sous 120 px de haut : la
 *   mascotte en pied y devient un timbre, c'est le rôle des deux autres formats.
 *
 * Le contour noir de la mascotte la détache du crème comme du vert : plus de
 * médaillon autour du logo. La hauteur se donne par className (h-9...), la
 * largeur suit. Images importées : adresse à empreinte, mise en cache longue.
 * Chargement différé : l'en-tête est masqué sous 1280 px et le bandeau mobile
 * au-dessus, chaque appareil ne télécharge que le format qu'il affiche. Le
 * lien parent porte le nom (« Mister Pellets, accueil ») : texte alternatif
 * vide par défaut.
 */
const FILES = { compact, ligne: line, complet: fullInverse } as const;

function LogoImg({ file, alt, className }: { file: LogoImage; alt: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={file.src}
      width={file.width}
      height={file.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("h-full w-auto max-w-none", className)}
    />
  );
}

export function Logo({
  className,
  variant = "ligne",
  alt = "",
}: {
  className?: string;
  variant?: keyof typeof FILES;
  alt?: string;
}) {
  return (
    <span className={cn("inline-flex", className)}>
      <LogoImg file={FILES[variant]} alt={alt} />
    </span>
  );
}

/** La mascotte seule, en pied : page introuvable. */
export function Mascot({ className, alt = "" }: { className?: string; alt?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      <LogoImg file={mascot} alt={alt} />
    </span>
  );
}
