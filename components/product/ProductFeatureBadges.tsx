import { useId, type ComponentType, type SVGProps } from "react";
import { AirVent, Droplet, ShieldCheck } from "lucide-react";
import type { Combustible, ProductType } from "@/lib/products-demo";
import { cn } from "@/lib/utils";

/**
 * Pastilles rondes de la carte produit : le combustible d'abord (pellets, bois
 * ou hybride, une seule par fiche), puis ce qui change le projet de chauffage
 * (hydro, canalisable, insert, étanche). Tout vient des champs déjà saisis dans
 * l'admin Payload (collections/Products.ts), rien de neuf à encoder. La légende
 * de la boutique (ProductFeatureLegend) lit la même liste FEATURES, donc les
 * deux ne peuvent pas diverger.
 *
 * Pas de pastille WiFi : 76 fiches sur 84 sont connectées (relevé du
 * 23/09/2026), l'information ne distingue rien et chargerait chaque carte.
 */

/** Sous-ensemble des champs produit qui pilotent les pastilles. */
export interface ProductFeatureFlags {
  type?: ProductType;
  combustible?: Combustible;
  /** Raccordé au chauffage central (case « Hydro » de l'admin). */
  isHydro?: boolean;
  /** Case « Canalisable » de l'admin : des inserts le sont sans porter le type. */
  isCanalizable?: boolean;
  /** Case « Étanche (BBC compatible) » de l'admin. */
  isAirtight?: boolean;
}

type IconProps = SVGProps<SVGSVGElement>;

/** Base des pictogrammes maison, calée sur le trait des icônes lucide. */
function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Trois granulés. */
function PelletsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="2.5" y="8" width="5" height="12" rx="2.5" />
      <rect x="9.5" y="4" width="5" height="14" rx="2.5" />
      <rect x="16.5" y="7" width="5" height="12" rx="2.5" />
    </IconBase>
  );
}

/** Trois bûches vues en bout. */
function LogsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="7.5" r="4.5" />
      <circle cx="7" cy="16" r="4.5" />
      <circle cx="17" cy="16" r="4.5" />
      <path d="M12 7.5h.01M7 16h.01M17 16h.01" />
    </IconBase>
  );
}

/** Une bûche et deux granulés : bois + pellets. */
function HybridIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="7" cy="13.5" r="4.5" />
      <path d="M7 13.5h.01" />
      <rect x="13.5" y="5" width="4" height="13" rx="2" />
      <rect x="18.5" y="8" width="4" height="12" rx="2" />
    </IconBase>
  );
}

/** Foyer encastré : un cadre et la flamme lucide réduite de moitié. */
function InsertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="2.5" y="3.5" width="19" height="17" rx="2" />
      <g transform="translate(6 6) scale(0.5)">
        <path
          strokeWidth={4}
          d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
        />
      </g>
    </IconBase>
  );
}

export interface ProductFeatureBadge {
  key: ProductFeatureKey;
  /** Libellé lu par les lecteurs d'écran, affiché en info-bulle et dans la légende. */
  label: string;
  Icon: ComponentType<IconProps>;
}

/** Les sept pastilles possibles, dans l'ordre d'affichage (carte et légende). */
const FEATURES = [
  { key: "pellets", label: "Pellets", Icon: PelletsIcon },
  { key: "bois", label: "Bois (bûches)", Icon: LogsIcon },
  { key: "hybride", label: "Hybride bois + pellets", Icon: HybridIcon },
  { key: "hydro", label: "Hydro (chauffage central)", Icon: Droplet },
  { key: "canalisable", label: "Canalisable", Icon: AirVent },
  { key: "insert", label: "Insert encastrable", Icon: InsertIcon },
  { key: "etanche", label: "Étanche (BBC)", Icon: ShieldCheck },
] as const satisfies readonly { key: string; label: string; Icon: ComponentType<IconProps> }[];

export type ProductFeatureKey = (typeof FEATURES)[number]["key"];

/** Liste complète pour la légende de la boutique. */
export const PRODUCT_FEATURE_LEGEND: readonly ProductFeatureBadge[] = FEATURES;

const FEATURE_BY_KEY = Object.fromEntries(FEATURES.map((f) => [f.key, f])) as Record<
  ProductFeatureKey,
  ProductFeatureBadge
>;

const HYDRO_TYPES: ReadonlySet<ProductType> = new Set(["hydro", "hybride-hydro"]);
const HYBRID_TYPES: ReadonlySet<ProductType> = new Set(["hybride", "hybride-hydro"]);

/**
 * Pastilles d'une fiche, dans l'ordre d'affichage. Le combustible vient du
 * champ `combustible` (source du filtre boutique) ; le type sert de filet quand
 * les deux divergent, par exemple un insert Girolami encodé « hybride ».
 */
export function productFeatureBadges(p: ProductFeatureFlags): ProductFeatureBadge[] {
  const keys: ProductFeatureKey[] = [];
  const hasData = p.combustible !== undefined || p.type !== undefined;
  const hybrid = p.combustible === "hybride" || (p.type !== undefined && HYBRID_TYPES.has(p.type));

  if (hybrid) keys.push("hybride");
  else if (p.combustible === "bois") keys.push("bois");
  else if (hasData) keys.push("pellets");

  if (p.isHydro || (p.type !== undefined && HYDRO_TYPES.has(p.type))) keys.push("hydro");
  if (p.isCanalizable || p.type === "canalisable") keys.push("canalisable");
  if (p.type === "insert") keys.push("insert");
  if (p.isAirtight) keys.push("etanche");

  return keys.map((key) => FEATURE_BY_KEY[key]);
}

interface ProductFeatureIconProps {
  Icon: ComponentType<IconProps>;
  /** 32 px sur la photo, 28 px dans la légende. */
  size?: "md" | "sm";
}

/**
 * Le rond orange qui porte l'icône, commun à la carte et à la légende. Icône en
 * vert profond sur orange flamme : 4,3:1, au-dessus du 3:1 demandé aux
 * pictogrammes (WCAG 1.4.11) ; le blanc n'atteindrait que 2,5:1.
 */
export function ProductFeatureIcon({ Icon, size = "md" }: ProductFeatureIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-mp-orange-flame text-mp-green-deep shadow-sm ring-1 ring-white/70",
        size === "sm" ? "h-7 w-7" : "h-8 w-8"
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

interface ProductFeatureBadgesProps extends ProductFeatureFlags {
  className?: string;
}

/**
 * Colonne de pastilles rondes posée en haut à droite de la photo, en face des
 * étiquettes « Best-seller » / « Nouveau ». Icône seule à l'écran, libellé en
 * info-bulle au survol et dans le texte masqué pour les lecteurs d'écran.
 */
export function ProductFeatureBadges({ className, ...flags }: ProductFeatureBadgesProps) {
  const badges = productFeatureBadges(flags);
  if (badges.length === 0) return null;

  return (
    <ul aria-label="Caractéristiques" className={cn("flex flex-col items-end gap-1.5", className)}>
      {badges.map(({ key, label, Icon }) => (
        <li key={key} title={label}>
          <ProductFeatureIcon Icon={Icon} />
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Légende des pastilles, affichée juste avant la grille de la boutique. Même
 * liste et mêmes ronds que sur les photos, pour que le visiteur retrouve
 * chaque icône d'un regard.
 */
export function ProductFeatureLegend({ className }: { className?: string }) {
  const titleId = useId();

  return (
    <div className={cn("rounded-2xl border border-mp-sand/40 bg-mp-beige/60 px-4 py-4 text-center", className)}>
      <p id={titleId} className="mb-3 text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
        Légende des pastilles
      </p>
      <ul aria-labelledby={titleId} className="flex flex-wrap justify-center gap-x-5 gap-y-2.5">
        {PRODUCT_FEATURE_LEGEND.map(({ key, label, Icon }) => (
          <li key={key} className="flex items-center gap-2 text-sm text-mp-ink">
            <ProductFeatureIcon Icon={Icon} size="sm" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
