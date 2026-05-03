/**
 * Compilation centralisée des FAQ Mister Pellets (Hotfix V1.3 §P2).
 *
 * Source : compilation des FAQ déjà rédigées sur le site (page Primes,
 * page d'accueil, guides, articles blog) + nouvelles questions ajoutées
 * pour combler les angles morts (cf. doc §P2.5).
 *
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
      "Notre cœur de zone est la Wallonie, avec livraison gratuite dans un rayon de 50 km autour de notre showroom de Fernelmont. Au-delà, on couvre les 5 provinces wallonnes au cas par cas (Namur, Liège, Hainaut, Brabant wallon, Luxembourg) avec une participation aux frais de déplacement chiffrée dans le devis. On n'intervient pas en Flandre ni à Bruxelles, faute d'avoir une équipe SAV de proximité dans ces régions.",
  },
  {
    id: "general-awlest",
    category: "general",
    question: "Quelle est la différence entre Mister Pellets et Awlest ?",
    answer:
      "Mister Pellets est la marque commerciale spécialisée dans les poêles à pellets d'Awlest SRL, société active en Wallonie depuis 2016. Concrètement, quand tu reçois un devis ou une facture de notre part, le nom Awlest apparaît sur le document, parce que c'est la société qui porte juridiquement l'activité. Mister Pellets, c'est le visage métier. Awlest, c'est la structure légale derrière. Même équipe, même showroom à Fernelmont, même numéro de TVA (BE 0656.514.212).",
  },
  {
    id: "general-delai",
    category: "general",
    question: "Combien de temps entre la demande de devis et la pose ?",
    answer:
      "Compte 3 à 6 semaines en saison normale, plus long de septembre à décembre où la demande est forte. Le diagnostic à domicile est planifiable dans la semaine qui suit ta demande. Le devis tombe sous 48 heures ouvrées après visite. Une fois le devis signé, les modèles courants sont disponibles en 5 à 10 jours, les configurations spécifiques (couleurs rares, hydros sur-mesure) en 3 à 5 semaines.",
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
      "Garantie légale belge de 2 ans sur tous les produits. En complément, garantie commerciale Mister Pellets de 5 ans pièces et main d'œuvre sur les poêles installés par notre équipe, sous réserve de l'entretien annuel obligatoire. Le SAV est assuré directement par nous (pas de sous-traitance), avec un délai d'intervention typique de 48 à 72 heures dans la zone Fernelmont et 50 km autour.",
  },
  {
    id: "general-contact",
    category: "general",
    question: "Comment vous contacter ?",
    answer:
      "Trois canaux : téléphone au 0472 04 32 22 (le plus rapide, du lundi au vendredi 9h-18h et samedi 9h-13h), email à info@awlest.com, ou formulaire de devis en ligne avec réponse sous 48 heures ouvrées. Pour une visite en personne, le showroom de Fernelmont accueille sur rendez-vous (recommandé pour garantir la disponibilité d'un conseiller).",
  },

  // ───────────────────────────────────────────────────────────────────
  // CHOISIR SON POÊLE
  // ───────────────────────────────────────────────────────────────────
  {
    id: "choisir-puissance-100",
    category: "choisir",
    question: "Quelle puissance de poêle pour 100 m² bien isolés ?",
    answer:
      "Pour 100 m² PEB B, vise 8 à 10 kW. Pour la même surface en PEB A (passif ou quasi-passif), 7 à 8 kW suffisent. Pour PEB C-D, monte à 10-12 kW. Pour PEB E ou pire, prévois 12 à 15 kW. Multiplie ta surface par 0,10 si la PEB est bonne (A-B), par 0,12 si moyenne (C-D), par 0,15 si faible (E-G). Ajoute 10 % par 25 cm de plafond au-dessus de 2,50 m. Sur le terrain, on affine toujours en regardant la maison.",
  },
  {
    id: "choisir-puissance-150",
    category: "choisir",
    question: "Quelle puissance pour 150 m² mal isolés ?",
    answer:
      "Pour 150 m² en PEB E ou F, vise 18 à 22 kW. À ce niveau de puissance et de surface, mieux vaut passer sur un canalisable qui distribue la chaleur dans plusieurs pièces, voire un hydro raccordé aux radiateurs si la maison a déjà un circuit central. Un seul poêle d'air à 22 kW dans une grande maison mal isolée chauffera essentiellement la pièce d'installation et laissera les autres au froid. Le diagnostic à domicile valide la stratégie avant signature du devis.",
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
      "Non. Un poêle à pellets a besoin d'électricité pour faire fonctionner sa résistance d'allumage, son motoréducteur de vis sans fin et son ventilateur d'extraction des fumées. En cas de coupure, le poêle s'éteint en sécurité et redémarre tout seul au retour du courant si tu l'avais laissé en mode automatique. Pour une autonomie totale, il faudrait coupler avec un onduleur ou un groupe électrogène, ce qu'on déconseille pour un usage résidentiel classique.",
  },
  {
    id: "choisir-sans-cheminee",
    category: "choisir",
    question: "Peut-on installer un poêle à pellets sans cheminée existante ?",
    answer:
      "Oui, deux options. Première : ventouse en façade, possible uniquement avec les modèles étanches certifiés. C'est la solution la plus simple et la moins chère (pas de tubage en toiture, pas de complexité d'étanchéité). Deuxième : conduit en toiture, plus cher (1 200 à 2 500 € selon la complexité du toit) mais utilisable avec tous les modèles. Le diagnostic à domicile valide quelle option est techniquement faisable chez toi.",
  },
  {
    id: "choisir-etanche",
    category: "choisir",
    question: "Quelle différence entre un poêle étanche et un poêle non étanche ?",
    answer:
      "Un poêle étanche prend l'air comburant directement à l'extérieur via un tuyau dédié (concentrique avec la sortie de fumée le plus souvent), donc il ne consomme pas l'air de la pièce. Un poêle non étanche puise l'air dans la pièce d'installation. Les modèles étanches sont obligatoires en maison passive, BBC ou avec VMC double-flux, et fortement recommandés en logement bien isolé. Ils permettent aussi le passage en ventouse façade. Surcoût typique : 200 à 400 € sur le matériel.",
  },
  {
    id: "choisir-canalisable-vs-hydro",
    category: "choisir",
    question: "Canalisable ou hydro, comment choisir ?",
    answer:
      "Canalisable si tu veux chauffer ta pièce de vie principale + 1 ou 2 pièces secondaires (chambres, bureau) via un réseau de gaines isolées. Hydro si tu veux chauffer toute la maison via le circuit existant de radiateurs ou de plancher chauffant, typiquement en remplacement d'une chaudière mazout. Hydro est nettement plus cher (8 000 à 14 000 € posé contre 5 500 à 8 000 € pour un canalisable) mais c'est la seule solution pour un chauffage central complet.",
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES
  // ───────────────────────────────────────────────────────────────────
  {
    id: "marques-distribuees",
    category: "marques",
    question: "Quelles marques distribuez-vous ?",
    answer:
      "Quatre marques sélectionnées pour couvrir l'ensemble des besoins wallons. Edilkamin (Italie, depuis 1963) est la référence italienne du chauffage biomasse avec une gamme très large et le Wi-Fi de série. EK63 est la marque sœur du groupe Edilkamin, orientée moderne et connectée à un prix plus accessible. Dielle (Italie) se distingue par son système breveté de combustion par alimentation par le bas (flamme plus calme, auto-nettoyage, gamme complète y compris hybride bois et pellets). Ferlux (Espagne, plus de 28 ans) propose une gamme complète à excellent rapport qualité-prix.",
  },
  {
    id: "marques-edilkamin-vs-ek63",
    category: "marques",
    question: "Edilkamin ou EK63 : quelle différence ?",
    answer:
      "EK63 est la marque sœur d'Edilkamin, créée par le même groupe italien. EK63 propose des modèles modernes et connectés à un prix plus accessible. Edilkamin garde une gamme plus large (notamment les modèles haut de gamme et les inserts) et un positionnement plus traditionnel. Côté technique, les deux marques partagent les mêmes standards de qualité et les mêmes certifications (CE, EN 14785, écodesign 2022). Le choix se fait souvent sur le design et le budget.",
  },
  {
    id: "marques-dielle-particularite",
    category: "marques",
    question: "Qu'est-ce qui rend Dielle différent des autres ?",
    answer:
      "Dielle utilise un système breveté de combustion par alimentation par le bas du brasero (vis sans fin en inox depuis le bas), alors que la majorité des poêles alimentent par le haut. Conséquences concrètes : flamme plus naturelle et plus calme (proche d'un poêle à bois traditionnel), auto-nettoyage du brasero (moins d'entretien), tolérance accrue aux pellets de qualité variable, fonctionnement plus silencieux. La gamme inclut aussi un modèle hybride qui fonctionne au pellets ET au bois (Ghibli Hybrid Idro), unique sur le marché.",
  },
  {
    id: "marques-ferlux-budget",
    category: "marques",
    question: "Ferlux est-il vraiment moins cher que les marques italiennes ?",
    answer:
      "Oui, Ferlux propose un excellent rapport qualité-prix avec des poêles à partir de 1 600 à 2 500 € matériel seul. C'est un fabricant espagnol établi depuis plus de 28 ans, distribué dans plus de 30 pays, avec une gamme complète (air, canalisable, hydro). Le rendement annoncé monte jusqu'à 94 %, parmi les meilleurs du marché. Made in Spain, certifications CE et EN 13240. Pour une résidence principale ou secondaire avec un budget maîtrisé, Ferlux tient parfaitement la route.",
  },
  {
    id: "marques-best-seller",
    category: "marques",
    question: "Quels sont vos modèles best-sellers ?",
    answer:
      "Côté Edilkamin : la Blade Plus 9 kW (étanche moderne pour BBC) et la Cherie Up 11 kW (polyvalente). Côté EK63 : la Tweed 90+ canalisable 9 kW (très populaire en Wallonie) et la Like 80 pour les appartements. Côté Dielle : la série Round (air design rond) et la série Bump Idro pour les hydros. Côté Ferlux : la Helen pour l'air et la Lyra pour le canalisable. Le diagnostic à domicile précise quel modèle correspond le mieux à ta configuration.",
  },

  // ───────────────────────────────────────────────────────────────────
  // PELLETS (combustible)
  // ───────────────────────────────────────────────────────────────────
  {
    id: "pellets-consommation-10kw",
    category: "pellets",
    question: "Combien de pellets consomme un poêle de 10 kW par an ?",
    answer:
      "Pour une maison wallonne PEB B-C de 120 m² avec un poêle 10 kW en chauffage principal, compte 1,5 à 2 tonnes par saison de chauffe (octobre à avril). En appoint sur les 3 mois d'hiver les plus froids, plutôt 600 à 900 kg. La consommation réelle dépend de l'isolation, de la température de consigne, du nombre d'occupants, et de la rigueur de l'hiver. Sur 5 ans, un Wallon moyen consomme entre 7 et 10 tonnes de pellets pour un usage chauffage principal.",
  },
  {
    id: "pellets-enplus-vs-dinplus",
    category: "pellets",
    question: "ENplus A1 ou DINplus : quelle différence ?",
    answer:
      "Les deux certifications garantissent la même qualité pour un usage domestique en Belgique. ENplus A1 et DINplus livrent ≥ 4,6 kWh/kg, ≤ 0,7 % de cendres, ≤ 10 % d'humidité, traçabilité du sac jusqu'à la scierie. ENplus est plus répandue dans les enseignes wallonnes. DINplus impose un seuil de cendres légèrement plus strict (≤ 0,5 %). Choisis selon disponibilité et prix. Refuse tout sac sans certification visible : un pellet douteux peut faire 3,5 kWh/kg avec 2 % de cendres et casse l'échangeur en 2 saisons.",
  },
  {
    id: "pellets-prix-tonne",
    category: "pellets",
    question: "Combien coûte une tonne de pellets en Wallonie en 2026 ?",
    answer:
      "Au sac de 15 kg en grande surface bricolage : 6,20 à 7,00 € le sac (soit 410 à 470 € la tonne équivalente). En achat groupé sur palette de 66 sacs (990 kg) : 5,50 à 6,30 € le sac (370 à 420 € la tonne). En vrac livré pour ceux qui ont un silo : 360 à 410 € la tonne TVAC. Achat conseillé en été pour profiter des stocks bas saison (10 à 15 % de réduction par rapport aux prix d'hiver).",
  },
  {
    id: "pellets-stockage",
    category: "pellets",
    question: "Comment stocker les pellets correctement ?",
    answer:
      "Stockage sec, ventilé, à l'abri du gel intense (sous -10 °C, les pellets se fragilisent). Pour 800 kg/an de consommation, prévois 4 m² de palette dans un garage ou un abri. Évite les sous-sols humides : le pellet absorbe vite l'humidité et perd en pouvoir calorifique dès 12 % d'eau. Pose les sacs sur palette bois pour éviter le contact direct avec un sol béton humide. Vérifie la date d'ensachage : un pellet de plus de 18 mois a souvent perdu en cohésion.",
  },
  {
    id: "pellets-mauvaise-qualite",
    category: "pellets",
    question: "Quels sont les risques avec un pellet de mauvaise qualité ?",
    answer:
      "Trois risques : combustion plus mauvaise (rendement réduit de 20 à 30 %, donc tu brûles plus de pellets pour la même chaleur), encrassement de l'échangeur 3 fois plus rapide (mâchefer dans le creuset, blocage de la sonde de fumée), et casse prématurée des composants. Sur le terrain, on a vu des poêles 3 ans tomber en panne pour cause de pellets bon marché non certifiés. La garantie ne couvre pas ce type de sinistre. L'économie apparente de 2 € le sac est largement perdue en surconsommation et en SAV.",
  },

  // ───────────────────────────────────────────────────────────────────
  // INSTALLATION
  // ───────────────────────────────────────────────────────────────────
  {
    id: "installation-duree",
    category: "installation",
    question: "Combien de temps prend la pose d'un poêle à pellets ?",
    answer:
      "Une pose standard sur conduit existant se fait en une journée, du démontage de l'ancien appareil au premier feu avec toi en fin d'après-midi. Un canalisable avec gaines vers d'autres pièces prend 1,5 jour en moyenne. Un hydro complet avec raccordement aux radiateurs et désembouage compte 2 à 3 jours. L'équipe arrive entre 8h et 9h, prépare la zone (bâches, plaques de protection), pose, raccorde, étanchéifie, met en service.",
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
      "Oui pour les modèles étanches (raccordement direct vers l'extérieur via tuyau dédié, c'est leur principe). Pour les modèles non étanches en maison non hermétique, une grille d'aération dans la pièce ou la pièce attenante suffit. En maison passive, BBC ou avec VMC double-flux, seul le poêle étanche est admissible. Le diagnostic vérifie la conformité de la prise d'air par rapport à la puissance du poêle (section minimale réglementaire de 50 cm² par kW au-delà de 5 kW).",
  },
  {
    id: "installation-distance-mur-bois",
    category: "installation",
    question: "Quelle distance entre le poêle et un mur en bois ?",
    answer:
      "La distance minimale réglementaire dépend du modèle et figure sur la fiche constructeur. Typiquement, compte 20 cm latéralement et 30 à 40 cm à l'arrière pour un poêle à pellets moderne (ces distances sont nettement réduites par rapport aux poêles à bois grâce à l'enveloppe mieux isolée). Pour un mur sensible (bois, papier peint, placo non protégé), une plaque de protection murale incombustible est ajoutée si la distance ne peut pas être respectée.",
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
      "Si le conduit est en bon état et conforme (chemisé inox ou émail vitrifié récent), il est utilisable directement. Pour les conduits anciens (avant 1980, ou en briques non chemisées), le tubage est obligatoire pour la sécurité et la conformité. Coût : 800 à 1 500 € selon la hauteur et la complexité. Le diagnostic à domicile inclut une inspection visuelle du conduit. Pour les cas douteux, un test de vacuité par fumigène est réalisé avant de signer le devis.",
  },

  // ───────────────────────────────────────────────────────────────────
  // PRIMES & AIDES
  // ───────────────────────────────────────────────────────────────────
  {
    id: "primes-montant-max",
    category: "primes",
    question: "Quel est le montant maximal de la prime poêle pellets en 2026 ?",
    answer:
      "960 €, pour un ménage en catégorie R1 (revenus de référence inférieurs ou égaux à 24 600 €). C'est la prime de base de 160 € multipliée par le coefficient 6. Au-delà, le plafond en pourcentage de la facture peut s'appliquer (70 % pour R1 et R2). R2 reçoit 640 €, R3 reçoit 320 €, R4 reçoit 160 €. Au-delà de 122 800 € de revenus (catégorie R5), le ménage n'est plus éligible aux primes Habitation depuis le 14 février 2025.",
  },
  {
    id: "primes-categorie",
    category: "primes",
    question: "Comment savoir dans quelle catégorie de revenus je tombe ?",
    answer:
      "La catégorie est définie par le revenu de référence du ménage figurant sur l'avertissement-extrait de rôle de l'avant-dernière année (pour une demande en 2026, on regarde les revenus 2024). C'est un revenu net imposable globalisé du ménage. R1 : ≤ 24 600 €. R2 : 24 601 à 39 300 €. R3 : 39 301 à 58 900 €. R4 : > 58 900 €. R5 (non éligible) : > 122 800 €. Le numéro gratuit 1718 du SPW te donne ta catégorie en quelques minutes.",
  },
  {
    id: "primes-audit-obligatoire",
    category: "primes",
    question: "L'audit logement préalable est-il vraiment obligatoire ?",
    answer:
      "Oui, depuis le 14 février 2025, un audit logement préalable est obligatoire pour la quasi-totalité des primes Habitation, y compris pour un poêle à pellets isolé. Coût 800 à 1 200 € TVAC, partiellement couvert par une prime audit séparée. L'audit doit être réalisé et enregistré avant le démarrage des travaux. Sa validité est de 5 ans, donc un audit fait pour d'autres travaux récents reste utilisable. Sans audit, le dossier prime est rejeté.",
  },
  {
    id: "primes-eligible",
    category: "primes",
    question: "Comment savoir si mon poêle est sur la liste officielle SPW ?",
    answer:
      "La liste officielle des appareils éligibles est publiée par le SPW Logement (logement.wallonie.be) et mise à jour régulièrement. Tous les modèles que distribue Mister Pellets (Edilkamin, EK63, Dielle, Ferlux) répondent aux critères techniques de base : rendement saisonnier ≥ 87 %, conformité écodesign 2022. On vérifie systématiquement le numéro de modèle exact dans la liste avant de signer le devis. Si un modèle n'y figure pas, on te dirige vers une référence équivalente éligible.",
  },
  {
    id: "primes-delai-versement",
    category: "primes",
    question: "Combien de temps pour recevoir la prime sur mon compte ?",
    answer:
      "Le délai actuel d'instruction par le SPW Logement est de 1 à 2 ans à compter du dépôt complet. Le gouvernement wallon s'est engagé à raccourcir ce délai. En attendant, tu paies normalement Mister Pellets et tu reçois la prime ensuite, directement sur ton compte. Tu as 8 mois après la dernière facture pour déposer un dossier complet, ensuite c'est forclos.",
  },
  {
    id: "primes-cumul-tva",
    category: "primes",
    question: "Puis-je cumuler la prime poêle pellets avec la TVA réduite à 6 % ?",
    answer:
      "Oui, automatiquement. La TVA à 6 % au lieu de 21 % s'applique d'office sur la pose si ton logement a plus de 10 ans (cas le plus fréquent en Wallonie). C'est appliqué directement par l'installateur sur la facture, ce n'est pas une prime à demander. Tu peux aussi cumuler avec un prêt à taux 0 % (Renopack ou Rénoprêt) jusqu'à 60 000 €, et avec d'éventuelles primes communales (cuve mazout, rénovation chauffage). Le cumul global est plafonné à 50 000 € par logement.",
  },
  {
    id: "primes-r5",
    category: "primes",
    question: "Et si mes revenus dépassent 122 800 € ?",
    answer:
      "Tu es en catégorie R5 et tu n'es plus éligible aux primes Habitation depuis le 14 février 2025. Tu peux toutefois bénéficier de la TVA réduite à 6 % (logement de plus de 10 ans) et du prêt à taux 0 % Renopack ou Rénoprêt. La prime régionale poêle pellets est exclue, mais l'opération reste rentable sur le long terme grâce à la TVA réduite et aux économies de combustible (pellets vs mazout vs gaz).",
  },

  // ───────────────────────────────────────────────────────────────────
  // ENTRETIEN & SAV
  // ───────────────────────────────────────────────────────────────────
  {
    id: "entretien-frequence",
    category: "entretien",
    question: "À quelle fréquence faire ramoner mon poêle ?",
    answer:
      "Une fois par an minimum en Wallonie, c'est obligatoire pour tous les poêles à pellets et requis par les compagnies d'assurance habitation. Le ramonage du conduit de fumée se fait par un ramoneur certifié (50 à 90 € en Wallonie). Garde toujours la facture : sans certificat de ramonage annuel, ton assurance peut refuser de couvrir un sinistre lié au poêle. Mister Pellets coordonne le ramonage avec l'entretien annuel sur demande.",
  },
  {
    id: "entretien-poele-eteint",
    category: "entretien",
    question: "Mon poêle s'éteint tout seul, que faire ?",
    answer:
      "Sept causes couvrent 95 % des cas, dans l'ordre de fréquence : creuset encrassé (40 %), pellets humides ou de mauvaise qualité (20 %), sonde de fumée encrassée (15 %), échangeur bouché (10 %), vis sans fin bloquée (8 %), prise d'air comburant obstruée (5 %), conduit non ramoné ou refoulement (2 %). À froid, vide et brosse le creuset, contrôle la qualité des pellets, essuie la sonde de fumée. Si rien ne fonctionne après ces 3 vérifications, appelle le SAV.",
  },
  {
    id: "entretien-cout-annuel",
    category: "entretien",
    question: "Quel est le coût moyen d'un entretien annuel ?",
    answer:
      "À titre indicatif, un entretien annuel complet à domicile coûte sur devis selon la zone et la complexité. L'opération dure environ 90 minutes : démontage, nettoyage du creuset, de l'échangeur, de la chambre de combustion, du conduit interne, de la sonde de fumée, du ventilateur d'extraction, vérification des joints et des paramètres de combustion. Compte aussi 50 à 90 € pour le ramonage du conduit par un ramoneur certifié, à programmer en parallèle.",
  },
  {
    id: "entretien-quotidien",
    category: "entretien",
    question: "Quel entretien quotidien est nécessaire ?",
    answer:
      "Vide les cendres tous les 2 à 3 jours en pleine saison de chauffe. Brosse le creuset toutes les semaines avec une brosse métallique pour décoller le mâchefer (résidu vitrifié qui bouche les trous d'admission d'air). Essuie la vitre avec un chiffon humide ou un produit dégraissant à froid. Tous les 15 jours, actionne la canne de ramonage interne (levier en façade sur les Edilkamin et EK63). C'est l'entretien le plus important pour préserver la durée de vie du poêle.",
  },
  {
    id: "entretien-sav-delai",
    category: "entretien",
    question: "Quel est le délai d'intervention SAV ?",
    answer:
      "48 à 72 heures dans la zone Fernelmont et 50 km autour, hors période de pic hivernal où le délai peut s'étendre à 5 à 7 jours. Le SAV est assuré directement par notre équipe (pas de sous-traitance), avec stock de pièces détachées Edilkamin, EK63, Dielle et Ferlux disponibles sous 48 heures. Coût intervention SAV : déplacement + main d'œuvre 1 à 2 h en moyenne, plus pièces si remplacement nécessaire.",
  },

  // ───────────────────────────────────────────────────────────────────
  // BOUTIQUE EN LIGNE
  // ───────────────────────────────────────────────────────────────────
  {
    id: "boutique-livraison-50km",
    category: "boutique",
    question: "Livrez-vous au-delà de 50 km de Fernelmont ?",
    answer:
      "Oui, on couvre toute la Wallonie au cas par cas. La livraison est gratuite dans un rayon de 50 km autour de notre showroom de Fernelmont (Namur, Andenne, Wavre, Charleroi, Huy, Liège partiellement). Au-delà, une participation aux frais de déplacement est chiffrée transparente dans le devis (typiquement 85 € forfait pour le reste de la Belgique). On n'intervient pas en Flandre ni à Bruxelles faute d'équipe SAV de proximité.",
  },
  {
    id: "boutique-pose-en-ligne",
    category: "boutique",
    question: "Puis-je acheter le poêle en ligne et le faire poser par Mister Pellets ?",
    answer:
      "Oui, c'est même la configuration la plus fréquente. Tu commandes le poêle sur la boutique en ligne (paiement Stripe sécurisé), puis on convient d'un rendez-vous de pose dans la foulée. La pose est facturée séparément (TVA 6 % si logement de plus de 10 ans, contre 21 % sur le matériel). Le diagnostic à domicile préalable reste recommandé pour valider la faisabilité (conduit, distances, accès) avant la commande définitive.",
  },
  {
    id: "boutique-paiement",
    category: "boutique",
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Pour les ventes en ligne : paiement intégral à la commande via Stripe (cartes bancaires Visa/Mastercard, Bancontact). Pour les devis avec pose : acompte de 30 % à la signature (virement, carte ou Bancontact), solde à la fin de la pose. On accepte aussi les paiements en plusieurs fois via le prêt à taux 0 % Renopack ou Rénoprêt (Société wallonne du Crédit social ou Fonds du Logement) pour les projets éligibles.",
  },
  {
    id: "boutique-retour",
    category: "boutique",
    question: "Quel est le droit de rétractation sur un achat en ligne ?",
    answer:
      "Conformément au Code de droit économique belge, tu disposes d'un délai de 14 jours à compter de la réception du produit pour exercer ton droit de rétractation, sans avoir à motiver ta décision. Les frais de retour sont à ta charge. Ce droit ne s'applique pas aux produits déjà installés ni aux prestations de pose déjà exécutées. Pour les commandes en ligne sans pose, le retour est simple : tu nous contactes, on récupère.",
  },

  // ───────────────────────────────────────────────────────────────────
  // SHOWROOM & RDV
  // ───────────────────────────────────────────────────────────────────
  {
    id: "showroom-adresse",
    category: "showroom",
    question: "Où se trouve votre showroom ?",
    answer:
      "Rue des Fagotis 3A, 5380 Fernelmont, à 17 km de Namur centre et accessible par la N4. Parking devant le bâtiment, accès PMR au rez-de-chaussée. On y expose plusieurs modèles parmi les 4 marques que nous distribuons (Edilkamin, EK63, Dielle, Ferlux). Horaires : du lundi au vendredi 9h à 18h, samedi 9h à 13h. La prise de rendez-vous est fortement recommandée pour garantir la disponibilité d'un conseiller.",
  },
  {
    id: "showroom-modeles",
    category: "showroom",
    question: "Tous les modèles de poêles sont-ils visibles au showroom ?",
    answer:
      "Non, la sélection en exposition tourne régulièrement selon les nouveautés de saison et les modèles que nous testons en condition réelle. Si tu vises un modèle particulier, prends rendez-vous : on te confirme la veille les références effectivement en exposition, et au besoin on en sort un du stock atelier pour ta visite. Les visites sans RDV restent possibles aux heures d'ouverture mais on ne peut pas garantir la disponibilité d'un conseiller selon la charge du jour.",
  },
  {
    id: "showroom-services",
    category: "showroom",
    question: "Quels services sont disponibles via la prise de rendez-vous ?",
    answer:
      "Cinq services au total. Devis sur place à domicile (gratuit, 60 minutes). Visite showroom + conseils à Fernelmont (gratuit, 45 minutes). Entretien annuel à domicile (sur devis, 90 minutes, réservé poêles à pellets). Dépannage à domicile (sur devis, durée variable selon la cause, réservé poêles à pellets). Ramonage à domicile (sur devis, 60 minutes, certificat fourni, réservé poêles à pellets). Réservation en ligne via notre système Easy!Appointments.",
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
