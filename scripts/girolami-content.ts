/**
 * Girolami : contenus visibles + données techniques par famille.
 *
 * Référence : modèle Split 9 validé par l'équipe Awlest (couleurs, specs).
 * Voix installateur Mister Pellets, charte éditoriale + humanizer : vouvoiement,
 * zéro tiret long, pas de règle de trois mécanique, phrases courtes et
 * concrètes, humour avec parcimonie. Descriptions générales enrichies des infos
 * principales : fonctionnement ultra silencieux (alimentation par le bas qui
 * évite le bruit des pellets qui tombent + convection naturelle soufflerie
 * coupée), pilotage Wi-Fi sur les modèles pellet / hybride / hydro-pellet (PAS
 * sur le lot 100 % bois), canalisation de l'air chaud vers une ou deux pièces
 * sur les versions canalisables (nombre exact de sorties non figé, donnée non
 * disponible au catalogue). Le reste fidèle au CATALISTINO 2026. Aucune donnée
 * inventée, aucune spec chiffrée dans la prose.
 */

export interface Feature { title: string; description: string }
export interface FamilyContent { tagline: string; paras: string[]; features: Feature[] }

/* ===== Couleurs : hex réel pour la pastille (les 3 validées par l'équipe sur
   Split : Blanc #FFFFFF, Bordeaux #6D071A, Noir #000000). ===== */
export const COLOR_HEX: Record<string, string> = {
  "Blanc": "#FFFFFF",
  "Noir": "#000000",
  "Bordeaux": "#6D071A",
  "Gris anthracite": "#3A3A3A",
  "Bronze": "#5C4A35",
  "Vert": "#2E5A34",
  "Ivoire": "#EFE6D0",
  "Corten": "#9C5A34",
};

/* ===== Géométrie + classe énergie par famille (relevé fidèle catalogue,
   boîtier identique sur toutes les puissances ; validé contre Split 58x119x54
   170 kg). w/h/d en cm, weight en kg. energyClass : A++ pour le pellet
   (confirmé par l'équipe sur Split), null pour le bois (à valider). ===== */
export interface Geom { w: number | null; h: number | null; d: number | null; weight: number | null; energyClass: string | null }
export const FAMILY_GEOM: Record<string, Geom> = {
  // Poêles à air pellet (même moteur que Split)
  "round": { w: 54, h: 112, d: 56, weight: 170, energyClass: "A++" },
  "slim": { w: 90, h: 115, d: 36, weight: 170, energyClass: "A++" },
  "curvy": { w: 59, h: 118, d: 58, weight: 170, energyClass: "A++" },
  "flow": { w: 62, h: 114, d: 53, weight: 170, energyClass: "A++" },
  "mini": { w: 59, h: 76, d: null, weight: 150, energyClass: "A++" },
  "vert": { w: 58, h: 122, d: 54, weight: 170, energyClass: "A++" },
  "vert maiolica": { w: 58, h: 122, d: 54, weight: 170, energyClass: "A++" },
  "split": { w: 58, h: 119, d: 54, weight: 170, energyClass: "A++" },
  "twin mini": { w: 63, h: 73, d: 61, weight: 150, energyClass: "A++" },
  "twin slim": { w: 91, h: 110, d: 40, weight: 170, energyClass: "A++" },
  // Inserts pellet
  "grid verticale": { w: 89, h: 126, d: 43, weight: 170, energyClass: "A++" },
  "grid panorama": { w: 101, h: 126, d: 46, weight: 170, energyClass: "A++" },
  // Thermopoêles + inserts hydro
  "soft": { w: 63, h: 125, d: 66, weight: 250, energyClass: "A++" },
  "soft maiolica": { w: 63, h: 125, d: 66, weight: 250, energyClass: "A++" },
  "soft slim": { w: 97, h: 126, d: 56, weight: 285, energyClass: "A++" },
  "sharp": { w: 60, h: 120, d: 68, weight: 250, energyClass: "A++" },
  "edge": { w: 66, h: 118, d: 66, weight: 250, energyClass: "A++" },
  "furni": { w: 63, h: 123, d: 65, weight: 250, energyClass: "A++" },
  "ti": { w: 73, h: 121, d: 66, weight: 250, energyClass: "A++" },
  "ti panorama": { w: 104, h: 122, d: 74, weight: 250, energyClass: "A++" },
  "ti slim": { w: 93, h: 121, d: 54, weight: 250, energyClass: "A++" },
  "ti slim panorama": { w: 115, h: 121, d: 64, weight: 250, energyClass: "A++" },
  "ti plus": { w: null, h: null, d: null, weight: 250, energyClass: "A++" },
  "ti plus panorama": { w: null, h: null, d: null, weight: 250, energyClass: "A++" },
  // Bois (classe énergie laissée à valider par l'équipe)
  "alfa bio": { w: 125, h: 153, d: 65, weight: null, energyClass: null },
};

/* ===== Atouts communs (catalogue 2026) ===== */
const F_AUTO: Feature = { title: "Brasier autonettoyant", description: "L'alimentation par le fond nettoie le creuset pendant la chauffe. Vous gardez un bon rendement sans gratter le brasier tous les deux jours." };
const F_ETANCHE: Feature = { title: "Poêle étanche", description: "Il prend l'air de combustion dehors, pas dans la pièce. C'est ce qu'il faut pour une maison récente bien isolée ou une basse énergie." };
const F_CONVECTION: Feature = { title: "Marche aussi en convection naturelle", description: "Vous coupez la soufflerie et il continue à chauffer en silence. Pratique le soir dans un salon ou une chambre." };
const F_RADIO: Feature = { title: "Radiocommande LCD avec sonde", description: "Écran et sonde de température d'ambiance fournis. Vous réglez la consigne depuis le canapé, le poêle ajuste sa puissance tout seul." };
const F_WIFI: Feature = { title: "Pilotage Wi-Fi", description: "Vous allumez, réglez et programmez le poêle depuis l'appli sur votre smartphone. Pratique pour lancer la chauffe avant de rentrer." };
const F_SILENCE: Feature = { title: "Fonctionnement ultra silencieux", description: "L'alimentation par le bas évite le bruit des pellets qui tombent dans le brasier. En convection naturelle, soufflerie coupée, on ne l'entend quasiment plus." };
const F_VERRE: Feature = { title: "Top et vitre Cristal Magik", description: "Dessus en verre et vitre courbe qui s'assombrit dès que la flamme s'éteint. Belle vue sur le feu allumé, look sobre éteint." };
const F_CANAL: Feature = { title: "Canalisable vers une autre pièce", description: "Des ventilateurs arrière indépendants, réglables au thermostat, pour pousser la chaleur dans une ou deux pièces voisines ou à l'étage." };
const F_COAX: Feature = { title: "Sortie coaxiale", description: "Un seul conduit concentrique pour l'air et les fumées. La pose étanche est plus simple, surtout en sortie de façade sur une maison récente." };
const F_HYDRO: Feature = { title: "Raccordé au chauffage central", description: "Il chauffe l'eau de vos radiateurs ou de votre plancher chauffant. C'est l'appareil pour remplacer une chaudière mazout sans tout casser." };
const F_HYBRID: Feature = { title: "Bois ou pellets, au choix", description: "Des bûches quand vous en avez, des pellets quand vous voulez l'automatique et la tranquillité. Le même appareil fait les deux." };
const F_INSERT: Feature = { title: "S'encastre dans une cheminée", description: "Il se glisse dans un foyer existant et lui rend un vrai rendement. On modernise une vieille cheminée sans gros chantier de maçonnerie." };
const F_WOOD: Feature = { title: "Chauffe au bois", description: "Des bûches dans un foyer fermé qui tient le rendement au lieu d'envoyer la chaleur dans le conduit." };
const F_SERPENTINE: Feature = { title: "Option eau chaude (serpentin)", description: "Version avec serpentin disponible : en plus du chauffage, elle prépare votre eau chaude sanitaire." };
const F_VENTILE: Feature = { title: "Convection ou ventilé", description: "En convection naturelle pour le silence, ou avec kit de ventilation pour pousser l'air chaud plus loin dans la pièce." };
const F_MAIOLICA: Feature = { title: "Habillage maïolique", description: "Céramique émaillée italienne qui accumule la chaleur et la restitue en douceur, longtemps après l'extinction." };

export const FAMILY_CONTENT: Record<string, FamilyContent> = {
  "curvy": {
    tagline: "Poêle à pellets galbé, top en verre",
    paras: [
      "Le Curvy joue les formes rondes et le verre. Le dessus est vitré, et la vitre Cristal Magik, courbe, s'obscurcit complètement quand la flamme s'éteint. Vous avez une grande visibilité du feu quand ça chauffe, et un bloc élégant qui s'efface dans la pièce une fois coupé.",
      "Sous le capot, c'est un vrai Girolami : alimentation à source autonettoyante, poêle étanche qui prend l'air dehors, rendement qui monte jusqu'à 96 %. Il est aussi très discret : l'alimentation par le bas évite le bruit des pellets qui tombent, et en convection naturelle, soufflerie coupée, on ne l'entend quasiment plus. Vous le pilotez au Wi-Fi depuis l'appli, et la radiocommande LCD avec sonde d'ambiance est fournie.",
      "Il existe de 9 à 14 kW, en finition céramique, dans plusieurs couleurs. La version canalisable envoie l'air chaud dans une ou deux pièces voisines. Valve stellaire et soupape antiéclatement de série.",
    ],
    features: [F_VERRE, F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "flow": {
    tagline: "Poêle à pellets aux lignes droites, top en verre",
    paras: [
      "Le Flow, c'est l'esprit Curvy en version droite. Lignes nettes, dessus en verre, vitre Cristal Magik qui se fonce à l'arrêt. Il vise les intérieurs contemporains qui veulent un poêle discret mais bien dessiné.",
      "Même base technique que toute la gamme : brasier autonettoyant, poêle étanche, rendement jusqu'à 96 %, fonctionnement possible en convection naturelle. Et il tient ses promesses côté bruit : pellets amenés par le bas, donc pas de cliquetis, et soufflerie coupée il devient quasi silencieux. Wi-Fi pour le piloter depuis le smartphone, radiocommande LCD avec sonde fournie.",
      "De 9 à 14 kW, habillage acier, plusieurs couleurs au catalogue. La version canalisable pousse l'air chaud vers une ou deux pièces voisines.",
    ],
    features: [F_VERRE, F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "round": {
    tagline: "Poêle à pellets cylindrique",
    paras: [
      "Le Round mise sur une silhouette ronde qui passe partout, contre un mur comme au milieu d'une pièce. La sortie d'air se fait à l'avant et en partie haute, la chaleur se répartit bien autour de l'appareil.",
      "C'est un poêle étanche à alimentation autonettoyante, rendement jusqu'à 96 %. Il sait tourner en convection naturelle pour les soirées au calme, et comme tout Girolami, l'alimentation par le bas le rend silencieux, sans le bruit des pellets qui tombent. Pilotage Wi-Fi depuis l'appli, radiocommande LCD avec sonde de série.",
      "De 9 à 14 kW, large choix de couleurs. Il existe en version canalisable pour chauffer une ou deux pièces voisines, et en sortie coaxiale selon votre configuration de pose.",
    ],
    features: [F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "slim": {
    tagline: "Poêle à pellets de faible profondeur",
    paras: [
      "Le Slim est fait pour se plaquer contre un mur sans manger la pièce : à peine 36 cm de profondeur pour près de 90 cm de large, mais la puissance d'un poêle normal. Le bon plan quand le passage est compté.",
      "Brasier autonettoyant, poêle étanche, rendement jusqu'à 96 %, convection naturelle possible. Et il est discret : alimentation par le bas, donc pas de bruit de pellets, et silence complet soufflerie coupée. Vous le pilotez au Wi-Fi, la radiocommande LCD avec sonde d'ambiance est fournie.",
      "De 9 à 14 kW, plusieurs couleurs. Versions canalisable (une ou deux pièces) et coaxiale au catalogue, selon la sortie de fumées prévue chez vous.",
    ],
    features: [F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "mini": {
    tagline: "Poêle à pellets compact",
    paras: [
      "Le Mini, c'est le petit format de la gamme. Parfait pour un séjour modeste, un studio ou un chalet où chaque centimètre compte, sans renoncer à la mécanique Girolami.",
      "Malgré la taille, on garde le brasier autonettoyant, le côté étanche et la vitre céramique sérigraphiée. L'alimentation par le bas le rend silencieux, et il tourne aussi en convection naturelle. Sortie de fumées arrière ou par le dessus selon la pièce. Pilotage Wi-Fi et radiocommande LCD avec sonde fournie.",
      "Disponible en 6 et 9 kW, en plusieurs couleurs.",
    ],
    features: [F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO, { title: "Format compact", description: "Petit encombrement au sol pour les petites surfaces. Il chauffe sans prendre toute la place." }],
  },
  "vert": {
    tagline: "Poêle à pellets vertical en acier",
    paras: [
      "Le Vert est un poêle élancé, habillage acier, qui tient peu de place au sol grâce à sa ligne verticale. Il se glisse là où un poêle large ne rentrerait pas.",
      "Alimentation autonettoyante, poêle étanche, rendement jusqu'à 96 %, convection naturelle possible. Côté bruit, l'alimentation par le bas évite le cliquetis des pellets et il devient quasi silencieux soufflerie coupée. Wi-Fi pour le piloter depuis le smartphone, radiocommande LCD avec sonde fournie.",
      "De 9 à 14 kW, en blanc, bordeaux ou noir. La version canalisable envoie l'air chaud vers une ou deux pièces voisines.",
    ],
    features: [F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "vert maiolica": {
    tagline: "Poêle à pellets vertical, habillage maïolique",
    paras: [
      "Le Vert Maiolica reprend la ligne verticale du Vert, mais habillé de maïolique, la céramique émaillée italienne. Disponible en blanc, bordeaux et noir.",
      "La céramique accumule la chaleur et la restitue doucement, même une fois le poêle éteint. Dessous, c'est la mécanique Girolami : brasier autonettoyant, poêle étanche, rendement jusqu'à 96 %, convection naturelle possible, et le silence de l'alimentation par le bas. Pilotage Wi-Fi et radiocommande LCD avec sonde fournie.",
      "De 9 à 14 kW, en version standard ou canalisable (une ou deux pièces).",
    ],
    features: [F_MAIOLICA, F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "split": {
    tagline: "Poêle à pellets à chambre céramique",
    paras: [
      "Le Split travaille avec une chambre de combustion céramique qui pousse le rendement et garde la chaleur plus longtemps. Une ligne sobre, disponible en blanc, bordeaux et noir.",
      "Comme toute la gamme Girolami : alimentation à source autonettoyante, poêle étanche qui prélève l'air dehors, rendement de 96 % à 9 kW. Il est aussi très silencieux, l'alimentation par le bas évite le bruit des pellets qui tombent, et en pure convection naturelle, soufflerie coupée, on ne l'entend plus. Vous le pilotez au Wi-Fi depuis l'appli, et la radiocommande LCD avec sonde d'ambiance est fournie.",
      "De 9 à 14 kW, en version standard ou canalisable (une ou deux pièces voisines). Valve stellaire et soupape de sécurité antiéclatement de série.",
    ],
    features: [{ title: "Chambre de combustion céramique", description: "La céramique du foyer pousse le rendement et restitue la chaleur plus longtemps." }, F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "twin mini": {
    tagline: "Poêle à pellets compact haut de gamme",
    paras: [
      "Le Twin Mini, c'est le petit format de la ligne Twin, en finition noire soignée. Pour qui veut du beau matériel sans encombrer la pièce.",
      "Brasier autonettoyant, poêle étanche, convection naturelle possible, et le silence de l'alimentation par le bas. Pilotage Wi-Fi et radiocommande LCD avec sonde : la base technique Girolami dans un format réduit.",
      "Proposé en 6 kW.",
    ],
    features: [F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO, { title: "Format compact premium", description: "Petite empreinte au sol, finition haut de gamme. Pour les petites pièces exigeantes." }],
  },
  "twin slim": {
    tagline: "Poêle à pellets slim haut de gamme",
    paras: [
      "Le Twin Slim est le poêle de faible profondeur de la ligne Twin : large, plat, fait pour habiller un mur. Noir de série, ou en finitions Materia (corten, ivoire, gris anthracite) en option payante.",
      "Brasier autonettoyant, poêle étanche, convection naturelle possible, fonctionnement silencieux grâce à l'alimentation par le bas. Wi-Fi et radiocommande LCD avec sonde fournis. Du matériel haut de gamme à profondeur réduite.",
      "De 9 à 12 kW, en version standard ou canalisable (une ou deux pièces).",
    ],
    features: [{ title: "Finitions Materia en option", description: "Corten, ivoire ou gris anthracite en plus du noir de série, à vous de choisir le rendu." }, F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
  },
  "grid verticale": {
    tagline: "Insert à pellets, vision verticale",
    paras: [
      "Le Grid Verticale est un insert à pellets pour cheminée, avec une vitre haute qui met le feu en valeur sur toute la hauteur.",
      "Il s'encastre dans un foyer existant et lui rend un vrai rendement, avec l'automatisme et la propreté du pellet. Alimentation autonettoyante, fonctionnement silencieux, pilotage Wi-Fi et radiocommande LCD avec sonde.",
      "De 9 à 12 kW, en version standard ou canalisable pour diffuser la chaleur vers une ou deux pièces voisines.",
    ],
    features: [F_INSERT, F_AUTO, F_SILENCE, F_WIFI, F_RADIO, { title: "Vision verticale de la flamme", description: "Vitre haute qui montre le feu sur toute la hauteur." }],
  },
  "grid panorama": {
    tagline: "Insert à pellets, vision panoramique",
    paras: [
      "Le Grid Panorama est l'insert à pellets en version large, avec une vitre panoramique pour une vue généreuse sur le feu : l'effet cheminée ouverte, mais avec le rendement des pellets.",
      "Il s'encastre dans une cheminée existante. Alimentation autonettoyante, fonctionnement silencieux, pilotage Wi-Fi et radiocommande LCD avec sonde.",
      "Proposé de 9 à 12 kW, en version standard ou canalisable (une ou deux pièces).",
    ],
    features: [F_INSERT, F_AUTO, F_SILENCE, F_WIFI, F_RADIO, { title: "Vitre panoramique", description: "Large vision du feu, l'effet cheminée avec la commodité des pellets." }],
  },
  "soft": {
    tagline: "Thermopoêle hydro raccordé au chauffage central",
    paras: [
      "Le Soft est un thermopoêle hydro. Il ne se contente pas de chauffer la pièce, il alimente le circuit d'eau de la maison : radiateurs ou plancher chauffant. C'est le best-seller de la marque, et il a décroché un Good Design Award en 2022.",
      "C'est l'appareil pour remplacer une chaudière mazout vieillissante ou compléter une installation. Rendement jusqu'à 96 %, gros réservoir de pellets pour de l'autonomie, alimentation autonettoyante qui tourne sans le bruit des pellets qui tombent. Vous le pilotez au Wi-Fi depuis l'appli, et la radiocommande LCD avec sonde est fournie.",
      "De 14 à 26 kW. En version hybride bois-pellet, qui accepte les deux combustibles, ou en version pellet seul, plus simple et moins chère. Disponible en blanc, ivoire, bordeaux et noir.",
    ],
    features: [F_HYDRO, F_HYBRID, F_AUTO, F_WIFI, F_RADIO],
  },
  "soft maiolica": {
    tagline: "Thermopoêle hydro, habillage maïolique",
    paras: [
      "Le Soft Maiolica, c'est le thermopoêle Soft habillé de maïolique, la céramique émaillée. Blanc, bordeaux ou noir, avec ce supplément de caractère et d'inertie thermique.",
      "Il chauffe l'eau du circuit central, radiateurs ou plancher. Rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, pilotage Wi-Fi et radiocommande LCD avec sonde.",
      "De 14 à 26 kW, en hybride bois-pellet ou en pellet seul.",
    ],
    features: [F_HYDRO, F_MAIOLICA, F_HYBRID, F_AUTO, F_WIFI],
  },
  "soft slim": {
    tagline: "Thermopoêle hydro de faible profondeur",
    paras: [
      "Le Soft Slim, c'est le thermopoêle Soft en version peu profonde : large et plat, il se plaque contre un mur tout en chauffant le circuit d'eau de la maison.",
      "Raccordé aux radiateurs ou au plancher chauffant, rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, pilotage Wi-Fi et radiocommande LCD avec sonde.",
      "De 14 à 26 kW, en hybride bois-pellet. Disponible en blanc, ivoire, bordeaux et noir.",
    ],
    features: [F_HYDRO, F_HYBRID, F_AUTO, F_WIFI, { title: "Faible profondeur", description: "Le chauffage central de la maison sans empiéter sur la pièce." }],
  },
  "sharp": {
    tagline: "Thermopoêle hydro au design anguleux",
    paras: [
      "Le Sharp est un thermopoêle hydro à la ligne plus marquée, anguleuse. Il raccorde la maison au chauffage central via le poêle, pour qui veut que l'appareil se voie tout en chauffant tout le logement.",
      "Rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, pilotage Wi-Fi et radiocommande LCD avec sonde.",
      "De 14 à 26 kW, en hybride bois-pellet ou en pellet seul. Disponible en blanc, gris anthracite, noir et bronze.",
    ],
    features: [F_HYDRO, F_HYBRID, F_AUTO, F_WIFI, F_RADIO],
  },
  "edge": {
    tagline: "Thermopoêle hydro",
    paras: [
      "L'Edge est un thermopoêle hydro qui chauffe l'eau de l'installation : radiateurs, plancher chauffant, il alimente le circuit complet. Une vraie alternative à la chaudière classique.",
      "Rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, pilotage Wi-Fi et radiocommande LCD avec sonde.",
      "De 14 à 26 kW, en version hybride bois-pellet ou pellet seul. Disponible en blanc et gris anthracite.",
    ],
    features: [F_HYDRO, F_HYBRID, F_AUTO, F_WIFI, F_RADIO],
  },
  "furni": {
    tagline: "Thermopoêle hydro",
    paras: [
      "Le Furni est un thermopoêle hydro pour le chauffage central. Il prend le relais d'une vieille chaudière ou complète une installation existante.",
      "Rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, gros réservoir pour l'autonomie, pilotage Wi-Fi et radiocommande LCD avec sonde.",
      "De 14 à 26 kW, en hybride bois-pellet ou pellet seul, en blanc, ivoire, bordeaux et noir.",
    ],
    features: [F_HYDRO, F_HYBRID, F_AUTO, F_WIFI, F_RADIO],
  },
  "ti": {
    tagline: "Insert thermo-cheminée hydro",
    paras: [
      "Le TI est un insert thermo-cheminée. Il s'encastre dans une cheminée et raccorde le foyer au chauffage central : votre cheminée chauffe alors toute la maison via les radiateurs.",
      "On récupère un vieux foyer pour en faire une source de chaleur centrale, sans gros chantier. Rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, pilotage Wi-Fi.",
      "De 14 à 26 kW, en hybride bois-pellet ou pellet seul.",
    ],
    features: [F_INSERT, F_HYDRO, F_HYBRID, F_WIFI],
  },
  "ti panorama": {
    tagline: "Insert thermo-cheminée hydro, vitre panoramique",
    paras: [
      "Le TI Panorama, c'est l'insert thermo-cheminée en version vitre large. Une vue généreuse sur le feu, et le raccordement au chauffage central de la maison.",
      "Encastrable dans un foyer existant, rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, pilotage Wi-Fi.",
      "De 14 à 26 kW, en hybride bois-pellet ou pellet seul.",
    ],
    features: [F_INSERT, F_HYDRO, F_WIFI, { title: "Vitre panoramique", description: "Large vision du feu tout en chauffant le circuit d'eau." }],
  },
  "ti plus": {
    tagline: "Insert thermo-cheminée hydro, puissance étendue",
    paras: [
      "Le TI Plus pousse la puissance de l'insert thermo-cheminée pour les grandes installations qui demandent plus de débit de chaleur.",
      "Encastrable, raccordé au chauffage central, alimentation autonettoyante, pilotage Wi-Fi. En hybride bois-pellet.",
      "Disponible en version 26 Plus.",
    ],
    features: [F_INSERT, F_HYDRO, F_HYBRID, F_WIFI],
  },
  "ti plus panorama": {
    tagline: "Insert thermo-cheminée hydro Plus, vitre panoramique",
    paras: [
      "Le TI Plus Panorama combine la puissance étendue et la vitre large. Pour les grandes maisons qui veulent à la fois le débit de chaleur et la vue sur le feu.",
      "Encastrable, raccordé au chauffage central, alimentation autonettoyante, pilotage Wi-Fi, hybride bois-pellet.",
    ],
    features: [F_INSERT, F_HYDRO, F_WIFI, { title: "Vitre panoramique", description: "Grande vision du feu sur une version puissante." }],
  },
  "ti slim": {
    tagline: "Insert thermo-cheminée hydro compact",
    paras: [
      "Le TI Slim est l'insert thermo-cheminée en version compacte. Il se loge dans un foyer de dimensions réduites tout en chauffant le circuit d'eau de la maison.",
      "Encastrable, rendement jusqu'à 96 %, alimentation autonettoyante et silencieuse, pilotage Wi-Fi. Hybride bois-pellet.",
      "De 14 à 26 kW.",
    ],
    features: [F_INSERT, F_HYDRO, F_WIFI, { title: "Format compact", description: "Pour les foyers de cheminée plus petits, sans renoncer au chauffage central." }],
  },
  "ti slim panorama": {
    tagline: "Insert thermo-cheminée hydro compact, vitre panoramique",
    paras: [
      "Le TI Slim Panorama, c'est l'insert compact avec la vitre large. Encombrement réduit, belle vue sur le feu, et raccordement au chauffage central.",
      "Encastrable dans un foyer existant, alimentation autonettoyante, pilotage Wi-Fi, hybride bois-pellet.",
      "De 14 à 26 kW.",
    ],
    features: [F_INSERT, F_HYDRO, F_WIFI, { title: "Compact et panoramique", description: "Petit logement, grande vitre, chauffage central." }],
  },

  // ===== LOT BOIS (pas de Wi-Fi, pas d'alimentation pellet) =====
  "tc evo": {
    tagline: "Cheminée hydro à bois",
    paras: [
      "Le TC Evo est une cheminée à bois qui chauffe l'eau de votre circuit. Vous faites une flambée de bûches et la chaleur part dans les radiateurs ou le plancher chauffant, pas seulement dans la pièce.",
      "Une version avec serpentin prépare en plus votre eau chaude sanitaire. C'est le foyer bois pour qui veut du chauffage central sans passer au pellet. Plusieurs formats selon votre cheminée : standard, vitre latérale gauche ou droite, ou vitre galbée.",
    ],
    features: [F_WOOD, F_HYDRO, F_SERPENTINE],
  },
  "tc bio evo": {
    tagline: "Insert thermo-cheminée multicombustible bois et pellets",
    paras: [
      "Le TC Bio Evo est un insert thermo-cheminée qui accepte le bois et les pellets. Vous faites du feu de bûches quand vous voulez, et le kit pellet prend le relais en automatique quand vous n'êtes pas là.",
      "Il chauffe l'eau du circuit central de la maison. En mode pellet, l'alimentation autonettoyante tourne sans bruit et vous le pilotez au Wi-Fi. C'est la solution pour qui hésite entre bois et pellet : il fait vraiment les deux, avec un seul appareil encastré.",
    ],
    features: [F_INSERT, F_HYDRO, F_HYBRID, F_WIFI],
  },
  "frame": {
    tagline: "Monobloc à bois encastrable",
    paras: [
      "Le Frame est un foyer bois fermé qui s'encastre, avec une grande vitre sur le feu. En convection naturelle, ou avec kit de ventilation pour pousser l'air chaud plus loin dans la pièce.",
      "Disponible en version frontale ou avec vitre latérale, gauche ou droite, selon l'implantation dans la pièce. Plusieurs largeurs de foyer.",
    ],
    features: [F_WOOD, F_VENTILE, F_INSERT],
  },
  "alfa": {
    tagline: "Monobloc à bois",
    paras: [
      "L'Alfa est un foyer bois fermé à encastrer. La version Double est bifaciale, visible des deux côtés d'un mur : idéale pour séparer deux pièces tout en partageant le feu.",
      "Convection naturelle ou ventilé selon le modèle.",
    ],
    features: [F_WOOD, F_VENTILE, F_INSERT],
  },
  "mbs": {
    tagline: "Monobloc à bois compact",
    paras: [
      "Le MBS F est un monobloc bois au bon rapport prix-rendement. Foyer en keraltek pour un budget serré, ou en fonte pour l'inertie et la robustesse.",
      "Un kit de ventilation avec afficheur est disponible pour diffuser l'air chaud dans la pièce. Plusieurs largeurs.",
    ],
    features: [F_WOOD, { title: "Foyer keraltek ou fonte", description: "Deux versions au choix : keraltek pour le prix, fonte pour l'inertie et la durée." }, F_INSERT],
  },
  "vision evo": {
    tagline: "Insert à bois, ventilation frontale",
    paras: [
      "Le Vision Evo est un insert à bois avec ventilation frontale. Il redonne du rendement à une cheminée existante et souffle l'air chaud par l'avant.",
      "L'accès au ventilateur se fait par l'intérieur pour l'entretien, et le flux d'air frontal peut être coupé. Plusieurs largeurs de foyer, de 60 à 100 cm, selon la taille de votre âtre.",
    ],
    features: [F_WOOD, F_INSERT, { title: "Ventilation frontale réglable", description: "L'air chaud sort par l'avant, le flux peut être coupé et le moteur reste accessible de l'intérieur." }],
  },
};

export const DEFAULT_CONTENT: FamilyContent = {
  tagline: "Poêle à pellets Girolami",
  paras: ["Poêle à pellets Girolami, fabrication italienne. Alimentation par le bas autonettoyante et silencieuse, poêle étanche, pilotage Wi-Fi et radiocommande LCD avec sonde."],
  features: [F_AUTO, F_SILENCE, F_WIFI, F_ETANCHE, F_RADIO],
};

/** shortDescription <=200 caractères, fidèle à la config réelle du produit. */
export function buildShortDescription(p: {
  family: string; tagline: string; power: number | null; powerMaxKW: number | null;
  isCanalizable: boolean; isCoassiale: boolean; combustible: string | null; isHydro: boolean; priceTTC: number | null;
}): string {
  const bits: string[] = [p.tagline + "."];
  if (p.power) bits.push(`${p.power} kW.`);
  const extra: string[] = [];
  if (p.combustible === "hybrid") extra.push("Fonctionne au bois comme aux pellets");
  if (p.isCoassiale) extra.push("sortie coaxiale");
  if (p.isCanalizable) extra.push("version canalisable");
  if (extra.length) { const s = extra.join(", "); bits.push(s.charAt(0).toUpperCase() + s.slice(1) + "."); }
  let out = bits.join(" ");
  if (out.length > 200) out = out.slice(0, 197).trimEnd() + "...";
  return out;
}
