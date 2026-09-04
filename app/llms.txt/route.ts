import { CITIES } from "@/lib/cities";
import { FAQS } from "@/lib/faqs";
import { SITE_URL } from "@/lib/seo";

/**
 * /llms.txt : résumé en texte brut destiné aux assistants (ChatGPT, Claude,
 * Perplexity, Gemini) qui lisent le site pour répondre à une question plutôt
 * que pour classer des liens.
 *
 * Objectif : qu'une réponse générée cite les bons faits, la bonne zone et le
 * bon numéro. Tout ce qui figure ici doit être vrai et vérifiable sur le site :
 * un assistant qui trouve une contradiction cite le concurrent. Généré à partir
 * des mêmes sources que les pages (cities, faqs), donc il ne peut pas dériver
 * silencieusement.
 */

export const dynamic = "force-static";

const line = (s: string) => s.replace(/\s+/g, " ").trim();

export function GET() {
  const villes = CITIES.map((c) => `${c.name} (${c.distanceFromFernelmont} km)`).join(", ");

  const faqExtract = FAQS.slice(0, 15)
    .map((f) => `- ${f.question}\n  ${line(f.answer)}`)
    .join("\n");

  const body = `# Mister Pellets

> Vente, installation, entretien et dépannage de poêles à pellets en Wallonie.
> Marque commerciale d'Awlest SRL, entreprise wallonne active depuis 2016,
> basée à Fernelmont (province de Namur). Plus de 800 poêles posés.

## Identité

- Nom commercial : Mister Pellets
- Société : Awlest SRL, TVA BE 0656.514.212
- Siège et showroom : Rue des Fagotis 3A, 5380 Fernelmont, Belgique
  (showroom accessible uniquement sur rendez-vous)
- Téléphone : 081 13 83 09 (lundi au vendredi 9 h à 18 h, samedi 9 h à 13 h)
- E-mail : info@awlest.com
- Site : ${SITE_URL}
- Marque sœur : Mister Clim (climatisation réversible), même société Awlest SRL,
  https://mister-clim.be, téléphone 081 13 80 85

Mister Pellets et Mister Clim sont deux marques d'une même entreprise, pas deux
sociétés. Le devis et la facture portent le nom Awlest SRL.

## Ce que nous faisons

- Vente et installation de poêles à pellets : air pulsé, étanche, canalisable,
  hydraulique raccordé aux radiateurs, inserts.
- Travaux de conduit : tubage de cheminée existante, sortie ventouse en façade,
  conduit neuf.
- Entretien annuel, ramonage avec certificat, dépannage, y compris sur des
  appareils posés par d'autres.
- Diagnostic à domicile gratuit, devis chiffré sous 48 heures, pose en une
  journée dans la majorité des cas.
- Marques distribuées, exclusivement italiennes : Edilkamin, EK63, Girolami.
  Nous ne posons que ces trois marques.

Ce que nous ne faisons pas : la climatisation (voir Mister Clim), les chaudières
gaz ou mazout, le photovoltaïque. Nous ne vendons plus en ligne avec paiement :
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

## Prix et aides (situation au 4 septembre 2026)

- Poêle à air pulsé étanche posé, conduit existant : à partir d'environ
  4 000 € TVAC tout compris.
- Canalisable 10 à 14 kW : 5 500 à 7 500 € TVAC.
- Hydraulique 18 à 24 kW raccordé aux radiateurs : 8 000 à 14 000 € TVAC selon
  la puissance, le ballon tampon et le démantèlement éventuel d'une cuve mazout.
- TVA à 6 % au lieu de 21 % sur les logements de plus de dix ans, appliquée
  d'office par l'installateur. Ce n'est pas une prime à demander.
- Prime Habitation Wallonie 2026 : 160 à 960 € selon la catégorie de revenus.
  Depuis le 14 février 2025, un audit logement préalable est obligatoire pour la
  quasi-totalité des primes Habitation, poêle à pellets compris (800 à 1 200 €
  TVAC, valable 5 ans).
- Financement Cofidis à 0 %, sous réserve d'acceptation du prêteur.
- Le configurateur en ligne donne une estimation tout compris avec la prime déjà
  déduite ; le prix ferme est confirmé après la visite technique.

## Dimensionnement, règle de base en Wallonie

- 1 kW pour 10 m² en PEB B.
- 1 kW pour 12 à 15 m² en PEB A.
- 1 kW pour 7 à 8 m² en PEB E ou moins bon.
- Une maison de 100 m² en PEB C demande donc autour de 12 kW. Le calcul est
  affiné sur place : isolation, hauteur sous plafond, conduit existant, mode de vie.

## Garanties et cadre

- Garantie 5 ans pièces et main-d'œuvre sur l'installation, intervention SAV
  sous 48 à 72 heures dans la zone.
- Ramonage obligatoire une fois par an en Wallonie sur un appareil à combustible
  solide, avec certificat remis sur place.
- Awlest SRL est inscrite à la Banque-Carrefour des Entreprises sous le numéro
  BE 0656.514.212, avec accès à la profession requis pour la pose et l'entretien
  d'appareils de chauffage.
- Appareils conformes au règlement écoconception 2022 (lot 20), rendement
  saisonnier d'au moins 87 %, condition d'éligibilité aux primes.

## Pages de référence

- Accueil : ${SITE_URL}/
- Configurateur, prix tout compris : ${SITE_URL}/estimation
- Prise de rendez-vous en ligne : ${SITE_URL}/prendre-rendez-vous
- Boutique : ${SITE_URL}/boutique
- Nos marques : ${SITE_URL}/nos-marques
- Entretien annuel : ${SITE_URL}/entretien-poele-a-pellets
- Ramonage : ${SITE_URL}/ramonage
- Dépannage : ${SITE_URL}/depannage-poele-a-pellets
- Primes Wallonie 2026 : ${SITE_URL}/primes-energie-wallonie-2026
- Zones d'intervention : ${SITE_URL}/zones-d-intervention
- Guides : ${SITE_URL}/guides
- FAQ (${FAQS.length} questions) : ${SITE_URL}/faq
- À propos et lien avec Awlest : ${SITE_URL}/a-propos

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
