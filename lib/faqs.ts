/**
 * Compilation centralisée des FAQ Mister Pellets (Hotfix V1.3 §P2).
 *
 * Source : compilation des FAQ déjà rédigées sur le site (page Primes,
 * page d'accueil, guides, articles blog) + nouvelles questions ajoutées
 * pour combler les angles morts (cf. doc §P2.5).
 *
 * Voix : vouvoiement (charte juin 2026), installateur wallon, zéro tiret long.
 * 3 marques mises en avant : Edilkamin, EK63, Girolami. Aucun paiement en ligne : devis, visite, acompte.
 * Stratégie GEO : première phrase de chaque réponse = la réponse complète,
 * le reste détaille. Réponses 50 à 200 mots. Mention naturelle de la marque
 * et de la zone géographique (Mister Pellets, Wallonie). Schema FAQPage
 * généré automatiquement sur la page /faq.
 */

export type FaqCategory =
  | "general"
  | "choisir"
  | "marques"
  | "pellets"
  | "installation"
  | "primes"
  | "entretien"
  | "boutique"
  | "showroom";

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  general: "Général",
  choisir: "Choisir son poêle",
  marques: "Marques",
  pellets: "Pellets",
  installation: "Installation",
  primes: "Primes & aides",
  entretien: "Entretien & SAV",
  boutique: "Boutique en ligne",
  showroom: "Showroom & RDV",
};

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  // ───────────────────────────────────────────────────────────────────
  // GÉNÉRAL
  // ───────────────────────────────────────────────────────────────────
  {
    id: "general-zone",
    category: "general",
    question: "Mister Pellets installe-t-il en dehors de la Wallonie ?",
    answer:
      "Pour la livraison d'un poêle, on couvre toute la Belgique : gratuite dans un rayon de 20 km autour de notre showroom de Fernelmont, puis forfait de 50 € en Wallonie, 100 € à Bruxelles et 100 € en Flandre. Pour la pose et le SAV, c'est différent : notre équipe est basée à Fernelmont et reste concentrée sur les 5 provinces wallonnes (Namur, Liège, Hainaut, Brabant wallon, Luxembourg), là où on peut garantir un suivi de proximité. En Flandre et à Bruxelles, on livre le matériel mais on ne fait pas la pose ni le SAV.",
  },
  {
    id: "general-awlest",
    category: "general",
    question: "Quelle est la différence entre Mister Pellets et Awlest ?",
    answer:
      "Mister Pellets est la marque commerciale spécialisée dans les poêles à pellets d'Awlest SRL, société active en Wallonie depuis 2016. Concrètement, quand vous recevez un devis ou une facture de notre part, le nom Awlest apparaît sur le document, parce que c'est la société qui porte juridiquement l'activité. Mister Pellets, c'est le visage métier. Awlest, c'est la structure légale derrière. Même équipe, même showroom à Fernelmont, même numéro de TVA (BE 0656.514.212).",
  },
  {
    id: "general-delai",
    category: "general",
    question: "Combien de temps entre la demande de devis et la pose ?",
    answer:
      "Comptez 3 à 6 semaines en saison normale, plus long de septembre à décembre où la demande est forte. Le diagnostic à domicile est planifiable dans la semaine qui suit votre demande. Le devis tombe sous 48 heures ouvrées après visite. Une fois le devis signé, les modèles courants sont disponibles en 5 à 10 jours, les configurations spécifiques (couleurs rares, hydros sur-mesure) en 3 à 5 semaines.",
  },
  {
    id: "general-volume",
    category: "general",
    question: "Combien de poêles avez-vous installés depuis votre création ?",
    answer:
      "Plus de 800 poêles à pellets vendus et installés en Wallonie depuis 2016. On installe entre 80 et 120 poêles par an, sur des maisons de toutes tailles (mosanes, fermettes rénovées, BBC modernes). On dit non à un projet quand on pense que ce n'est pas le bon choix pour le client, ce qui nous a coûté quelques ventes mais nous a permis de tenir notre standard de qualité.",
  },
  {
    id: "general-garantie",
    category: "general",
    question: "Quelles garanties offrez-vous ?",
    answer:
      "Garantie légale belge de 2 ans sur tous les produits. En complément, garantie commerciale Mister Pellets de 5 ans pièces et main d'œuvre sur les poêles installés par notre équipe, sous réserve d'un entretien annuel. Le SAV est assuré directement par nous (pas de sous-traitance), avec un délai d'intervention typique de 48 à 72 heures dans la zone Fernelmont et 50 km autour.",
  },
  {
    id: "general-contact",
    category: "general",
    question: "Comment vous contacter ?",
    answer:
      "Trois canaux : téléphone au 081 13 83 09 (le plus rapide, du lundi au vendredi 9h-18h et samedi 9h-13h), email à info@awlest.com, ou formulaire de devis en ligne avec réponse sous 48 heures ouvrées. Pour une visite en personne, le showroom de Fernelmont vous reçoit uniquement sur rendez-vous.",
  },

  // ───────────────────────────────────────────────────────────────────
  // CHOISIR SON POÊLE
  // ───────────────────────────────────────────────────────────────────
  {
    id: "choisir-puissance-100",
    category: "choisir",
    question: "Quelle puissance de poêle pour 100 m² bien isolés ?",
    answer:
      "Pour 100 m² PEB B, visez 8 à 10 kW. Pour la même surface en PEB A (passif ou quasi-passif), 7 à 8 kW suffisent. Pour PEB C-D, montez à 10-12 kW. Pour PEB E ou pire, prévoyez 12 à 15 kW. Multipliez votre surface par 0,10 si la PEB est bonne (A-B), par 0,12 si moyenne (C-D), par 0,15 si faible (E-G). Ajoutez 10 % par 25 cm de plafond au-dessus de 2,50 m. Sur le terrain, on affine toujours en regardant la maison.",
  },
  {
    id: "choisir-puissance-150",
    category: "choisir",
    question: "Quelle puissance pour 150 m² mal isolés ?",
    answer:
      "Pour 150 m² en PEB E ou F, visez 18 à 22 kW. À ce niveau de puissance et de surface, mieux vaut passer sur un canalisable qui distribue la chaleur dans plusieurs pièces, voire un hydro raccordé aux radiateurs si la maison a déjà un circuit central. Un seul poêle d'air à 22 kW dans une grande maison mal isolée chauffera essentiellement la pièce d'installation et laissera les autres au froid. Le diagnostic à domicile valide la stratégie avant signature du devis.",
  },
  {
    id: "choisir-poele-vs-chaudiere",
    category: "choisir",
    question: "Quelle différence entre un poêle à pellets et une chaudière à pellets ?",
    answer:
      "Un poêle à pellets chauffe par sa flamme et son enveloppe : il est dans la pièce de vie, il diffuse de la chaleur localement (avec ventilateur ou par convection naturelle). Une chaudière à pellets est dans une chaufferie, elle alimente un circuit d'eau qui dessert radiateurs ou plancher chauffant via la maison entière. Entre les deux, le poêle hydro fait office d'intermédiaire : il est visible dans la pièce, il chauffe par sa flamme, et il alimente aussi un circuit hydraulique central.",
  },
  {
    id: "choisir-coupure-courant",
    category: "choisir",
    question: "Mon poêle peut-il fonctionner pendant une coupure de courant ?",
    answer:
      "Non. Un poêle à pellets a besoin d'électricité pour faire fonctionner sa résistance d'allumage, son motoréducteur de vis sans fin et son ventilateur d'extraction des fumées. En cas de coupure, le poêle s'éteint en sécurité et redémarre tout seul au retour du courant si vous l'aviez laissé en mode automatique. Pour une autonomie totale, il faudrait coupler avec un onduleur ou un groupe électrogène, ce qu'on déconseille pour un usage résidentiel classique.",
  },
  {
    id: "choisir-sans-cheminee",
    category: "choisir",
    question: "Peut-on installer un poêle à pellets sans cheminée existante ?",
    answer:
      "Oui, deux options. Première : ventouse en façade, possible uniquement avec les modèles étanches certifiés. C'est la solution la plus simple et la moins chère (pas de tubage en toiture, pas de complexité d'étanchéité). Deuxième : un conduit neuf, le long de la façade ou à travers la maison jusqu'au toit, utilisable avec tous les modèles. Comptez environ 1 800 à 2 200 € TVAC de plus qu'une pose sur conduit existant pour 6 m de conduit (TVA à 6 %), puis un peu plus de 200 € par mètre supplémentaire. Le diagnostic à domicile valide quelle option est techniquement faisable chez vous.",
  },
  {
    id: "choisir-etanche",
    category: "choisir",
    question: "Quelle différence entre un poêle étanche et un poêle non étanche ?",
    answer:
      "Un poêle étanche prend l'air comburant directement à l'extérieur via un tuyau dédié (concentrique avec la sortie de fumée le plus souvent), donc il ne consomme pas l'air de la pièce. Un poêle non étanche puise l'air dans la pièce d'installation. Les modèles étanches sont indispensables en maison passive, BBC ou avec VMC double flux, et fortement recommandés en logement bien isolé. Ils permettent aussi le passage en ventouse façade. Surcoût typique : 200 à 400 € sur le matériel.",
  },
  {
    id: "choisir-canalisable-vs-hydro",
    category: "choisir",
    question: "Canalisable ou hydro, comment choisir ?",
    answer:
      "Canalisable si vous voulez chauffer votre pièce de vie principale plus 1 ou 2 pièces secondaires (chambres, bureau) via un réseau de gaines isolées. Hydro si vous voulez chauffer toute la maison via le circuit existant de radiateurs ou de plancher chauffant, typiquement en remplacement d'une chaudière mazout. Hydro est nettement plus cher (8 000 à 14 000 € posé contre 5 500 à 8 000 € pour un canalisable) mais c'est la seule solution pour un chauffage central complet.",
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES
  // ───────────────────────────────────────────────────────────────────
  {
    id: "marques-distribuees",
    category: "marques",
    question: "Quelles marques distribuez-vous ?",
    answer:
      "Trois marques, choisies pour couvrir l'ensemble des besoins wallons. Edilkamin (Italie, depuis 1963) est la référence italienne du chauffage biomasse, gamme très large et Wi-Fi de série sur les modèles récents. EK63, la marque sœur du groupe Edilkamin, vise le moderne et le connecté à un prix plus accessible. Girolami (Italie, depuis 1970) est un fabricant familial au brevet Source Feeding autonettoyant, avec une gamme hybride bois-pellet et des thermopoêles hydro pour remplacer une chaudière. Les trois sont posées et suivies par notre équipe, avec le même SAV de proximité.",
  },
  {
    id: "marques-edilkamin-vs-ek63",
    category: "marques",
    question: "Edilkamin ou EK63 : quelle différence ?",
    answer:
      "EK63 est la marque sœur d'Edilkamin, créée par le même groupe italien. EK63 propose des modèles modernes et connectés à un prix plus accessible. Edilkamin garde une gamme plus large (notamment les modèles haut de gamme et les inserts) et un positionnement plus traditionnel. Côté technique, les deux marques partagent les mêmes standards de qualité et les mêmes certifications (CE, EN 14785, écodesign 2022). Le choix se fait souvent sur le design et le budget.",
  },
  {
    id: "marques-girolami-particularite",
    category: "marques",
    question: "Qu'est-ce qui rend Girolami différent des autres ?",
    answer:
      "Girolami a un brevet maison, le Source Feeding : le pellet est poussé sous le brasier au lieu de tomber dessus, et les cendres sont chassées dans un bac sous le foyer. Concrètement, le brasier reste propre tout seul, vous ne grattez plus tous les jours, vous videz le cendrier une fois par semaine. C'est un fabricant familial italien de Sant'Oreste, près de Rome, depuis 1970. Autre signature : la gamme hybride bois-pellet (le Soft, Good Design Award 2022), où une sonde reconnaît seule le combustible chargé et bascule entre bûche et pellet sans toucher au menu.",
  },
  {
    id: "marques-girolami-bois-pellet",
    category: "marques",
    question: "Un Girolami fonctionne-t-il au bois et aux pellets ?",
    answer:
      "Oui, sur la gamme hybride, le Soft en tête. Le Fuel Convert System détecte tout seul le combustible chargé : des pellets, ça tourne au pellet ; des bûches, ça bascule en mode bois, sans toucher au menu. Vous allumez au pellet le matin pour l'automatique, vous finissez la soirée à la bûche si l'envie vous prend. Le reste de la gamme (Vert, Flow, Curvy, Split) est en pellet, avec le brasier autonettoyant et un poêle étanche compatible avec les maisons bien isolées.",
  },
  {
    id: "marques-best-seller",
    category: "marques",
    question: "Quels sont vos modèles best-sellers ?",
    answer:
      "Nos deux meilleures ventes sont des EK63 : la Tweed 90+ (9,2 kW) et la Spy 110+ (10,5 kW), canalisables et étanches. Chez Edilkamin, la Cherie 11++ Evo (11 kW, canalisable) couvre la plupart des maisons à étage, et la Celia Air Tight C (7,2 kW, étanche) les maisons très bien isolées. Chez Girolami, le Soft, primé au Good Design Award 2022, remplace une chaudière au mazout en hydro, et le Vert canalisable chauffe deux pièces de plus. Le diagnostic à domicile tranche selon votre maison.",
  },

  // ───────────────────────────────────────────────────────────────────
  // PELLETS (combustible)
  // ───────────────────────────────────────────────────────────────────
  {
    id: "pellets-consommation-10kw",
    category: "pellets",
    question: "Combien de pellets consomme un poêle de 10 kW par an ?",
    answer:
      "Pour une maison wallonne PEB B-C de 120 m² avec un poêle 10 kW en chauffage principal, comptez 1,5 à 2 tonnes par saison de chauffe (octobre à avril). En appoint sur les 3 mois d'hiver les plus froids, plutôt 600 à 900 kg. La consommation réelle dépend de l'isolation, de la température de consigne, du nombre d'occupants, et de la rigueur de l'hiver. Sur 5 ans, un Wallon moyen consomme entre 7 et 10 tonnes de pellets pour un usage chauffage principal.",
  },
  {
    id: "pellets-enplus-vs-dinplus",
    category: "pellets",
    question: "ENplus A1 ou DINplus : quelle différence ?",
    answer:
      "Pour un poêle domestique, aucune : les deux certifications reprennent la classe A1 de la norme ISO 17225-2, avec les mêmes seuils. Au moins 4,6 kWh/kg, 0,7 % de cendres au maximum, 10 % d'humidité au maximum, 6 mm de diamètre à 1 mm près. ENplus est la plus répandue dans les magasins wallons, DINplus vient d'Allemagne. Prenez celle qui est disponible au meilleur prix, et refusez un sac sans certification : vous ne savez pas ce que vous brûlez.",
  },
  {
    id: "pellets-prix-tonne",
    category: "pellets",
    question: "Combien coûte une tonne de pellets en Wallonie en 2026 ?",
    answer:
      "Autour de 410 € la tonne en sacs. En août 2026, ValBiom relevait en moyenne 6,19 € le sac de 15 kg en Wallonie, pour des pellets certifiés achetés par palette, livraison non comprise. C'est 13 % de plus qu'en août 2025 (5,48 €). Le sac acheté à l'unité coûte plus cher. ValBiom ne s'attend pas à une baisse pour l'hiver 2026-2027 : si vous avez la place, faire son stock à l'automne reste le bon réflexe.",
  },
  {
    id: "pellets-stockage",
    category: "pellets",
    question: "Comment stocker les pellets correctement ?",
    answer:
      "Au sec, sur une palette, jamais à même un sol en béton. C'est l'humidité qui abîme les pellets, pas le froid : un garage non chauffé convient s'il est sain. Une palette de 66 sacs (990 kg) tient sur moins d'un mètre carré. Évitez les caves humides : un pellet qui prend l'eau gonfle, se délite et peut bourrer la vis sans fin. Fermez les sacs entamés et videz-les en entier dans le réservoir plutôt que de les laisser ouverts.",
  },
  {
    id: "pellets-mauvaise-qualite",
    category: "pellets",
    question: "Quels sont les risques avec un pellet de mauvaise qualité ?",
    answer:
      "Trois risques : combustion plus mauvaise (rendement réduit de 20 à 30 %, donc vous brûlez plus de pellets pour la même chaleur), encrassement de l'échangeur 3 fois plus rapide (mâchefer dans le creuset, blocage de la sonde de fumée), et casse prématurée des composants. Sur le terrain, on a vu des poêles de 3 ans tomber en panne à cause de pellets bon marché non certifiés. La garantie ne couvre pas ce type de sinistre. L'économie apparente de 2 € le sac est largement perdue en surconsommation et en SAV.",
  },

  // ───────────────────────────────────────────────────────────────────
  // INSTALLATION
  // ───────────────────────────────────────────────────────────────────
  {
    id: "installation-duree",
    category: "installation",
    question: "Combien de temps prend la pose d'un poêle à pellets ?",
    answer:
      "Une pose standard sur conduit existant se fait en une journée, du démontage de l'ancien appareil au premier feu avec vous en fin d'après-midi. Un canalisable avec gaines vers d'autres pièces prend 1,5 jour en moyenne. Un hydro complet avec raccordement aux radiateurs et désembouage compte 2 à 3 jours. L'équipe arrive entre 8h et 9h, prépare la zone (bâches, plaques de protection), pose, raccorde, étanchéifie, met en service.",
  },
  {
    id: "installation-plafond",
    category: "installation",
    question: "Quelle hauteur de plafond minimum est requise ?",
    answer:
      "2,20 m minimum pour la pièce d'installation, 2,50 m recommandés pour un confort optimal. Au-dessus de 3 m (rénovations dans des fermettes, lofts, vieux corps de logis namurois), il faut majorer la puissance du poêle de 10 % par 25 cm supplémentaires pour compenser le volume d'air à chauffer. Le diagnostic à domicile vérifie aussi les distances de sécurité au-dessus du poêle (typiquement 40 à 60 cm sous une étagère ou un plafond inflammable).",
  },
  {
    id: "installation-air-comburant",
    category: "installation",
    question: "Faut-il une arrivée d'air dédiée ?",
    answer:
      "Oui pour les modèles étanches (raccordement direct vers l'extérieur via tuyau dédié, c'est leur principe). Pour les modèles non étanches en maison non hermétique, une grille d'aération dans la pièce ou la pièce attenante suffit. En maison passive, BBC ou avec VMC double-flux, seul le poêle étanche est admissible. Le diagnostic vérifie que la prise d'air a la section demandée par la notice du fabricant pour votre modèle.",
  },
  {
    id: "installation-distance-mur-bois",
    category: "installation",
    question: "Quelle distance entre le poêle et un mur en bois ?",
    answer:
      "La distance minimale réglementaire dépend du modèle et figure sur la fiche constructeur. Typiquement, comptez 20 cm latéralement et 30 à 40 cm à l'arrière pour un poêle à pellets moderne (ces distances sont nettement réduites par rapport aux poêles à bois grâce à l'enveloppe mieux isolée). Pour un mur sensible (bois, papier peint, placo non protégé), une plaque de protection murale incombustible est ajoutée si la distance ne peut pas être respectée.",
  },
  {
    id: "installation-appartement",
    category: "installation",
    question: "Peut-on poser un poêle dans un appartement ?",
    answer:
      "Oui, à condition d'avoir un conduit de fumée existant ou de pouvoir tirer une ventouse en façade (modèles étanches). Vérifications préalables : autorisation du syndic de copropriété (souvent obligatoire pour percer la façade), respect du règlement de copropriété, contrôle des distances de sécurité dans une pièce souvent plus contrainte qu'en maison. Sur les anciens appartements bruxellois et liégeois avec conduit existant, c'est la configuration la plus simple. Sur les appartements neufs, tout dépend de la façade.",
  },
  {
    id: "installation-conduit-existant",
    category: "installation",
    question: "Mon ancien conduit de cheminée est-il utilisable ?",
    answer:
      "Si le conduit est en bon état et conforme (chemisé inox ou émail vitrifié récent), il est utilisable directement. Pour les conduits anciens (avant 1980, ou en briques non chemisées), le tubage est obligatoire pour la sécurité et la conformité. Comptez environ 700 à 1 400 € TVAC de plus qu'un simple raccordement, selon la hauteur (TVA à 6 %). Le diagnostic à domicile inclut une inspection visuelle du conduit. Pour les cas douteux, un test de vacuité par fumigène est réalisé avant de signer le devis.",
  },

  // ───────────────────────────────────────────────────────────────────
  // PRIMES & AIDES
  // ───────────────────────────────────────────────────────────────────
  {
    id: "primes-montant-max",
    category: "primes",
    question: "Existe-t-il encore une prime pour un poêle à pellets en 2026 ?",
    answer:
      "Non, plus depuis le 1er octobre 2026, sauf pour les ménages à très petits revenus (subvention MEBAR, via le CPAS). La prime Habitation, qui couvrait le poêle à pellets, s'est arrêtée le 30 septembre 2026 : travaux terminés et demande introduite ce jour-là au plus tard. La Wallonie soutient désormais la rénovation par deux prêts, le Rénopack et le Rénoprêt, réservés aux maisons classées E, F ou G qui gagnent le label exigé après travaux. Pour un poêle posé seul, l'aide qui reste est la TVA à 6 % dans un logement de plus de 10 ans.",
  },
  {
    id: "primes-categorie",
    category: "primes",
    question: "Comment savoir dans quelle catégorie de revenus je tombe pour le Rénopack ?",
    answer:
      "Quatre catégories, selon les revenus du ménage : C1 jusqu'à 28 900 €, C2 jusqu'à 41 100 €, C3 jusqu'à 67 100 € et C4 jusqu'à 122 800 €. Les seuils sont indexés au 1er janvier 2026 et baissent de 5 000 € par personne à charge. En C1, la moitié du Rénopack ne se rembourse pas, 40 % en C2 et 15 % en C3 ; la C4 a droit au Rénoprêt, sans part effacée. La SWCS, le Fonds du Logement ou le 1718 (gratuit) vous situent précisément.",
  },
  {
    id: "primes-audit-obligatoire",
    category: "primes",
    question: "Faut-il un audit logement ?",
    answer:
      "Pour un poêle seul, non : il n'y a plus de prime à demander. Pour un Rénopack ou un Rénoprêt, oui. L'audit doit avoir été réalisé ou actualisé moins d'un an avant la demande de prêt, et c'est lui qui fixe le label PEB de départ et la liste des travaux. Si un tel projet est en vue, parlez-nous de l'audit avant de choisir le poêle : sa puissance doit correspondre à la maison une fois isolée.",
  },
  {
    id: "primes-eligible",
    category: "primes",
    question: "Mon poêle doit-il figurer sur une liste officielle ?",
    answer:
      "Plus pour une prime, puisqu'elle a pris fin. Tous les poêles vendus en Europe depuis le 1er janvier 2022 doivent respecter le règlement d'écoconception (UE) 2015/1185 : au moins 79 % de rendement saisonnier pour un poêle à pellets, et des plafonds d'émissions de particules, de monoxyde de carbone et d'oxydes d'azote. Les modèles que nous posons y répondent. Si vous financez le poêle par un Rénopack, la SWCS vous dira si elle impose d'autres critères.",
  },
  {
    id: "primes-delai-versement",
    category: "primes",
    question: "Mon poêle a été posé en septembre 2026 : puis-je encore demander la prime ?",
    answer:
      "Seulement si la demande a été introduite au plus tard le 30 septembre 2026 à 23 h 59, la date limite du régime temporaire. Une exception concerne les projets lancés avant le 14 février 2025, avec un devis daté et signé avant cette date : ils peuvent demander la prime aux anciennes conditions jusqu'au 30 septembre 2027, une fois la mesure publiée au Moniteur belge. Le 1718 (gratuit) vous renseignera sur votre cas.",
  },
  {
    id: "primes-cumul-tva",
    category: "primes",
    question: "Puis-je cumuler la TVA à 6 % et le Rénopack ?",
    answer:
      "Oui, l'un n'empêche pas l'autre. La TVA réduite est fédérale : elle s'applique sur la facture quand nous fournissons et posons le poêle dans un logement privé de plus de 10 ans. Le Rénopack est un prêt régional qui finance des travaux, poêle compris, si le projet remplit ses conditions (maison classée E, F ou G, audit de moins d'un an, saut de label).",
  },
  {
    id: "primes-r5",
    category: "primes",
    question: "Et si les revenus du ménage dépassent 122 800 € ?",
    answer:
      "Pour un ménage qui occupe son logement, les prêts régionaux s'arrêtent là : ni Rénopack ni Rénoprêt. Il reste la TVA à 6 % sur un logement de plus de 10 ans, poêle et pose compris, et les économies de combustible si vous quittez le mazout. Si vous louez le logement, le Rénoprêt est ouvert aux propriétaires bailleurs : la SWCS vous dira à quelles conditions.",
  },

  // ───────────────────────────────────────────────────────────────────
  // ENTRETIEN & SAV
  // ───────────────────────────────────────────────────────────────────
  {
    id: "entretien-frequence",
    category: "entretien",
    question: "À quelle fréquence faire ramoner mon poêle ?",
    answer:
      "Une fois par an. Aucune loi wallonne ni fédérale ne l'impose pour un poêle, mais la plupart des contrats d'assurance incendie l'exigent, comme les notices des fabricants et certains règlements de police communaux. Gardez le certificat : si un feu de cheminée survient alors que le ramonage manque, l'assureur peut réduire son intervention quand ce manquement a joué dans le sinistre. Chez nous, le ramonage coûte 90 € TVAC, et il est compris dans l'entretien complet à 175 € TVAC.",
  },
  {
    id: "entretien-poele-eteint",
    category: "entretien",
    question: "Mon poêle s'éteint tout seul, que faire ?",
    answer:
      "Sept causes couvrent 95 % des cas, dans l'ordre de fréquence : creuset encrassé (40 %), pellets humides ou de mauvaise qualité (20 %), sonde de fumée encrassée (15 %), échangeur bouché (10 %), vis sans fin bloquée (8 %), prise d'air comburant obstruée (5 %), conduit non ramoné ou refoulement (2 %). À froid, videz et brossez le creuset, contrôlez la qualité des pellets, essuyez la sonde de fumée. Si rien ne fonctionne après ces 3 vérifications, appelez le SAV.",
  },
  {
    id: "entretien-cout-annuel",
    category: "entretien",
    question: "Quel est le coût moyen d'un entretien annuel ?",
    answer:
      "175 € TVAC chez nous, ramonage du conduit compris, déplacement inclus dans notre zone d'intervention. L'opération dure environ 90 minutes : démontage, nettoyage du creuset, de l'échangeur, de la chambre de combustion, du conduit interne, de la sonde de fumée et du ventilateur d'extraction, puis contrôle des joints et des paramètres de combustion. Le ramonage seul coûte 90 € TVAC.",
  },
  {
    id: "entretien-quotidien",
    category: "entretien",
    question: "Quel entretien quotidien est nécessaire ?",
    answer:
      "Videz les cendres tous les 2 à 3 jours en pleine saison de chauffe. Brossez le creuset toutes les semaines avec une brosse métallique pour décoller le mâchefer (résidu vitrifié qui bouche les trous d'admission d'air). Essuyez la vitre avec un chiffon humide ou un produit dégraissant à froid. Tous les 15 jours, actionnez la canne de ramonage interne (levier en façade sur les Edilkamin et EK63). C'est l'entretien le plus important pour préserver la durée de vie du poêle.",
  },
  {
    id: "entretien-sav-delai",
    category: "entretien",
    question: "Quel est le délai d'intervention SAV ?",
    answer:
      "48 à 72 heures dans la zone Fernelmont et 50 km autour, hors période de pic hivernal où le délai peut s'étendre à 5 à 7 jours. Le SAV est assuré directement par notre équipe (pas de sous-traitance), avec stock de pièces détachées Edilkamin, EK63 et Girolami disponibles sous 48 heures. Côté prix : 110 € TVAC la première heure, puis 60 € TVAC par heure supplémentaire, déplacement inclus dans notre zone, pièces en plus.",
  },

  // ───────────────────────────────────────────────────────────────────
  // BOUTIQUE EN LIGNE
  // ───────────────────────────────────────────────────────────────────
  {
    id: "boutique-livraison",
    category: "boutique",
    question: "Livrez-vous partout en Belgique ?",
    answer:
      "Oui, on livre nos poêles partout en Belgique. La livraison est gratuite dans un rayon de 20 km autour de notre showroom de Fernelmont (Namur et les communes voisines). Au-delà, le forfait est simple et transparent : 50 € pour le reste de la Wallonie, 100 € à Bruxelles, 100 € en Flandre. La pose et le SAV, eux, restent concentrés sur la Wallonie où notre équipe est basée : en Flandre et à Bruxelles, on livre le matériel mais on ne pose pas et on n'assure pas le SAV.",
  },
  {
    id: "boutique-pose-en-ligne",
    category: "boutique",
    question: "Puis-je acheter le poêle en ligne et le faire poser par Mister Pellets ?",
    answer:
      "Oui, c'est même la configuration la plus fréquente. Vous chiffrez votre installation sur le configurateur, on cale une visite technique, et c'est elle qui transforme l'estimation en prix ferme : on valide le conduit, les distances et l'accès avant tout engagement. Quand nous fournissons et posons le poêle dans un logement de plus de 10 ans, toute la facture est à 6 % de TVA, poêle compris. Un poêle livré sans pose reste à 21 %. Une fois le devis accepté, vous recevez la facture d'acompte et on planifie la pose.",
  },
  {
    id: "boutique-paiement",
    category: "boutique",
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Rien ne se paie en ligne. Après la visite technique et l'acceptation du devis, vous recevez une facture d'acompte de 30 %, puis le solde à la fin de la pose. Virement, carte ou Bancontact. Si votre projet entre dans les conditions du Rénopack ou du Rénoprêt (logement classé E, F ou G, audit, saut de label), le prêt de la SWCS ou du Fonds du Logement peut financer la facture.",
  },
  {
    id: "boutique-retour",
    category: "boutique",
    question: "Quel est le droit de rétractation sur un achat en ligne ?",
    answer:
      "Conformément au Code de droit économique belge, vous disposez d'un délai de 14 jours à compter de la réception du produit pour exercer votre droit de rétractation, sans avoir à motiver votre décision. Les frais de retour sont à votre charge. Ce droit ne s'applique pas aux produits déjà installés ni aux prestations de pose déjà exécutées. Pour les commandes en ligne sans pose, le retour est simple : vous nous contactez, on récupère.",
  },

  // ───────────────────────────────────────────────────────────────────
  // SHOWROOM & RDV
  // ───────────────────────────────────────────────────────────────────
  {
    id: "showroom-adresse",
    category: "showroom",
    question: "Où se trouve votre showroom ?",
    answer:
      "Rue des Fagotis 3A, 5380 Fernelmont, à 17 km de Namur centre et accessible par la N4. Parking devant le bâtiment, accès PMR au rez-de-chaussée. On y expose plusieurs modèles des marques que nous distribuons (Edilkamin, EK63, Girolami). Horaires : du lundi au vendredi de 9 h à 18 h, le samedi de 9 h à 13 h, uniquement sur rendez-vous.",
  },
  {
    id: "showroom-modeles",
    category: "showroom",
    question: "Tous les modèles de poêles sont-ils visibles au showroom ?",
    answer:
      "Non. La sélection en exposition tourne au fil des saisons et des modèles que nous testons. Comme le showroom se visite sur rendez-vous, dites-nous en réservant quel modèle vous intéresse : on vous confirme la veille ce qui est exposé, et au besoin on en sort un du stock de l'atelier pour votre visite.",
  },
  {
    id: "showroom-services",
    category: "showroom",
    question: "Quels services sont disponibles via la prise de rendez-vous ?",
    answer:
      "Cinq services. Le devis sur place à domicile (gratuit, 60 minutes) et la visite du showroom à Fernelmont (gratuite, 45 minutes) se réservent en ligne, sur la page Prendre rendez-vous. L'entretien annuel (175 € TVAC, ramonage compris, environ 90 minutes), le dépannage (110 € TVAC la première heure) et le ramonage (90 € TVAC, certificat fourni) se calent par téléphone au 081 13 83 09 : on a besoin de savoir quel poêle on vient voir avant de bloquer un créneau.",
  },
  {
    id: "showroom-visio",
    category: "showroom",
    question: "Peut-on faire le diagnostic en visio ?",
    answer:
      "Oui, c'est une option proposée pour les clients hors zone ou pour gagner du temps. Le diagnostic en visio dure 15 minutes et permet de cadrer le projet (surface, isolation, type de pièce, conduit existant) sans déplacement. Si le projet avance, le diagnostic technique à domicile reste recommandé avant signature du devis pour valider les détails (distances, accès, étanchéité). Prise de rendez-vous via téléphone ou formulaire de contact.",
  },
];

// =====================================================================
// HELPERS
// =====================================================================

export function getFaqsByCategory(category: FaqCategory): FaqItem[] {
  return FAQS.filter((f) => f.category === category);
}

export function searchFaqs(query: string): FaqItem[] {
  const q = query.toLowerCase().trim();
  if (q === "") return FAQS;
  return FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q),
  );
}

export const FAQ_CATEGORIES: { value: FaqCategory; label: string; count: number }[] = (
  Object.entries(FAQ_CATEGORY_LABELS) as [FaqCategory, string][]
).map(([value, label]) => ({
  value,
  label,
  count: FAQS.filter((f) => f.category === value).length,
}));
