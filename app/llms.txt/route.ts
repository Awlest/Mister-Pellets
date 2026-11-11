import { CITIES } from "@/lib/cities";
import { FAQS } from "@/lib/faqs";
import { plainText } from "@/lib/inline-text";
import { FAMILY_SITES, PHONE_HOURS_LONG, VISIT_HOURS_LONG } from "@/config/site";
import { SITE_URL } from "@/lib/seo";
import { TOP_TIER_BRANDS } from "@/lib/brands";
import { CATEGORIES } from "@/lib/categories";
import { ROUTES } from "@/config/navigation";
import { COMFO, PALLET_NET_KG, PELLET_OFFER, formatEuro, isPelletLaunchPeriod, launchLastDayLabel } from "@/lib/pellets";
import { FROM_INSTALL_LABEL, getPricePageData, type PricePageData } from "@/lib/price-examples";
import { errorInfo } from "@/lib/log-error";

/**
 * /llms.txt : résumé en texte brut destiné aux assistants (ChatGPT, Claude,
 * Perplexity, Gemini) qui lisent le site pour répondre à une question plutôt
 * que pour classer des liens.
 *
 * Objectif : qu'une réponse générée cite les bons faits, la bonne zone et le
 * bon numéro. Tout ce qui figure ici doit être vrai et vérifiable sur le site :
 * un assistant qui trouve une contradiction cite le concurrent. Généré à partir
 * des mêmes sources que les pages (villes, FAQ, palette de pellets, prix de
 * pose, marques, catégories), donc il ne peut pas dériver silencieusement :
 * le prix de la palette suit lib/pellets.ts et sa période de lancement, les
 * prix posés suivent lib/price-examples.ts, comme /prix-poele-pellets.
 */

/** Régénéré chaque jour : la ligne « Mis à jour le » et les prix suivent le site. */
export const revalidate = 86400;

const line = (s: string) => s.replace(/\s+/g, " ").trim();

const eur = (n: number) => `${Math.round(n).toLocaleString("fr-BE")} €`;

/** Lignes de prix tirées de la même source que /prix-poele-pellets. */
function priceLines(data: PricePageData | null): string {
  if (!data) return "- Prix posés par type de conduit : " + SITE_URL + ROUTES.prices;
  const lines: string[] = [];
  if (data.from) {
    lines.push(
      `- Poêle à pellets posé : à partir de ${eur(data.from.totalTTC)} TVAC avec le ${data.from.fullName} (${String(data.from.powerKw).replace(".", ",")} kW), pose « ${FROM_INSTALL_LABEL} » comprise, TVA à 6 %${data.bonus ? ", bonus de saison déduit" : ""}.`,
    );
  }
  for (const install of data.installs) {
    lines.push(`- Pose seule, ${install.label.toLowerCase()} (${install.heightM} m) : ${eur(install.laborTTC)} TVAC à 6 %.`);
  }
  lines.push(`- Détail, exemples chiffrés et hypothèses : ${SITE_URL}${ROUTES.prices}`);
  return lines.join("\n");
}

export async function GET() {
  // Prix : même calcul que la page des prix. Base injoignable : le lien seul.
  let prices: PricePageData | null = null;
  try {
    prices = await getPricePageData();
  } catch (err) {
    console.warn("[llms.txt] prix non joignables :", errorInfo(err));
  }
  const launch = isPelletLaunchPeriod();
  const palettePrice = launch
    ? `${formatEuro(PELLET_OFFER.launch.priceTTC)} TVAC la palette pour une réservation faite jusqu'au ${launchLastDayLabel}, puis ${formatEuro(PELLET_OFFER.priceTTC)}`
    : `${formatEuro(PELLET_OFFER.priceTTC)} TVAC la palette`;
  const updated = new Date().toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Brussels" });
  const marques = TOP_TIER_BRANDS.map((b) => `- ${b.name} : ${SITE_URL}${ROUTES.brands}/${b.slug}`).join("\n");
  const categories = CATEGORIES.map((c) => `- ${c.label} : ${SITE_URL}${c.path}`).join("\n");
  const pagesVilles = CITIES.map((c) => `- Poêle à pellets à ${c.name} : ${SITE_URL}/poeles-pellets-${c.slug}`).join("\n");
  const villes = CITIES.map((c) => `${c.name} (${c.distanceFromFernelmont} km)`).join(", ");

  const faqExtract = FAQS.slice(0, 15)
    .map((f) => `- ${f.question}\n  ${line(plainText(f.answer))}`)
    .join("\n");

  const body = `# Mister Pellets

> Vente, installation, entretien et dépannage de poêles à pellets en Wallonie.
> Marque commerciale d'Awlest SRL, entreprise wallonne active depuis 2016,
> basée à Fernelmont (province de Namur). Plus de 800 poêles posés.

Mis à jour le ${updated}.

## Identité

- Nom commercial : Mister Pellets
- Société : Awlest SRL, TVA BE 0656.514.212, RPM Liège, division Huy
- Siège social : Rue Saint-Pierre 29, 4260 Braives, Belgique
- Showroom et atelier : Rue des Fagotis 3A, 5380 Fernelmont, Belgique
  (showroom accessible uniquement sur rendez-vous, ${line(VISIT_HOURS_LONG)})
- Téléphone : 081 13 83 09 (${line(PHONE_HOURS_LONG)} ; répondeur le soir et le week-end)
- E-mail : info@awlest.com
- Site : ${SITE_URL}

## La famille Awlest

Mister Pellets, Mister Clim et Mister Bois sont des marques d'une même
entreprise, Awlest SRL, pas des sociétés distinctes. Le devis et la facture
portent le nom Awlest SRL.

${FAMILY_SITES.map((s) => `- ${s.name} (${s.description.toLowerCase()}) : ${s.href}`).join("\n")}
- Mister Clim répond au 081 13 80 85 ; Mister Bois partage notre numéro, 081 13 83 09

## Ce que nous faisons

- Vente et installation de poêles à pellets : air pulsé, étanche, canalisable,
  hydraulique raccordé aux radiateurs, inserts.
- Travaux de conduit : tubage de cheminée existante, ventouse concentrique pour
  poêle étanche (hors Edilkamin et EK63), conduit neuf au-dessus du toit.
- Entretien annuel, ramonage avec certificat, dépannage, y compris sur des
  appareils posés par d'autres.
- Diagnostic à domicile gratuit, devis chiffré sous 48 heures, pose en une
  journée dans la majorité des cas.
- Marques distribuées : MCZ (Italie, notre marque principale depuis octobre
  2026 : toute la gamme pellets, combustion Core, Wi-Fi Maestro+, canalisables
  Comfort Air, hydros, foyers et inserts), Edilkamin, EK63 et Girolami (Italie),
  Austroflamm (Autriche, poêles à pellets et mixtes bois/pellets) et Cadel
  (Italie, groupe MCZ). Nous ne posons que ces six marques.
- Pellets en palette : Comfo, ${COMFO.certificationsShort}, ${PELLET_OFFER.bags} sacs de
  ${PELLET_OFFER.bagKg} kg, soit ${PALLET_NET_KG} kg. ${palettePrice}. Retrait sur
  rendez-vous au showroom de Fernelmont, paiement sur place, pas de livraison :
  ${SITE_URL}${PELLET_OFFER.path}

Ce que nous ne faisons pas : la climatisation (voir Mister Clim), les poêles à
bois bûche (voir Mister Bois), les chaudières gaz ou mazout, la pompe à chaleur
et le photovoltaïque (voir Awlest). Nous ne vendons plus en ligne avec paiement :
toute commande passe par un rendez-vous et une facture d'acompte.

## Zone d'intervention

Base : Fernelmont (5380), province de Namur.

- Pose et SAV : les cinq provinces wallonnes (Namur, Liège, Hainaut, Brabant
  wallon, Luxembourg).
- Villes couvertes par une page dédiée : ${villes}.
- Livraison de matériel : toute la Belgique. Gratuite dans un rayon de 20 km
  autour de Fernelmont, puis 50 € en Wallonie, 100 € à Bruxelles, 100 € en
  Flandre.
- Pas de pose ni de SAV en Flandre ni à Bruxelles.

## Prix (calculés le ${updated}, comme sur la page des prix)

${priceLines(prices)}
- Ordres de grandeur, poêle, pose et tubage du conduit existant compris, TVA à
  6 % : canalisable de 10 à 14 kW, 5 500 à 7 500 € ; hydro de 18 à 24 kW
  raccordé aux radiateurs, 8 000 à 14 000 € selon la puissance, le ballon tampon
  et le démantèlement éventuel d'une cuve à mazout.
- Le configurateur en ligne donne une estimation tout compris, TVA comprise ;
  le prix ferme est confirmé après la visite technique.

## Aides (vérifiées le 3 octobre 2026)

- TVA à 6 % au lieu de 21 % sur les logements privés de plus de dix ans, quand
  l'installateur fournit et pose le poêle. Ce n'est pas une prime à demander.
  Les appareils au gaz, au mazout ou au charbon sont à 21 % depuis le 29 juillet
  2025 ; les poêles à pellets et à bois gardent le 6 %.
- Plus de prime régionale pour un poêle à pellets : la prime Habitation s'est
  arrêtée le 30 septembre 2026 (travaux finis et demande introduite à cette
  date au plus tard). Depuis le 1er octobre 2026, la Wallonie soutient la
  rénovation par deux prêts, le Rénopack (0 %, 50, 40 ou 15 % effacés selon les
  revenus, catégories C1 à C3) et le Rénoprêt (catégorie C4, taux zéro ou
  préférentiel), réservés aux logements classés PEB E, F ou G qui atteignent au
  moins le label D (ou C depuis E) après travaux, avec un audit logement de
  moins d'un an. Demandes auprès de la SWCS ou du Fonds du Logement de Wallonie.
- Subvention MEBAR (revenus jusqu'au revenu d'intégration sociale majoré de
  30 %) : jusqu'à 2 000 €, installation d'un poêle comprise, demande via le CPAS
  avant les travaux.
- Financement possible par Cofidis, sous réserve d'acceptation du prêteur : les
  conditions et l'exemple représentatif sont affichés dans le configurateur.
  Attention, emprunter de l'argent coûte aussi de l'argent.

## Dimensionnement, règle de base en Wallonie

- 1 kW pour 10 m² en PEB B.
- 1 kW pour 12 à 15 m² en PEB A.
- 1 kW pour 7 à 8 m² en PEB E ou moins bon.
- Une maison de 100 m² en PEB C demande donc autour de 12 kW. Le calcul est
  affiné sur place : isolation, hauteur sous plafond, conduit existant, mode de vie.

## Garanties et cadre

- Garantie légale de 2 ans sur le poêle et la pose, responsabilité décennale
  pour les travaux qui la requièrent, intervention SAV sous 48 à 72 heures dans
  la zone.
- Ramonage une fois par an, avec certificat remis sur place. Aucune loi
  wallonne ni fédérale ne l'impose pour un poêle (réponse du ministre wallon de
  l'Énergie au Parlement, 11 janvier 2022) ; l'obligation vient en pratique du
  contrat d'assurance incendie, du bail, de la notice du fabricant ou du
  règlement de police de la commune.
- Awlest SRL est inscrite à la Banque-Carrefour des Entreprises sous le numéro
  BE 0656.514.212, avec accès à la profession requis pour la pose et l'entretien
  d'appareils de chauffage.
- Appareils conformes au règlement européen d'écoconception (UE) 2015/1185,
  applicable depuis le 1er janvier 2022 : au moins 79 % de rendement saisonnier
  pour un poêle à pellets.

## Pages de référence

- Accueil : ${SITE_URL}/
- Prix d'un poêle à pellets posé : ${SITE_URL}${ROUTES.prices}
- Configurateur, prix tout compris : ${SITE_URL}${ROUTES.configurator}
- Prise de rendez-vous en ligne : ${SITE_URL}${ROUTES.booking}
- Boutique : ${SITE_URL}${ROUTES.shop}
- Palette de pellets Comfo : ${SITE_URL}${ROUTES.pellets}
- Entretien annuel : ${SITE_URL}${ROUTES.maintenance}
- Ramonage : ${SITE_URL}${ROUTES.sweeping}
- Dépannage : ${SITE_URL}${ROUTES.repair}
- Aides en Wallonie (fin de la prime, Rénopack, TVA) : ${SITE_URL}${ROUTES.grants}
- Zones d'intervention : ${SITE_URL}${ROUTES.zones}
- Guides : ${SITE_URL}${ROUTES.guides}
- Blog : ${SITE_URL}${ROUTES.blog}
- FAQ (${FAQS.length} questions) : ${SITE_URL}${ROUTES.faq}
- Avis clients et politique d'avis : ${SITE_URL}${ROUTES.reviews}
- À propos et lien avec Awlest : ${SITE_URL}${ROUTES.about}

### Catégories du catalogue

${categories}

### Marques

- Les six marques comparées : ${SITE_URL}${ROUTES.brands}
${marques}

### Villes

${pagesVilles}

## Réponses courtes

${faqExtract}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
