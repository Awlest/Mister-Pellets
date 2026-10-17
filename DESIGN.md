---
name: Mister Pellets
description: Installateur et boutique de poêles à pellets en Wallonie. Crème, vert forêt et orange braise, à plat, sans effet.
colors:
  cream: "#F4EDE1"
  beige: "#F0E8DA"
  beige-warm: "#EAE0CB"
  sand: "#C8B68F"
  white: "#FFFFFF"
  ink: "#14241B"
  ink-soft: "#4A5A50"
  green-darkest: "#102916"
  green-deep: "#174724"
  green-mid: "#377038"
  green-light: "#508943"
  orange-flame: "#F28A20"
  orange-warm: "#FDB842"
  orange-light: "#FFE4D1"
  orange-ink: "#A05508"
  orange-display: "#C2680A"
  bark: "#2A1F15"
typography:
  display:
    fontFamily: "Fraunces, Fraunces Fallback, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, Fraunces Fallback, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Fraunces, Fraunces Fallback, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter Tight, Inter Tight Fallback, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"ss01\", \"cv11\""
  label:
    fontFamily: "Inter Tight, Inter Tight Fallback, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  2xl: "16px"
  lg: "20px"
  3xl: "24px"
  xl: "28px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-md: "24px"
  shell: "1280px"
  measure: "720px"
  band: "56px"
  band-md: "80px"
  band-sm: "40px"
  band-sm-md: "56px"
components:
  button-primary:
    backgroundColor: "{colors.orange-flame}"
    textColor: "{colors.green-darkest}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.orange-warm}"
  button-secondary:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 24px"
  button-secondary-hover:
    backgroundColor: "{colors.green-mid}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.green-deep}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 24px"
  button-outline-hover:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.white}"
  card:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge:
    backgroundColor: "{colors.beige-warm}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-eyebrow:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  bottom-nav:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    height: "64px"
  footer:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.cream}"
---

# Design System: Mister Pellets

Source de vérité du rendu du site mister-pellets.be, tirée du code au 17/10/2026
(`app/globals.css`, `components/ui/*`, `components/sections/*`). Toute nouvelle
page ou section suit ce fichier. La voix et les textes relèvent de
`docs/charte-editoriale.md`, pas d'ici. Le brief d'origine des jetons est
`docs/mister-pellets-brief-fullcode.md` §2 ; en cas d'écart, le code et ce
fichier font foi.

## Overview

**Creative North Star : « L'atelier du poêlier »**

Un installateur wallon qui montre son travail sans esbroufe. Les pages sont
posées sur un papier crème, les titres en Fraunces donnent la voix d'un artisan
qui écrit bien, le vert forêt porte l'autorité (titres, liens, pied de page) et
l'orange braise ne sert qu'à ce qui doit être cliqué ou repéré : le bouton qui
chiffre, les pastilles, la progression. Tout est à plat. La profondeur vient de
l'alternance des fonds (crème, beige, vert) et des filets sable, pas d'ombres
ni d'effets.

Le site est pensé d'abord pour le téléphone. Sur mobile, pas d'en-tête : la
navigation vit dans la barre flottante du bas. Le mouvement est rare et court : il confirme un geste, il ne
décore jamais.

**Key Characteristics:**
- Fond crème dominant (60 %), vert profond en structure (30 %), orange en accent (10 %), écorce sous 1 %.
- Titres Fraunces 600 serrés, texte Inter Tight ; un mot d'accent en italique orange par grand titre au plus.
- Blocs à plat : filet sable, aucune ombre posée dans la page, aucun dégradé, aucun halo, aucun flou.
- Photo et texte côte à côte ou empilés, jamais l'un sur l'autre.
- Une courbe de mouvement, trois durées, opacité et transform seulement.

## Colors

Une palette chaude et terrienne : beiges papier, vert forêt, orange de braise.
Les valeurs vivent dans `app/globals.css` (`:root`, préfixe `--mp-`) et sont
exposées en classes Tailwind (`bg-mp-cream`, `text-mp-green-deep`, etc.).
**Aucune couleur en dur dans un composant** : seulement ces jetons.

### Primary
- **Vert forêt** (green-deep) : titres h1 à h6, liens par défaut, bouton secondaire, sections de rupture (`tone="green"`), pied de page.
- **Vert nuit** (green-darkest) : texte posé sur l'orange (boutons, pastilles), survol foncé des blocs verts.

### Secondary
- **Orange braise** (orange-flame) : APLATS uniquement. Bouton principal, pastilles caractéristiques, chips actives, barre de progression, pouce du curseur, icônes, bordure de survol des cartes. Jamais en texte sur fond clair (2,1:1).
- **Orange chaud** (orange-warm) : survol du bouton principal ; texte et icônes d'accent sur fond vert (6,2:1) ; anneau de focus sur fond vert.
- **Orange encre** (orange-ink) : tout PETIT texte orange sur fond clair (marque au-dessus d'un nom, liens « Lire », étiquettes, astérisques) et anneau de focus du site.
- **Orange titre** (orange-display) : mots d'accent des grands titres (`.mp-italic`, 24 px et plus), seuil AA du grand texte.
- **Pêche** (orange-light) : fonds d'icônes, état choisi léger (`/40`), sélection de texte.

### Tertiary
- **Vert feuille** (green-mid) : badge « Nouveau », survol du bouton vert, mention « bien dimensionné ».
- **Vert tendre** (green-light) : fonds de confirmation (`/15`) et leur filet (`/40`).

### Neutral
- **Crème** (cream) : fond de page et des cartes (`--background`). #F4EDE1 depuis le 17/10/2026, le même lin que Mister Bois : l'ancien #FAF7F0 paraissait blanc.
- **Beige** (beige) : section sur deux, encadrés de texte.
- **Beige chaud** (beige-warm) : pastilles neutres (puissance, volume), fond des photos en attente, survol des menus.
- **Sable** (sand) : filets et bordures (`/40` sur les cartes, `/50` à `/60` sur les barres et menus), pastilles inactives.
- **Blanc** (white) : surfaces de formulaire (configurateur, devis, champs).
- **Encre** (ink) : texte courant.
- **Encre douce** (ink-soft) : texte secondaire, légendes, onglets inactifs.
- **Écorce** (bark) : réserve, moins de 1 % (nuancier seulement aujourd'hui).
- **Erreurs** : la palette rouge de Tailwind (`text-red-700`, `bg-red-50`, `border-red-200`), seule exception aux jetons `--mp-`, toujours avec un texte qui dit le problème.

### Paires de contraste validées (WCAG 2.2)
| Texte / fond | Ratio | Usage permis |
|---|---|---|
| ink / cream | 13,9:1 | texte courant |
| ink-soft / cream | 6,3:1 | texte secondaire |
| ink-soft / beige-warm | 5,6:1 | texte dans une pastille neutre |
| green-deep / cream | 9,2:1 | titres, liens |
| green-deep / beige-warm | 8,2:1 | titres sur fond beige chaud |
| orange-ink / cream | 4,8:1 | petit texte orange |
| orange-ink / beige | 4,5:1 | petit texte orange |
| orange-ink / white | 5,5:1 | petit texte orange |
| orange-display / cream | 3,4:1 | grand texte seulement (24 px et plus) |
| green-darkest / orange-flame | 6,2:1 | texte sur bouton ou pastille orange |
| green-deep / orange-flame | 4,3:1 | pictogramme sur pastille orange (seuil 3:1) |
| cream / green-deep | 9,2:1 | texte sur fond vert |
| orange-warm / green-deep | 6,2:1 | accent sur fond vert |
| white / green-mid | 5,9:1 | badge « Nouveau » |
| orange-flame / cream | 2,1:1 | INTERDIT pour du texte |

### Named Rules
**La règle de la braise.** L'orange flamme est un aplat, jamais un texte sur fond clair. Pour du texte orange : orange-ink (petit) ou orange-display (grand titre).

**La règle 60/30/10.** Crème en fond, vert en structure, orange en accent. Si l'orange dépasse un dixième de l'écran, c'est qu'il décore.

## Typography

**Display Font :** Fraunces (repli Georgia), fichiers locaux `app/fonts/` via `next/font/local`.
**Body Font :** Inter Tight (repli Arial recalé), fichiers locaux.

**Character :** un sérif à l'ancienne, serré et sûr de lui, pour la parole de l'artisan ; un sans-sérif net et compact pour les faits, les prix et les formulaires. Les polices ne changent pas.

### Hierarchy
- **Display** (600, 30 px en mobile, 48 px dès 768, 72 px dès 1024 ; interligne 1,05 ; approche -0,02 em) : h1 de l'accueil et des héros. `text-wrap: pretty`.
- **Headline** (600, 30 px puis 48 px dès 768 : `text-3xl md:text-5xl` ; interligne 1,1) : h2 de section, centré. `text-wrap: balance`.
- **Title** (600, 20 à 24 px ; interligne 1,2) : h3 de carte, titres d'étape.
- **Body** (400, 16 px, jamais moins sur mobile ; interligne 1,625 `leading-relaxed`) : paragraphes, colonne de 720 px max (`.mp-measure`). Chapô en 18 à 20 px (`text-lg md:text-xl`), encre douce.
- **Label** (600, 12 px, capitales, `tracking-wider`) : marque au-dessus d'un nom, en-têtes de filtres, pastille d'accroche.
- **Prix** : Fraunces 600, `tabular-nums`, toujours le TVAC en premier.

### Named Rules
**La règle du mot braise.** Un grand titre porte au plus un groupe de mots en `.mp-italic` (italique, orange-display, graisse 500). Jamais dans un texte courant.

**La règle des 12 px.** Rien sous 12 px, sauf les libellés de la barre du bas (10 px, choix du client).

Tailles hors échelle déjà en place, à ne pas reproduire ailleurs : 10 px (barre du bas), 13 et 15 px (annonce du bonus de saison), 28 px (titre du héros `compact` en mobile). Les polices de repli « Fraunces Fallback » et « Inter Tight Fallback » (globals.css) sont Times New Roman et Arial recalés sur les métriques des polices du site, pour éviter tout saut à leur arrivée.

## Layout

Mobile d'abord, grille Tailwind par défaut : `sm` 640, `md` 768, `lg` 1024, `xl` 1280 px.

- **Gouttière unique** : `.mp-shell` sur chaque section (largeur 100 %, max 1 280 px, marges 16 px puis 24 px dès 768). Jamais de `max-w-*` concurrent sur un `.mp-shell`.
- **Colonne de lecture** : `.mp-measure` (720 px) À L'INTÉRIEUR d'un `.mp-shell`. Titres et chapôs courts centrés ; texte long aligné à gauche dans la colonne centrée.
- **Rythme vertical** : deux valeurs seulement. `.mp-band` (56 px puis 80 px) pour une section, `.mp-band-sm` (40 px puis 56 px) pour un bandeau utilitaire.
- **Alternance des fonds** : prop `tone` (`cream`, `beige`, `green`) de `lib/section-tone.ts`. Deux sections consécutives n'ont jamais le même fond.
- **Grilles** : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (ou `lg:grid-cols-4`). `min-w-0` sur toute colonne de grille ou de flex qui contient du texte long, un champ ou un défilement horizontal (et sur un `<fieldset>`).
- **Navigation** : sous 1 280 px, pas d'en-tête ; barre flottante du bas (`NavbarSticky`, 5 onglets). À partir de 1 280 px, en-tête collant (`Header`), barre du bas masquée.
- **Réserve de place** : la barre du bas occupe `--mp-bottomnav-h` ; le pied de page la réserve (`.footer-mp`). Une barre d'action collante se cale à `--mp-bottomnav-offset` du bas. Une ancre sous l'en-tête desktop prend `scroll-mt-16` (ou plus).
- **Aucun défilement horizontal** à 320 et 375 px : `overflow-x: clip` sur `html, body` (pas `hidden`, qui casse `sticky`). Un tableau large défile dans son propre conteneur (`-mx-4 md:mx-0 overflow-x-auto`).
- **Cibles tactiles** : 44 px minimum (`min-h-11`), 8 px entre deux cibles.

## Elevation & Depth

À plat par défaut. La profondeur vient des fonds alternés et des filets sable. Deux niveaux d'ombre seulement, teintés encre, toujours décalés vers le bas, jamais colorés.

### Shadow Vocabulary
- **Surface de travail** (`shadow-md` : `0 8px 24px rgba(20, 36, 27, 0.10)`) : carte du configurateur, formulaire de devis, récapitulatif, barre flottante du bas.
- **Couche flottante** (`shadow-lg` : `0 16px 48px rgba(20, 36, 27, 0.16)`) : menus déroulants de l'en-tête, volets, bandeau cookies.
- **Voile** : `bg-mp-ink/40` sous un volet, `bg-black/90` sous la visionneuse photo. Aplat, sans flou.

### Named Rules
**La règle du filet.** Une carte posée dans la page n'a pas d'ombre : un filet `border-mp-sand/40` suffit. Son survol change la couleur de la bordure (`hover:border-mp-orange-flame`), jamais sa hauteur ni son ombre.

**La règle du fond plein.** En-tête, barre du bas, barre d'action, volets, bandeau cookies : fond opaque (`bg-mp-cream`), jamais translucide ni flouté.

## Shapes

Des coins francs mais doux, et des pilules pour tout ce qui se clique.

- **Pilules** (`rounded-full`) : boutons, badges, chips de filtre, barre du bas, pastilles.
- **Cartes** (`rounded-[20px]`, jeton `lg`) : `Card`, cartes produit.
- **Grandes surfaces** (`rounded-3xl`, 24 px) : formulaires, galerie photo, encadrés de prix.
- **Cartes d'option et champs** (`rounded-xl`) : ATTENTION, `rounded-xl` vaut 28 px sur ce site (jeton du thème), plus que `rounded-2xl` (16 px). Utiliser `rounded-2xl` pour un encadré moyen.
- **Vignettes** (`rounded-lg` 20 px, ou `rounded-xl` sur les vignettes de galerie).
- Bordures : 1 px en filet, 2 px pour un état choisi ou un bouton contour.

## Components

Réutiliser ces composants pour toute nouvelle page. En créer un nouveau seulement si aucun ne convient, avec les mêmes jetons.

### Composants partagés (obligatoires)
| Besoin | Composant | Fichier |
|---|---|---|
| Gabarit (en-tête, barre du bas, pied de page, bandeau cookies) | automatique | `app/(frontend)/layout.tsx` |
| Héros d'une page interne, avec fil d'Ariane | `HeroSecondary` (`compact` pour un outil) | `components/sections/HeroSecondary.tsx` |
| Fil d'Ariane hors héros | `Breadcrumb` | `components/seo/Breadcrumb.tsx` |
| Bouton | `Button` (`primary`, `outline`, `secondary`, `ghost`, `link`) | `components/ui/button.tsx` (classes : `button-variants.ts`) |
| Carte | `Card`, `CardHeader`, `CardTitle`, `CardContent` | `components/ui/card.tsx` |
| Badge, accroche | `Badge` (`default`, `primary`, `secondary`, `outline`, `success`, `eyebrow`) | `components/ui/badge.tsx` |
| Carte produit et pastilles | `ProductCard`, `ProductFeatureBadges`, `ProductFeatureLegend` | `components/product/` |
| Volet (menu, détail) | `Sheet`, `SheetContent` | `components/ui/sheet.tsx` |
| Étapes numérotées | `ProcessSteps` | `components/sections/ProcessSteps.tsx` |
| FAQ (avec `buildFAQSchema`) | `FAQAccordion` ; page FAQ complète : `FaqExplorer` | `components/sections/` |
| Bloc d'appel final | `CTAFinal` (`tone`, `secondaryCta`) | `components/sections/CTAFinal.tsx` |
| Page de service (entretien, ramonage, dépannage) | `ServiceLanding` | `components/sections/ServiceLanding.tsx` |
| Marques, aides, chiffres, avis | `BrandsGrid`, `PrimesBlock`, `StatsGrid`, `Testimonials` | `components/sections/` |
| Formulaires | `ContactForm`, `QuoteForm`, `EstimateConfigurator`, `BookingWidget` | `components/forms/`, `components/booking/` |
| Métadonnées, données structurées | `buildPageMetadata`, `JsonLd`, `build*Schema` | `lib/seo.ts`, `components/seo/JsonLd.tsx` |
| Fond de section | `toneClass(tone)` | `lib/section-tone.ts` |

`components/sections/HeroPrimary.tsx` n'est utilisé nulle part : le héros de l'accueil est écrit dans `app/(frontend)/page.tsx`. Pour une page interne, `HeroSecondary`.

### Squelette d'une nouvelle page
```tsx
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Titre de la page",
  description: "Description de 150 caractères environ.",
  path: "/chemin-de-la-page",
});

export default function NouvellePage() {
  return (
    <>
      <HeroSecondary
        eyebrow="Accroche courte"
        title={<>Titre avec <span className="mp-italic">un accent</span></>}
        description="Chapô d'une ou deux phrases."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Titre de la page" }]}
      />

      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure mx-auto mb-10 text-center text-3xl font-semibold md:text-5xl">
            Titre de section
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">{/* contenu */}</Card>
          </div>
        </div>
      </section>

      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure">{/* texte long, aligné à gauche */}</div>
        </div>
      </section>

      <CTAFinal tone="beige" />
    </>
  );
}
```

### Buttons
- **Forme :** pilule ; hauteurs 36, 44 (défaut) et 56 px.
- **Principal :** aplat orange braise, texte vert nuit ; survol orange chaud. Un seul par écran.
- **Contour :** bordure 2 px vert forêt ; survol plein vert, texte blanc.
- **Secondaire :** aplat vert forêt, texte blanc ; survol vert feuille.
- **Pression :** `active:scale-[0.97]`. Aucune ombre, aucune lévitation.
- **Focus :** anneau 2 px orange-ink décalé de 2 px (orange chaud sur fond vert).

### Cards / Containers
- **Coins :** 20 px. **Fond :** crème. **Filet :** `border-mp-sand/40`. **Ombre :** aucune.
- **Carte cliquable :** le lien enveloppe la carte (`group`), survol = `group-hover:border-mp-orange-flame` + titre en couleur ; flèche qui glisse de 4 px au plus (`group-hover:translate-x-1`).
- **Carte produit :** photo carrée seule, puis marque et pastilles sur une ligne, nom, étiquettes (« Nouveau », « Best-seller ») avant les puissances, prix TVAC. Rien n'est posé sur la photo ; zoom de la photo au survol limité à `scale-[1.02]`.

### Chips & badges
- **Badge neutre :** beige chaud, texte encre. **Chip active :** orange braise, texte vert nuit. **Chip inactive :** contour sable, fond crème.
- **Pastilles caractéristiques :** disques orange de 28 px, pictogramme vert forêt, libellé en info-bulle et en texte masqué.

### Inputs / Fields
- **Style :** fond blanc, bordure sable 1 px, texte 16 px (pas de zoom iOS), coins `rounded-xl`.
- **Focus :** bordure orange braise et anneau `ring-mp-orange-flame/20`.
- **Erreur :** bordure et texte rouge 700, message sous le champ, `role="alert"`.
- **Cartes de choix :** bordure 2 px ; choisie = bordure orange braise, fond pêche `/40`, pastille radio dessinée (la sélection ne repose pas sur la seule couleur).

### Navigation
- **Barre du bas (< 1 280 px) :** pilule crème opaque, filet sable, `shadow-md`, 5 onglets, pastille orange derrière l'onglet actif (texte vert nuit). Se replie au défilement vers le bas, revient au défilement vers le haut.
- **En-tête (≥ 1 280 px) :** collant, fond crème opaque ; au défilement il passe de 96 à 64 px et prend un filet sable, sans animation de hauteur. Sous-menus en CSS (survol et clavier), `shadow-lg`.

### Mouvement
Jetons dans `app/globals.css` (`:root`), repris par Tailwind (`ease-out`, durée par défaut des `transition-*`) :
- `--mp-ease-out: cubic-bezier(0.22, 1, 0.36, 1)` : la seule courbe du site.
- `--mp-duration-micro: 180ms` : survols, pressions, changements d'état, pastille de la barre du bas, défilement des jours de l'agenda.
- `--mp-duration-enter: 240ms` : ouverture d'un volet ou d'un menu, retour de la barre du bas, barre de progression.
- `--mp-duration-exit: 160ms` : fermeture, toujours plus courte que l'ouverture.

Permis : opacité et transform (`translate`, `scale`, `rotate` d'un chevron), couleurs et bordures au survol, glissement d'un volet depuis son bord, déplacement de 8 px au plus pour un contenu. `prefers-reduced-motion: reduce` coupe tout (règle globale dans `globals.css`). Le héros n'a aucun fondu : titre, photo et accroche sont visibles dès le premier affichage (LCP).

## Do's and Don'ts

### Do:
- **Do** utiliser uniquement les jetons `--mp-*` (classes `bg-mp-*`, `text-mp-*`, `border-mp-*`) et les composants partagés listés plus haut.
- **Do** poser chaque section dans `.mp-shell` avec `.mp-band`, et alterner les fonds par `tone`.
- **Do** mettre le texte orange en orange-ink (petit) ou orange-display (grand titre) ; l'orange braise reste un aplat.
- **Do** signaler le survol d'une carte par sa bordure ou la couleur de son titre.
- **Do** garder photo et texte côte à côte (desktop) ou empilés (mobile).
- **Do** vérifier 44 px de cible, contraste AA, focus visible, aucun défilement horizontal à 320 et 375 px, `min-w-0` sur les colonnes.
- **Do** lancer `pnpm run check:design` avant de livrer.

### Don't:
- **Don't** écrire une couleur en dur (`#xxxxxx`, `rgb()`) dans un composant ; seules les images Open Graph générées et la balise `theme-color` en ont.
- **Don't** utiliser `rounded-xl` en pensant à 12 px : il vaut 28 px ici.
- **Don't** mettre l'orange braise en couleur de texte sur fond clair (2,1:1).
- **Don't** ajouter un fondu ou un `opacity: 0` sur le titre ou la photo du héros.

### Interdits (règles du 17/10/2026, mot pour mot)
1. **Aucun dégradé** : ni `linear-/radial-/conic-gradient`, ni `bg-gradient-*`, `bg-linear-*`, `bg-radial-*`, `from-/via-/to-`,
   ni texte en dégradé, ni voile en dégradé sur une photo. Remplacer par un aplat issu des jetons du site.
   Seule exception : un remplissage à arrêt net (deux couleurs, même position d'arrêt) pour la piste d'un curseur
   `input[type=range]`, qui n'est pas un dégradé visible. Les images OG (`opengraph-image.tsx`) passent aussi en aplat.
2. **Aucun halo ni lueur** : pas de tache radiale décorative, pas d'ombre à décalage nul colorée (`0 0 16px <couleur>`),
   pas de `drop-shadow` lumineux, pas de jeton `--shadow-glow`. **Aucun flou décoratif** : `backdrop-blur` sur en-tête,
   barre du bas, volets, bandeaux cookies → fond opaque (jeton de surface plein, opacité 1). Le voile d'une modale
   ou d'un volet reste un aplat sombre, sans flou. Les ombres restantes : une seule échelle sobre, avec décalage vertical
   et flou doux, de préférence remplacée par un filet (`border`) quand c'est possible.
3. **Aucune superposition de blocs** :
   - pas de marge négative qui fait monter une carte ou une section sur la précédente (`-mt-*`, `-translate-y-*` de mise en page) ;
   - pas de carte, chiffre clé, badge de réassurance ou bloc de texte posé en absolu SUR une photo ou sur une autre section ;
     le texte n'est jamais posé sur une photo : photo et texte côte à côte (desktop) ou empilés (mobile) ;
   - pas d'élément décoratif en absolu qui déborde d'un bloc (cercles, taches, formes) ;
   - les pastilles d'information d'une carte produit (promo, « nouveau », classe énergétique…) passent dans le corps
     de la carte, sous ou à côté de la photo, pas par-dessus ;
   - restent autorisés car ce sont des couches d'interface, pas des blocs : en-tête collant, barre de navigation du bas,
     menus déroulants, volets, modales, infobulles, bandeau cookies, bouton de fermeture d'une visionneuse, flèches
     de carrousel À L'INTÉRIEUR de la zone photo, compteur d'images d'une galerie.
   - vérifier aussi qu'aucun contenu n'est masqué sous la barre fixe du bas ou l'en-tête collant (réserve de place).
4. **Animations légères** :
   - uniquement `opacity` et `transform` (et couleurs/bordures pour les survols) ;
   - micro-interactions 150 à 200 ms, ouvertures de volets/menus 200 à 250 ms, rien au-delà de 300 ms ;
   - courbe ease-out unique, définie en jeton (ex. `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`), sortie plus courte que l'entrée ;
   - interdits : ressort ou rebond (cubic-bezier avec valeur > 1 ou < 0, `spring`), lévitation des cartes au survol
     (`hover:-translate-y-*`, ombre qui grossit), zoom des photos au survol au-delà de `scale(1.02)`, animations en boucle
     décoratives (`animate-pulse`, `animate-ping`, `animate-bounce`, flottement, défilement infini) hors indicateur de chargement,
     révélation au défilement section par section, déplacements de plus de 8 px, décalages en cascade de plus de 40 ms par élément ;
   - le contenu est visible par défaut (jamais `opacity:0` en attente de JS) ; au plus UNE entrée discrète par page (le héros),
     et pas sur l'élément LCP (titre, photo principale) ;
   - `prefers-reduced-motion: reduce` coupe tout mouvement (une règle globale dans le CSS suffit si elle n'existe pas).

Garde-fou : `scripts/check-design.mjs` (`pnpm run check:design`) refuse dégradés, flous, lueurs, courbes à ressort,
boucles décoratives, lévitation au survol, marges négatives verticales et couleurs en dur. Une exception justifiée se
marque `check-design: allow (raison)` sur la ligne ou juste au-dessus.
