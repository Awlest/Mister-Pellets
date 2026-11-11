import type { ProductDemo } from "./products-demo";
import { isHybrid } from "./catalog-scope";
import { REMISES, TARIFS } from "./pose/tarifs";
import { evacuationPrice, formatEur, HAUTEUR, INSTALL_TYPES, VAT, withVat, type InstallType } from "./pose/moteur";
import { shownPriceTTC } from "./product-price";

/**
 * Pages catégories du catalogue : une vraie page par famille de poêles, avec
 * sa grille de fiches rendue par le serveur. Elles remplacent les liens de
 * menu vers la boutique filtrée (`/boutique?chauffage=hydro`), qui servaient
 * la page de la boutique sans titre ni adresse propres.
 *
 * Chaque page vit dans app/(frontend)/<slug>/page.tsx et rend
 * components/sections/CategoryLanding.tsx : chapô, grille, tableau du
 * catalogue calculé au rendu (`summarizeCategory`), texte « comment choisir »
 * (`sections`), trois fiches et deux guides liés, questions fréquentes.
 * Montants de pose : lib/pose/tarifs.ts, jamais écrits à la main.
 *
 * Les hybrides bois + pellets ne figurent dans aucune catégorie : leur fiche
 * de référence est sur mister-bois.be (lib/catalog-scope.ts).
 */
export interface CategoryData {
  /** Clé de la catégorie, aussi son adresse sans la barre. */
  slug:
    | "poeles-a-pellets-canalisables"
    | "poeles-a-pellets-hydro"
    | "inserts-a-pellets"
    | "poeles-a-pellets-etanches";
  path: string;
  /** Libellé du menu et du fil d'Ariane. */
  label: string;
  /** Libellé court du volet mobile. */
  short: string;
  /** Sous-titre du menu. */
  navDesc: string;
  /** H1 : début, puis mots en accent. */
  h1: { lead: string; accent: string };
  metaTitle: string;
  metaDescription: string;
  /** Chapô de 80 à 120 mots, faits tirés du site (guides, tarifs de pose). */
  intro: string;
  /** Guide ou article qui détaille le sujet. */
  guide?: { href: string; label: string };
  /** Texte « comment choisir », sous la grille ; liens `[texte](adresse)` permis. */
  sections?: { heading: string; paragraphs: string[] }[];
  /** Questions fréquentes, visibles et balisées (FAQPage). */
  faq?: { question: string; answer: string }[];
  /** Trois fiches à regarder (slugs) : seules celles encore au catalogue s'affichent. */
  featured?: string[];
  /** Guides et articles liés, en plus de `guide`. */
  readMore?: { href: string; label: string }[];
  /** Dernière modification du texte (AAAA-MM-JJ) : affichée, et `lastmod` du sitemap. */
  modifiedAt: string;
  /** La fiche appartient à la catégorie. */
  matches: (p: ProductDemo) => boolean;
}

const isInsert = (p: ProductDemo): boolean =>
  p.type === "insert" || p.appliance === "insert" || p.appliance === "foyer";
const isHydro = (p: ProductDemo): boolean => Boolean(p.isHydro) || p.type === "hydro";

/** Montant HTVA et TVAC à 6 % (logement de plus de 10 ans), au format du site. */
const htTtc = (ht: number): string => `${formatEur(ht)} HTVA (${formatEur(withVat(ht, VAT.reduced).total)} TVAC à 6 %)`;

/**
 * Pose d'une évacuation et son raccordement, TVAC à 6 %, remises en cours
 * comprises, au même calcul que /estimation et /prix-poele-pellets.
 */
export function evacuationTtc(type: InstallType, hauteurM: number = HAUTEUR.defaut): string {
  const ht =
    evacuationPrice(type, hauteurM, TARIFS, REMISES).amountHT +
    INSTALL_TYPES[type].percements * TARIFS.percementRenforceHT;
  return formatEur(withVat(ht, VAT.reduced).total);
}

const CANAL = htTtc(TARIFS.canalisationParPieceHT);
const CANAL_MAX = TARIFS.canalisationPiecesMax;

export const CATEGORIES: CategoryData[] = [
  {
    slug: "poeles-a-pellets-canalisables",
    path: "/poeles-a-pellets-canalisables",
    label: "Poêles canalisables",
    short: "Canalisables",
    navDesc: "Chauffer une ou deux pièces de plus",
    h1: { lead: "Poêles à pellets", accent: "canalisables" },
    metaTitle: "Poêles à pellets canalisables en Wallonie",
    metaDescription:
      "Poêles à pellets canalisables posés en Wallonie : un seul poêle chauffe la pièce de vie et une ou deux pièces voisines par gaines. Modèles et prix.",
    intro: `Un poêle à pellets canalisable chauffe la pièce où il est posé et envoie une partie de l'air chaud vers une ou deux pièces voisines, par des gaines isolées passées dans un mur, un faux plafond ou les combles. C'est ce qu'on pose le plus souvent dans une maison à étage de 100 à 180 m² : un seul appareil et un seul conduit de fumées. La canalisation se chiffre à part de la pose, ${formatEur(TARIFS.canalisationParPieceHT)} HTVA par pièce desservie, ${TARIFS.canalisationPiecesMax} pièces au plus. Pour chauffer toute la maison, on regarde plutôt un poêle hydro raccordé aux radiateurs.`,
    guide: { href: "/guides/poele-pellets-canalisable", label: "Le guide du poêle canalisable" },
    modifiedAt: "2026-11-11",
    sections: [
      {
        heading: "Comment choisir un poêle à pellets canalisable",
        paragraphs: [
          `Commencez par compter les pièces à chauffer. Un canalisable chauffe la pièce où il est posé et une ou deux pièces voisines : nous canalisons ${CANAL_MAX} pièces au plus, à ${CANAL} par pièce desservie, matériel et main d'œuvre compris. Au-delà, l'air arrive tiède au bout de la gaine. Pour chauffer toute la maison, un [poêle à pellets hydro](/poeles-a-pellets-hydro) raccordé aux radiateurs fait mieux le travail.`,
          "Calculez ensuite la puissance sur toute la surface chauffée, pièces desservies comprises, et pas sur le seul séjour. Un appareil trop juste tourne à plein régime tout l'hiver ; un appareil trop fort tourne au ralenti et s'encrasse. Le tableau ci-dessus donne la plage de puissance de chaque marque, et notre [guide de la puissance](/guides/quelle-puissance-poele-pellets) fait le calcul selon la surface et l'isolation.",
          "Regardez le trajet de la gaine avant le modèle. Plus elle est longue, plus l'air perd de chaleur en route : chaque notice fixe la longueur admise, et MCZ annonce jusqu'à 8 m sur sa gamme Comfort Air. La gaine isolée passe dans une cloison, un faux plafond ou les combles. Nous traçons son chemin à la visite technique, bouche par bouche, avant de chiffrer.",
          "Vérifiez enfin la ventilation de la maison. La plupart des canalisables du catalogue sont aussi étanches : ils prennent leur air de combustion dehors et conviennent à une maison isolée équipée d'une ventilation double flux. Les autres puisent leur air dans la pièce, qui doit alors avoir une arrivée d'air.",
          "Le prix affiché sur chaque fiche est celui de l'appareil, TVA comprise. La pose, l'évacuation des fumées et la canalisation s'ajoutent : la page des [prix d'un poêle à pellets posé](/prix-poele-pellets) détaille chaque forfait, et l'[estimation en ligne](/estimation) fait le total pour votre maison en deux minutes. Le prix ferme suit la visite technique, gratuite.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien de pièces peut chauffer un poêle à pellets canalisable ?",
        answer: `La pièce où il est posé, plus une ou deux pièces voisines par des gaines. Nous canalisons ${CANAL_MAX} pièces au plus. Pour chauffer toutes les pièces d'une maison, un [poêle hydro](/poeles-a-pellets-hydro) raccordé aux radiateurs convient mieux.`,
      },
      {
        question: "Combien coûte la canalisation d'un poêle à pellets ?",
        answer: `${CANAL} par pièce desservie, matériel et main d'œuvre compris, en plus de la pose du poêle et de son évacuation. La TVA à 6 % vaut pour un logement de plus de 10 ans ; sinon, c'est 21 %.`,
      },
      {
        question: "Quelle longueur de gaine pour un poêle canalisable ?",
        answer:
          "Celle que la notice du modèle autorise. MCZ annonce jusqu'à 8 m sur sa gamme Comfort Air. Plus la gaine est courte et isolée, plus l'air arrive chaud : nous traçons le trajet à la visite technique.",
      },
      {
        question: "Un poêle à pellets canalisable peut-il chauffer l'étage ?",
        answer:
          "Oui. La gaine monte dans une cloison ou un coffrage, puis débouche dans une chambre ou un bureau de l'étage. C'est la configuration la plus fréquente dans une maison à étage.",
      },
    ],
    featured: ["ek63-tweed-90", "cadel-luce-plus-9-up-twin", "edilkamin-cherie-11-evo"],
    readMore: [{ href: "/guides/quelle-puissance-poele-pellets", label: "Quelle puissance de poêle à pellets ?" }],
    matches: (p) => (Boolean(p.isCanalizable) || p.type === "canalisable") && !isInsert(p),
  },
  {
    slug: "poeles-a-pellets-hydro",
    path: "/poeles-a-pellets-hydro",
    label: "Poêles hydro",
    short: "Hydro",
    navDesc: "Raccordés aux radiateurs",
    h1: { lead: "Poêles à pellets", accent: "hydro" },
    metaTitle: "Poêles à pellets hydro en Wallonie",
    metaDescription:
      "Poêles à pellets hydro raccordés aux radiateurs ou au plancher chauffant, pour remplacer une chaudière au mazout. Modèles et puissances, pose en Wallonie.",
    intro:
      "Un poêle à pellets hydro chauffe l'eau d'un circuit : il alimente vos radiateurs ou votre plancher chauffant, comme une chaudière, tout en chauffant la pièce où il se trouve. C'est le choix quand on remplace une chaudière au mazout ou au gaz et qu'on garde le chauffage central. La pose ajoute un raccordement hydraulique au conduit de fumées : comptez un à deux jours de chantier selon l'installation en place. Raccordé au chauffage central, l'appareil se contrôle chaque année, comme le prévoit l'arrêté wallon du 29 janvier 2009.",
    guide: { href: "/guides/poele-pellets-hydro", label: "Le guide du poêle hydro" },
    modifiedAt: "2026-11-11",
    sections: [
      {
        heading: "Comment choisir un poêle à pellets hydro",
        paragraphs: [
          "Un poêle hydro se dimensionne sur les besoins de toute la maison, pas sur la pièce où il est posé. Sa puissance se partage entre l'eau du circuit et l'air de la pièce, et chaque fiche donne la part rendue à l'eau : c'est elle qui doit couvrir vos radiateurs ou votre plancher chauffant. Le tableau ci-dessus donne la plage de puissance de chaque marque ; la visite technique fixe la bonne valeur pour votre maison.",
          "Regardez ensuite l'installation en place. Radiateurs ou plancher chauffant, ballon d'eau chaude, vase d'expansion, place pour le poêle dans une pièce de vie : tout se relève à la visite. La pose ajoute un raccordement hydraulique à l'évacuation des fumées, et le chantier dure un à deux jours selon ce qui existe. Si vous gardez l'ancienne chaudière en secours, dites-le dès la visite : son raccordement se prévoit dans le devis.",
          "Pensez à l'autonomie. Le réservoir des hydros du catalogue contient de 14 à 30 kg de pellets selon le modèle : une grosse journée en régime doux, quelques heures à pleine puissance. En plein hiver, un silo relié au poêle évite de le remplir chaque jour.",
          "Choisissez aussi entre un modèle étanche, qui prend son air dehors et convient à une maison équipée d'une ventilation double flux, et un modèle qui puise son air dans la pièce. Les deux existent en hydro au catalogue.",
          "Côté budget, le prix affiché est celui de l'appareil, TVA comprise ; une fiche sans prix est sur devis. Le kit hydraulique, le raccordement et l'évacuation s'ajoutent : l'[estimation en ligne](/estimation) compose le total, et la page des [prix d'un poêle à pellets posé](/prix-poele-pellets) détaille les forfaits. Il n'y a plus de prime régionale pour un poêle depuis le 1er octobre 2026 : l'aide qui reste est la TVA à 6 % dans un logement de plus de 10 ans (voir [nos aides](/aides-poele-a-pellets-wallonie)).",
        ],
      },
    ],
    faq: [
      {
        question: "Un poêle à pellets hydro peut-il remplacer une chaudière au mazout ?",
        answer:
          "Oui, quand la puissance qu'il rend à l'eau couvre les besoins de la maison et que le circuit de radiateurs ou de plancher chauffant est en état. La visite technique le vérifie avant tout devis. Le [guide du poêle hydro](/guides/poele-pellets-hydro) détaille le remplacement.",
      },
      {
        question: "Faut-il faire contrôler un poêle hydro chaque année ?",
        answer:
          "Oui. Raccordé au chauffage central, il entre dans l'arrêté du Gouvernement wallon du 29 janvier 2009, qui prévoit un contrôle périodique des générateurs au combustible solide. Notre [entretien](/entretien-poele-a-pellets) coûte 175 € TVAC, ramonage du conduit compris.",
      },
      {
        question: "Combien de temps tient le réservoir d'un poêle hydro ?",
        answer:
          "Les hydros du catalogue ont un réservoir de 14 à 30 kg : de quelques heures à pleine puissance à une grosse journée en régime doux. Un silo relié au poêle évite le remplissage quotidien en plein hiver.",
      },
      {
        question: "Y a-t-il une prime pour un poêle à pellets hydro en Wallonie ?",
        answer:
          "Non : la prime Habitation s'est arrêtée le 30 septembre 2026. Restent la TVA à 6 % quand l'installateur fournit et pose le poêle dans un logement de plus de 10 ans, et la subvention MEBAR du CPAS pour les petits revenus. Le détail est sur [notre page des aides](/aides-poele-a-pellets-wallonie).",
      },
    ],
    featured: ["ek63-spot-100h", "ek63-monday-190h", "mcz-thea-hydro-18-r"],
    readMore: [{ href: "/blog/remplacer-chaudiere-mazout-poele-hydro", label: "Remplacer une chaudière au mazout" }],
    matches: (p) => isHydro(p) && !isInsert(p),
  },
  {
    slug: "inserts-a-pellets",
    path: "/inserts-a-pellets",
    label: "Inserts à pellets",
    short: "Inserts",
    navDesc: "Dans une cheminée existante",
    h1: { lead: "Inserts et foyers", accent: "à pellets" },
    metaTitle: "Inserts à pellets pour cheminée existante",
    metaDescription:
      "Inserts et foyers à pellets à encastrer dans une cheminée existante : modèles à air, canalisables et hydro, posés en Wallonie par Mister Pellets.",
    intro:
      "Un insert à pellets s'encastre dans une cheminée existante, à la place du foyer ouvert ou d'un ancien insert. Vous gardez la cheminée et son habillage, et vous gagnez un chauffage qui se programme et s'alimente seul depuis son réservoir. Le conduit en place doit convenir au pellet : on contrôle son état et son diamètre à la visite technique, avant de chiffrer. Certains inserts sont canalisables et envoient de l'air chaud vers une pièce voisine. Les foyers hydro, eux, se raccordent au chauffage central et alimentent les radiateurs.",
    guide: { href: "/blog/insert-pellets-cheminee-existante", label: "Poser un insert à pellets dans une cheminée" },
    modifiedAt: "2026-11-11",
    sections: [
      {
        heading: "Comment choisir un insert à pellets",
        paragraphs: [
          "Tout part de la cheminée. Nous mesurons le foyer et la hotte, pas seulement l'ouverture : l'insert doit s'y glisser, se raccorder et garder l'espace de ventilation que demande sa notice. Un insert compact comme l'EK63 Pellek 80 ou l'Edilkamin Pellkamin 8 Evo mesure 73,5 cm de large pour 49 cm de haut et 49 cm de profondeur ; le Pellkamin 12++ Evo monte à 93 cm de large.",
          `Le conduit vient ensuite. Un insert à pellets pousse ses fumées avec un ventilateur : le conduit travaille en légère pression et doit être étanche, ce que le vieux conduit maçonné d'un feu ouvert n'est presque jamais. On y descend donc un tubage inox de 80 ou 100 mm jusqu'en haut de la souche. Chez nous, le tubage de 10 m et le raccordement coûtent ${evacuationTtc("tubage")} TVAC à 6 %, remises en cours comprises, puis s'ajustent au mètre réel.`,
          "Choisissez la façon de chauffer. Un insert à air chauffe la pièce de la cheminée. Un modèle canalisable, comme l'Edilkamin Pellkamin 10+ ou l'EK63 Pellek 110+, envoie une partie de l'air chaud vers une pièce voisine par une gaine. Un foyer hydro se raccorde au chauffage central et alimente les radiateurs : c'est le cas des MCZ Vivo 90 Hydro du catalogue.",
          "Tenez compte du réservoir. Pour tenir dans un foyer, il est petit : 11 kg sur le Pellek 80 et le Pellkamin 8 Evo, de 6 à 16 heures selon la puissance d'après Edilkamin. En plein hiver, vous remplissez chaque jour. Un tiroir de chargement frontal, proposé en option sur certains modèles, se décide à la commande.",
          "Le prix affiché sur chaque fiche est celui de l'insert, TVA comprise ; une fiche sans prix est sur devis. L'[estimation en ligne](/estimation) ajoute la pose et le tubage. Vous préférez brûler des bûches ? Les inserts à bois sont chez [Mister Bois](https://mister-bois.be/inserts-a-bois).",
        ],
      },
    ],
    faq: [
      {
        question: "Peut-on mettre un insert à pellets dans n'importe quelle cheminée ?",
        answer:
          "Dans la plupart des cheminées ouvertes, oui, si le foyer est assez grand, si le conduit peut être tubé jusqu'en haut et si une prise électrique est accessible. Un conduit dévoyé ou une cheminée très étroite demande plus de travail : la visite technique tranche.",
      },
      {
        question: "Faut-il tuber la cheminée pour un insert à pellets ?",
        answer: `Presque toujours : le conduit doit être étanche, parce que l'insert pousse ses fumées avec un ventilateur. Le tubage inox de 80 ou 100 mm et le raccordement coûtent ${evacuationTtc("tubage")} TVAC pour 10 m chez nous, remises en cours comprises. Une cheminée déjà tubée en inox et en bon état se raccorde simplement.`,
      },
      {
        question: "Un insert à pellets peut-il chauffer plusieurs pièces ?",
        answer:
          "Oui, de deux façons : un modèle canalisable envoie de l'air chaud vers une pièce voisine par une gaine, et un foyer hydro alimente les radiateurs du chauffage central. Un insert à air ne chauffe que la pièce de la cheminée.",
      },
      {
        question: "Combien de temps tient le réservoir d'un insert à pellets ?",
        answer:
          "Sur les modèles compacts, 11 kg de pellets : de 6 heures à pleine puissance à 16 heures au ralenti, selon Edilkamin pour le Pellkamin 8 Evo. En plein hiver, on le remplit chaque jour.",
      },
    ],
    featured: ["edilkamin-pellkamin-10-plus", "cadel-zefiro-9", "mcz-vivo-90-hydro-smartclean-18"],
    readMore: [{ href: "/blog/evacuation-fumees-poele-pellets", label: "Tubage, conduit ou ventouse : l'évacuation" }],
    matches: (p) => isInsert(p),
  },
  {
    slug: "poeles-a-pellets-etanches",
    path: "/poeles-a-pellets-etanches",
    label: "Poêles étanches",
    short: "Étanches",
    navDesc: "Maison isolée, ventilation double flux",
    h1: { lead: "Poêles à pellets", accent: "étanches" },
    metaTitle: "Poêles à pellets étanches en Wallonie",
    metaDescription:
      "Poêles à pellets étanches pour maison bien isolée ou ventilation double flux : l'air de combustion vient de l'extérieur. Modèles posés en Wallonie.",
    intro:
      "Un poêle à pellets étanche prend l'air de sa combustion à l'extérieur, par une arrivée dédiée, et pas dans la pièce. Il ne perturbe donc pas une ventilation double flux et convient aux maisons récentes ou rénovées, bien isolées. Selon la marque, les fumées sortent par une ventouse concentrique en façade ou par un conduit qui monte au-dessus du toit : avec Edilkamin et EK63, c'est toujours le conduit vertical. La puissance se choisit avec la surface et l'isolation, et le configurateur la calcule en deux minutes.",
    guide: { href: "/blog/evacuation-fumees-poele-pellets", label: "Tubage, conduit ou ventouse : l'évacuation des fumées" },
    modifiedAt: "2026-11-11",
    sections: [
      {
        heading: "Comment choisir un poêle à pellets étanche",
        paragraphs: [
          "Un poêle étanche se justifie d'abord par la maison. S'il y a une ventilation double flux, une hotte puissante ou une construction très isolée et peu ventilée, le poêle ne doit pas puiser son air dans la pièce : l'étanche le prend dehors, par une arrivée d'air dédiée ou par un conduit concentrique. Dans une maison ancienne qui respire, un poêle non étanche avec une arrivée d'air suffit souvent.",
          "Choisissez une puissance modeste. Une maison bien isolée demande peu : la règle courante est d'1 kW pour 12 à 15 m² dans une maison très bien isolée, contre 1 kW pour 10 m² dans une maison correctement isolée. Le tableau ci-dessus donne la plage de chaque marque, et notre [guide de la puissance](/guides/quelle-puissance-poele-pellets) détaille le calcul. Un poêle trop fort tournera au ralenti et s'encrassera.",
          `Décidez ensuite de l'évacuation. Étanche ne veut pas dire sans conduit : comme tout poêle à pellets, il pousse ses fumées avec un ventilateur, dans un conduit étanche. Sans cheminée, un poêle étanche peut sortir en façade par une ventouse concentrique, si sa notice la prévoit : ${evacuationTtc("ventouse-facade")} TVAC à 6 % chez nous, remise en cours comprise. Une sortie murale simple n'est pas admise, et avec Edilkamin et EK63 il n'y a jamais de ventouse : le conduit monte au-dessus du toit, ${evacuationTtc("conduit-exterieur")} TVAC pour 10 m de conduit double paroi en façade.`,
          "Regardez aussi le bruit et le diffuseur. Les poêles étanches du catalogue vont du petit poêle à air au canalisable et à l'hydro. Si le souffle d'un ventilateur vous gêne, Austroflamm chauffe par convection naturelle, sans ventilateur qui souffle dans la pièce.",
          "Le prix affiché sur chaque fiche est celui de l'appareil, TVA comprise ; une fiche sans prix est sur devis. La pose et l'évacuation s'ajoutent : voyez la page des [prix d'un poêle à pellets posé](/prix-poele-pellets) ou l'[estimation en ligne](/estimation).",
        ],
      },
    ],
    faq: [
      {
        question: "Qu'est-ce qu'un poêle à pellets étanche ?",
        answer:
          "Un poêle dont la chambre de combustion est fermée à l'air de la pièce : il prend son air dehors, par une arrivée dédiée ou un conduit concentrique, et rejette ses fumées par un conduit étanche. Il ne perturbe pas une ventilation double flux.",
      },
      {
        question: "Un poêle à pellets étanche est-il obligatoire avec une VMC double flux ?",
        answer:
          "C'est le choix que nous recommandons : un poêle qui puise son air dans la pièce entre en concurrence avec la ventilation, qui équilibre l'air entrant et sortant. Un poêle étanche reste indépendant de la VMC.",
      },
      {
        question: "Peut-on installer un poêle à pellets étanche sans cheminée ?",
        answer:
          "Oui : par une ventouse concentrique en façade si la notice du poêle la prévoit (jamais avec Edilkamin ni EK63), ou par un conduit double paroi qui monte au-dessus du toit, en façade ou par l'intérieur. Les prix de chaque solution sont sur la page des [prix d'un poêle à pellets posé](/prix-poele-pellets).",
      },
      {
        question: "Quelle marque de poêle à pellets étanche choisir ?",
        answer:
          "Toutes les marques que nous posons ont des modèles étanches. Le choix se fait sur la puissance, l'évacuation possible chez vous (Edilkamin et EK63 refusent la ventouse), le bruit et le budget. Le tableau de cette page donne le nombre de modèles et les prix affichés de chaque marque.",
      },
    ],
    featured: ["cadel-perla-7", "girolami-split", "austroflamm-clou-pellet-8"],
    readMore: [{ href: "/blog/ek63-etanche-maison-passive-bbc", label: "Poêle étanche et maison passive" }],
    matches: (p) => Boolean(p.isAirtight) && !isInsert(p),
  },
];

/** Une ligne du tableau d'une catégorie : une marque, ou le total. */
export interface CategorySummaryRow {
  brand: string;
  models: number;
  /** Puissances extrêmes (kW), puissances regroupées d'une fiche comprises. */
  minKw?: number;
  maxKw?: number;
  /** Fiches avec un prix affiché, et prix affichés extrêmes (TVAC, appareil seul). */
  priced: number;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Tableau d'une catégorie, calculé au rendu sur les fiches visibles : par
 * marque (de la plus fournie à la moins fournie), puis le total. Le prix est
 * celui de la carte (bonus de saison, sinon promo, sinon catalogue).
 */
export function summarizeCategory(products: readonly ProductDemo[]): { rows: CategorySummaryRow[]; total: CategorySummaryRow } {
  const summarize = (brand: string, list: readonly ProductDemo[]): CategorySummaryRow => {
    const kws = list.flatMap((p) => (p.powers && p.powers.length > 0 ? p.powers : [p.powerKw])).filter((k) => k > 0);
    const prices = list.map((p) => shownPriceTTC(p)).filter((v): v is number => typeof v === "number" && v > 0);
    return {
      brand,
      models: list.length,
      ...(kws.length > 0 && { minKw: Math.min(...kws), maxKw: Math.max(...kws) }),
      priced: prices.length,
      ...(prices.length > 0 && { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) }),
    };
  };
  const byBrand = new Map<string, ProductDemo[]>();
  for (const p of products) byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p]);
  const rows = [...byBrand.entries()]
    .map(([brand, list]) => summarize(brand, list))
    .sort((a, b) => b.models - a.models || a.brand.localeCompare(b.brand, "fr"));
  return { rows, total: summarize("Toutes marques", products) };
}

/** Fiches d'une catégorie parmi les fiches visibles, hybrides exclus. */
export function productsInCategory<T extends ProductDemo>(category: CategoryData, products: readonly T[]): T[] {
  return products.filter((p) => !isHybrid(p) && category.matches(p));
}

/** Catégories auxquelles appartient une fiche (liens depuis la fiche produit). */
export function categoriesOf(product: ProductDemo): CategoryData[] {
  if (isHybrid(product)) return [];
  return CATEGORIES.filter((c) => c.matches(product));
}

export function getCategory(slug: CategoryData["slug"]): CategoryData {
  return CATEGORIES.find((c) => c.slug === slug)!;
}
