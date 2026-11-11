/**
 * Articles éditoriaux du blog Mister Pellets, Phase 7.
 *
 * Stratégie GEO (Generative Engine Optimization) :
 * - Réponse directe en TL;DR (exploitable par les LLMs : ChatGPT, Perplexity, Claude, Gemini)
 * - Données chiffrées et sourcées (chiffres Wallonie 2026, normes EN, prix marché)
 * - Citations internes ("Selon les techniciens Mister Pellets, …")
 * - FAQ structurée → Schema FAQPage
 * - Sections H2 = questions naturelles ("Comment dimensionner…", "Pourquoi…")
 * - Maillage interne sémantique vers guides, marques, villes, produits
 * - Mention zone géographique (Wallonie / Belgique)
 *
 * Quand Payload Articles sera peuplé, ces données peuvent être migrées en CMS.
 * En attendant, on les expose en SSG pour garantir un build prévisible.
 */

import {
  activeDiscount,
  evacuationPrice,
  formatEur,
  HAUTEUR,
  INSTALL_TYPES,
  VAT,
  withVat,
  type InstallType,
} from "@/lib/pose/moteur";
import { REMISES, TARIFS } from "@/lib/pose/tarifs";

export type ArticleCategory =
  | "guide-achat"
  | "installation"
  | "entretien"
  | "pellets"
  | "primes"
  | "marques"
  | "actualite";

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  "guide-achat": "Guide d'achat",
  installation: "Installation",
  entretien: "Entretien",
  pellets: "Pellets & combustible",
  primes: "Primes & aides",
  marques: "Marques & modèles",
  actualite: "Actualité",
};

export interface ArticleSection {
  heading: string;          // H2
  paragraphs?: string[];
  list?: { ordered?: boolean; items: string[] };
  callout?: { variant: "info" | "warning" | "success"; text: string };
  table?: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
}

export interface ArticleData {
  slug: string;
  title: string;            // H1
  metaTitle: string;        // <title>
  metaDescription: string;  // <meta description>
  excerpt: string;          // résumé éditorial pour la card
  tldr: string;             // réponse directe LLM (3-4 phrases)
  category: ArticleCategory;
  tags: string[];
  readingTimeMinutes: number;
  publishedAt: string;      // ISO
  modifiedAt?: string;      // ISO
  authorName: string;
  authorRole: string;
  coverImageAlt: string;
  sections: ArticleSection[];
  faqs: { question: string; answer: string }[];
  related: {
    articles?: string[];    // slugs d'articles
    guides?: string[];      // slugs de guides (lib/guides.ts)
    cities?: string[];      // slugs de villes (lib/cities.ts)
    brands?: string[];      // slugs de marques (lib/brands.ts)
  };
}

/**
 * Pose et raccordement d'une évacuation pour l'article sur l'évacuation, au
 * même calcul que /estimation (lib/pose) : un changement de tarif ou de remise
 * se répercute ici au déploiement suivant.
 */
function poseEvacuation(type: InstallType, hauteurM = HAUTEUR.defaut): string[] {
  const ht =
    evacuationPrice(type, hauteurM, TARIFS, REMISES).amountHT +
    INSTALL_TYPES[type].percements * TARIFS.percementRenforceHT;
  return [formatEur(ht), formatEur(withVat(ht, VAT.reduced).total)];
}

const REMISE_POSE_EN_COURS = (["tubage", "double-paroi", "ventouse"] as const).some((p) => activeDiscount(p, REMISES));

// =====================================================================
// 5 ARTICLES PILIERS GEO, chacun ~1500-2000 mots, format réponse directe
// =====================================================================

export const ARTICLES: ArticleData[] = [
  // ───────────────────────────────────────────────────────────────────
  // PELLETS : relevé mensuel des prix (11/11/2026), page tenue à jour chaque mois
  // Sources lues le 11/11/2026 : ValBiom, « Suivi mensuel des prix des
  // combustibles bois », mise à jour du 21/10/2026 (tableau « Prix moyen observé
  // en Wallonie », image tableau-oct-26.jpg, et graphique en c€/kWh TVAC) ;
  // CREG, tableau de bord d'octobre 2026 (Wallonie : électricité 45,89 c€/kWh
  // pour 3 500 kWh/an, gaz 13,57 c€/kWh pour 17 000 kWh/an) ; SPF Économie,
  // tarif officiel n° 2026/217 valable à partir du 11/11/2026 (gasoil de
  // chauffage H0/H7 : 1,4442 €/l sous 2 000 l, 1,4011 €/l à partir de 2 000 l) ;
  // SPW, guide Walloreno 2026, p. 7 (1 litre de mazout = 10 kWh) ; DIN CERTCO
  // 2 PfG C 0444/02.25, annexe 1 (PCI ≥ 4,6 kWh/kg) ; ENplus
  // ST 1001:2022, tableau des classes (PCI ≥ 4,6 kWh/kg) ; Test-Achats, article
  // du 25/09/2026 ; notices MCZ Cute Air 8 M1, Edilkamin Cherie 9+ Evo, Cadel
  // Grace 7 et Austroflamm Clou Pellet (rendements et consommations horaires).
  // Palette Comfo : lib/pellets.ts (470 € TVAC, 65 sacs de 15 kg).
  // Mise à jour mensuelle : première ligne du tableau « mois par mois », tldr,
  // section 1, section 5, tableau du kWh, FAQ, puis modifiedAt.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "prix-pellets-belgique",
    title: "Prix des pellets en Belgique : le relevé mois par mois",
    metaTitle: "Prix des pellets en Belgique, mois par mois",
    metaDescription:
      "Prix du sac de pellets de 15 kg en Wallonie, mois par mois depuis janvier 2025 : 7,02 € en octobre 2026 (ValBiom). Budget d'une saison, kWh, quand acheter.",
    excerpt:
      "Le sac de 15 kg est passé de 5,64 € à 7,02 € en un an. Le relevé mensuel de ValBiom depuis janvier 2025, ce que coûte une saison de chauffe, et le kWh de pellet face au mazout, au gaz et à l'électricité.",
    tldr:
      "En octobre 2026, le sac de 15 kg de pellets certifiés coûtait en moyenne 7,02 € en Wallonie, acheté par palette et hors livraison, selon le relevé mensuel de ValBiom. Cela fait 468 € la tonne et environ 10 centimes le kWh. Un an plus tôt, le même sac valait 5,64 € ; en août 2026, 6,19 €.",
    category: "pellets",
    tags: ["prix des pellets", "sac de 15 kg", "palette de pellets", "ValBiom", "prix du kWh"],
    readingTimeMinutes: 7,
    publishedAt: "2026-11-11",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers combustible",
    coverImageAlt: "Sacs de pellets de 15 kg empilés sur une palette, sous housse",
    sections: [
      {
        heading: "Le prix du sac, de la palette et du kWh en octobre 2026",
        paragraphs: [
          "L'asbl ValBiom relève chaque mois le prix moyen des pellets en Wallonie. Son dernier chiffre, publié le 21 octobre 2026 : 7,02 € le sac de 15 kg, TVA comprise. Ce prix vaut pour des pellets certifiés DINplus ou ENplus, achetés par palette entière, sans la livraison.",
          "À ce prix, le kilo revient à 47 centimes, la tonne en sacs à 468 € et une palette de 65 sacs à 456 €. Un kilo de pellet certifié contient au moins 4,6 kWh : le kWh coûte donc 10,2 centimes. En octobre 2025, le sac valait 5,64 € : il a pris 24 % en un an.",
          "C'est une moyenne, et les écarts entre vendeurs sont larges. En septembre 2026, Test-Achats trouvait des sacs de 5,50 € à plus de 8,50 € selon le vendeur et la quantité commandée, pour une moyenne de 6,75 €.",
        ],
      },
      {
        heading: "Le relevé mois par mois depuis janvier 2025",
        paragraphs: [
          "Le prix du sac est celui du tableau de ValBiom. Les deux colonnes de droite sont nos calculs : la tonne en sacs, soit le prix du sac divisé par 15 et multiplié par 1 000, et le kWh, à 4,6 kWh par kilo.",
        ],
        table: {
          headers: ["Mois", "Sac de 15 kg", "Tonne en sacs", "Prix du kWh"],
          rows: [
            ["Octobre 2026", "7,02 €", "468 €", "10,2 centimes"],
            ["Septembre 2026", "6,64 €", "443 €", "9,6 centimes"],
            ["Août 2026", "6,19 €", "413 €", "9,0 centimes"],
            ["Juillet 2026", "6,15 €", "410 €", "8,9 centimes"],
            ["Juin 2026", "6,13 €", "409 €", "8,9 centimes"],
            ["Mai 2026", "6,11 €", "407 €", "8,9 centimes"],
            ["Avril 2026", "6,12 €", "408 €", "8,9 centimes"],
            ["Mars 2026", "6,05 €", "403 €", "8,8 centimes"],
            ["Février 2026", "6,02 €", "401 €", "8,7 centimes"],
            ["Janvier 2026", "5,99 €", "399 €", "8,7 centimes"],
            ["Décembre 2025", "5,84 €", "389 €", "8,5 centimes"],
            ["Novembre 2025", "5,86 €", "391 €", "8,5 centimes"],
            ["Octobre 2025", "5,64 €", "376 €", "8,2 centimes"],
            ["Septembre 2025", "5,54 €", "369 €", "8,0 centimes"],
            ["Août 2025", "5,48 €", "365 €", "7,9 centimes"],
            ["Juillet 2025", "5,43 €", "362 €", "7,9 centimes"],
            ["Juin 2025", "5,43 €", "362 €", "7,9 centimes"],
            ["Mai 2025", "5,48 €", "365 €", "7,9 centimes"],
            ["Avril 2025", "5,69 €", "379 €", "8,2 centimes"],
            ["Mars 2025", "5,70 €", "380 €", "8,3 centimes"],
            ["Février 2025", "5,66 €", "377 €", "8,2 centimes"],
            ["Janvier 2025", "5,61 €", "374 €", "8,1 centimes"],
          ],
          caption:
            "Source : ValBiom, « Suivi mensuel des prix des combustibles bois », prix moyen observé en Wallonie, mise à jour du 21 octobre 2026. Pellets certifiés DINplus ou ENplus, une palette au minimum, hors livraison. Tonne et kWh : calculs Mister Pellets.",
        },
      },
      {
        heading: "Ce que coûte une saison de chauffe",
        paragraphs: [
          "Un kilo de pellet certifié contient au moins 4,6 kWh. Les notices des poêles que nous posons annoncent 89 à 93 % de rendement (MCZ Cute Air 8, Edilkamin Cherie 9+ Evo, Cadel Grace 7, Austroflamm Clou Pellet) : avec 90 %, un kilo laisse 4,1 kWh de chaleur dans la maison. Pour 1 000 kWh de chaleur, il faut donc 242 kg de pellets, 16 sacs, soit 113 € au prix d'octobre 2026.",
          "L'isolation de la maison pèse plus que la puissance du poêle. Le plus sûr est de partir de votre ancienne facture de mazout ou de gaz : la méthode est dans [notre calcul du budget d'un hiver au pellet](/blog/budget-hiver-poele-pellets-consommation-2026). Pour le poêle lui-même, voyez [le prix d'un poêle à pellets posé](/prix-poele-pellets).",
          "À l'heure, un poêle de 8 kW brûle de 0,5 kg au ralenti à 1,8 kg à pleine puissance (MCZ Cute Air 8), un 9 kW de 0,8 à 2,1 kg (Edilkamin Cherie 9+ Evo). Sur la saison, voici les fourchettes que nous donnons en rendez-vous, recalculées au prix d'octobre.",
        ],
        table: {
          headers: ["Votre cas", "Chaleur à fournir", "Pellets par saison", "Sacs de 15 kg", "Budget à 7,02 € le sac"],
          rows: [
            ["Appoint le soir et le week-end, poêle de 7 à 9 kW", "2 500 à 3 700 kWh", "600 à 900 kg", "40 à 60", "280 à 420 €"],
            ["Chauffage principal, maison de 120 m² en PEB B ou C, poêle de 10 kW", "6 200 à 8 300 kWh", "1,5 à 2 tonnes", "100 à 135", "700 à 950 €"],
            ["Poêle hydro qui remplace une chaudière, maison de 150 à 180 m²", "12 400 à 16 600 kWh", "3 à 4 tonnes", "200 à 270", "1 400 à 1 900 €"],
          ],
          caption:
            "Hypothèses : 4,6 kWh par kilo, 90 % de rendement, saison d'octobre à avril, sac à 7,02 € (ValBiom, octobre 2026), livraison non comprise. Fourchettes indicatives : l'isolation et la consigne de température les font varier.",
        },
      },
      {
        heading: "Sac à l'unité, palette ou vrac",
        paragraphs: [
          "Le relevé de ValBiom porte sur l'achat d'une palette entière, livraison non comprise. Une palette, c'est un peu moins d'une tonne. Si vous vous faites livrer, ajoutez le transport au prix du sac avant de comparer deux offres.",
          "À l'unité ou par petites quantités, le prix au sac grimpe : la fourchette de Test-Achats, de 5,50 € à plus de 8,50 €, dépend autant de la quantité commandée que du vendeur.",
          "Le vrac, soufflé par camion dans un silo, est le format des chaudières à pellets. Un poêle se remplit au sac. ValBiom suit aussi le vrac sur son graphique, en centimes par kWh : sa courbe suit celle du sac, un peu en dessous. Son tableau ne donne pas le prix du vrac à la tonne, et nous ne publions pas un chiffre que nous n'avons pas lu.",
          "Nous vendons une palette de pellets Comfo, certifiés DINplus A1 : 65 sacs de 15 kg pour 470 € TVA comprise, soit 7,23 € le sac, à retirer sur rendez-vous à Fernelmont. Tout est sur la page [palette de pellets Comfo](/palette-pellets-comfo).",
        ],
      },
      {
        heading: "Quand acheter vos pellets",
        paragraphs: [
          "En 2025, le prix a suivi la saison : 5,43 € le sac en juin et en juillet, 5,86 € en novembre. Sur une palette de 65 sacs, l'écart fait 28 €.",
          "En 2026, le creux d'été n'a pas eu lieu. Le sac est monté presque chaque mois, de 5,99 € en janvier à 6,19 € en août, puis il a pris 83 centimes en deux mois : 54 € de plus par palette entre août et octobre.",
          "ValBiom avance deux explications. La construction tourne au ralenti, les scieries débitent moins de résineux et produisent moins de sciure, la matière première du pellet. Et la hausse du pétrole, liée au conflit au Moyen-Orient, pousse davantage de ménages vers le bois. Pour l'hiver 2026-2027, l'association juge un recul marqué des prix improbable et retient un scénario de stabilité, tant que l'offre et la demande restent en équilibre.",
          "Notre avis : achetez votre saison en une fois, entre mai et août, si vous avez un endroit sec pour la stocker. Attendre l'automne n'a payé ni en 2025 ni en 2026. Et en novembre, n'attendez pas une baisse pour remplir le garage : prenez ce qu'il vous faut pour finir l'hiver.",
        ],
      },
      {
        heading: "Le kWh de pellet face au mazout, au gaz et à l'électricité",
        paragraphs: [
          "Pour comparer, nous ramenons chaque énergie au prix d'un kWh contenu dans le combustible, avant les pertes de l'appareil. Les prix sont les derniers publiés, à la date indiquée dans le tableau.",
          "Le pellet reste l'énergie la moins chère du tableau, 27 à 30 % sous le mazout. L'écart s'est resserré : en août, à 6,19 € le sac, son kWh valait 9 centimes. Avec un poêle à 90 % de rendement, le kWh de chaleur rendu dans la pièce revient à 11,3 centimes.",
          "Le prix de l'électricité est celui d'un radiateur électrique. Une pompe à chaleur consomme plusieurs fois moins pour la même chaleur, et se compare avec son rendement saisonnier.",
        ],
        table: {
          headers: ["Énergie", "Prix relevé", "Prix du kWh", "Source et date"],
          rows: [
            ["Pellets en sacs", "7,02 € le sac de 15 kg", "10,2 centimes", "ValBiom, octobre 2026"],
            ["Gaz naturel", "13,57 centimes le kWh, tout compris", "13,6 centimes", "CREG, Wallonie, octobre 2026"],
            ["Mazout de chauffage, à partir de 2 000 litres", "1,4011 € le litre", "14,0 centimes", "SPF Économie, tarif du 11 novembre 2026"],
            ["Mazout de chauffage, moins de 2 000 litres", "1,4442 € le litre", "14,4 centimes", "SPF Économie, tarif du 11 novembre 2026"],
            ["Électricité", "45,89 centimes le kWh, tout compris", "45,9 centimes", "CREG, Wallonie, octobre 2026"],
          ],
          caption:
            "Pellets : 4,6 kWh par kilo au moins (ENplus A1 et DINplus). Mazout : prix maximum officiel, 10 kWh par litre (Service public de Wallonie). Gaz et électricité : prix moyens de la CREG pour un ménage de 17 000 kWh de gaz et de 3 500 kWh d'électricité par an.",
        },
      },
      {
        heading: "Sources et mises à jour",
        paragraphs: [
          "Chiffres relus à la source le 11 novembre 2026. Le relevé de novembre n'était pas encore publié. ValBiom met son tableau à jour une fois par mois : nous ajoutons alors la ligne, et la date de mise à jour s'affiche en haut de la page.",
          "ValBiom convertit le prix du sac avec environ 5 kWh par kilo : dans son analyse de juin 2024, 5,57 € le sac donnaient 7,43 centimes le kWh. Nous gardons 4,6 kWh, le minimum garanti par les certifications : notre kWh de pellet sort donc un peu plus cher que le sien.",
        ],
        list: {
          items: [
            "ValBiom, « Suivi mensuel des prix des combustibles bois », mise à jour du 21 octobre 2026 : [valbiom.be](https://www.valbiom.be/actualites/suivi-mensuel-des-prix-des-combustibles-bois).",
            "CREG, tableau de bord mensuel de l'électricité et du gaz naturel, octobre 2026 : [creg.be](https://www.creg.be/fr/professionnels/fonctionnement-et-monitoring-du-marche/tableau-de-bord).",
            "SPF Économie, tarif officiel des produits pétroliers n° 2026/217, valable à partir du 11 novembre 2026 : [economie.fgov.be](https://economie.fgov.be/fr/themes/energie/prix-de-lenergie/prix-maximum-des-produits/tarif-officiel-des-produits).",
            "Test-Achats, « Voici pourquoi acheter votre pellet avant la fin du mois de septembre », 25 septembre 2026 : [test-achats.be](https://www.test-achats.be/maison-energie/pellets/news/prix-avantageux-pellet-belgique).",
            "ValBiom, « Suivi des prix des combustibles bois », analyse de juin 2024 : [valbiom.be](https://www.valbiom.be/sites/default/files/tool/file/valbiom-analyse-suivi-des-prix-des-combustibles-bois-juin-2024.pdf).",
            "ENplus, norme ST 1001:2022, exigences de qualité des pellets : [enplus-pellets.eu](https://enplus-pellets.eu/wp-content/uploads/Documents/ENplus-ST-1001-ENplus-wood-pellets-Requirements-for-companies-5.pdf). DIN CERTCO, programme DINplus, annexe 1 (édition 02-2025) : [dincertco.de](https://www.dincertco.de/media/dincertco/dokumente_1/certification_schemes/2-pfg-c-0444_annex-1_en_wood-pellets.pdf).",
            "Service public de Wallonie, guide pratique Walloreno 2026, page 7 : [energie.wallonie.be](https://energie.wallonie.be/files/PEB/B%C3%A2timents%20r%C3%A9sidentiels/R%C3%A9novation/Outils/Publications/Walloreno/brochureWalloreno_2026.pdf).",
          ],
        },
      },
    ],
    faqs: [
      {
        question: "Quel est le prix d'un sac de pellets de 15 kg en Belgique ?",
        answer:
          "En octobre 2026, 7,02 € en moyenne en Wallonie, selon le relevé mensuel de ValBiom : pellets certifiés, achetés par palette, hors livraison. À l'unité, comptez plus. En septembre 2026, Test-Achats relevait des sacs de 5,50 € à plus de 8,50 € selon le vendeur et la quantité.",
      },
      {
        question: "Quel est le prix d'une palette de pellets ?",
        answer:
          "Au prix moyen d'octobre 2026, une palette de 65 sacs de 15 kg revient à 456 €, hors livraison, et la tonne en sacs à 468 €. Un an plus tôt, la même palette coûtait 367 €.",
      },
      {
        question: "Le prix des pellets va-t-il baisser cet hiver ?",
        answer:
          "ValBiom ne le prévoit pas. Dans sa mise à jour du 21 octobre 2026, l'association juge un recul marqué improbable pour l'hiver 2026-2027 et retient un scénario de prix stables, sauf rupture entre l'offre et la demande.",
      },
      {
        question: "Quand acheter vos pellets pour les payer moins cher ?",
        answer:
          "Entre mai et août. En 2025, le sac valait 5,43 € en juin et en juillet, contre 5,86 € en novembre. En 2026, il n'y a pas eu de baisse d'été, mais le sac d'août, à 6,19 €, coûtait encore 83 centimes de moins que celui d'octobre.",
      },
      {
        question: "Les pellets sont-ils encore moins chers que le mazout ?",
        answer:
          "Oui. Au relevé d'octobre 2026 (7,02 € le sac de 15 kg), le kWh de pellet revient à 10,2 centimes, contre 14,0 à 14,4 centimes pour le mazout au prix maximum du SPF Économie du 11 novembre 2026, soit 1,4011 à 1,4442 € le litre selon la quantité.",
      },
    ],
    related: {
      articles: [
        "budget-hiver-poele-pellets-consommation-2026",
        "pellets-enplus-a1-vs-dinplus",
        "remplacer-chaudiere-mazout-poele-hydro",
      ],
      guides: ["quelle-puissance-poele-pellets", "remettre-en-route-poele-pellets-automne"],
      cities: ["namur", "charleroi", "liege"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // GUIDE D'ACHAT : poêle à pellets et électricité (11/11/2026)
  // Sources lues le 11/11/2026 : MCZ, manuel du Cute Air 8 M1, partie 1
  // (réf. 8902204900, p. 25 : 67 W, 38 W, 340 W, 3 W) et partie 2
  // (réf. 8902205000, p. 48 « Défaut temporaire de courant », p. 53), fiche
  // technique rév. 2019052901, FAQ mcz.it/fr-be (onduleur), page
  // mcz.it/fr/consommation-electrique-poeles (85 kWh/an, étude Amoès) ;
  // Edilkamin, manuel Cherie 9+ Evo / 11++ Evo, cod. 942786-FR I 02.25/A (§ 6.5
  // données électriques, § 17.6 Black-out) ; Cadel, manuel de l'installateur
  // Grace 7 et autres, réf. 89022193B (345 W max, résistance 300 W, ASI 210 V),
  // manuel de l'utilisateur Wall3 Plus / Tile3 Plus / Moon, réf. 89022051A
  // (§ 8.10, 12.7, 12.9) ; Austroflamm, notices Clou Pellet V1.0 du 06/08/2024
  // (p. 18, 62, 76) et Clou Duo V2.0 du 20/12/2024 (p. 11, 17, 76, 80) ; Bronpi,
  // fiche Free-6 et notice « Manual Free v.300925 » ; CREG, tableau de bord
  // d'octobre 2026 (Wallonie, 45,89 c€/kWh).
  // À confirmer par Dorian : aucun poêle à pellets sans électricité au catalogue.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "poele-pellets-sans-electricite-coupure-courant",
    title: "Poêle à pellets sans électricité : ce qui existe vraiment",
    metaTitle: "Poêle à pellets sans électricité : le point",
    metaDescription:
      "Coupure de courant, consommation électrique d'après les notices MCZ, Edilkamin, Cadel et Austroflamm, onduleur, poêles à pellets sans électricité : le point.",
    excerpt:
      "Un poêle à pellets s'arrête quand le courant saute. Ce qu'il consomme d'après les notices, ce qui se passe pendant la coupure, quel onduleur brancher, et les rares modèles qui se passent de prise.",
    tldr:
      "Un poêle à pellets a besoin de courant : la vis sans fin, l'allumage, l'extracteur de fumées et la carte électronique sont électriques. À la coupure, il s'arrête et se met en sécurité. Il consomme peu : 9 à 177 W en marche, jusqu'à 345 W à l'allumage. Des poêles à pellets sans électricité existent, mais nous n'en posons pas.",
    category: "guide-achat",
    tags: ["coupure de courant", "consommation électrique", "onduleur", "poêle sans électricité", "poêle mixte"],
    readingTimeMinutes: 8,
    publishedAt: "2026-11-11",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens poseurs",
    coverImageAlt: "Poêle à pellets allumé dans un séjour, câble d'alimentation branché sur une prise murale",
    sections: [
      {
        heading: "Pourquoi un poêle à pellets a besoin de courant",
        paragraphs: [
          "Quatre organes tournent à l'électricité. La vis sans fin amène les pellets du réservoir au creuset. Une résistance les allume. Un extracteur aspire les fumées et les pousse dans le conduit : Cadel range ses poêles parmi les appareils « à tirage forcé ». Une carte électronique règle le tout, avec les sondes et les sécurités. La plupart des poêles ont en plus un ventilateur qui souffle l'air chaud dans la pièce.",
          "Les Austroflamm chauffent par convection naturelle, sans ventilateur d'air chaud. Ils restent des poêles électriques : la notice du Clou Pellet prévoit une alimentation en 230 V et un ventilateur de tirage pour les fumées. « Convection naturelle » ne veut pas dire « sans électricité ».",
        ],
      },
      {
        heading: "Ce qu'il consomme, d'après les notices",
        paragraphs: [
          "C'est à l'allumage qu'un poêle à pellets tire le plus, quand la résistance chauffe : 340 W au maximum sur un MCZ Cute Air 8, 345 W sur un Cadel Grace 7, dont 300 W pour la seule résistance. Une fois la flamme prise, la consommation tombe à quelques dizaines de watts. Le poêle sans ventilateur d'air chaud est aussi celui qui consomme le moins.",
          "Sur une saison, prenons 1 500 heures de marche, soit 7 heures par jour d'octobre à avril. Le Cute Air 8 consomme alors 57 à 100 kWh, le Cherie 9+ Evo 102 à 266 kWh, le Clou Pellet 14 à 27 kWh. Au prix moyen de l'électricité en Wallonie en octobre 2026, 45,89 centimes le kWh selon la CREG, cela fait de 6 à 122 € par hiver selon le poêle, hors allumages. MCZ cite de son côté une mesure du bureau d'études Amoès : 85 kWh par an pour un de ses poêles dans une maison de 72 m², soit 39 €.",
          "La veille compte aussi : 3 W toute l'année font 26 kWh, soit 12 €. MCZ et Cadel conseillent de débrancher le poêle hors saison.",
        ],
        table: {
          headers: ["Poêle", "À l'allumage", "À puissance nominale", "À puissance réduite", "En veille"],
          rows: [
            ["MCZ Cute Air 8 (8 kW, ventilé)", "340 W au maximum", "67 W", "38 W", "3 W"],
            ["Edilkamin Cherie 9+ Evo (9 kW, canalisable)", "non précisé", "177 W", "68 W", "3 W"],
            ["Cadel Grace 7 (7 kW)", "345 W au maximum, dont 300 W de résistance", "non précisé", "non précisé", "non précisé"],
            ["Austroflamm Clou Pellet 8 et 10 kW (convection naturelle)", "non précisé", "15 et 18 W", "9 W", "3 W"],
            ["Austroflamm Clou Duo (mixte bois et pellets, 7 kW)", "non précisé", "15 W", "11 W", "5 W"],
          ],
          caption:
            "Puissance électrique absorbée, d'après les notices et fiches techniques des fabricants lues le 11 novembre 2026 (références en fin d'article). « Non précisé » : la notice ne donne pas la valeur ou renvoie à la plaque signalétique.",
        },
      },
      {
        heading: "Ce qui se passe pendant une coupure de courant",
        paragraphs: [
          "Le courant saute, tout s'arrête d'un coup : plus de pellets, plus d'air soufflé, plus d'extraction. Les pellets déjà dans le creuset finissent de brûler, et leurs fumées ne sont plus poussées dehors. Elles sortent si le conduit tire tout seul. Austroflamm l'écrit dans la notice du Clou Pellet : le conduit doit fournir un tirage de 3 à 12 Pa au minimum pour évacuer les gaz en cas de panne de courant. C'est une des raisons pour lesquelles nous tenons à [un conduit qui monte au-dessus du toit](/blog/evacuation-fumees-poele-pellets).",
          "Si de la fumée s'échappe dans la pièce, appliquez la consigne que MCZ donne pour toute fumée anormale : ouvrez les fenêtres et laissez la porte du foyer fermée.",
          "Au retour du courant, tout dépend de la marque.",
        ],
        list: {
          items: [
            "MCZ (Cute Air 8) : le poêle passe en refroidissement, puis se rallume de lui-même.",
            "Cadel (Wall3 Plus, Tile3 Plus, Moon) : après une coupure de moins de 10 secondes, il reprend où il en était. Au-delà, il affiche « ON BLACK OUT », refroidit à fond, puis relance un allumage.",
            "Edilkamin (Cherie 9+ Evo et 11++ Evo) : l'écran alterne « Black Out » et « OFF » pendant l'extinction, puis le poêle reste éteint, « Black Out » affiché. Prévoyez de le rallumer vous-même.",
            "Austroflamm (Clou Pellet) : une pile CR2032 garde l'heure et la programmation pendant la coupure. La notice demande de la remplacer tous les 2 ans.",
          ],
        },
        callout: {
          variant: "info",
          text: "Si le poêle ne repart pas ou affiche une alarme après la coupure, n'enchaînez pas les allumages. Notez le message à l'écran et appelez [notre service de dépannage](/depannage-poele-a-pellets).",
        },
      },
      {
        heading: "Onduleur, batterie, groupe électrogène",
        paragraphs: [
          "Un onduleur (une ASI, alimentation sans interruption) garde le poêle sous tension pendant la coupure. MCZ précise lequel dans sa foire aux questions : un modèle à onde sinusoïdale pure, en 230 V et 50 Hz, d'une puissance au moins égale à la puissance électrique maximale de la fiche technique du poêle, soit 340 W pour un Cute Air 8. Cadel demande une tension d'au moins 210 V sans fluctuations, et prévient qu'il ne garantit pas le fonctionnement du poêle sur ces appareils, vu la variété du marché.",
          "L'autonomie se calcule : l'énergie de la batterie, en wattheures, divisée par la puissance du poêle, en watts.",
          "Un groupe électrogène ou une batterie domestique doivent tenir la même exigence : une onde sinusoïdale pure et une tension stable. Une batterie domestique ne prend le relais pendant une coupure que si l'installation a été prévue pour : demandez-le à l'installateur qui l'a posée.",
          "Notre avis : pour la plupart des maisons, l'onduleur ne vaut pas la dépense. Le poêle se met en sécurité tout seul et une coupure d'une heure se passe avec un pull. Il se justifie si les coupures reviennent souvent chez vous, ou si le poêle est votre seul chauffage. Dans ce cas, prenez de la marge sur la puissance et vérifiez la mention « onde sinusoïdale pure » sur la fiche.",
        ],
        table: {
          headers: ["Énergie de la batterie", "Poêle à 38 W", "Poêle à 67 W", "Poêle à 177 W"],
          rows: [
            ["500 Wh", "13 heures", "7 heures", "3 heures"],
            ["1 000 Wh", "26 heures", "15 heures", "6 heures"],
            ["2 000 Wh", "53 heures", "30 heures", "11 heures"],
          ],
          caption:
            "Autonomie théorique, arrondie à l'heure : énergie de la batterie divisée par la puissance du poêle (38 et 67 W : MCZ Cute Air 8 à puissance réduite et nominale ; 177 W : Edilkamin Cherie 9+ Evo à puissance nominale). En pratique, comptez moins : l'onduleur a ses pertes et chaque allumage tire jusqu'à 340 W.",
        },
      },
      {
        heading: "Les poêles à pellets vraiment sans électricité",
        paragraphs: [
          "Ils existent. Le fabricant espagnol Bronpi en propose deux, les Free-6 et Free-11. Les pellets descendent du réservoir par gravité quand vous ouvrez un levier, et l'air arrive par le seul tirage du conduit. Le Free-6 annonce 6 kW, 91 % de rendement et un réservoir de 7 kg, pour 5,8 à 11,6 heures d'autonomie.",
          "Ce que vous perdez se lit dans la notice. L'allumage se fait à la main, avec un cube allume-feu et une allumette. La puissance se règle avec un registre de tirage, sans thermostat ni programmation. Le conduit doit tirer juste, 12 Pa à 2 Pa près, et Bronpi déconseille les pièces équipées d'une hotte ou d'une ventilation qui gêneraient ce tirage.",
          "Nous n'en avons pas au catalogue. Avec un poêle à pellets, vous achetez un feu qui s'allume seul, tient la température demandée et se programme. Sans courant, ces trois avantages disparaissent.",
        ],
      },
      {
        heading: "L'alternative : un poêle mixte bois et pellets",
        paragraphs: [
          "Si la coupure de courant vous inquiète vraiment, regardez les poêles mixtes. L'Austroflamm Clou Duo brûle des pellets en temps normal, et sa notice prévoit un mode de secours : sans courant, il fonctionne aux bûches. Le conduit doit alors tirer à 12 Pa au moins, le clapet d'air reste grand ouvert sans réglage possible, et Austroflamm prévient que les performances ne sont pas celles du fonctionnement normal. Les Duo sont sur [notre page Austroflamm](/nos-marques/austroflamm).",
          "Et si vous voulez un chauffage qui ne dépend jamais d'une prise, choisissez un poêle à bois bûche : vous les trouverez chez [Mister Bois](https://mister-bois.be/poeles-a-bois).",
        ],
      },
      {
        heading: "Les documents que nous avons lus",
        paragraphs: [
          "Notices, fiches techniques et pages officielles consultées le 11 novembre 2026.",
        ],
        list: {
          items: [
            "MCZ, manuel d'installation et d'utilisation du Cute Air 8 M1 (réf. 8902204900 et 8902205000) et fiche technique : [documents techniques MCZ](https://www.mcz.it/fr-be/service-support-poeles-cheminees/zone-de-telechargement/documents-techniques?article=7122002).",
            "MCZ, foire aux questions, entrée sur les onduleurs : [mcz.it](https://www.mcz.it/fr-be/service-support-poeles-cheminees/foire-aux-questions).",
            "MCZ, « La consommation électrique des poêles à granulés » : [mcz.it](https://www.mcz.it/fr/consommation-electrique-poeles).",
            "Edilkamin, manuel Cherie 9+ Evo et 11++ Evo (cod. 942786-FR, 02.25/A) : [manuels Edilkamin](https://st.edilkamin.com:4433/ek_schede_download.aspx?lang=fr).",
            "Cadel, manuel de l'installateur Grace 7 (réf. 89022193B) : [cadelsrl.com](https://grp.cadelsrl.com/documents/89022193B.pdf). Manuel de l'utilisateur Wall3 Plus, Tile3 Plus et Moon (réf. 89022051A) : [cadelsrl.com](https://grp.cadelsrl.com/documents/89022051A.pdf).",
            "Austroflamm, notice du Clou Pellet (version 1.0 du 6 août 2024) : [austroflamm.com](https://www.austroflamm.com/products/Clou-pellet_2.0/technical-data/Clou-Pellet-Notice-d-instructions-fr-803101-945185-V1.0.pdf). Notice du Clou Duo (version 2.0 du 20 décembre 2024) : [austroflamm.com](https://www.austroflamm.com/products/Clou-Duo-Pelletbetrieb/technical-data/Clou-Duo-Notice-d-instructions-fr-810001-945083-V2.0.pdf).",
            "Bronpi, fiche et notice du Free-6 : [bronpi.com](https://bronpi.com/fr/produit/free-6/).",
            "CREG, tableau de bord d'octobre 2026 : [creg.be](https://www.creg.be/fr/professionnels/fonctionnement-et-monitoring-du-marche/tableau-de-bord).",
          ],
        },
      },
    ],
    faqs: [
      {
        question: "Un poêle à pellets peut-il fonctionner sans électricité ?",
        answer:
          "Non, pas un poêle à pellets classique : la vis sans fin, la résistance d'allumage, l'extracteur de fumées et la carte électronique sont électriques. Il existe des poêles à pellets à gravité, sans prise, comme les Bronpi Free, mais ils s'allument à la main et ne se programment pas.",
      },
      {
        question: "Que se passe-t-il pendant une coupure de courant avec un poêle à pellets ?",
        answer:
          "Le poêle s'arrête : plus d'alimentation en pellets, plus d'extraction. Les pellets du creuset finissent de brûler et les fumées partent par le tirage naturel du conduit. Au retour du courant, un MCZ ou un Cadel refroidit puis se rallume seul ; un Edilkamin Cherie reste éteint et affiche « Black Out ».",
      },
      {
        question: "Quelle est la consommation électrique d'un poêle à pellets ?",
        answer:
          "D'après les notices, de 9 à 177 W en marche selon le modèle et le régime, 3 à 5 W en veille et jusqu'à 345 W pendant l'allumage. Sur 1 500 heures de chauffe, cela fait 14 à 266 kWh, soit 6 à 122 € au prix moyen wallon d'octobre 2026.",
      },
      {
        question: "Quel onduleur pour un poêle à pellets ?",
        answer:
          "MCZ demande un onduleur à onde sinusoïdale pure, en 230 V et 50 Hz, d'une puissance au moins égale à la puissance électrique maximale du poêle, 340 W pour un Cute Air 8. Avec 500 Wh de batterie, ce poêle tient environ 7 heures à puissance nominale, moins s'il doit se rallumer.",
      },
      {
        question: "Un poêle à pellets à convection naturelle fonctionne-t-il sans courant ?",
        answer:
          "Non. La convection naturelle supprime le ventilateur d'air chaud, pas l'électricité : un Austroflamm Clou Pellet garde une vis, un allumage et un extracteur électriques. Il consomme simplement moins, 15 à 18 W à puissance nominale selon sa notice.",
      },
    ],
    related: {
      articles: [
        "poele-pellets-eteint-tout-seul-causes",
        "evacuation-fumees-poele-pellets",
        "girolami-hybride-bois-pellet-fuel-convert",
      ],
      guides: ["guide-achat-poele-pellets-wallonie", "comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege"],
      brands: ["mcz", "edilkamin", "cadel", "austroflamm"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // INSTALLATION : évacuation des fumées (09/11/2026)
  // Sources lues le 09/11/2026 : notices MCZ (PAD Hydromatic M2, réf.
  // 8902137901), Edilkamin (cod. 942415-FR 11.23/C) et Cadel (89022051B,
  // rév. 00-2025) ; FAQ belge de MCZ (mcz.it/fr-be, sortie murale) ; DoP et
  // notices Poujoulat (Therminox TI, PGI, Tubaginox ; lettres P1, N1, W, G, O) ;
  // guide Poujoulat « Tubage et raccordement » (11/2019) ; CoDT, art. R.IV.1-1,
  // rubrique A.11 (Wallex, version du 01/05/2025) ; AGW du 29/01/2009 (NBN
  // B 61-002 citée pour les seules chaudières de chauffage central). Prix :
  // poseEvacuation() ci-dessus. Ventouse : choix de Dorian du 10/11/2026,
  // concentrique sur poêle étanche admise, sortie murale simple refusée (la FAQ
  // MCZ vise celle-là, confirmé par Dorian), jamais avec Edilkamin ni EK63
  // (MARQUES_SANS_VENTOUSE, lib/estimate.ts).
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "evacuation-fumees-poele-pellets",
    title: "Évacuation d'un poêle à pellets : tubage, conduit en façade ou par l'intérieur ?",
    metaTitle: "Évacuation d'un poêle à pellets : tubage, conduit, ventouse",
    metaDescription:
      "Tubage, conduit double paroi en façade ou par l'intérieur, ventouse concentrique : ce qu'imposent les fabricants, les règles en Wallonie et le prix posé.",
    excerpt:
      "Sans une évacuation conforme, ni bon tirage ni garantie. Les solutions que nous posons, ce que demandent les notices MCZ, Edilkamin et Cadel, et ce que coûte chacune.",
    tldr:
      "Un poêle à pellets évacue ses fumées par un conduit qui débouche au-dessus du toit, ou par une ventouse concentrique s'il est étanche. Avec une cheminée existante, on la tube en inox ; sans cheminée, on pose un conduit isolé double paroi, le long de la façade ou à travers les étages, ou une ventouse concentrique. Une sortie murale simple, sans concentrique, n'est pas admise, et MCZ prévient qu'elle fait perdre la garantie. Edilkamin et EK63 refusent toute sortie murale, ventouse comprise. Le raccord doit être étanche : le poêle pousse ses fumées avec un ventilateur.",
    category: "installation",
    tags: ["évacuation", "tubage", "conduit double paroi", "ventouse", "installation"],
    readingTimeMinutes: 9,
    publishedAt: "2026-11-09",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens poseurs",
    coverImageAlt: "Conduit de fumée isolé double paroi fixé le long d'une façade, au-dessus du toit",
    sections: [
      {
        heading: "Pourquoi l'évacuation compte autant que le poêle",
        paragraphs: [
          "Un poêle à pellets n'attend pas que la cheminée tire. Un ventilateur extrait les fumées du foyer et les pousse dans le raccord : Cadel parle d'appareil à tirage forcé. Le raccord travaille donc en pression, et il doit être étanche aux fumées comme aux condensats. MCZ et Cadel conseillent des tubes à joint, du type T200 P1.",
          "La notice du fabricant fixe le reste : diamètre, longueurs, coudes, débouché. Une évacuation qui s'en écarte tire mal, encrasse le poêle et met la garantie en jeu. C'est pour ça que nous la choisissons en même temps que l'appareil.",
        ],
      },
      {
        heading: "Les règles des notices, en clair",
        list: {
          items: [
            "Un diamètre constant, au moins égal à celui de la buse du poêle (MCZ).",
            "Peu d'horizontal : 3 m au plus chez Edilkamin, 4 m avec une pente d'au moins 3 % chez MCZ et Cadel.",
            "Trois changements de direction à 90° au maximum, chez les trois fabricants.",
            "Un tronçon vertical d'au moins 1,5 m (Edilkamin ; Cadel en Ø 80), 2 m chez Cadel en Ø 100.",
            "Au pied du conduit, un té avec une chambre visitable qui recueille la suie et les condensats.",
            "Pas de flexible aluminium ni de fibrociment pour le raccord (MCZ).",
            "Un débouché au-dessus du toit, hors de la zone de reflux, ou une ventouse concentrique si le poêle est étanche et que sa notice la prévoit (jamais chez Edilkamin).",
          ],
        },
        callout: {
          variant: "info",
          text: "Lire le marquage d'un conduit : dans « T200 P1 W V2 L50040 O20 », P1 veut dire étanche en pression jusqu'à 200 Pa (N1 : seulement en dépression), W accepte les condensats, O20 indique un conduit non résistant au feu de cheminée à garder à 20 mm des matériaux combustibles. Un G à la place du O signale un conduit qui résiste au feu de cheminée.",
        },
      },
      {
        heading: "La ventouse en façade : concentrique, ou rien",
        paragraphs: [
          "Une ventouse, c'est une sortie horizontale à travers le mur : les fumées débouchent en façade sans monter jusqu'au toit. Sur un poêle à pellets, elle n'est admise qu'en concentrique, avec un poêle étanche et le kit prévu par son fabricant : les fumées sortent par le tube central, l'air de combustion entre par l'anneau qui l'entoure.",
          "Une sortie murale simple, un tube de fumée seul à travers le mur, n'est pas admise. MCZ et Cadel interdisent toute évacuation dirigée vers un mur. Dans sa foire aux questions belge, MCZ juge une sortie de fumée murale « absolument déconseillée », et les fabricants font tomber la garantie des poêles installés ainsi.",
          "Edilkamin va plus loin : ses notices interdisent l'évacuation murale directe, modèles étanches compris. Avec un Edilkamin ou un EK63, pas de ventouse, même concentrique : le conduit monte au-dessus du toit.",
          "En France, la sortie en façade existe sous avis technique, avec des distances précises aux fenêtres, au sol et aux voisins. Aucun texte belge public ne l'organise : l'emplacement du terminal suit la notice du poêle, et nous le validons à la visite technique. Si la façade ne s'y prête pas, on passe au conduit.",
          "Un poêle étanche garde tout son intérêt dans une maison très isolée : il prend son air dehors, par une arrivée d'air dédiée ou par un conduit concentrique, et ne dépend pas de la ventilation de la maison. C'est aussi lui qui ouvre la porte à la ventouse.",
        ],
      },
      {
        heading: "Vous avez une cheminée : on la tube",
        paragraphs: [
          "Un ancien conduit maçonné ne reçoit pas un poêle à pellets tel quel. On y descend un tubage inox au diamètre du poêle, sur toute la hauteur. Poujoulat conseille un tubage rigide dans un conduit droit et un flexible double peau dans un conduit dévoyé. Pour un poêle étanche, le raccord se fait en concentrique jusqu'au plafond, puis le flexible prend le relais : l'air de combustion descend par l'espace resté libre autour.",
          "Avant de tuber, le conduit se ramone et se contrôle. Cadel demande de le faire vérifier par un ramoneur, et Edilkamin exige qu'un conduit qui n'est pas neuf soit nettoyé. Si votre cheminée est déjà tubée en inox et en bon état, il n'y a qu'à raccorder le poêle.",
          "Le cas de la cheminée ouverte transformée en insert est détaillé dans notre article sur l'insert à pellets.",
        ],
      },
      {
        heading: "Pas de cheminée : un conduit isolé le long de la façade",
        paragraphs: [
          "Le conduit traverse le mur derrière le poêle, puis monte contre la façade jusqu'au-dessus du toit. C'est un conduit double paroi isolé : un tube inox pour les fumées, une couche d'isolant, une paroi extérieure. L'isolant garde les fumées chaudes, ce qui aide le tirage et limite la condensation.",
          "En Wallonie, le placement d'un conduit de cheminée est dispensé de permis d'urbanisme par le CoDT (article R.IV.1-1, rubrique A.11). Deux réserves : si votre bien est soumis au guide régional d'urbanisme pour les zones protégées ou les bâtisses en site rural, le conduit doit le respecter ; et un bien en zone de protection ou repris à l'inventaire du patrimoine sort de la dispense. Le Code civil continue de s'appliquer, mitoyenneté et vues comprises : un conduit sur un mur mitoyen se discute avec le voisin.",
        ],
      },
      {
        heading: "Pas de cheminée : un conduit par l'intérieur",
        paragraphs: [
          "Le conduit double paroi monte dans la maison, traverse le plancher de l'étage et la toiture. Il reste à l'abri du froid et ne se voit pas de la rue, mais il demande deux percements renforcés et un passage libre à chaque étage, souvent dans un placard ou un coin de chambre.",
          "À chaque traversée, la distance aux matériaux combustibles est celle du marquage du conduit (le chiffre qui suit G ou O), et les pièces de traversée sont prévues pour. Le passage se vérifie à la visite, solive par solive.",
        ],
      },
      {
        heading: "Ce que coûte chaque solution chez nous",
        paragraphs: [
          `Ces montants sortent du même calcul que notre estimation en ligne, pour 10 m de conduit${REMISE_POSE_EN_COURS ? ", remises en cours comprises" : ""}. Le tubage et le conduit double paroi sont ensuite ajustés au mètre réel ; la ventouse est au forfait. Au-delà de ${HAUTEUR.seuilAcces} m, il faut une nacelle (${formatEur(TARIFS.options.nacelle)} HTVA la journée) ou un échafaudage, chiffré sur devis.`,
        ],
        table: {
          headers: ["Évacuation", "Pose et raccordement HTVA", "TVAC à 6 %"],
          rows: [
            ["Cheminée déjà tubée, à raccorder", ...poseEvacuation("conduit-existant")],
            ["Tubage d'une cheminée existante, 10 m", ...poseEvacuation("tubage")],
            ["Conduit double paroi en façade, 10 m", ...poseEvacuation("conduit-exterieur")],
            ["Conduit double paroi par l'intérieur, 10 m, deux percements compris", ...poseEvacuation("conduit-toiture")],
            ["Ventouse concentrique, poêle étanche (hors Edilkamin et EK63)", ...poseEvacuation("ventouse-facade")],
          ],
          caption:
            "Hors poêle. TVA à 6 % pour un logement de plus de 10 ans, sinon 21 %. Le prix ferme suit la visite technique.",
        },
      },
      {
        heading: "Ce que nous vérifions à la visite technique",
        list: {
          items: [
            "La cheminée existante : état, section, aucun autre appareil raccordé, accès pour le ramonage.",
            "La hauteur jusqu'au faîte et le débouché, selon la pente et la couverture du toit.",
            "Le passage du mur ou des planchers, et les distances aux matériaux combustibles.",
            "Pour une ventouse : un poêle étanche, et la place du terminal en façade, loin des fenêtres, du sol et des voisins.",
            "La ventilation de la maison : VMC, hotte, autre appareil à combustion, qui décident d'un poêle étanche.",
            "La place du poêle par rapport au conduit, qui fixe la sortie arrière ou dessus et le nombre de coudes.",
          ],
        },
        paragraphs: [
          "Vous pouvez chiffrer votre cas en deux minutes avec l'estimation en ligne, puis réserver la visite technique gratuite : le prix ferme vient après.",
        ],
      },
    ],
    faqs: [
      {
        question: "Peut-on installer un poêle à pellets sans conduit de fumée ?",
        answer:
          "Oui, avec une ventouse concentrique, si le poêle est étanche et que sa notice la prévoit : les fumées sortent par le tube central, l'air de combustion entre autour. Une sortie murale simple n'est pas admise, et MCZ écrit que les fabricants font alors tomber la garantie. Edilkamin et EK63 refusent toute sortie murale. Sinon, on pose un conduit double paroi isolé qui monte au-dessus du toit, en façade ou par l'intérieur.",
      },
      {
        question: "Tubage ou conduit double paroi, quelle différence ?",
        answer:
          "Le tubage est un tube inox descendu dans une cheminée existante, qui lui sert d'enveloppe. Le conduit double paroi remplace la cheminée qui n'existe pas : il a sa propre isolation et sa paroi extérieure. Le tubage revient moins cher quand la cheminée est saine.",
      },
      {
        question: "Faut-il un permis pour un conduit en façade en Wallonie ?",
        answer:
          "En général non : le CoDT dispense de permis le placement d'un conduit de cheminée (article R.IV.1-1, rubrique A.11). Exceptions : un bien en zone de protection ou repris à l'inventaire du patrimoine, ou un conduit contraire au guide régional d'urbanisme dans les zones où il s'applique. Renseignez-vous auprès de votre commune en cas de doute.",
      },
      {
        question: "Ma cheminée est déjà tubée, faut-il refaire le tubage ?",
        answer:
          "Pas forcément. Si le tubage est en inox, au bon diamètre, en bon état et adapté aux pellets, on raccorde simplement le poêle après un ramonage. Nous le vérifions à la visite technique.",
      },
    ],
    related: {
      articles: ["insert-pellets-cheminee-existante", "ek63-etanche-maison-passive-bbc"],
      guides: ["guide-achat-poele-pellets-wallonie", "comment-entretenir-poele-pellets"],
      cities: ["namur", "liege", "charleroi", "fernelmont"],
      brands: ["mcz", "edilkamin", "cadel"],
    },
  },
  // ───────────────────────────────────────────────────────────────────
  // ACTUALITÉ : arrivée de MCZ (30/10/2026)
  // Sources : mcz.it/fr-be (fiches produits et données techniques,
  // technologies Core, Maestro+ et 365, collection Easy), mcz.it/fr
  // (communiqués iF Design Award et Red Dot Award 2026), mcz.it/it/career,
  // mczgroup.it/fr/le-groupe-mcz, catalogue MCZ pellet 2026 ; valeurs reprises
  // sur les fiches produit.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "mcz-arrive-chez-mister-pellets",
    title: "MCZ arrive chez Mister Pellets : toute la gamme pellets posée en Wallonie",
    metaTitle: "MCZ arrive : poêles à pellets Core, canalisables et hydro",
    metaDescription:
      "Depuis octobre 2026, Mister Pellets pose toute la gamme pellets MCZ en Wallonie : combustion Core, Wi-Fi Maestro+, canalisables Comfort Air, hydros, foyers et inserts. Ce qui change pour vous.",
    excerpt:
      "MCZ devient notre première marque : une centaine de versions de 6 à 24 kW, la combustion Core, le Wi-Fi de série et la canalisation Comfort Air. Posées par la même équipe, partout en Wallonie.",
    tldr:
      "Depuis octobre 2026, Mister Pellets distribue et pose toute la gamme pellets MCZ en Wallonie. MCZ, fabricant italien fondé en 1975 près de Pordenone, a lancé son premier poêle à pellets en 2002 et breveté sa canalisation Comfort Air en 2007. Sa gamme va du poêle de 6 kW pour une pièce bien isolée au foyer hydro de 24 kW, avec la combustion Core (55 % d'émissions en moins que les limites Ecodesign selon MCZ), le Wi-Fi et le Bluetooth de série sur la plupart des modèles et la canalisation Comfort Air jusqu'à 8 m. C'est désormais la marque qu'on propose en premier.",
    category: "actualite",
    tags: ["MCZ", "nouveautés", "marques", "combustion Core", "poêle canalisable", "poêle hydro"],
    readingTimeMinutes: 6,
    publishedAt: "2026-10-30",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers poêles à pellets",
    coverImageAlt: "Poêle à pellets MCZ installé dans un séjour",
    sections: [
      {
        heading: "Pourquoi MCZ, et pourquoi en premier ?",
        paragraphs: [
          "Sur le terrain, la question n'est jamais « quelle marque ? », c'est « quel poêle pour cette maison-là ? ». Une pièce de vie ouverte, un couloir d'un mètre, deux chambres à chauffer à l'étage, une vieille cheminée, des radiateurs à alimenter : il faut un modèle qui colle, pas un modèle qu'on force. MCZ est la marque qui a le plus de réponses, avec une centaine de versions en pellets.",
          // check-catalogue: allow (histoire du fabricant)
          "MCZ a été fondée en 1975 par la famille Zanette à Vigonovo di Fontanafredda, près de Pordenone, dans le nord-est de l'Italie, où se trouvent toujours le siège et l'usine. Foyers en 1982, poêles à bois en 1998, premier poêle à pellets, l'Antares, en 2002, premier poêle à pellets piloté par smartphone en 2014. Le groupe possède aussi Cadel, une marque qu'on pose depuis le début du mois. Edilkamin, EK63, Girolami, Austroflamm et Cadel restent au catalogue : MCZ passe simplement devant.",
        ],
      },
      {
        heading: "Ce que MCZ fait mieux",
        list: {
          items: [
            "La combustion Core : une combustion par gazéification qui, selon MCZ, rejette 55 % d'émissions en moins que les limites européennes Ecodesign et économise jusqu'à 15 % de pellets. Le brasero se nettoie seul et le foyer se nettoie une fois par semaine.",
            "Le pilotage Maestro+ : Wi-Fi et Bluetooth de série, appli pour allumer, programmer et suivre la consommation, panneau numérique sur le poêle et mise à jour du logiciel à distance. La télécommande Freestanding avec thermostat est en option.",
            "La canalisation Comfort Air, brevetée par MCZ : l'air chaud part par des gaines jusqu'à 8 m, avec une sortie jusqu'à 80 °C, et les diffuseurs peuvent se poser bas sur le mur.",
            "Moins d'entretien sur toute la gamme : brasero autonettoyant sur les versions Core et Matic, technologie SmartClean sur les nouveaux Teia (7 à 10 jours sans aspirer les cendres) et sur le foyer Vivo 90 Hydro SmartClean (un nettoyage par semaine).",
            "La ligne Easy pour les budgets serrés : dessus, porte ou brasero en fonte selon les modèles, commandes simples, Wi-Fi par kit en option.",
          ],
        },
      },
      {
        heading: "La gamme MCZ en un coup d'œil",
        paragraphs: [
          "Toutes les versions sont dans la boutique, filtrables par marque, type et puissance. Les versions R ont la sortie des fumées à l'arrière, les UP et XUP par le haut, ce qui permet de coller le poêle au mur. Quelques exemples selon le besoin :",
        ],
        table: {
          headers: ["Besoin", "Modèle MCZ", "Pourquoi"],
          rows: [
            ["Séjour, poêle à air polyvalent", "Ego Air 8 R", "8,1 kW, étanche, Wi-Fi de série, couvercle et brasero en fonte"],
            ["Couloir ou petite pièce", "Alea Air 7 R", "27,5 cm de profondeur pour 6,2 kW, ligne Easy"],
            ["Maison bien isolée, silence", "Eiko Natural Matic 6 Core R", "Convection naturelle, pas de ventilateur dans la pièce, 40,5 cm de profondeur"],
            ["Chauffer deux pièces de plus", "Feel Comfort Air Matic 12 Core R", "12 kW, deux gaines à l'arrière, finitions grès"],
            ["Radiateurs ou plancher chauffant", "Musa Hydro Matic 18 R", "13,2 kW cédés à l'eau, classe A++"],
            ["Cheminée existante", "Qbox 70 Air 8", "Insert de 7,8 kW, chambre de combustion en fonte"],
            ["Chaud l'hiver, frais l'été", "Eiko 365 R", "6 kW aux pellets et 2,6 kW de rafraîchissement, sans unité extérieure"],
          ],
          caption: "Valeurs des fiches techniques du site belge MCZ et du catalogue MCZ pellet 2026, reprises sur nos fiches produit.",
        },
      },
      {
        heading: "Eiko 365 : le poêle qui rafraîchit aussi",
        paragraphs: [
          "C'est la nouveauté dont on nous parle le plus. L'Eiko 365 chauffe aux pellets l'hiver, avec la combustion Core, et rafraîchit l'été grâce à un module air-air de 9 000 BTU/h intégré. Pas d'unité extérieure, pas d'évacuation des condensats : un seul trou dans le mur en plus du conduit de fumée. Il a reçu l'iF Design Award puis le Red Dot Award en 2026.",
          "MCZ le destine aux espaces jusqu'à 50 m² environ. On regarde avec vous si votre pièce et votre conduit s'y prêtent lors de la visite technique.",
        ],
      },
      {
        heading: "Ce qui change pour vous",
        list: {
          items: [
            "Une centaine de modèles MCZ en plus dans la boutique, avec leurs caractéristiques, leurs finitions et les photos du fabricant.",
            "Même parcours qu'avec nos autres marques : visite technique, devis sous 48 heures, pose en une journée dans la plupart des cas, TVA à 6 % sur les logements de plus de 10 ans.",
            "Même équipe et même SAV : [notre équipe de Fernelmont](/a-propos) pose, met en service, fait l'entretien annuel et intervient sous 48 à 72 h dans notre zone.",
            "Bonus de saison jusqu'au 24 décembre 2026 : -10 % sur le prix des poêles MCZ dès qu'il est affiché, pose au tarif normal.",
          ],
        },
        callout: {
          variant: "info",
          text: "Les prix des modèles MCZ arrivent sur les fiches au fil des jours. En attendant, on vous chiffre le poêle et la pose sur devis, sous 48 heures.",
        },
      },
      {
        heading: "MCZ, Cadel ou Edilkamin : comment choisir ?",
        paragraphs: [
          "Prenez MCZ si vous voulez le modèle exact qui colle à votre maison, avec la combustion la plus propre et le pilotage depuis le téléphone. Cadel, du même groupe, reste intéressant pour un poêle connecté à prix doux, surtout en format plat. Edilkamin garde ses fidèles et sa longue histoire.",
          "Dans tous les cas, on compare deux ou trois modèles de marques différentes lors de la visite, sur votre maison, votre conduit et votre budget.",
        ],
      },
    ],
    faqs: [
      {
        question: "MCZ, c'est une marque italienne ?",
        answer: "Oui. MCZ est la marque phare du groupe MCZ, installé à Vigonovo di Fontanafredda, près de Pordenone, dans le nord-est de l'Italie. Le groupe possède aussi Cadel.",
      },
      {
        question: "Tous les poêles MCZ ont-ils le Wi-Fi ?",
        answer: "Les modèles Maestro+, c'est-à-dire la plupart de la gamme, ont le Wi-Fi et le Bluetooth de série. Les poêles de la ligne Easy (Alea, Ghea, Hera, May, Mida, Raam, Rock, Teia, Clio, Thea) se pilotent avec leur panneau, et depuis le téléphone avec le kit Wi-Fi en option.",
      },
      {
        question: "Un poêle MCZ demande-t-il beaucoup d'entretien ?",
        answer: "Moins qu'un poêle classique sur les versions Core et Matic : le brasero se nettoie seul et le foyer se nettoie une fois par semaine. Sur les Teia SmartClean, MCZ annonce 7 à 10 jours sans aspirer les cendres. L'entretien annuel par un technicien reste obligatoire : on s'en charge.",
      },
      {
        question: "Vous posez MCZ dans toute la Wallonie ?",
        answer: "Oui, dans les cinq provinces wallonnes, avec la même équipe et le même SAV que pour nos autres marques. Livraison gratuite dans un rayon de 20 km autour de Fernelmont.",
      },
    ],
    related: {
      articles: ["austroflamm-cadel-nouvelles-marques-mister-pellets", "edilkamin-ek63-girolami-quelle-marque-choisir"],
      brands: ["mcz", "cadel", "edilkamin"],
      cities: ["namur", "charleroi", "liege"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // ACTUALITÉ : arrivée d'Austroflamm et de Cadel (18/10/2026)
  // Sources : austroflamm.com et cadelsrl.com (pages entreprise, catalogues
  // 2026, notices, FAQ), registre autrichien, communiqués Cadel 2023 et iF
  // 2026, fiches techniques reprises sur les 77 fiches produit du site.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "austroflamm-cadel-nouvelles-marques-mister-pellets",
    title: "Austroflamm et Cadel arrivent chez Mister Pellets",
    metaTitle: "Austroflamm et Cadel : deux nouvelles marques de poêles",
    metaDescription:
      "Depuis octobre 2026, Mister Pellets pose Austroflamm (Autriche, haut de gamme, pellets sans ventilateur dans la pièce et mixtes Duo) et Cadel (Italie, groupe MCZ, Wi-Fi intégré). Ce qui change pour vous.",
    excerpt:
      "Deux marques rejoignent Edilkamin, EK63 et Girolami : Austroflamm pour le haut de gamme silencieux, Cadel pour le connecté à prix doux. 77 modèles en plus dans la boutique, posés par la même équipe.",
    tldr:
      "Depuis octobre 2026, Mister Pellets distribue et pose deux nouvelles marques en Wallonie. Austroflamm, entreprise familiale autrichienne fondée en 1983, apporte des poêles à pellets qui chauffent sans ventilateur dans la pièce et des poêles mixtes bois-pellets Duo : 11 modèles de 6 à 10 kW. Cadel, fabricant italien de poêles depuis plus de soixante ans et membre du groupe MCZ depuis 2013, apporte 66 modèles à pellets, Wi-Fi et Bluetooth intégrés, du poêle plat de 27 cm au thermopoêle hydro de 24,7 kW. Austroflamm se place à côté d'Edilkamin dans le haut de gamme, Cadel à côté d'EK63 dans le connecté accessible.",
    category: "actualite",
    tags: ["Austroflamm", "Cadel", "nouveautés", "marques", "poêle mixte", "poêle connecté"],
    readingTimeMinutes: 6,
    publishedAt: "2026-10-18",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers poêles à pellets",
    coverImageAlt: "Poêle à pellets installé dans un séjour",
    sections: [
      {
        heading: "Pourquoi deux marques de plus ?",
        paragraphs: [
          "Avec Edilkamin, EK63 et Girolami, on couvrait l'essentiel des projets wallons. Il restait deux demandes auxquelles on répondait mal. D'un côté, des clients qui voulaient un poêle à pellets vraiment silencieux, beau, et parfois capable de brûler aussi des bûches. De l'autre, des maisons où la place manque : un couloir, un hall, une petite pièce, avec un budget serré mais l'envie de piloter le poêle depuis le téléphone.",
          "Austroflamm répond à la première, Cadel à la seconde. Les deux marques ont un point commun avec celles qu'on posait déjà : elles se vendent par des revendeurs spécialisés qui installent et mettent en service, et leur garantie suppose une pose par un professionnel. C'est notre métier.",
        ],
      },
      {
        heading: "Austroflamm : le haut de gamme autrichien",
        paragraphs: [
          "Austroflamm est une entreprise familiale fondée en 1983 par Ferdinand Huemer, qui la dirige toujours, à Krenglbach en Haute-Autriche. Son premier poêle à pellets date de 1995. Les poêles sont dessinés par Cesare Monti, un designer italien qui travaille exclusivement pour la marque, et le foyer est garni de Keramott, un matériau breveté développé et produit par Austroflamm.",
          "Ce qui la distingue sur les pellets, c'est l'absence de ventilateur d'air ambiant. Les Clou Pellet, Clou Compact Pellet, Ella, Perry et Ruby 2.0 chauffent par convection naturelle : pas de souffle, pas de bruit de soufflerie dans le séjour. Ils prennent tous l'air de combustion dehors grâce à un raccord d'air extérieur de série, et annoncent de 87 à 90 % de rendement en classe A+.",
          "L'autre famille, ce sont les poêles mixtes Duo : Clou Duo, Mo Duo, Mo Duo Cook, Quadra Duo et Scotty Duo. Vous chargez des bûches, le poêle le détecte et règle l'air ; quand le bois a fini de brûler, il redémarre de lui-même aux pellets. Au bois, il chauffe aussi pendant une coupure de courant. Le Mo Duo Cook a en plus une plaque de cuisson sur le dessus.",
        ],
        table: {
          headers: ["Modèle", "Type", "Puissance pellets", "À retenir"],
          rows: [
            ["Clou Compact Pellet", "Pellets", "6 kW", "52 cm de large, 49,9 cm de profondeur"],
            ["Clou Pellet 8 / 10", "Pellets", "8 ou 10 kW", "Réservoir de 36 kg, jusqu'à 60 h d'autonomie"],
            ["Ruby 2.0", "Pellets", "8 kW", "Porte arrondie en fonte, canalisable avec kit"],
            ["Clou Duo", "Mixte bois-pellets", "7 kW", "43 cm de profondeur"],
            ["Mo Duo Cook", "Mixte bois-pellets", "9,4 kW", "Plaque de cuisson de série"],
            ["Quadra Duo", "Mixte bois-pellets", "8,3 kW", "Acier ou pierre naturelle, 41 cm de profondeur"],
          ],
          caption: "Valeurs des fiches techniques et déclarations de performances Austroflamm. Les 11 modèles sont dans la boutique.",
        },
      },
      {
        heading: "Cadel : le connecté accessible du groupe MCZ",
        paragraphs: [
          "Cadel fabrique des poêles depuis plus de soixante ans à Santa Lucia di Piave, près de Trévise. Depuis 2013, la marque fait partie du groupe MCZ, dont [nous posons aussi toute la gamme pellets depuis octobre 2026](/blog/mcz-arrive-chez-mister-pellets). Le parallèle avec EK63, marque du groupe Edilkamin, est le bon : des poêles modernes, connectés, à un prix plus doux que la marque phare du groupe. Les poêles sortent d'une usine inaugurée en 2023 sur la même commune, certifiée ISO 9001 depuis 2006, où la tôle est découpée, soudée, peinte et assemblée.",
          "Les poêles à pellets Cadel se pilotent depuis le téléphone avec l'appli gratuite Easy Connect Plus, en Wi-Fi ou en Bluetooth. Sur les modèles récents, le brasero Autoclean se vide à chaque allumage : le nettoyage passe de tous les jours à une fois par semaine, voire moins, selon Cadel. Presque toute la gamme a une chambre de combustion étanche, et elle est en classe A+ (A++ pour une partie des hydros).",
          "La gamme est très large : poêles plats de 27 à 33 cm de profondeur (Grace, Spirit, Baggy, Luce, Elle, Vesta), canalisables à une ou deux sorties (gamme Plus), inserts pour cheminée ouverte (Ponente, Zefiro), thermopoêles et inserts hydro pour les radiateurs (Maya Idro, River Idro, Saturno). En 2026, le Spin Plus 9 a reçu un iF Design Award.",
        ],
        table: {
          headers: ["Besoin", "Modèle Cadel", "Pourquoi"],
          rows: [
            ["Couloir ou petite pièce", "Grace 7", "27 cm de profondeur, fixation murale possible"],
            ["Chauffer deux pièces de plus", "Vesta Plus 11 Autoclean", "Deux sorties d'air chaud, 33 cm de profondeur"],
            ["Séjour, budget maîtrisé", "Cristal Plus 9", "Porte en fonte, une sortie canalisée, 90 % de rendement"],
            ["Cheminée ouverte existante", "Zefiro 9", "Insert à pellets, canalisable avec kit"],
            ["Radiateurs ou plancher chauffant", "River Idro 18 Autoclean", "13,2 kW cédés à l'eau, classe A++"],
          ],
          caption: "Exemples tirés des 66 modèles Cadel de la boutique, valeurs des fiches techniques Cadel 2026.",
        },
      },
      {
        heading: "Ce qui change pour vous",
        list: {
          items: [
            "77 modèles en plus dans la boutique, avec leurs caractéristiques et photos officielles, filtrables par marque.",
            "Même parcours qu'avec nos autres marques : visite technique, devis sous 48 heures, pose en une journée dans la plupart des cas, TVA à 6 % sur les logements de plus de 10 ans.",
            "Bonus de saison jusqu'au 24 décembre 2026 : -10 % sur le prix des poêles Austroflamm et Cadel, comme sur MCZ (-15 % sur Edilkamin, EK63 et Girolami), pose au tarif normal.",
            "Garantie : 2 ans chez Cadel ; chez Austroflamm, les conditions de l'importateur belge, remises par écrit avec le devis. Dans les deux cas, l'entretien annuel est à faire : on s'en charge.",
          ],
        },
        callout: {
          variant: "info",
          text: "Les prix de certains modèles arrivent sur les fiches au fil des jours. En attendant, on vous chiffre le poêle et la pose sur devis, sous 48 heures.",
        },
      },
      {
        heading: "Austroflamm ou Cadel : comment choisir ?",
        paragraphs: [
          "Prenez Austroflamm si le silence et la finition comptent plus que tout, ou si vous voulez profiter d'un vrai feu de bois sans renoncer à l'automatisme des pellets. Prenez Cadel si vous cherchez le bon rapport entre prix, connectivité et format, en particulier pour une pièce étroite, plusieurs pièces à chauffer ou des radiateurs à alimenter.",
          "Et si vous hésitez avec Edilkamin, EK63 ou Girolami, c'est normal : on compare toujours deux ou trois modèles de marques différentes lors de la visite, sur votre maison, votre conduit et votre budget.",
        ],
      },
    ],
    faqs: [
      {
        question: "Les poêles Austroflamm sans ventilateur dans la pièce chauffent-ils assez ?",
        // check-catalogue: allow (comparaison)
        answer: "Oui, la chaleur se diffuse par convection naturelle et par rayonnement, comme avec un poêle à bois. La pièce monte un peu moins vite en température qu'avec un poêle ventilé, mais sans bruit de soufflerie. Pour plusieurs pièces, on regarde un modèle canalisable avec kit, comme le Ruby 2.0 ou un Duo.",
      },
      {
        question: "Un Cadel a-t-il le Wi-Fi de série ?",
        answer: "Cadel annonce le Wi-Fi et le Bluetooth intégrés sur ses poêles à pellets, avec l'appli gratuite Easy Connect Plus. Sur quelques modèles d'entrée de gamme, la fiche du fabricant parle de Wi-Fi à prévoir : on vous le confirme au devis.",
      },
      {
        question: "Le bonus de saison s'applique-t-il aux nouvelles marques ?",
        answer: "Oui, à -10 % sur le prix du poêle pour Austroflamm et Cadel, comme pour MCZ, jusqu'au 24 décembre 2026. Le bonus ne porte pas sur la pose, qui suit ses propres tarifs. Edilkamin, EK63 et Girolami restent à -15 %.",
      },
      {
        question: "Vous posez Austroflamm et Cadel dans toute la Wallonie ?",
        answer: "Oui, dans les cinq provinces wallonnes, avec la même équipe et le même SAV que pour nos autres marques. Livraison gratuite dans un rayon de 20 km autour de Fernelmont.",
      },
    ],
    related: {
      articles: ["edilkamin-ek63-girolami-quelle-marque-choisir", "ek63-entity-90-poele-31-cm-couloir"],
      brands: ["austroflamm", "cadel"],
      cities: ["namur", "charleroi", "liege"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // SAISON 2026-2027 : budget d'un hiver au pellet (ajouté le 03/10/2026)
  // Prix : ValBiom (pellets, août 2026) et SPF Économie (mazout, tarif
  // n° 2026/191 du 03/10/2026). À actualiser à chaque saison.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "budget-hiver-poele-pellets-consommation-2026",
    title: "Combien coûte un hiver au pellet ? Le calcul pour 2026-2027",
    metaTitle: "Poêle à pellets : combien de sacs pour l'hiver 2026-2027 ?",
    metaDescription:
      "Combien de pellets pour un hiver, ce que ça coûte en 2026 et comment le calculer chez vous à partir de votre ancienne facture. Prix ValBiom et SPF Économie.",
    excerpt:
      "Un sac de 15 kg coûte autour de 6 € en Wallonie. La vraie question, c'est combien de sacs votre maison va avaler entre octobre et avril. Voici comment le calculer sans vous tromper.",
    tldr:
      "Pour un poêle de 10 kW qui chauffe la maison tout l'hiver, comptez 1,5 à 2 tonnes de pellets, soit 100 à 135 sacs de 15 kg. Au prix moyen relevé par ValBiom en août 2026, 6,19 € le sac acheté par palette, la saison revient à 620 à 830 €. En appoint, plutôt 600 à 900 kg. Le calcul tient en un chiffre : un kilo de pellet certifié livre au moins 4,6 kWh, et votre poêle en restitue environ 90 %.",
    category: "pellets",
    tags: ["consommation", "prix des pellets", "budget chauffage", "mazout", "hiver 2026-2027"],
    readingTimeMinutes: 7,
    publishedAt: "2026-10-03",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers combustible",
    coverImageAlt: "Palette de sacs de pellets de 15 kg stockée au sec pour l'hiver",
    sections: [
      {
        heading: "Ce qu'un kilo de pellet vous donne vraiment",
        paragraphs: [
          "Un pellet certifié ENplus A1 ou DINplus contient au moins 4,6 kWh par kilo. Votre poêle n'en restitue pas tout : les modèles que nous posons annoncent entre 85 et 96 % de rendement. Pour un calcul simple sur une saison entière, avec les allumages et les régimes bas, on retient 90 %. Un kilo de pellet, c'est donc un peu plus de 4 kWh de chaleur dans la maison.",
          "À pleine puissance, un poêle de 8 kW brûle un peu moins de 2 kilos par heure : Edilkamin annonce de 0,7 à 1,9 kg/h pour son insert Pellkamin 8 Evo, du minimum au maximum. Mais un poêle bien dimensionné passe l'essentiel de l'hiver à mi-régime, et c'est là que se joue votre consommation.",
        ],
      },
      {
        heading: "Trois profils, trois budgets",
        paragraphs: [
          "Voici les fourchettes qu'on donne en rendez-vous, chiffrées au prix moyen relevé par ValBiom en août 2026.",
        ],
        table: {
          headers: ["Votre usage", "Pellets par saison", "Sacs de 15 kg", "Budget"],
          rows: [
            ["Appoint le soir et le week-end, poêle de 7 à 9 kW", "600 à 900 kg", "40 à 60", "250 à 370 €"],
            ["Chauffage principal, maison de 120 m² en PEB B ou C, poêle de 10 kW", "1,5 à 2 tonnes", "100 à 135", "620 à 830 €"],
            ["Poêle hydro qui remplace une chaudière, maison de 150 à 180 m²", "3 à 4 tonnes", "200 à 270", "1 240 à 1 650 €"],
          ],
          caption: "Prix moyen ValBiom d'août 2026 en Wallonie : 6,19 € le sac de 15 kg, pellets certifiés achetés par palette, livraison non comprise. Fourchettes indicatives : l'isolation et le thermostat font la différence.",
        },
      },
      {
        heading: "Faire le calcul chez vous, à partir de l'ancienne facture",
        paragraphs: [
          "Le plus fiable, c'est de partir de ce que la maison consommait déjà. Un litre de mazout contient environ 10 kWh. Si votre vieille chaudière en rendait 80 % sur la saison, chaque litre devenait 8 kWh de chaleur. Un kilo de pellet en donne un peu plus de 4 dans le poêle : un litre de mazout remplacé, c'est donc à peu près 1,9 kg de pellets.",
          "Une maison qui brûlait 1 500 litres par an demandera autour de 2,8 tonnes de pellets, à condition que le poêle chauffe toute la maison, ce qui suppose un hydro raccordé aux radiateurs. Un poêle à air dans le séjour n'en remplace qu'une partie : la chaudière continue de chauffer les chambres, et le calcul porte sur la part de chaleur que le poêle reprend.",
          "Au gaz ou à l'électricité, le principe ne change pas : partez des kWh de chauffage de votre facture annuelle, puis divisez par ce que livre un kilo de pellet.",
        ],
      },
      {
        heading: "Le kWh de pellet face au mazout, début octobre 2026",
        paragraphs: [
          "Au prix ValBiom d'août, 6,19 € le sac, un kilo de pellets coûte 41 centimes. À 4,6 kWh par kilo, le kWh revient à 9 centimes. Le mazout était à 1,53 € le litre au tarif maximum du SPF Économie du 3 octobre 2026, à partir de 2 000 litres commandés. À 10 kWh par litre, le kWh revient à 15 centimes. Pour le prix du poêle et de sa pose, voyez la page [prix d'un poêle à pellets posé](/prix-poele-pellets).",
          "À chaleur égale, le pellet coûte donc un peu moins de 60 % du mazout. Pour le gaz et l'électricité, regardez le prix du kWh sur votre propre facture : les contrats varient trop d'un ménage à l'autre pour qu'un chiffre unique veuille dire quelque chose.",
        ],
        callout: {
          variant: "info",
          text: "Le SPF Économie publie chaque jour ouvrable le prix maximum du mazout, et ValBiom publie chaque mois le prix moyen des pellets en Wallonie. Deux sources gratuites pour refaire le calcul quand les prix bougent. Nous reportons chaque relevé de ValBiom dans [notre suivi du prix des pellets, mois par mois](/blog/prix-pellets-belgique), avec le kWh face au mazout, au gaz et à l'électricité.",
        },
      },
      {
        heading: "Quand acheter, et comment ne pas gaspiller",
        paragraphs: [
          "Les prix suivent la saison. En 2025, ValBiom relevait 5,43 € le sac en juin et en juillet, puis 5,99 € en janvier 2026. Pour l'hiver qui vient, ValBiom n'attend pas de baisse. Si vous avez la place, une palette achetée maintenant reste un meilleur calcul que des sacs à l'unité en plein mois de janvier.",
          "Côté consommation, ce qui pèse le plus, c'est la consigne de température, puis la propreté du poêle. Un échangeur encrassé ou des pellets humides, et le poêle brûle plus pour chauffer moins. L'entretien annuel n'est pas qu'une affaire de garantie.",
        ],
        list: {
          items: [
            "Réglez la pièce de vie à 19 ou 20 °C : chaque degré au-dessus se paie tout l'hiver.",
            "Préférez un régime bas et continu à une série d'allumages : chaque démarrage sollicite la bougie et brûle des pellets avant de vraiment chauffer.",
            "Fermez les portes des pièces que le poêle n'est pas censé chauffer, sauf si c'est un canalisable.",
            "Stockez les sacs au sec : un pellet qui a pris l'humidité chauffe moins et encrasse plus.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: "Combien de sacs de pellets faut-il pour un hiver ?",
        answer:
          "Pour un poêle qui chauffe la maison tout l'hiver, 100 à 135 sacs de 15 kg, soit 1,5 à 2 tonnes. En appoint le soir et le week-end, 40 à 60 sacs suffisent souvent. L'isolation et la consigne de température font varier ces chiffres du simple au double.",
      },
      {
        question: "Combien consomme un poêle à pellets par heure ?",
        answer:
          "Un poêle de 8 kW brûle un peu moins de 2 kg par heure à pleine puissance, et moins d'un kilo au ralenti. Edilkamin annonce par exemple de 0,7 à 1,9 kg/h pour son insert Pellkamin 8 Evo.",
      },
      {
        question: "Le pellet est-il moins cher que le mazout en 2026 ?",
        answer:
          "Oui. Début octobre 2026, le kWh de pellet revenait à environ 9 centimes (6,19 € le sac de 15 kg, prix moyen ValBiom d'août), contre 15 centimes pour le mazout (1,53 € le litre au tarif maximum du SPF Économie, à partir de 2 000 litres).",
      },
      {
        question: "Faut-il acheter ses pellets maintenant ?",
        answer:
          "Si vous avez un endroit sec pour les stocker, oui. Les prix montent d'habitude entre l'été et janvier : en 2025, le sac est passé de 5,43 € en juin à 5,99 € en janvier, et ValBiom ne prévoit pas de baisse pour l'hiver 2026-2027.",
      },
    ],
    related: {
      articles: [
        "prix-pellets-belgique",
        "pellets-enplus-a1-vs-dinplus",
        "remplacer-chaudiere-mazout-poele-hydro",
      ],
      guides: ["remettre-en-route-poele-pellets-automne", "quelle-puissance-poele-pellets"],
      cities: ["namur", "charleroi", "liege"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // INSTALLATION : insert à pellets dans une cheminée ouverte (03/10/2026)
  // Fiches : EK63 Pellek 80 et 110+, Edilkamin Pellkamin 8, 10+ et 12++,
  // Girolami Grid (catalogue). Autonomie et chargement : edilkamin.com, ek-63.com.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "insert-pellets-cheminee-existante",
    title: "Transformer une cheminée ouverte en insert à pellets : ce qu'on vérifie avant de poser",
    metaTitle: "Insert à pellets dans une cheminée existante : le guide",
    metaDescription:
      "Votre feu ouvert chauffe surtout le conduit. Un insert à pellets récupère la cheminée : dimensions, tubage, électricité, réservoir, canalisation. Le point avant devis.",
    excerpt:
      "Un feu ouvert, c'est beau, et ça chauffe surtout le conduit. Un insert à pellets garde la cheminée et la rend utile tout l'hiver, à condition de vérifier quatre choses avant de commander.",
    tldr:
      "Un insert à pellets se glisse dans le foyer d'une cheminée ouverte et la transforme en chauffage programmable, avec 89 à 92 % de rendement sur les modèles que nous posons. Avant de commander, on vérifie quatre points : les dimensions du foyer, le conduit (un tubage de 80 ou 100 mm est presque toujours nécessaire), une prise électrique et la ventilation de la hotte. La contrepartie, c'est un petit réservoir, 11 kg sur les modèles compacts, qu'on remplit chaque jour en plein hiver.",
    category: "installation",
    tags: ["insert", "cheminée", "tubage", "Pellkamin", "Pellek"],
    readingTimeMinutes: 7,
    publishedAt: "2026-10-03",
    modifiedAt: "2026-11-11",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens pose et conduits",
    coverImageAlt: "Insert à pellets encastré dans une ancienne cheminée ouverte",
    sections: [
      {
        heading: "Pourquoi un feu ouvert chauffe si peu",
        paragraphs: [
          "Une cheminée ouverte aspire l'air chaud de la pièce pour nourrir sa flamme et en renvoie la plus grande part dans le conduit. Vous avez chaud au visage, froid dans le dos, et la maison se refroidit pendant que le feu brûle. C'est le charme du feu de bois, pas un chauffage.",
          "Un insert à pellets ferme le foyer et règle sa combustion. Les modèles que nous posons annoncent entre 89 et 92 % de rendement, et ils se programment comme un poêle : allumage à 6 h, extinction à 23 h, consigne de température, souvent depuis le smartphone.",
        ],
      },
      {
        heading: "Les quatre vérifications avant de commander",
        paragraphs: [
          "C'est ce qu'on regarde à la visite technique, dans cet ordre.",
        ],
        list: {
          ordered: true,
          items: [
            "Les dimensions du foyer. Un insert compact comme l'EK63 Pellek 80 ou l'Edilkamin Pellkamin 8 Evo mesure 73,5 cm de large pour 49 cm de haut et 49 cm de profondeur : le foyer doit offrir un peu plus, pour le glisser et le raccorder. Le Pellkamin 12++ Evo, plus puissant, monte à 93 cm de large. On mesure le foyer et la hotte, pas seulement l'ouverture.",
            "Le conduit. Un insert à pellets pousse ses fumées avec un ventilateur : le conduit travaille en légère pression et doit être étanche. Le vieux conduit maçonné d'une cheminée ouverte ne l'est presque jamais, d'où un tubage inox de 80 mm, ou de 100 mm selon la hauteur et le modèle, jusqu'en haut de la souche.",
            "L'électricité. Comme tout appareil à pellets, l'insert a besoin d'une prise 230 V pour sa bougie d'allumage, sa vis sans fin et ses ventilateurs. Pendant une coupure de courant, il s'arrête en sécurité.",
            "La hotte et l'air. L'espace autour de l'insert doit être ventilé comme le prévoit la notice, avec des grilles d'entrée et de sortie, sinon la chaleur reste piégée dans la maçonnerie au lieu de chauffer la pièce. Et le foyer doit recevoir son air de combustion.",
          ],
        },
      },
      {
        heading: "Le vrai défaut : un petit réservoir",
        paragraphs: [
          "C'est le point qu'on explique toujours avant de vendre un insert. Pour tenir dans un foyer, le réservoir est petit : 11 kg sur le Pellek 80 et sur le Pellkamin 8 Evo. Edilkamin annonce de 6 à 16 heures d'autonomie pour ce dernier, selon la puissance. En plein hiver, vous remplissez donc chaque jour.",
          "Le remplissage dépend de l'option choisie. Le Pellkamin 8 Evo se sort sur ses glissières pour être rempli, ou reçoit en option un tiroir de chargement frontal ou une trappe. EK63 propose aussi un tiroir frontal pour ses Pellek, qui permet de recharger l'insert allumé. Ça se décide à la commande, et ça change le quotidien.",
        ],
      },
      {
        heading: "Chauffer une deuxième pièce, ou brûler du bois",
        paragraphs: [
          "Certains inserts envoient une partie de l'air chaud vers une pièce voisine par une gaine : c'est le cas des Edilkamin Pellkamin 10+ et 12++ et de l'EK63 Pellek 110+. Pratique quand la cheminée est dans le séjour et qu'une chambre ou un bureau reste froid derrière le mur.",
          "Si vous tenez au feu de bois de temps en temps, Girolami fait des foyers hybrides qui acceptent les bûches et les pellets, comme la gamme Grid. Ils sont plus encombrants qu'un insert compact : on regarde ensemble si votre cheminée peut les accueillir.",
        ],
      },
      {
        heading: "Ce que coûte la transformation",
        paragraphs: [
          "Le prix se joue sur l'insert et sur le conduit. Notre forfait de pose avec tubage est calculé pour dix mètres de conduit, puis ajusté au mètre, en plus ou en moins. Dans un logement de plus de 10 ans, toute la facture est à 6 % de TVA quand nous fournissons et posons l'insert.",
          "Pour un chiffre précis, le configurateur en ligne compose l'ensemble en deux minutes : l'insert du catalogue, la pose, le tubage et la TVA. Le prix ferme vient après la visite technique, parce qu'on ne connaît vraiment un conduit qu'après l'avoir vu de près.",
        ],
        callout: {
          variant: "warning",
          text: "Un insert à bois et un insert à pellets ne se raccordent pas de la même façon. Si votre cheminée a déjà reçu un insert à bois, son conduit n'est pas forcément adapté au pellet : on le vérifie à la visite. Si vous préférez rester au bois bûche, les inserts à bois sont chez [Mister Bois](https://mister-bois.be/inserts-a-bois).",
        },
      },
    ],
    faqs: [
      {
        question: "Peut-on poser un insert à pellets dans n'importe quelle cheminée ?",
        answer:
          "Dans la plupart des cheminées ouvertes, oui, si le foyer est assez grand, si le conduit peut être tubé jusqu'en haut et si une prise électrique est accessible. Les cheminées très étroites ou au conduit dévoyé demandent plus de travail : la visite technique tranche.",
      },
      {
        question: "Faut-il obligatoirement tuber le conduit ?",
        answer:
          "Presque toujours. Un insert à pellets rejette ses fumées sous une légère pression, grâce à son ventilateur : le conduit doit être étanche. Un vieux conduit maçonné ne l'est pas, d'où le tubage inox de 80 ou 100 mm.",
      },
      {
        question: "Combien de temps tient le réservoir d'un insert ?",
        answer:
          "Sur les modèles compacts, 11 kg de pellets : de 6 heures à pleine puissance à 16 heures au ralenti, selon Edilkamin pour le Pellkamin 8 Evo. En plein hiver, on le remplit chaque jour.",
      },
      {
        question: "Un insert à pellets fonctionne-t-il sans électricité ?",
        answer:
          "Non. Bougie d'allumage, vis sans fin et ventilateurs ont besoin de courant. Pendant une coupure, l'insert s'arrête en sécurité. Au retour du courant, selon la marque, il se rallume seul ou reste éteint jusqu'à ce que vous le relanciez : la notice le précise. Le détail, marque par marque : [poêle à pellets et coupure de courant](/blog/poele-pellets-sans-electricite-coupure-courant).",
      },
    ],
    related: {
      articles: ["budget-hiver-poele-pellets-consommation-2026"],
      guides: ["guide-achat-poele-pellets-wallonie", "poele-pellets-canalisable"],
      brands: ["edilkamin", "ek63", "girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : comparatif des 3 marques top-tier (pilier maillage)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "edilkamin-ek63-girolami-quelle-marque-choisir",
    title: "Edilkamin, EK63, Girolami : quelle marque italienne choisir en 2026 ?",
    metaTitle: "Edilkamin, EK63 ou Girolami : quelle marque choisir ? (2026)",
    metaDescription:
      "Trois marques italiennes, trois usages. Edilkamin pour la durée, EK63 pour le connecté accessible, Girolami pour l'auto-nettoyage. Le comparatif Mister Pellets.",
    excerpt:
      "Les trois marques qu'on met en avant sont toutes italiennes, mais elles ne visent pas le même besoin. Voici comment trancher selon votre maison et votre budget.",
    tldr:
      "Edilkamin, EK63 et Girolami sont nos trois marques premium, toutes italiennes. Edilkamin, c'est la valeur sûre, celle qui tient 15 à 20 ans. EK63 vise le même sérieux en version connectée et étanche, mais autour de 15 à 25 % moins cher à puissance égale. Girolami fait autre chose : il brûle le pellet comme le bois, et son brasier se nettoie seul.",
    category: "marques",
    tags: ["Edilkamin", "EK63", "Girolami", "comparatif", "marques italiennes"],
    readingTimeMinutes: 8,
    publishedAt: "2026-05-15",
    modifiedAt: "2026-10-18",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Comparatif des poêles à pellets Edilkamin, EK63 et Girolami distribués par Mister Pellets",
    sections: [
      {
        heading: "Trois marques italiennes, trois philosophies",
        paragraphs: [
          "Ce comparatif porte sur nos trois marques italiennes historiques : Edilkamin, EK63 et Girolami. Depuis octobre 2026, Austroflamm et Cadel les ont rejointes, on les présente dans notre article sur leur arrivée. Le point commun, c'est l'Italie. Toutes les trois conçoivent leurs poêles en Italie, avec le savoir-faire biomasse qui va avec.",
          "Le reste change. Edilkamin, c'est la référence historique, fondée en 1963 et installée à Lainate, près de Milan. EK63 est sa marque sœur, lancée pour proposer du connecté moderne à un prix plus doux. Girolami est une marque familiale fondée près de Rome en 1970, avec un brevet maison d'alimentation par le bas qui change le quotidien d'entretien.",
          "Aucune n'est meilleure dans l'absolu. La bonne, c'est celle qui colle à votre maison et à votre budget.",
        ],
      },
      {
        heading: "Edilkamin : la valeur sûre qui dure 20 ans",
        paragraphs: [
          "Edilkamin a plus de 60 ans. Son usine historique est à Gabbioneta Binanuova, près de Crémone, sa recherche à Lavagno, près de Vérone, et le groupe produit aussi en Hongrie, à Sárvár. C'est la marque qu'on recommande quand le critère numéro un, c'est la longévité.",
          "Sa technologie Leonardo surveille en continu la combustion et l'adapte au conduit, à la météo et aux pellets. La combustion reste stable même quand vous changez de marque de sacs ou quand l'humidité varie. Sur le terrain, les Edilkamin qu'on a posés tiennent couramment 15 à 20 ans.",
          "Le revers, c'est le prix catalogue : Edilkamin est dans le haut de la fourchette. Mais ramené à [la durée de vie réelle d'un poêle Edilkamin](/blog/duree-de-vie-poele-edilkamin), le coût annuel reste bas, et le SAV pièces reste disponible longtemps après l'arrêt d'un modèle.",
        ],
      },
      {
        heading: "EK63 : le connecté accessible",
        paragraphs: [
          "EK63 est la marque sœur d'Edilkamin. Elle reprend la plateforme industrielle et le SAV du groupe, mais sous une marque pensée pour un prix d'attaque plus doux. À puissance équivalente, on est typiquement 15 à 25 % en dessous d'un Edilkamin.",
          "Deux atouts concrets. D'abord le Wi-Fi Smart, intégré de série sur la majorité des modèles, sans abonnement : vous programmez et vous allumez votre poêle depuis votre smartphone. Ensuite l'étanchéité : la plupart des EK63 prennent l'air comburant à l'extérieur, ce qui les rend compatibles avec les maisons à VMC double flux, BBC et passives.",
          "C'est le bon choix quand vous voulez un poêle moderne et connecté sans viser le ticket premium.",
        ],
      },
      {
        heading: "Girolami : le polycombustible qui se nettoie tout seul",
        paragraphs: [
          "Girolami est une marque familiale italienne, fabriquée à Sant'Oreste près de Rome depuis 1970. Sa signature, c'est le brevet Source Feeding : le pellet est poussé par le bas du brasier au lieu de tomber dessus, et les cendres sont chassées dans un bac sous le foyer.",
          "Concrètement, le brasier reste propre seul. Vous ne grattez plus tous les jours, vous videz le cendrier une fois par semaine. Pour les utilisateurs qui en ont assez du nettoyage quotidien, ça change vraiment le quotidien.",
          "L'autre force de Girolami, c'est l'hybride bois-pellet sur la gamme Soft. Une sonde reconnaît le combustible chargé et bascule seule entre pellet et bûche. Vous allumez au pellet le matin, vous finissez la soirée à la bûche, sans toucher au menu.",
        ],
      },
      {
        heading: "Le comparatif en un coup d'oeil",
        paragraphs: [
          "Voici les trois marques côte à côte sur les critères qui font la décision.",
        ],
        table: {
          headers: ["Critère", "Edilkamin", "EK63", "Girolami"],
          rows: [
            ["Positionnement", "Référence premium", "Connecté accessible", "Polycombustible breveté"],
            ["Techno phare", "Leonardo (autorégulation)", "Wi-Fi Smart de série", "Source Feeding (auto-nettoyage)"],
            ["Combustible", "Pellet", "Pellet", "Pellet, bois, hybride"],
            ["Hybride bois-pellet", "Non", "Non", "Oui"],
            ["Wi-Fi de série", "Selon modèle", "Oui sur la majorité", "Oui sur gamme moderne"],
            ["Étanchéité", "Sur gamme étanche", "Quasi toute la gamme", "Selon modèle"],
            ["Hydro (chauffage central)", "Oui", "Oui", "Oui"],
          ],
          caption: "Comparatif des trois marques premium distribuées par Mister Pellets en Wallonie.",
        },
      },
      {
        heading: "Comment choisir selon votre profil",
        paragraphs: [
          "En pratique, tout se joue sur votre besoin principal.",
        ],
        list: {
          items: [
            "Vous voulez une marque qui a fait ses preuves et qui dure : Edilkamin, 60 ans d'historique et une durée de vie observée de 15 à 20 ans.",
            "Vous voulez un poêle connecté sans payer le surcoût premium : EK63, Wi-Fi de série, étanche, 15 à 25 % moins cher qu'un Edilkamin équivalent.",
            "Vous voulez pellet et bois dans la même machine, sans nettoyage quotidien : Girolami, brevet auto-nettoyant et bascule automatique des combustibles.",
          ],
        },
        callout: {
          variant: "info",
          text: "Le plus simple reste le diagnostic à domicile. On regarde votre maison, votre PEB, votre conduit et votre usage, et on vous dit franchement quelle marque et quelle puissance sont les bonnes. C'est gratuit et sans engagement.",
        },
      },
    ],
    faqs: [
      {
        question: "Ces trois marques sont-elles vraiment toutes italiennes ?",
        answer:
          "Oui. Edilkamin a son siège près de Milan depuis 1963, Girolami est installée à Sant'Oreste, près de Rome, depuis 1970, et EK63 est la marque sœur d'Edilkamin. Précision utile : Edilkamin produit aussi dans son usine de Sárvár, en Hongrie.",
      },
      {
        question: "EK63 est-il moins bien qu'Edilkamin ?",
        answer:
          "Non, c'est différent. EK63 reprend l'industrie et le SAV d'Edilkamin, mais cible un prix plus accessible et le connecté de série. Edilkamin garde la gamme la plus large et des technologies comme Leonardo. EK63 n'est pas un sous-Edilkamin, c'est une marque pensée pour un autre budget.",
      },
      {
        question: "Girolami est-il bien suivi en Belgique ?",
        answer:
          "On distribue et on pose Girolami en Wallonie avec le même service que pour Edilkamin et EK63 : visite technique, devis sous 48 h, pose en une journée et SAV pièces assuré localement.",
      },
      {
        question: "Quelle marque pour une maison passive ou BBC ?",
        answer:
          "EK63 est le choix le plus naturel : la majorité de ses modèles sont étanches et prennent l'air comburant à l'extérieur, donc compatibles avec les VMC double flux. Edilkamin propose aussi une gamme étanche dédiée.",
      },
      {
        question: "Quelle marque pour remplacer une chaudière mazout ?",
        answer:
          "Visez un modèle hydro, qui se raccorde au circuit de chauffage central. Les trois marques en proposent : Edilkamin (Cherie H, Blade H), EK63 (Spot 100 H, Monday H 190 et 230) et Girolami (gamme Soft hydro, chaudière Biotec).",
      },
    ],
    related: {
      articles: [
        "austroflamm-cadel-nouvelles-marques-mister-pellets",],
      brands: ["edilkamin", "ek63", "girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Leonardo (Edilkamin)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "technologie-leonardo-edilkamin-combustion",
    title: "Technologie Leonardo : comment Edilkamin auto-règle la combustion",
    metaTitle: "Technologie Leonardo Edilkamin : la combustion auto-réglée",
    metaDescription:
      "Leonardo, le système d'autorégulation d'Edilkamin : combustion surveillée en continu et adaptée au conduit, à la météo et aux pellets. Ce que ça change au quotidien.",
    excerpt:
      "Leonardo, c'est le système qui règle la combustion à votre place. On explique comment il marche et ce qu'il change concrètement chez vous.",
    tldr:
      "Leonardo est le système d'autorégulation de combustion d'Edilkamin. Il relève en continu les paramètres de la combustion, qui varient avec le conduit, la météo et les pellets, et le poêle corrige seul sa combustion. Résultat : la flamme reste optimale même si vous changez de marque de pellets, même quand l'humidité ou la température varient. Vous n'avez rien à régler dans le menu. Leonardo est intégré aux modèles Edilkamin qui en sont équipés, ce n'est pas une option payante.",
    category: "marques",
    tags: ["Edilkamin", "Leonardo", "combustion", "autorégulation"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-15",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Schéma de la technologie Leonardo d'autorégulation de combustion sur un poêle Edilkamin",
    sections: [
      {
        heading: "Leonardo, la combustion qui se règle toute seule",
        paragraphs: [
          "Leonardo est le système d'autorégulation d'Edilkamin. Plutôt que de vous demander d'ajuster des paramètres dans un menu, le poêle ajuste lui-même la combustion, en continu, pendant qu'il tourne.",
          "C'est une des raisons pour lesquelles on recommande Edilkamin quand un client cherche un poêle qu'on installe et qu'on oublie. Vous allumez, et le poêle se débrouille pour garder une combustion propre.",
        ],
      },
      {
        heading: "Des sondes qui mesurent, un poêle qui corrige",
        paragraphs: [
          "Edilkamin explique que Leonardo relève en continu les principaux paramètres de la combustion, influencés par le conduit (courbes, longueur, diamètre), les conditions ambiantes (vent, pression atmosphérique, altitude) et le pellet (essence du bois, compacité, humidité). D'après les notices des modèles équipés, il s'appuie pour cela sur un capteur de pression dans la chambre de combustion et une sonde de température des fumées.",
          "À partir de ces mesures, il corrige deux choses : le débit de pellets envoyé par la vis sans fin, et le débit d'air du ventilateur. La flamme reste dans sa zone idéale, sans intervention de votre part.",
        ],
      },
      {
        heading: "Ce que ça change concrètement",
        paragraphs: [
          "Concrètement, Leonardo travaille pour vous dans plusieurs situations courantes.",
        ],
        list: {
          items: [
            "Vous changez de marque de pellets : longueur, taux de cendres et densité varient d'un sac à l'autre, le poêle se recale seul.",
            "L'humidité de la pièce change au fil de la saison : la combustion reste stable.",
            "Il fait très froid dehors et le tirage du conduit se modifie : Leonardo compense.",
          ],
        },
        callout: {
          variant: "info",
          text: "Vous n'avez rien à toucher dans le menu. C'est tout l'intérêt : la combustion reste optimale sans que vous deveniez technicien de votre propre poêle.",
        },
      },
      {
        heading: "Leonardo et la qualité des pellets",
        paragraphs: [
          "Tous les sacs de pellets ne se valent pas. Sur un poêle classique, un lot un peu différent peut décaler la combustion et encrasser plus vite. Avec Leonardo, le poêle absorbe une bonne partie de cet écart.",
          "Ça ne dispense pas d'acheter des pellets certifiés ENplus A1 ou DINplus, c'est la base. Mais le système pardonne les variations normales d'un lot à l'autre.",
        ],
      },
      {
        heading: "Est-ce que ça vaut le surcoût Edilkamin ?",
        paragraphs: [
          "Leonardo n'est pas une option à cocher : il est intégré aux modèles Edilkamin qui en sont équipés. Le tarif Edilkamin est premium, et l'autorégulation fait partie de ce que vous payez.",
          "Concrètement, une combustion bien réglée en permanence, c'est moins d'imbrûlés, moins d'encrassement de l'échangeur, et un poêle qui vieillit mieux. C'est un des arguments durée de vie de la marque.",
        ],
      },
    ],
    faqs: [
      {
        question: "Leonardo, c'est une option payante ?",
        answer:
          "Non. Leonardo est intégré d'usine aux modèles Edilkamin qui en sont équipés. Il n'y a pas de module à acheter ni d'abonnement.",
      },
      {
        question: "Avec Leonardo, je n'ai plus besoin d'entretenir mon poêle ?",
        answer:
          "Si. Le ramonage et l'entretien annuel restent indispensables. Leonardo optimise la combustion, il ne remplace pas l'entretien mécanique.",
      },
      {
        question: "Leonardo fonctionne avec n'importe quels pellets ?",
        answer:
          "Il encaisse bien les variations entre lots, mais on conseille toujours des pellets certifiés ENplus A1 ou DINplus. Un bon combustible reste la base d'une combustion saine.",
      },
      {
        question: "EK63 a-t-il aussi la technologie Leonardo ?",
        answer:
          "Non, Leonardo reste une technologie propre à Edilkamin. EK63, la marque sœur, mise plutôt sur le Wi-Fi Smart intégré de série.",
      },
    ],
    related: {
      articles: ["edilkamin-ek63-girolami-quelle-marque-choisir"],
      brands: ["edilkamin"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Wi-Fi de série (EK63)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "ek63-wifi-serie-poele-pellets-connecte",
    title: "EK63 : pourquoi le Wi-Fi de série change la vie au quotidien",
    metaTitle: "EK63 Wi-Fi de série : le poêle à pellets sans abonnement",
    metaDescription:
      "Le Wi-Fi Smart est intégré de série sur la majorité des EK63, sans abonnement. Allumage à distance, programmation, suivi conso. Ce que ça change vraiment.",
    excerpt:
      "Sur EK63, le Wi-Fi n'est ni une option ni un abonnement. Voici ce que ça change concrètement quand vous pilotez votre poêle depuis votre smartphone.",
    tldr:
      "La majorité des poêles EK63 intègrent le Wi-Fi Smart d'usine, sans abonnement. Vous pilotez l'allumage, la programmation horaire, la puissance et le suivi de consommation depuis votre smartphone. Le mot important, c'est de série : pas de module à acheter, pas de gamme haute à viser. Combiné à l'étanchéité de la plupart des modèles EK63, c'est le profil idéal d'une maison wallonne récente.",
    category: "marques",
    tags: ["EK63", "Wi-Fi", "connecté", "smartphone"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-15",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Pilotage d'un poêle à pellets EK63 connecté en Wi-Fi depuis un smartphone",
    sections: [
      {
        heading: "Le Wi-Fi de série, et sans abonnement",
        paragraphs: [
          "Sur la majorité des modèles EK63, le module Wi-Fi Smart est intégré dès l'usine. Ce n'est pas un accessoire à acheter en plus, et il n'y a aucun abonnement mensuel pour l'utiliser.",
          "C'est un des vrais arguments de la marque. Chez beaucoup de fabricants, la connectivité est en option payante ou réservée aux gammes les plus chères. EK63 la met d'office.",
        ],
      },
      {
        heading: "Ce que vous pilotez depuis votre smartphone",
        paragraphs: [
          "L'application couvre l'essentiel des usages quotidiens.",
        ],
        list: {
          items: [
            "Allumer et éteindre le poêle à distance.",
            "Programmer des plages horaires, jour par jour, sur la semaine.",
            "Régler la puissance et passer en mode économique.",
            "Suivre la consommation de pellets.",
            "Recevoir les alertes : réservoir bas, entretien nécessaire.",
          ],
        },
      },
      {
        heading: "Pourquoi de série change le quotidien",
        paragraphs: [
          "Le dimanche soir, vous programmez votre semaine en deux minutes. Vous lancez le poêle depuis le bureau pour rentrer dans un séjour déjà chaud. Et quand vous partez en week-end, un coup d'oeil sur l'app suffit pour vérifier que tout est bien coupé.",
          "Ces usages ne sont utiles que s'ils sont disponibles tout le temps, sans surcoût. C'est exactement ce que veut dire de série.",
        ],
        callout: {
          variant: "success",
          text: "Pas d'abonnement, c'est important sur la durée : le pilotage reste gratuit pendant toute la vie du poêle, pas seulement la première année.",
        },
      },
      {
        heading: "Wi-Fi et étanchéité : le vrai combo EK63",
        paragraphs: [
          "Le Wi-Fi n'est pas le seul atout d'EK63. La plupart des modèles sont étanches : ils prennent l'air comburant directement à l'extérieur et n'aspirent pas l'air chaud de votre pièce.",
          "Connecté plus étanche, c'est le profil idéal des maisons récentes wallonnes, à VMC double flux, BBC ou passives. Vous pilotez facilement, et le poêle respecte l'équilibre d'air de la maison.",
        ],
      },
      {
        heading: "Les modèles EK63 connectés",
        paragraphs: [
          "Le Wi-Fi équipe les best-sellers de la gamme : le Tweed 90+ canalisable étanche, le Spy 110+, le Daily 130++, et l'Entity 90+ ultra-fin de 31 cm de profondeur. Tous se pilotent depuis l'application.",
        ],
      },
    ],
    faqs: [
      {
        question: "Le Wi-Fi EK63 a-t-il un abonnement ?",
        answer:
          "Non. Le Wi-Fi Smart est intégré de série et son utilisation est gratuite, sans abonnement, pendant toute la vie du poêle.",
      },
      {
        question: "Que se passe-t-il si je n'ai pas de Wi-Fi chez moi ?",
        answer:
          "Le poêle fonctionne normalement en local, avec son écran et sa programmation intégrée. Le Wi-Fi est un confort en plus, pas une condition de fonctionnement.",
      },
      {
        question: "Le Wi-Fi remplace-t-il un thermostat ?",
        answer:
          "L'application gère la programmation horaire et la puissance. Selon le modèle, un thermostat d'ambiance peut aussi être ajouté. On en parle lors du devis selon votre configuration.",
      },
      {
        question: "Tous les EK63 sont-ils connectés ?",
        answer:
          "La grande majorité des modèles EK63 intègrent le Wi-Fi Smart. On confirme toujours le détail modèle par modèle au moment du devis.",
      },
    ],
    related: {
      articles: ["edilkamin-ek63-girolami-quelle-marque-choisir"],
      brands: ["ek63"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Source Feeding (Girolami)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "source-feeding-girolami-brasier-auto-nettoyant",
    title: "Source Feeding Girolami : pourquoi le brasier reste propre tout seul",
    metaTitle: "Source Feeding Girolami : le brasier qui se nettoie seul",
    metaDescription:
      "Le brevet Source Feeding de Girolami pousse le pellet par le bas et chasse les cendres dans un bac. Fini le nettoyage quotidien du brasier. Explications.",
    excerpt:
      "Le brevet Source Feeding de Girolami change la corvée la plus détestée des poêles à pellets : le nettoyage quotidien du brasier.",
    tldr:
      "Source Feeding est le brevet d'alimentation par le bas de Girolami. Au lieu de tomber sur le brasier, le pellet est poussé sous le brasier, et les cendres sont chassées vers un bac de collecte sous le foyer. Concrètement, le brasier reste propre tout seul : vous ne grattez plus tous les jours, vous videz le cendrier environ une fois par semaine. L'entretien annuel, lui, reste nécessaire.",
    category: "marques",
    tags: ["Girolami", "Source Feeding", "entretien", "brasier"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-15",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Schéma du système Source Feeding de Girolami, alimentation du pellet par le bas du brasier",
    sections: [
      {
        heading: "Le vrai sujet : le nettoyage quotidien du brasier",
        paragraphs: [
          "Sur un poêle à pellets classique, le pellet tombe par le haut sur le brasier. La combustion laisse un dépôt de cendres et d'imbrûlés, et il faut gratter le brasier régulièrement, souvent tous les jours en pleine saison de chauffe.",
          "C'est la corvée que personne n'aime. Girolami a construit son brevet maison autour de ce problème précis.",
        ],
      },
      {
        heading: "Source Feeding : l'alimentation par le bas",
        paragraphs: [
          "Avec Source Feeding, le pellet n'est pas lâché sur le brasier : il est poussé par en dessous. Au fur et à mesure que le combustible neuf arrive, les cendres et les imbrûlés sont chassés vers un bac de collecte placé sous le foyer.",
          "Le brasier reste donc dégagé en permanence. C'est mécanique, intégré au fonctionnement du poêle : il n'y a aucun mode à activer.",
        ],
      },
      {
        heading: "Ce que ça change : du quotidien à l'hebdomadaire",
        paragraphs: [
          "Le changement est net au quotidien : vous ne grattez plus le brasier chaque jour. Reste à vider le bac à cendres, environ une fois par semaine selon votre utilisation.",
        ],
        callout: {
          variant: "success",
          text: "Pour les clients qui en ont assez du nettoyage quotidien d'un poêle classique, c'est l'argument qui fait basculer le choix vers Girolami.",
        },
      },
      {
        heading: "Source Feeding et tolérance aux pellets",
        paragraphs: [
          "Comme le brasier ne s'encrasse pas de la même manière, le système encaisse mieux les pellets de qualité variable. La combustion reste régulière même si un lot est un peu différent.",
          "On conseille quand même des pellets certifiés ENplus A1 ou DINplus : un bon combustible reste le meilleur allié de votre poêle, quel que soit le système d'alimentation.",
        ],
      },
      {
        heading: "Quels modèles Girolami profitent du Source Feeding",
        paragraphs: [
          "Le Source Feeding est la signature de Girolami, présente sur la gamme. La Soft, hybride bois-pellet hydro, primée au Good Design Award 2022, en est la vitrine. Les modèles Vert, Flow et Curvy l'embarquent aussi, chacun avec son style.",
          "Sur la gamme hybride, Source Feeding se combine au Fuel Convert System, qui bascule automatiquement entre pellet et bois selon le combustible chargé.",
        ],
      },
    ],
    faqs: [
      {
        question: "Le brasier ne se nettoie vraiment jamais à la main ?",
        answer:
          "Le brasier reste propre seul au quotidien grâce au Source Feeding. Vous videz le bac à cendres environ une fois par semaine, et l'entretien annuel complet par un professionnel reste nécessaire.",
      },
      {
        question: "Source Feeding consomme-t-il plus de pellets ?",
        answer:
          "Non. C'est un mode d'alimentation du brasier, pas une surconsommation. Le rendement des poêles Girolami reste élevé.",
      },
      {
        question: "Tous les Girolami ont-ils le Source Feeding ?",
        answer:
          "C'est la signature de la marque, présente sur sa gamme de poêles. On confirme le détail modèle par modèle au moment du devis.",
      },
      {
        question: "Et l'hybride bois-pellet, comment ça marche avec ?",
        answer:
          "Sur la gamme Soft, Source Feeding se combine au Fuel Convert System : une sonde reconnaît le combustible chargé et le poêle bascule seul entre pellet et bois, sans réglage manuel.",
      },
    ],
    related: {
      articles: ["edilkamin-ek63-girolami-quelle-marque-choisir"],
      brands: ["girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : hybride bois-pellet (Girolami)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "girolami-hybride-bois-pellet-fuel-convert",
    title: "Pellet ou bûche ? Avec un Girolami hybride, vous prenez les deux",
    metaTitle: "Girolami hybride bois-pellet : le Fuel Convert System",
    metaDescription:
      "Le Girolami hybride bascule seul entre pellet et bûche grâce au Fuel Convert System. Plus de choix à faire entre les deux combustibles. Explications.",
    excerpt:
      "Choisir entre le pellet et la bûche, c'est un faux dilemme avec un Girolami hybride. Le poêle reconnaît le combustible et s'adapte tout seul.",
    tldr:
      "Les Girolami hybrides, la Soft en tête, fonctionnent au pellet comme à la bûche. Le Fuel Convert System utilise une sonde qui reconnaît le combustible chargé et bascule automatiquement entre les modes, sans aucun réglage manuel. Vous allumez au pellet le matin pour la programmation, vous finissez la soirée à la bûche pour l'ambiance. Le système accepte aussi certains broyés certifiés, comme les coques ou les noyaux, parfois avec un accessoire.",
    category: "marques",
    tags: ["Girolami", "hybride", "bois", "pellet", "Fuel Convert System"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-16",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Poêle Girolami hybride bois-pellet équipé du Fuel Convert System",
    sections: [
      {
        heading: "Le faux dilemme du pellet contre la bûche",
        paragraphs: [
          "Quand on choisit un poêle, on tranche en général entre deux mondes. Le pellet, c'est l'autonomie et la programmation : vous remplissez le réservoir, vous programmez, le poêle gère. La bûche, c'est l'ambiance, le geste, et un combustible parfois moins cher si vous avez une source de bois.",
          "Le Girolami hybride supprime ce choix. Vous n'avez pas à décider une fois pour toutes : vous utilisez l'un ou l'autre selon le moment, dans la même machine.",
        ],
      },
      {
        heading: "Le Fuel Convert System reconnaît le combustible",
        paragraphs: [
          "Le coeur de l'hybride Girolami, c'est le Fuel Convert System. Une sonde détecte ce que vous avez chargé dans le poêle : du pellet, des bûches, ou des combustibles broyés.",
          "À partir de cette lecture, le poêle bascule seul vers le bon mode de combustion. Aucun menu à ouvrir, rien à régler : il s'occupe du reste.",
        ],
      },
      {
        heading: "Une journée type avec un Girolami hybride",
        paragraphs: [
          "Le matin, le poêle s'allume tout seul en mode pellet, à l'heure que vous avez programmée. La maison est déjà chaude quand vous vous levez.",
          "Le soir, vous avez envie d'une vraie flambée. Vous chargez des bûches, le poêle passe en mode bois, et vous profitez de la flamme. Le lendemain, retour au pellet pour la programmation. Sans rien régler entre les deux.",
        ],
        callout: {
          variant: "info",
          text: "Un hybride peut aussi fonctionner uniquement au pellet si vous le souhaitez. Le bois reste une possibilité, pas une obligation.",
        },
      },
      {
        heading: "Au-delà du bois : les combustibles broyés",
        paragraphs: [
          "Le Fuel Convert System ne se limite pas au pellet et à la bûche. Il accepte aussi des combustibles broyés certifiés, comme des coques, des noyaux ou des plaquettes, avec parfois un accessoire à ajouter.",
          "C'est un atout si vous avez accès à ce type de ressource. Le poêle adapte sa combustion à ce que vous lui donnez, dans la limite des combustibles prévus par le constructeur.",
        ],
      },
      {
        heading: "Quels modèles Girolami sont hybrides",
        paragraphs: [
          "L'hybride se trouve surtout sur la gamme Soft, primée au Good Design Award 2022, un thermopoêle qui alimente le chauffage central.",
          "Girolami décline aussi l'hybride en thermocheminées, en chaudières et en foyers. La Vert, elle, fonctionne au pellet seul : c'est le canalisable de la marque. On dimensionne le bon modèle ensemble lors du diagnostic à domicile.",
        ],
      },
    ],
    faqs: [
      {
        question: "Dois-je régler le poêle quand je change de combustible ?",
        answer:
          "Non. Le Fuel Convert System reconnaît seul le combustible chargé et bascule automatiquement entre les modes. Aucun réglage manuel n'est nécessaire.",
      },
      {
        question: "Peut-on mettre du pellet et du bois en même temps ?",
        answer:
          "On utilise l'un puis l'autre, pas les deux simultanément. Le poêle fonctionne avec le combustible que vous avez chargé et bascule au chargement suivant.",
      },
      {
        question: "Un poêle hybride est-il plus cher qu'un poêle pellet simple ?",
        answer:
          "Un hybride embarque plus de technologie qu'un poêle pellet classique, ce qui se ressent au tarif. En contrepartie, vous n'êtes jamais bloqué sur un seul combustible. On chiffre le modèle adapté à votre besoin lors du devis.",
      },
      {
        question: "L'hybride fonctionne-t-il si je n'utilise que du pellet ?",
        answer:
          "Oui. Vous pouvez très bien n'utiliser que le pellet et garder le bois comme option pour les soirées où vous en avez envie.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "source-feeding-girolami-brasier-auto-nettoyant",
      ],
      brands: ["girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : EK63 étanche maison passive / BBC
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "ek63-etanche-maison-passive-bbc",
    title: "Maison passive ou BBC : quel poêle EK63 étanche choisir",
    metaTitle: "Poêle EK63 étanche pour maison passive ou BBC : lequel ?",
    metaDescription:
      "En maison passive ou BBC, le poêle doit être étanche. Quel modèle EK63 selon la surface : Like 80, Zone 80, Tweed 90+, Spy 110+, Daily 130++, Entity 90+.",
    excerpt:
      "En maison basse consommation, un poêle étanche n'est pas une option. Voici comment choisir le bon modèle EK63 selon votre maison.",
    tldr:
      "Dans une maison passive, BBC ou à VMC double flux, le poêle doit être étanche : il prélève l'air comburant directement à l'extérieur et n'aspire pas l'air chaud de la pièce. La majorité des modèles EK63 sont étanches. Sur une petite pièce, un Like 80 ou un Zone 80 suffit (environ 7,6 kW) ; pour des volumes moyens à grands, on passe au Tweed 90+, au Spy 110+ ou au Daily 130++. L'Entity 90+ ultra-fin, lui, est pensé pour les couloirs.",
    category: "marques",
    tags: ["EK63", "étanche", "maison passive", "BBC", "VMC double flux"],
    readingTimeMinutes: 7,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle à pellets EK63 étanche installé dans une maison basse consommation",
    sections: [
      {
        heading: "Pourquoi un poêle étanche s'impose en maison BBC",
        paragraphs: [
          "Une maison passive ou BBC est conçue pour être très étanche à l'air, avec une ventilation mécanique contrôlée, souvent en double flux. L'air entre et sort par un circuit maîtrisé.",
          "Un poêle classique, lui, aspire l'air de la pièce pour sa combustion. Dans une maison étanche, ça déséquilibre la ventilation et ça peut créer une dépression. C'est pour ça qu'un poêle étanche est nécessaire : il ne touche pas à l'air intérieur.",
        ],
      },
      {
        heading: "Comment fonctionne un poêle étanche EK63",
        paragraphs: [
          "Un EK63 étanche prélève l'air comburant directement à l'extérieur, via une prise d'air dédiée. La combustion se fait en circuit fermé : l'air entre du dehors, les fumées repartent dehors.",
          "Conséquence concrète : le poêle ne consomme pas l'air chaud que vous avez payé pour chauffer, et il ne perturbe pas la VMC. C'est ce qui le rend compatible avec les maisons à VMC double flux, BBC et passives.",
        ],
      },
      {
        heading: "Quel EK63 selon la taille de votre maison",
        paragraphs: [
          "La gamme EK63 couvre du petit appartement à la maison à étage. Le tableau ci-dessous donne les repères de puissance modèle par modèle.",
        ],
        table: {
          headers: ["Modèle EK63", "Puissance", "Pour quel espace"],
          rows: [
            ["Like 80", "7,6 kW", "Appartements et petites pièces"],
            ["Zone 80", "7,6 kW", "Pièces compactes, jusqu'à 74 m²"],
            ["Tweed 90+", "9,2 kW", "Volume moyen, canalisable, best-seller"],
            ["Spy 110+", "10,5 kW", "Volume polyvalent, canalisable"],
            ["Daily 130++", "12,5 kW", "Grandes surfaces, environ 120 m²"],
            ["Entity 90+", "8,7 kW", "Couloirs et petits espaces, 31 cm de profondeur"],
          ],
          caption: "Repères indicatifs. La puissance exacte se valide au diagnostic selon la PEB et le volume réel.",
        },
      },
      {
        heading: "Le bonus : le Wi-Fi de série",
        paragraphs: [
          "En plus de l'étanchéité, la majorité des EK63 intègrent le Wi-Fi Smart de série, sans abonnement. Vous programmez et vous pilotez le poêle depuis votre smartphone.",
          "Dans une maison récente, bien isolée, où le poêle tourne souvent en douceur, cette programmation fine est un vrai confort au quotidien.",
        ],
      },
      {
        heading: "Ce qu'on vérifie à la visite technique",
        paragraphs: [
          "Avant de poser un EK63 étanche, on contrôle le tracé de la prise d'air et celui du conduit de fumée, qui doit monter au-dessus du toit : Edilkamin, qui fabrique les EK63, interdit la sortie murale directe, même sur ses modèles étanches. On valide aussi l'emplacement et la compatibilité avec votre VMC.",
          "C'est l'étape qui garantit une installation propre et conforme. Le devis chiffré arrive sous 48 h après cette visite.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tous les poêles EK63 sont-ils étanches ?",
        answer:
          "La grande majorité des modèles EK63 sont étanches. On confirme toujours le détail modèle par modèle au moment du devis, selon la maison.",
      },
      {
        question: "Un poêle étanche peut-il être canalisable ?",
        answer:
          "Oui. Plusieurs EK63 sont à la fois étanches et canalisables, comme le Tweed 90+, le Spy 110+, le Daily 130++ et l'Entity 90+. Vous chauffez une pièce voisine tout en respectant l'étanchéité.",
      },
      {
        question: "Faut-il une sortie en toiture ou une ventouse ?",
        answer:
          "Une sortie au-dessus du toit. Les notices Edilkamin interdisent la sortie murale directe, modèles étanches compris, donc pas de ventouse avec un EK63. Sans cheminée, on pose un conduit double paroi isolé, le long de la façade ou par l'intérieur. On valide le tracé à la visite technique.",
      },
      {
        question: "L'étanchéité change-t-elle l'entretien du poêle ?",
        answer:
          "Non. L'entretien annuel et le ramonage restent les mêmes, qu'un poêle soit étanche ou non.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "ek63-wifi-serie-poele-pellets-connecte",
      ],
      brands: ["ek63"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : remplacer une chaudière mazout (Edilkamin hydro)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "remplacer-chaudiere-mazout-edilkamin-hydro",
    title: "Edilkamin hydro : les modèles pour remplacer une chaudière au mazout",
    metaTitle: "Edilkamin hydro à la place d'une chaudière au mazout",
    metaDescription:
      "Un poêle Edilkamin hydro se raccorde à vos radiateurs comme une chaudière. Principe, modèles, ballon tampon, eau chaude sanitaire et aides en 2026.",
    excerpt:
      "Un poêle hydro chauffe toute la maison via vos radiateurs existants. Voici comment il remplace une vieille chaudière mazout.",
    tldr:
      "Un poêle Edilkamin hydro se raccorde au circuit de chauffage central et alimente vos radiateurs ou votre plancher chauffant, exactement comme une chaudière. Couplé à un ballon tampon, il peut aussi produire l'eau chaude sanitaire. Les modèles comme la gamme Cherie H ou Blade H sont conçus pour ça. C'est une solution adaptée pour remplacer une chaudière mazout vieillissante. La prime Habitation a pris fin le 30 septembre 2026 ; restent la TVA à 6 % et, pour une maison classée E, F ou G rénovée plus largement, le Rénopack.",
    category: "marques",
    tags: ["Edilkamin", "hydro", "chaudière mazout", "chauffage central"],
    readingTimeMinutes: 7,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle à pellets hydro Edilkamin raccordé au chauffage central en remplacement d'une chaudière mazout",
    sections: [
      {
        heading: "Pourquoi remplacer le mazout maintenant",
        paragraphs: [
          "Cet article parle des hydros Edilkamin. Pour le remplacement du mazout en général (calendrier, cuve, budget), voyez [du mazout aux pellets](/blog/remplacer-chaudiere-mazout-poele-hydro) ; pour le fonctionnement et la puissance d'un hydro, [le guide du poêle à pellets hydro](/guides/poele-pellets-hydro).",
          "Le mazout coûte cher et son prix reste volatil. Les vieilles chaudières au fioul perdent en rendement avec les années, et leur entretien devient un poste régulier.",
          "Beaucoup de maisons wallonnes en sont encore équipées, et le calendrier se resserre : à partir du 1er janvier 2031, on ne pourra plus installer ni remplacer une chaudière au mazout dans une maison existante en Wallonie. Passer au pellet, c'est un combustible produit en Belgique, dont le prix ne suit pas celui du pétrole.",
        ],
      },
      {
        heading: "Le principe du poêle hydro",
        paragraphs: [
          "Un poêle hydro n'est pas qu'un poêle qui chauffe une pièce. Il chauffe l'eau d'un circuit, et cette eau circule dans vos radiateurs ou votre plancher chauffant. Côté résultat, c'est le même rôle qu'une chaudière.",
          "La différence avec un poêle classique, c'est qu'une grande partie de la chaleur produite part dans le circuit d'eau plutôt que dans la pièce. Toute la maison est chauffée, pas seulement le séjour.",
        ],
      },
      {
        heading: "Les modèles Edilkamin hydro",
        paragraphs: [
          "Edilkamin a une gamme hydro dédiée, reconnaissable au suffixe H. Les modèles comme la Cherie H ou la Blade H se raccordent au chauffage central.",
          "La puissance se choisit selon la surface à chauffer et le nombre de radiateurs. C'est un point qu'on dimensionne précisément, parce qu'un hydro mal calibré chauffe mal ou s'encrasse.",
        ],
      },
      {
        heading: "Ballon tampon et eau chaude sanitaire",
        paragraphs: [
          "Pour bien fonctionner, un poêle hydro est souvent couplé à un ballon tampon. Ce ballon stocke la chaleur et lisse le fonctionnement du poêle, ce qui le fait durer plus longtemps.",
          "Avec un ballon adapté, l'installation peut aussi produire l'eau chaude sanitaire. Vous remplacez alors le chauffage et l'eau chaude de l'ancienne chaudière en une seule solution.",
        ],
        callout: {
          variant: "success",
          text: "La prime Habitation qui couvrait ce remplacement s'est arrêtée le 30 septembre 2026. Si votre maison est classée E, F ou G et que vous la rénovez plus largement, voyez le Rénopack avant de signer un devis : la liste officielle des travaux ne nomme pas les poêles, et l'hydro n'est financé que si l'audit le retient et que l'organisme prêteur l'accepte. Sinon, comptez sur la TVA à 6 %.",
        },
      },
      {
        heading: "Ce que comprend le remplacement",
        paragraphs: [
          "Un remplacement de chaudière mazout par un hydro, ce n'est pas juste poser un poêle. Il faut déposer l'ancienne chaudière, se raccorder au circuit existant, puis prévoir le ballon tampon et le conduit d'évacuation.",
          "On chiffre tout ça lors du diagnostic à domicile. Le devis détaille chaque poste pour que vous sachiez exactement ce que vous payez, TVA comprise.",
        ],
      },
    ],
    faqs: [
      {
        question: "Un poêle hydro peut-il remplacer complètement ma chaudière mazout ?",
        answer:
          "Oui, c'est son rôle : il alimente les radiateurs ou le plancher chauffant. Couplé à un ballon, il gère aussi l'eau chaude sanitaire. Le dimensionnement se valide au diagnostic.",
      },
      {
        question: "Faut-il garder mes radiateurs existants ?",
        answer:
          "Dans la majorité des cas oui, on se raccorde au circuit existant. On vérifie l'état et le dimensionnement des radiateurs lors de la visite technique.",
      },
      {
        question: "Un poêle hydro chauffe-t-il aussi la pièce où il est installé ?",
        answer:
          "Oui, une partie de la chaleur reste dans la pièce d'installation, le reste part dans le circuit d'eau. C'est un point qu'on prend en compte au dimensionnement.",
      },
      {
        question: "Le remplacement donne-t-il droit à une prime ?",
        answer:
          "Plus de prime régionale pour un nouveau projet depuis le 1er octobre 2026. Le Rénopack peut financer une rénovation si la maison est classée E, F ou G et que l'ensemble des travaux la fait monter de label, avec un audit préalable et une demande de prêt avant tout devis signé. Le poêle hydro n'en fait partie que si l'audit le retient et que l'organisme prêteur l'accepte. Dans tous les cas, la TVA est à 6 % dans un logement de plus de 10 ans.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "technologie-leonardo-edilkamin-combustion",
      ],
      brands: ["edilkamin"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : canalisable intelligent (Girolami)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "girolami-canalisable-intelligent-trois-ventilateurs",
    title: "Trois ventilateurs, trois pièces : le canalisable intelligent Girolami",
    metaTitle: "Girolami canalisable : trois ventilateurs indépendants",
    metaDescription:
      "Le canalisable Girolami pilote trois ventilateurs indépendants, un par pièce, chacun ajusté à sa température. Thermostats sans fil TriKey. Explications.",
    excerpt:
      "Un canalisable classique souffle pareil partout. Le Girolami, lui, ajuste chaque pièce indépendamment. Voici comment.",
    tldr:
      "Les Girolami canalisables (gamme Vert) embarquent trois ventilateurs indépendants. Chacun dessert une pièce et ajuste son débit selon la température réellement mesurée dans cette pièce. Avec les thermostats sans fil TriKey en option, chaque pièce atteint sa propre consigne. Fini la pièce proche du poêle qui surchauffe pendant que la chambre à l'étage reste fraîche.",
    category: "marques",
    tags: ["Girolami", "canalisable", "ventilateurs", "TriKey"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle Girolami canalisable diffusant la chaleur dans trois pièces via des ventilateurs indépendants",
    sections: [
      {
        heading: "Le problème du canalisable classique",
        paragraphs: [
          "Un poêle canalisable diffuse l'air chaud vers plusieurs pièces via des gaines. Sur beaucoup de modèles, un seul ventilateur pousse l'air, et le débit est le même partout.",
          "Résultat courant : la pièce où se trouve le poêle surchauffe, pendant que la chambre la plus éloignée reste trop fraîche. Vous vous retrouvez à ouvrir une fenêtre d'un côté et à mettre un pull de l'autre.",
        ],
      },
      {
        heading: "Trois ventilateurs indépendants",
        paragraphs: [
          "Sur les versions canalisables de Girolami, il y a trois ventilateurs distincts. Chacun dessert sa pièce et règle son propre débit.",
          "Le poêle ne pousse plus un air identique partout. Il envoie plus d'air là où il en faut, moins là où la pièce est déjà à température. Chaque pièce est traitée pour elle-même.",
        ],
      },
      {
        heading: "Les thermostats sans fil TriKey",
        paragraphs: [
          "Pour que le système soit vraiment intelligent, Girolami propose les thermostats sans fil TriKey en option. Vous en placez un dans chaque pièce desservie.",
          "Chaque thermostat mesure la température réelle de sa pièce et communique avec le poêle. Le ventilateur correspondant ajuste son débit pour atteindre la consigne de cette pièce, pas une moyenne approximative.",
        ],
        callout: {
          variant: "info",
          text: "Concrètement, vous pouvez viser 21 °C dans le séjour et 19 °C dans une chambre, et le poêle gère les deux en même temps.",
        },
      },
      {
        heading: "Quelle maison pour un Girolami canalisable",
        paragraphs: [
          "Le canalisable intelligent prend tout son sens dans une maison ouverte où le poêle est dans le séjour, avec une ou deux pièces à chauffer en plus, par exemple une chambre à l'étage ou un bureau.",
          "La gamme Vert de Girolami couvre ce besoin, au pellet, de 8,3 à 13 kW. On valide le tracé des gaines et la puissance utile lors du diagnostic.",
        ],
      },
      {
        heading: "La pose : ce qui se passe sur le terrain",
        paragraphs: [
          "Canaliser, ça veut dire faire passer des gaines isolées du poêle vers les pièces à chauffer, avec une grille de sortie dans chaque pièce. Le tracé doit être le plus court et le plus direct possible.",
          "On étudie ça à la visite technique : longueur des gaines, passages disponibles, position des grilles. C'est ce qui garantit que l'air arrive vraiment chaud au bout du parcours.",
        ],
      },
    ],
    faqs: [
      {
        question: "Combien de pièces peut chauffer un Girolami canalisable ?",
        answer:
          "Les versions canalisables pilotent trois ventilateurs, donc la pièce d'installation plus des pièces canalisées. Le nombre exact dépend du tracé des gaines, qu'on valide à la visite technique.",
      },
      {
        question: "Les thermostats TriKey sont-ils inclus ?",
        answer:
          "Les thermostats sans fil TriKey sont proposés en option. On en discute au devis selon le confort recherché pièce par pièce.",
      },
      {
        question: "Peut-on couper la canalisation vers une pièce ?",
        answer:
          "Oui. Comme les ventilateurs sont indépendants, vous pouvez moduler ou arrêter la diffusion vers une pièce qui n'a pas besoin d'être chauffée à un moment donné.",
      },
      {
        question: "Le canalisable Girolami est-il aussi hybride ?",
        answer:
          "Non. La Vert fonctionne au pellet seul. Pour brûler du bois et des pellets dans la même machine, il faut passer sur un hybride de la marque, comme la Soft, qui alimente le chauffage central.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "girolami-hybride-bois-pellet-fuel-convert",
      ],
      brands: ["girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : durée de vie (Edilkamin)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "duree-de-vie-poele-edilkamin",
    title: "Combien de temps dure vraiment un poêle Edilkamin",
    metaTitle: "Durée de vie d'un poêle Edilkamin : 15 à 20 ans, et pourquoi",
    metaDescription:
      "Un poêle Edilkamin bien entretenu dure couramment 15 à 20 ans. Fabrication, pièces d'usure, entretien annuel et coût ramené à l'année. Le point honnête.",
    excerpt:
      "Un Edilkamin coûte cher à l'achat, mais combien d'années tient-il vraiment ? Ce qu'on observe sur le terrain, sans enjoliver.",
    tldr:
      "Un poêle Edilkamin entretenu correctement dure couramment 15 à 20 ans, ce qu'on observe sur le parc qu'on suit en Wallonie. La longévité tient à la qualité de fabrication et surtout à l'entretien annuel : aucun poêle ne dure sans ramonage et révision. Les pièces d'usure restent disponibles longtemps grâce au réseau Edilkamin. Ramené à l'année, le tarif premium devient raisonnable.",
    category: "marques",
    tags: ["Edilkamin", "durée de vie", "entretien", "fiabilité"],
    readingTimeMinutes: 7,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle à pellets Edilkamin après plusieurs années d'utilisation, entretenu par Mister Pellets",
    sections: [
      {
        heading: "15 à 20 ans, ce qu'on observe sur le terrain",
        paragraphs: [
          "On installe et on suit des Edilkamin depuis le début de l'atelier. Sur ce parc, un poêle entretenu correctement tient couramment 15 à 20 ans.",
          "Ce n'est pas un argument marketing, c'est ce qu'on constate en SAV. Et la condition est toujours la même : l'entretien a été fait régulièrement. Un poêle négligé, quelle que soit la marque, ne tiendra pas cette durée.",
        ],
      },
      {
        heading: "Pourquoi un Edilkamin dure : la fabrication",
        paragraphs: [
          "Edilkamin produit dans son usine historique de Gabbioneta Binanuova, près de Crémone, et dans son usine de Sárvár, en Hongrie, avec un laboratoire de recherche à Lavagno, près de Vérone. Les foyers sont conçus pour encaisser les cycles de chauffe pendant des années.",
          "Une fabrication maîtrisée, ça se voit dans le temps : moins de jeu mécanique, des assemblages qui tiennent, une structure qui ne fatigue pas prématurément.",
        ],
      },
      {
        heading: "Le rôle décisif de l'entretien annuel",
        paragraphs: [
          "La durée de vie d'un poêle se joue surtout sur l'entretien. Le ramonage du conduit et la révision annuelle de l'appareil ne sont pas optionnels, ils sont la condition de la longévité.",
          "Un entretien annuel, c'est le nettoyage de l'échangeur, le contrôle des joints, la vérification de la combustion et des organes mécaniques. C'est ce qui évite qu'une petite usure devienne une panne lourde.",
        ],
      },
      {
        heading: "Les pièces d'usure et leur disponibilité",
        paragraphs: [
          "Comme tout appareil, un poêle a des pièces d'usure. Les plus courantes suivent chacune leur propre logique de remplacement.",
        ],
        table: {
          headers: ["Pièce", "Rôle", "Logique de remplacement"],
          rows: [
            ["Bougie d'allumage", "Allume les pellets", "Pièce d'usure, remplacée selon l'usage"],
            ["Joints de porte et de trappe", "Assurent l'étanchéité", "Contrôlés chaque année, remplacés si fatigués"],
            ["Ventilateurs", "Air de combustion et diffusion", "Longue durée, surveillés en entretien"],
            ["Motoréducteur de vis sans fin", "Achemine les pellets", "Longue durée, contrôlé en révision"],
          ],
          caption: "Edilkamin garde un stock de pièces disponible longtemps après l'arrêt d'un modèle, via son réseau de centres d'assistance.",
        },
      },
      {
        heading: "Le coût ramené à l'année",
        paragraphs: [
          "Edilkamin est dans le haut de la fourchette à l'achat. Mais le bon calcul, c'est le coût ramené à la durée de vie réelle.",
          "Un poêle premium qui dure 18 ans revient, à l'année, moins cher qu'un poêle d'entrée de gamme qu'il faut remplacer après 8 ans. Sans compter le confort d'un appareil qui ne vous lâche pas en plein hiver.",
        ],
        callout: {
          variant: "info",
          text: "Selon les techniciens Mister Pellets, la première cause de fin de vie prématurée d'un poêle n'est pas la marque, c'est l'entretien sauté pendant plusieurs années.",
        },
      },
    ],
    faqs: [
      {
        question: "Un Edilkamin dure-t-il vraiment 20 ans ?",
        answer:
          "Sur le parc qu'on suit, 15 à 20 ans est courant pour un poêle entretenu chaque année. Sans entretien régulier, aucune marque ne tient cette durée.",
      },
      {
        question: "Que se passe-t-il si je saute un entretien annuel ?",
        answer:
          "Une année sautée se rattrape, mais sauter plusieurs entretiens use l'appareil bien plus vite et peut faire passer une simple révision à une réparation lourde. L'entretien annuel reste la base.",
      },
      {
        question: "Trouve-t-on encore des pièces pour un vieux modèle Edilkamin ?",
        answer:
          "Edilkamin maintient un stock de pièces longtemps après l'arrêt d'un modèle, via son réseau de centres d'assistance. En Belgique, les pièces courantes sont disponibles rapidement.",
      },
      {
        question: "L'achat d'un Edilkamin est-il rentable malgré le prix ?",
        answer:
          "Ramené à la durée de vie, oui. Un poêle qui dure deux fois plus longtemps qu'un modèle d'entrée de gamme revient moins cher à l'année, en plus du confort et de la fiabilité.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "technologie-leonardo-edilkamin-combustion",
      ],
      brands: ["edilkamin"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Entity 90+ ultra-fin (EK63)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "ek63-entity-90-poele-31-cm-couloir",
    title: "Entity 90+ d'EK63 : le poêle qui passe partout (31 cm de profondeur)",
    metaTitle: "EK63 Entity 90+ : le poêle à pellets de 31 cm de profondeur",
    metaDescription:
      "L'EK63 Entity 90+ ne fait que 31 cm de profondeur : il passe là où un poêle classique ne rentre pas. 8,7 kW, canalisable, étanche, Wi-Fi de série.",
    excerpt:
      "Un couloir, un hall, un mur étroit : l'Entity 90+ d'EK63 passe là où les autres poêles ne rentrent pas. Et il chauffe vraiment.",
    tldr:
      "L'EK63 Entity 90+ est un poêle à pellets canalisable et étanche de seulement 31 cm de profondeur, contre 50 à 60 cm pour un poêle classique. Il s'installe dans un couloir, un hall ou un petit espace où aucun poêle standard ne rentrerait. Malgré son format, il développe 8,7 kW et peut canaliser l'air chaud vers une pièce voisine. Le seul vrai prérequis est un emplacement avec un passage de fumée correct.",
    category: "marques",
    tags: ["EK63", "Entity 90+", "couloir", "poêle compact", "canalisable"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-16",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Poêle à pellets EK63 Entity 90+ ultra-fin installé dans un couloir étroit",
    sections: [
      {
        heading: "31 cm de profondeur : ce que ça veut dire concrètement",
        paragraphs: [
          "Un poêle à pellets classique fait en général 50 à 60 cm de profondeur. C'est encombrant, et ça suffit à exclure pas mal d'emplacements.",
          "L'EK63 Entity 90+ ne fait que 31 cm de profondeur. Il se plaque contre un mur sans manger la pièce, et il ouvre des emplacements qui étaient impossibles avec un poêle standard.",
        ],
      },
      {
        heading: "Où l'Entity 90+ change la donne",
        paragraphs: [
          "Ce format ultra-fin a été pensé pour les espaces contraints, le genre d'emplacement qu'on rencontre souvent en Wallonie.",
        ],
        list: {
          items: [
            "Un couloir étroit où un poêle classique bloquerait le passage.",
            "Un hall d'entrée qu'on veut chauffer sans encombrer.",
            "Un petit séjour où chaque centimètre compte.",
            "Un mur de refend peu profond où poser un poêle paraissait impossible.",
          ],
        },
      },
      {
        heading: "Compact ne veut pas dire faible : 8,7 kW canalisable",
        paragraphs: [
          "On pourrait croire qu'un poêle aussi fin ne chauffe pas grand-chose. C'est faux. L'Entity 90+ développe 8,7 kW, de quoi chauffer sérieusement.",
          "Mieux : il est canalisable. Il peut envoyer une partie de l'air chaud vers une pièce adjacente. Posé dans un couloir, il chauffe le couloir et une chambre voisine.",
        ],
      },
      {
        heading: "Étanche et connecté, comme la gamme EK63",
        paragraphs: [
          "L'Entity 90+ n'est pas un modèle au rabais. Il reprend les atouts de la gamme EK63 : il est étanche, donc compatible avec les maisons à VMC double flux et BBC, et il intègre le Wi-Fi Smart de série.",
          "Vous profitez donc du format ultra-fin sans renoncer au pilotage smartphone ni à la compatibilité maison récente.",
        ],
      },
      {
        heading: "Le prérequis : un passage de fumée correct",
        paragraphs: [
          "Le seul vrai point à valider, c'est l'évacuation des fumées. Comme pour tout EK63, il faut un conduit correctement dimensionné qui monte au-dessus du toit : Edilkamin n'accepte pas la ventouse.",
          "On vérifie ça à la visite technique. Sur le terrain, on a posé l'Entity 90+ dans plusieurs couloirs et halls wallons : quand le passage de fumée est bon, ça fonctionne très bien.",
        ],
      },
    ],
    faqs: [
      {
        question: "Un poêle de 31 cm chauffe-t-il vraiment ?",
        answer:
          "Oui. L'Entity 90+ développe 8,7 kW malgré sa faible profondeur, et il est canalisable vers une pièce voisine. La performance est au rendez-vous.",
      },
      {
        question: "L'Entity 90+ peut-il s'installer dans un couloir ?",
        answer:
          "C'est exactement son terrain. Ses 31 cm de profondeur lui permettent de tenir dans un couloir sans bloquer le passage. Le point à valider est l'évacuation des fumées.",
      },
      {
        question: "L'Entity 90+ est-il étanche ?",
        answer:
          "Oui, il est étanche, comme la majorité de la gamme EK63. Il est donc compatible avec les maisons à VMC double flux, BBC et passives.",
      },
      {
        question: "Peut-on le piloter depuis le smartphone ?",
        answer:
          "Oui. L'Entity 90+ intègre le Wi-Fi Smart de série, sans abonnement, comme les autres modèles EK63.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "ek63-etanche-maison-passive-bbc",
      ],
      brands: ["ek63"],
    },
  },


  // ───────────────────────────────────────────────────────────────────
  // 2. PELLETS ENPlus A1 vs DINplus (intent : "quels pellets choisir")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "pellets-enplus-a1-vs-dinplus",
    title: "Pellets ENplus A1 vs DINplus : que choisir en Belgique en 2026 ?",
    metaTitle: "Pellets ENplus A1 ou DINplus ? Comparatif 2026 (Belgique)",
    metaDescription:
      "ENplus A1 et DINplus imposent les mêmes seuils : au moins 4,6 kWh/kg, 0,7 % de cendres au maximum. Comment lire un sac, le prix en Wallonie et le stockage.",
    excerpt:
      "ENplus A1 et DINplus sont les deux certifications sérieuses, et elles disent la même chose. Voici comment lire un sac, ce qu'il coûte en Wallonie et comment le stocker.",
    tldr:
      "ENplus A1 et DINplus imposent les mêmes seuils de qualité : au moins 4,6 kWh/kg, 0,7 % de cendres et 10 % d'humidité au maximum, 6 mm de diamètre à 1 mm près. ENplus est la plus répandue en Belgique. Refusez tout sac sans certification visible : un pellet douteux chauffe moins, encrasse plus vite, et personne ne vous dira ce qu'il contient. En août 2026, ValBiom relevait 6,19 € en moyenne le sac de 15 kg en Wallonie.",
    category: "pellets",
    tags: ["pellets", "ENplus", "DINplus", "qualité", "combustible"],
    readingTimeMinutes: 7,
    publishedAt: "2026-03-22",
    modifiedAt: "2026-11-11",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers combustible",
    coverImageAlt: "Sac de pellets certifiés ENplus A1 à côté d'un sac DINplus",
    sections: [
      {
        heading: "Les deux certifications qui comptent vraiment",
        paragraphs: [
          "Sur le marché belge, deux labels garantissent la qualité d'un sac de pellets : ENplus, géré depuis Bruxelles par Bioenergy Europe, et DINplus, le label allemand de DIN CERTCO. Tous deux reprennent la classe A1 de la norme ISO 17225-2 et contrôlent le diamètre, la longueur, la solidité, les cendres, l'humidité et le pouvoir calorifique.",
          "Leurs cahiers des charges fixent aujourd'hui les mêmes seuils : au moins 4,6 kWh par kilo, 0,7 % de cendres et 10 % d'humidité au maximum. ENplus a aussi une classe A2, jusqu'à 1,2 % de cendres, plutôt vendue pour les chaudières : pour un poêle, restez en A1.",
        ],
        table: {
          headers: ["Critère", "ENplus A1", "DINplus", "Sac non certifié"],
          rows: [
            ["Pouvoir calorifique", "≥ 4,6 kWh/kg", "≥ 4,6 kWh/kg", "Non garanti"],
            ["Cendres", "≤ 0,7 %", "≤ 0,7 %", "Non garanti"],
            ["Humidité", "≤ 10 %", "≤ 10 %", "Non garanti"],
            ["Diamètre", "6 ou 8 mm, ± 1 mm", "6 ou 8 mm, ± 1 mm", "Variable"],
            ["Longueur", "3,15 à 40 mm", "3,15 à 40 mm", "Variable"],
            ["Durabilité mécanique", "≥ 98 %", "≥ 98 %", "Non garantie"],
          ],
          caption: "Seuils des cahiers des charges ENplus A1 et DINplus (DIN CERTCO, édition 02-2025). Un sac non certifié n'offre aucune garantie.",
        },
      },
      {
        heading: "Pourquoi un pellet bon marché finit par coûter cher",
        paragraphs: [
          "Un sac à 4,50 € à côté d'un ENplus A1 à 6,20 €, la différence se voit sur le ticket. Elle fond dans le poêle : un pellet non certifié peut livrer nettement moins que les 4,6 kWh garantis par kilo, et vous en brûlez davantage pour la même chaleur.",
          "Le vrai coût est ailleurs. Plus de cendres, c'est un creuset qui se bouche plus vite, un échangeur qui s'encrasse et des extinctions en pleine chauffe. Et les fabricants demandent des pellets conformes : les dégâts causés par un combustible hors norme ne sont en général pas couverts par leur garantie.",
        ],
        callout: {
          variant: "warning",
          text: "Si le sac n'affiche ni le logo ENplus A1 avec son numéro d'identification, ni le logo DINplus avec son numéro de certificat, ne l'achetez pas. Le site enplus-pellets.eu liste les producteurs et distributeurs certifiés, pays par pays.",
        },
      },
      {
        heading: "Combien coûte un sac en 2026 et comment le stocker",
        paragraphs: [
          "En octobre 2026, ValBiom relevait en moyenne 7,02 € le sac de 15 kg en Wallonie, pour des pellets certifiés achetés par palette, livraison non comprise. C'est environ 468 € la tonne, et 24 % de plus qu'un an plus tôt. Le sac acheté à l'unité coûte plus cher. Le prix de chaque mois depuis janvier 2025 est dans [notre relevé du prix des pellets](/blog/prix-pellets-belgique).",
          "Pour le stockage, une seule règle : au sec. C'est l'humidité qui abîme les pellets, pas le froid. Une palette tient sur moins d'un mètre carré ; posez-la dans un garage ou un abri sain, jamais dans une cave humide, où le pellet reprend l'eau et perd son pouvoir calorifique.",
        ],
        list: {
          ordered: true,
          items: [
            "Achetez au printemps ou en été : en 2025, le sac valait 5,43 € en juin, contre 5,99 € en janvier suivant (relevés ValBiom).",
            "Fermez les sacs entamés, ou videz-les en entier dans le réservoir.",
            "Fiez-vous à la certification plutôt qu'au pays affiché : le numéro du sac remonte jusqu'au producteur.",
          ],
        },
      },
      {
        heading: "Quelle marque de pellets choisir ?",
        paragraphs: [
          "La règle tient en une ligne : prenez un sac certifié A1, chez un revendeur qui stocke à l'abri. Nous vendons une palette de pellets Comfo, certifiés DINplus A1, à retirer à Fernelmont ; si votre notice ne demande rien de plus, un autre pellet certifié A1 fera aussi bien l'affaire.",
          "Ensuite, si votre poêle tourne bien avec une marque, gardez-la. À chaque changement de lot, la combustion se recale. Les poêles autorégulés, comme les Edilkamin équipés de Leonardo, encaissent mieux ces écarts, mais un poêle qui brûle toujours le même pellet reste plus régulier.",
        ],
      },
      {
        heading: "La règle simple à retenir",
        paragraphs: [
          "Logo ENplus A1 ou DINplus visible avec son numéro, prix cohérent avec le marché (autour de 7 € le sac de 15 kg à la palette fin 2026), revendeur établi : vous êtes à l'abri d'une mauvaise surprise. Le reste, c'est jouer avec votre matériel. Nous vendons aussi des pellets Comfo certifiés DINplus A1 en palette, à retirer à Fernelmont : [la palette de pellets Comfo](/palette-pellets-comfo).",
        ],
      },
    ],
    faqs: [
      {
        question: "Faut-il choisir ENplus A1 plutôt que DINplus ?",
        answer:
          "Non, les deux se valent pour un poêle domestique : mêmes seuils de pouvoir calorifique, de cendres et d'humidité. ENplus est plus répandue dans les enseignes wallonnes. Choisissez selon la disponibilité et le prix.",
      },
      {
        question: "Combien de pellets faut-il par an pour chauffer une maison wallonne ?",
        answer:
          "Pour une maison PEB B-C de 120 m² avec un poêle de 10 kW en chauffage principal, comptez 1,5 à 2 tonnes par saison de chauffe (octobre à avril). En appoint sur les 3 mois d'hiver, plutôt 600 à 900 kg.",
      },
      {
        question: "Peut-on stocker des pellets dans un garage non chauffé ?",
        answer:
          "Oui, s'il est sec et ventilé. Posez les sacs sur une palette en bois plutôt que sur le béton. Le froid ne les abîme pas, l'humidité si.",
      },
      {
        question: "Que faire d'un sac de pellets éventré qui a pris l'humidité ?",
        answer:
          "Si les pellets restent durs et brillants, utilisez-les rapidement. S'ils sont gonflés, friables ou s'ils sentent le moisi, ne les mettez pas dans le poêle : ils bloqueraient la vis sans fin et encrasseraient le creuset.",
      },
    ],
    related: {
      articles: ["budget-hiver-poele-pellets-consommation-2026", "poele-pellets-eteint-tout-seul-causes"],
      guides: ["remettre-en-route-poele-pellets-automne", "comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege", "tournai"],
    },
  },


  // ───────────────────────────────────────────────────────────────────
  // 4. REMPLACER CHAUDIÈRE MAZOUT (intent : "remplacer mazout pellets")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "remplacer-chaudiere-mazout-poele-hydro",
    title: "Du mazout aux pellets : remplacer sa chaudière par un poêle hydro",
    metaTitle: "Remplacer une chaudière au mazout par des pellets",
    metaDescription:
      "Coût total, aides, retour sur investissement, raccordement aux radiateurs, cuve à mettre hors service : passer du mazout au pellet hydro, expliqué par Mister Pellets.",
    excerpt:
      "Le mazout dépasse 1,50 € le litre, et la Wallonie interdira de remplacer une chaudière mazout à partir de 2031. Le pellet hydro est l'alternative la plus simple pour garder ses radiateurs.",
    tldr:
      "Remplacer une chaudière mazout par un poêle hydro à pellets coûte 8 000 à 14 000 € TVAC posé, selon la puissance (16 à 24 kW) et le raccordement aux radiateurs existants. Il n'y a plus de prime régionale depuis le 1er octobre 2026, mais la TVA est à 6 % dans un logement de plus de 10 ans. Pour une maison qui brûlait 2 000 litres de mazout par an, l'économie tourne autour de 1 500 € par an aux prix d'octobre 2026 : l'installation se rembourse en 5 à 9 ans.",
    category: "installation",
    tags: ["hydro", "mazout", "remplacement", "chaudière", "transition"],
    readingTimeMinutes: 10,
    publishedAt: "2026-01-28",
    modifiedAt: "2026-10-03",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Spécialistes hydro et chauffage central",
    coverImageAlt: "Comparaison entre chaudière mazout ancienne et poêle hydro à pellets moderne",
    sections: [
      {
        heading: "Pourquoi le pellet hydro remplace bien le mazout",
        paragraphs: [
          "Cet article traite du remplacement : calendrier du mazout, cuve, budget et pièges. Le fonctionnement du poêle hydro, sa puissance et sa pose sont dans [le guide du poêle à pellets hydro](/guides/poele-pellets-hydro), et le cas d'un Edilkamin dans [remplacer une chaudière par un Edilkamin hydro](/blog/remplacer-chaudiere-mazout-edilkamin-hydro).",
          "Une chaudière mazout chauffe un circuit d'eau qui alimente les radiateurs et l'eau chaude sanitaire. Un poêle hydro à pellets fait exactement la même chose : il chauffe le même circuit, branché de la même manière. La transition technique est plus simple qu'on ne l'imagine.",
          "Côté combustible, le pellet se produit en Belgique, qui en fabrique plus qu'elle n'en consomme selon ValBiom. En août 2026, le sac de 15 kg valait 6,19 € en moyenne en Wallonie. Le mazout, lui, dépassait 1,50 € le litre au tarif maximum du SPF Économie début octobre 2026.",
          "Et la réglementation tourne. Depuis le 1er janvier 2026, une maison neuve ne peut plus recevoir de chaudière au mazout. À partir du 1er janvier 2031, on ne pourra plus en installer ni en remplacer dans une maison existante ; seul le remplacement du brûleur restera permis jusqu'à fin 2034.",
        ],
      },
      {
        heading: "Quelle puissance hydro pour quelle maison",
        paragraphs: [
          "Le calcul est différent du poêle d'air : ici, la puissance doit suivre le besoin total de chauffage de la maison, plus l'eau chaude sanitaire si vous choisissez cette option. Comptez généralement 0,15 à 0,18 kW par m² pour une maison wallonne 4 façades non passive.",
        ],
        table: {
          headers: ["Surface chauffée", "PEB", "Puissance hydro", "Ballon tampon recommandé"],
          rows: [
            ["100-130 m²", "C-D", "16-18 kW", "200-300 L"],
            ["130-180 m²", "C-E", "20-22 kW", "300-500 L"],
            ["180-250 m²", "D-G", "24-28 kW", "500-800 L"],
          ],
          caption: "Dimensionnement hydro indicatif Wallonie. Ajouter 10 % si la production d'eau chaude sanitaire est intégrée.",
        },
        callout: {
          variant: "info",
          text: "Pour les maisons de plus de 200 m² ou très mal isolées, on ajoute parfois un appoint électrique sur le ballon d'eau chaude pour les grands froids ou les week-ends prolongés.",
        },
      },
      {
        heading: "Le raccordement aux radiateurs existants",
        paragraphs: [
          "Bonne nouvelle : vos radiateurs restent en place. Le poêle hydro se raccorde au circuit via un ballon tampon (200 à 800 litres selon la puissance) qui sert de volume d'inertie. Ce ballon évite les cycles courts qui usent le poêle avant l'heure.",
          "Avant le raccordement, le circuit doit être désemboué : 20 ou 30 ans de chauffage au mazout laissent des boues dans les tuyaux et les radiateurs. Comptez 350 à 600 € selon la longueur du circuit et le nombre de radiateurs. On ne transige pas là-dessus : un circuit emboué encrasse le nouvel échangeur en quelques mois.",
        ],
      },
      {
        heading: "Combien ça coûte, et combien ça rapporte",
        paragraphs: [
          "Prenons une maison 4 façades de 1978 près de Sombreffe : 175 m², classée E, une chaudière mazout de 28 kW en fin de vie et une cuve de 3 000 litres. Le projet type comprend un Girolami Soft hydro, un ballon tampon de 500 litres, le désembouage du circuit, le raccordement, la mise en service et la mise hors service de la cuve. Avec la TVA à 6 %, il se situe dans le haut de notre fourchette hydro, entre 8 000 et 14 000 € TVAC selon l'état du circuit.",
          "Le calcul de l'économie. 2 000 litres de mazout contiennent environ 20 000 kWh ; une chaudière qui rend 80 % sur la saison en fait 16 000 kWh de chaleur. Pour produire la même chaleur, un hydro qui rend 90 % brûle environ 3,8 tonnes de pellets à 4,7 kWh par kilo.",
        ],
        callout: {
          variant: "success",
          text: "Aux prix d'octobre 2026 : 2 000 litres × 1,53 € = 3 070 € de mazout, contre 3,8 tonnes × 413 € = 1 560 € de pellets. Environ 1 500 € d'économie par an, soit un retour sur investissement de 5 à 9 ans.",
        },
      },
      {
        heading: "La cuve à mazout : une étape à ne pas oublier",
        paragraphs: [
          "À partir de 3 000 litres, la réglementation wallonne (arrêté du 17 juillet 2003) impose une mise hors service en règle : la citerne est vidée, nettoyée et dégazée, puis enlevée si elle est aérienne, enlevée ou remplie d'un matériau inerte si elle est enterrée. Les boues partent chez un collecteur agréé. Sous 3 000 litres, ces règles ne sont pas obligatoires, mais le SPW recommande de les suivre.",
          "Certaines communes accordent une aide pour la mise hors service d'une citerne : renseignez-vous avant les travaux. Mister Pellets coordonne l'opération avec une entreprise spécialisée.",
        ],
      },
      {
        heading: "Les 3 erreurs à éviter dans une transition mazout → pellets hydro",
        paragraphs: [
          "Erreur 1 : ne pas désembouer le circuit. Vous importez des années de boues dans un échangeur neuf, qui s'encrasse aussitôt.",
          "Erreur 2 : sous-dimensionner pour économiser. Un hydro de 18 kW sur 200 m² en PEB E tourne à plein en janvier, et vous finissez par allumer un appoint électrique. La marge utile est de 15 à 20 % au-dessus du calcul théorique.",
          "Erreur 3 : oublier le ballon tampon. Sans lui, le poêle enchaîne les cycles courts, allumage puis extinction toutes les demi-heures, use sa résistance d'allumage bien plus vite et fait du bruit dans la maison. Le ballon n'est pas une option.",
        ],
      },
    ],
    faqs: [
      {
        question: "Combien coûte le passage du mazout au poêle hydro à pellets ?",
        answer:
          "Comptez 8 000 à 14 000 € TVAC tout compris en Wallonie, avec la TVA à 6 % dans un logement de plus de 10 ans : poêle, ballon tampon, désembouage du circuit, raccordement et mise hors service de la cuve. Il n'y a plus de prime régionale pour un nouveau projet depuis le 1er octobre 2026. Si la maison est classée E, F ou G et que vous la rénovez plus largement, le Rénopack peut financer les travaux éligibles ; le poêle hydro n'en fait partie que si l'audit le retient et que l'organisme prêteur l'accepte, et la demande de prêt passe avant tout devis signé.",
      },
      {
        question: "Faut-il garder une chaudière d'appoint en plus du poêle hydro ?",
        answer:
          "Non, dans la grande majorité des cas le poêle hydro couvre tout le chauffage et l'eau chaude. Seules les très grandes maisons mal isolées peuvent avoir besoin d'un appoint électrique sur le ballon d'eau chaude pour les grands froids.",
      },
      {
        question: "Combien de temps pour rentabiliser l'investissement ?",
        answer:
          "Pour une maison qui brûlait 2 000 litres de mazout par an, comptez 5 à 9 ans aux prix d'octobre 2026 : environ 3 070 € de mazout contre 1 560 € de pellets, soit 1 500 € d'économie par an pour un investissement de 8 000 à 14 000 €. Si le mazout continue de grimper, ça va plus vite.",
      },
      {
        question: "Que faire de l'ancienne cuve mazout vide ?",
        answer:
          "À partir de 3 000 litres, elle doit être vidée, nettoyée et dégazée, puis enlevée si elle est aérienne, enlevée ou remplie d'un matériau inerte si elle est enterrée. Sous 3 000 litres, ce n'est pas obligatoire mais recommandé. Mister Pellets coordonne l'opération avec une entreprise spécialisée.",
      },
    ],
    related: {
      articles: [
        "budget-hiver-poele-pellets-consommation-2026",
        "remplacer-chaudiere-mazout-edilkamin-hydro",
      ],
      guides: ["poele-pellets-hydro", "guide-achat-poele-pellets-wallonie"],
      cities: ["namur", "charleroi", "wavre", "andenne"],
      brands: ["edilkamin", "girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 5. POÊLE QUI S'ÉTEINT (intent : "pourquoi mon poêle s'éteint")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "poele-pellets-eteint-tout-seul-causes",
    title: "Pourquoi mon poêle à pellets s'éteint tout seul ? 7 causes courantes",
    metaTitle: "Poêle à pellets qui s'éteint seul : 7 causes et solutions",
    metaDescription:
      "Creuset bouché, pellets humides, sonde encrassée, conduit obstrué… Voici comment diagnostiquer un poêle pellets qui s'arrête tout seul.",
    excerpt:
      "Un poêle qui s'éteint sans qu'on lui demande, c'est rarement un défaut de fabrication. 7 causes couvrent 95 % des cas, la plupart se règlent en 30 minutes sans technicien.",
    tldr:
      "Un poêle à pellets qui s'éteint tout seul a presque toujours une de ces 7 causes : creuset encrassé, pellets de mauvaise qualité ou humides, sonde de fumée encrassée, échangeur bouché, vis sans fin bloquée, prise d'air comburant obstruée, ou conduit non ramoné. Avant d'appeler un technicien, vérifiez ces 7 points dans l'ordre : la cause est le plus souvent un défaut d'entretien plutôt qu'une panne matérielle.",
    category: "entretien",
    tags: ["panne", "diagnostic", "entretien", "extinction", "creuset"],
    readingTimeMinutes: 9,
    publishedAt: "2026-04-02",
    modifiedAt: "2026-04-29",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens SAV",
    coverImageAlt: "Creuset de poêle à pellets encrassé avec mâchefer accumulé",
    sections: [
      {
        heading: "Cause n°1 : creuset encrassé (40 % des cas)",
        paragraphs: [
          "C'est la cause la plus fréquente. Le creuset (la coupelle où brûlent les pellets) accumule du mâchefer, résidu vitrifié de cendres et de minéraux, qui finit par boucher les trous d'admission d'air primaire. Sans air, la flamme s'étouffe et le poêle déclenche son extinction de sécurité.",
          "Diagnostic : à froid, sortez le creuset. Si vous voyez des amas durs et brillants comme du verre, c'est du mâchefer. Solution : frappez le creuset à l'envers sur une surface dure pour décoller, brossez les trous avec une brosse métallique, vérifiez qu'aucun trou n'est obstrué.",
        ],
        callout: {
          variant: "info",
          text: "Videz les cendres tous les 2-3 jours en pleine saison, brossez le creuset toutes les semaines. C'est l'entretien le plus important d'un poêle à pellets.",
        },
      },
      {
        heading: "Cause n°2 : pellets humides ou de mauvaise qualité (20 %)",
        paragraphs: [
          "Un pellet à 12 % d'humidité (au lieu de < 10 %) brûle moins bien, fait plus de cendres, encrasse l'échangeur. À partir de 14 %, le poêle peut s'éteindre faute de combustion stable.",
          "Diagnostic : prenez une poignée de pellets, frottez-les. Ils doivent être durs, lisses, sans poussière. Cassés, friables, ou poussiéreux = mauvais lot ou stockage humide. Solution : passez à un sac neuf certifié ENplus A1 ou DINplus, videz entièrement le réservoir et la vis sans fin avant.",
        ],
      },
      {
        heading: "Cause n°3 : sonde de fumée encrassée (15 %)",
        paragraphs: [
          "La sonde thermocouple mesure la température des fumées en sortie d'échangeur. Si elle est couverte de suie, elle envoie une fausse lecture : le poêle croit qu'il fait trop froid et déclenche une extinction par sécurité.",
          "Diagnostic : le code erreur affiché est souvent E101, E110 ou « température fumée basse » selon la marque. Solution : à froid, retirez la sonde (1 vis) et essuyez-la avec un chiffon sec. Pas de produit chimique. Remontez. 80 % des cas se résolvent en 5 minutes.",
        ],
      },
      {
        heading: "Cause n°4 : échangeur bouché (10 %)",
        paragraphs: [
          "L'échangeur (les conduits internes par où passent les fumées avant la sortie) accumule de la suie. Quand le passage rétrécit trop, le tirage chute, la combustion devient mauvaise, le poêle s'éteint.",
          "Diagnostic : ouvrez la porte du foyer. Si les parois sont noires de suie épaisse, l'échangeur l'est aussi probablement. Solution : ramonage interne avec la canne fournie (action sur le levier en façade pour les Edilkamin/EK63) toutes les 2-3 semaines en saison. Faites aussi ramoner le conduit une fois par an.",
        ],
      },
      {
        heading: "Cause n°5 : vis sans fin bloquée (8 %)",
        paragraphs: [
          "La vis sans fin descend les pellets du réservoir vers le creuset. Si un pellet trop long, un débris (vis, bois, plastique) ou un amas humide se coince, la vis force, le moteur déclenche sa sécurité thermique et le poêle s'arrête.",
          "Diagnostic : vous entendez le moteur grogner au démarrage sans pellets qui descendent dans le creuset. Solution : videz le réservoir, démontez la vis (1-2 vis selon modèle), retirez l'obstacle. Profitez-en pour vérifier qu'aucun élément étranger n'est présent.",
        ],
      },
      {
        heading: "Cause n°6 : prise d'air comburant obstruée (5 %)",
        paragraphs: [
          "Les modèles étanches prennent leur air de combustion à l'extérieur via un tuyau en façade. Une feuille morte, un nid, ou une grille obstruée bloque l'arrivée d'air. Le poêle ne peut plus brûler correctement et s'éteint.",
          "Diagnostic : passez à l'extérieur, vérifiez la grille de prise d'air. Solution : nettoyez à la brosse. Sur les non-étanches, vérifiez la grille de ventilation de la pièce, un meuble qui obstrue est aussi un classique.",
        ],
      },
      {
        heading: "Cause n°7 : conduit non ramoné ou refoulement (2 %)",
        paragraphs: [
          "Aucune loi wallonne n'impose de ramoner un poêle, mais la plupart des contrats d'assurance incendie l'exigent chaque année, et pour une bonne raison : la suie accumulée réduit le tirage. Par grand vent, un refoulement temporaire peut aussi déclencher l'extinction.",
          "Diagnostic : si le poêle s'éteint surtout par temps venteux ou si vous sentez une odeur de fumée intermittente, c'est probablement le conduit. Solution : un ramonage (90 € TVAC chez nous, certificat compris). Vérifiez aussi le chapeau du conduit : nid d'oiseau, mousse, c'est fréquent.",
        ],
        callout: {
          variant: "warning",
          text: "Si votre contrat d'assurance impose un ramonage annuel, l'assureur peut réduire ou refuser son intervention après un feu de cheminée quand le défaut de ramonage a joué dans le sinistre. Gardez toujours le certificat.",
        },
      },
      {
        heading: "Si rien ne fonctionne : appelez votre SAV",
        paragraphs: [
          "Si vous avez vérifié les 7 points ci-dessus sans succès, c'est probablement une panne matérielle : résistance d'allumage HS (durée de vie typique 4-7 ans), motoréducteur de vis sans fin, carte électronique. Ces réparations dépassent les compétences classiques d'un utilisateur, appelez votre installateur.",
          "Mister Pellets intervient en SAV dans les 50 km autour de Fernelmont. Pour les clients hors zone, on conseille toujours un installateur certifié local. Les pièces détachées Edilkamin, EK63 et Girolami sont disponibles en stock chez nous sous 48 h. Les questions qu'on nous pose le plus sur les pannes, l'entretien et le SAV sont réunies dans [la FAQ des poêles à pellets](/faq).",
        ],
      },
    ],
    faqs: [
      {
        question: "Mon poêle à pellets s'éteint au bout de 30 minutes, que faire ?",
        answer:
          "C'est typique d'un creuset encrassé qui ne laisse plus passer l'air primaire. Videz le creuset à froid, brossez les trous avec une brosse métallique, et vérifiez que les pellets sont certifiés ENplus A1 ou DINplus. Si le problème persiste après 2-3 cycles, contrôlez la sonde de fumée.",
      },
      {
        question: "Combien coûte une intervention SAV en Wallonie ?",
        answer:
          "Chez Mister Pellets, le dépannage coûte 110 € TVAC la première heure, puis 60 € TVAC par heure, déplacement inclus dans notre zone. Les pièces sont facturées en plus.",
      },
      {
        question: "Est-ce normal que mon poêle s'éteigne quand le réservoir est vide ?",
        answer:
          "Oui, c'est une sécurité normale. Le poêle détecte l'absence de pellets via la chute de température et déclenche une extinction propre. Remplissez le réservoir, attendez 5 minutes que la vis se réamorce, redémarrez.",
      },
      {
        question: "Mon poêle s'éteint surtout par temps de vent, pourquoi ?",
        answer:
          "Le vent peut provoquer un refoulement dans le conduit de fumée, surtout si le chapeau est mal adapté ou obstrué. Solution : faire vérifier le chapeau par un ramoneur, et si nécessaire installer un chapeau anti-refoulement type rotatif.",
      },
    ],
    related: {
      articles: [
        "poele-pellets-sans-electricite-coupure-courant",
        "pellets-enplus-a1-vs-dinplus",
        "budget-hiver-poele-pellets-consommation-2026",
      ],
      guides: ["remettre-en-route-poele-pellets-automne", "comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege", "fernelmont"],
      brands: ["edilkamin", "ek63", "girolami"],
    },
  },
];

// =====================================================================
// HELPERS
// =====================================================================

export function getArticleBySlug(slug: string): ArticleData | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): ArticleData[] {
  return ARTICLES.filter((a) => a.category === category);
}

export function getRelatedArticles(slug: string, limit = 3): ArticleData[] {
  const current = getArticleBySlug(slug);
  if (!current) return [];

  const explicit = (current.related.articles ?? [])
    .map((s) => getArticleBySlug(s))
    .filter((a): a is ArticleData => Boolean(a));

  if (explicit.length >= limit) return explicit.slice(0, limit);

  // Fallback : autres articles de la même catégorie, puis tout le reste
  const sameCategory = ARTICLES.filter(
    (a) => a.slug !== slug && a.category === current.category && !explicit.includes(a),
  );
  const others = ARTICLES.filter(
    (a) =>
      a.slug !== slug &&
      a.category !== current.category &&
      !explicit.includes(a) &&
      !sameCategory.includes(a),
  );

  return [...explicit, ...sameCategory, ...others].slice(0, limit);
}

export function getLatestArticles(limit = 6): ArticleData[] {
  return [...ARTICLES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export const ARTICLE_CATEGORIES: { value: ArticleCategory; label: string }[] = (
  Object.entries(CATEGORY_LABELS) as [ArticleCategory, string][]
).map(([value, label]) => ({ value, label }));
