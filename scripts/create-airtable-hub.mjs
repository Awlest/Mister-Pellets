// Crée le hub Airtable du système d'automatisation SEO (brief v2, section 3).
//
// Construit 8 tables dans une base Airtable EXISTANTE : Communes, Mots-clés,
// Idées, Contenu, Posts GBP, Avis, Photos, Journal SEO. Ajoute les champs
// liés une fois les tables créées, puis préremplit la table Communes.
//
// Le script est ré-exécutable : il saute les tables, champs liés et communes
// déjà présents.
//
// Prérequis :
//   1. Une base Airtable vide (créée à la main, 1 clic). Récupère son ID
//      dans l'URL : airtable.com/{appXXXXXXXX}/...
//   2. Un Personal Access Token avec les scopes :
//        schema.bases:write  +  data.records:write
//      et un accès à cette base.
//   3. Un fichier .env à la racine du dépôt (déjà gitignoré) :
//        AIRTABLE_TOKEN=patXXXXXXXXXXXXXX
//        AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
//
// Lancement :
//   node --env-file=.env scripts/create-airtable-hub.mjs

const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!TOKEN || !BASE_ID) {
  console.error(
    "Manque AIRTABLE_TOKEN ou AIRTABLE_BASE_ID. Crée un fichier .env puis " +
      "lance : node --env-file=.env scripts/create-airtable-hub.mjs",
  );
  process.exit(1);
}

const META = `https://api.airtable.com/v0/meta/bases/${BASE_ID}`;
const DATA = `https://api.airtable.com/v0/${BASE_ID}`;
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`${method} ${url} -> ${res.status} ${text}`);
  }
  return json;
}

// --- définitions de champs réutilisables -----------------------------------
const marque = {
  name: "Marque",
  type: "singleSelect",
  options: { choices: [{ name: "Mister Pellets" }, { name: "Awlest" }] },
};
const select = (name, ...values) => ({
  name,
  type: "singleSelect",
  options: { choices: values.map((v) => ({ name: v })) },
});
const text = (name) => ({ name, type: "singleLineText" });
const longText = (name) => ({ name, type: "multilineText" });
const intNum = (name) => ({ name, type: "number", options: { precision: 0 } });
const url = (name) => ({ name, type: "url" });
const date = (name) => ({
  name,
  type: "date",
  options: { dateFormat: { name: "iso" } },
});

// --- les 8 tables (champs scalaires uniquement ; les liens viennent après) --
const TABLES = [
  {
    name: "Communes",
    description: "Registre géographique des communes wallonnes ciblées.",
    fields: [
      text("Nom"),
      text("Code postal"),
      select("Province", "Namur", "Hainaut", "Liège", "Luxembourg", "Brabant wallon"),
      select("Tier de priorité", "1", "2", "3"),
      intNum("Distance Fernelmont (km)"),
      select("Statut de couverture", "à couvrir", "en cours", "couverte"),
      marque,
    ],
  },
  {
    name: "Mots-clés",
    description: "Banque de mots-clés SEO.",
    fields: [
      text("Mot-clé"),
      text("Pilier / thème"),
      select("Intention", "information", "comparaison", "décision", "local"),
      intNum("Volume estimé"),
      select("Difficulté", "faible", "moyenne", "élevée"),
      select("Statut", "à traiter", "en cours", "traité"),
      marque,
    ],
  },
  {
    name: "Idées",
    description: "Sas d'idées de sujets en vrac.",
    fields: [
      text("Idée"),
      longText("Note"),
      text("Source"),
      select("Statut", "en vrac", "qualifiée", "rejetée"),
      marque,
    ],
  },
  {
    name: "Contenu",
    description: "File éditoriale du blog.",
    fields: [
      text("Titre"),
      longText("Brief"),
      select("Statut", "idée", "à faire", "en génération", "publié"),
      url("Lien PR"),
      date("Date"),
      marque,
    ],
  },
  {
    name: "Posts GBP",
    description: "Posts Google Business Profile proposés par la Routine A.",
    fields: [
      text("Post"),
      longText("Texte"),
      select("Type", "article", "conseil", "offre", "installation"),
      select("Bouton CTA", "En savoir plus", "Appeler", "Réserver", "Devis gratuit", "Aucun"),
      select("Statut", "à valider", "validé", "publié"),
      marque,
    ],
  },
  {
    name: "Avis",
    description: "Avis clients reçus et réponses rédigées.",
    fields: [
      text("Auteur"),
      select("Note", "1", "2", "3", "4", "5"),
      longText("Texte"),
      longText("Réponse rédigée"),
      select("Statut", "à traiter", "à valider", "publiée"),
      date("Date"),
      marque,
    ],
  },
  {
    name: "Photos",
    description: "Catalogue des photos de chantier (pipeline Make).",
    fields: [
      text("Nom"),
      { name: "Aperçu", type: "multipleAttachments" },
      url("Chemin Drive"),
      select("Type d'installation", "poêle air", "canalisable", "hydro", "insert", "autre"),
      select("Étape", "avant", "pendant", "après", "équipe", "produit"),
      select("Qualité", "bonne", "moyenne", "faible"),
      longText("Légende"),
      select("Statut", "cataloguée", "utilisée"),
      marque,
    ],
  },
  {
    name: "Journal SEO",
    description: "Suivi hebdomadaire SEO et GBP.",
    fields: [
      text("Semaine"),
      date("Date"),
      longText("Métriques GBP"),
      longText("Métriques Search Console"),
      intNum("Nb contenus publiés"),
      intNum("Nb avis"),
      longText("Synthèse"),
      longText("Détail audit"),
      marque,
    ],
  },
];

// --- champs liés à ajouter une fois toutes les tables créées ----------------
const LINKS = [
  { table: "Mots-clés", field: "Commune liée", target: "Communes" },
  { table: "Contenu", field: "Mot-clé cible", target: "Mots-clés" },
  { table: "Contenu", field: "Commune cible", target: "Communes" },
  { table: "Posts GBP", field: "Photo liée", target: "Photos" },
  { table: "Photos", field: "Commune", target: "Communes" },
];

// --- préremplissage de la table Communes ------------------------------------
const COMMUNES = [
  ["Fernelmont", "5380", "Namur"],
  ["Namur", "5000", "Namur"],
  ["Charleroi", "6000", "Hainaut"],
  ["Liège", "4000", "Liège"],
  ["Wavre", "1300", "Brabant wallon"],
  ["Mons", "7000", "Hainaut"],
  ["Arlon", "6700", "Luxembourg"],
  ["Tournai", "7500", "Hainaut"],
  ["Verviers", "4800", "Liège"],
  ["Gembloux", "5030", "Namur"],
  ["Dinant", "5500", "Namur"],
];

async function main() {
  console.log(`Base cible : ${BASE_ID}`);
  const existing = (await api("GET", `${META}/tables`)).tables;
  const byName = new Map(existing.map((t) => [t.name, t]));

  // 1. créer les tables manquantes
  for (const def of TABLES) {
    if (byName.has(def.name)) {
      console.log(`= table « ${def.name} » déjà présente, ignorée`);
      continue;
    }
    const created = await api("POST", `${META}/tables`, def);
    byName.set(created.name, created);
    console.log(`+ table « ${def.name} » créée`);
  }

  // 2. ajouter les champs liés manquants
  for (const link of LINKS) {
    const table = byName.get(link.table);
    const target = byName.get(link.target);
    if (table.fields?.some((f) => f.name === link.field)) {
      console.log(`= champ lié « ${link.table}.${link.field} » déjà présent`);
      continue;
    }
    await api("POST", `${META}/tables/${table.id}/fields`, {
      name: link.field,
      type: "multipleRecordLinks",
      options: { linkedTableId: target.id },
    });
    console.log(`+ champ lié « ${link.table}.${link.field} » -> ${link.target}`);
  }

  // 3. préremplir la table Communes si elle est vide
  const communes = byName.get("Communes");
  const current = await api("GET", `${DATA}/${communes.id}?maxRecords=1`);
  if (current.records.length > 0) {
    console.log("= table Communes non vide, préremplissage ignoré");
  } else {
    const records = COMMUNES.map(([Nom, cp, Province]) => ({
      fields: {
        Nom,
        "Code postal": cp,
        Province,
        "Tier de priorité": "1",
        "Statut de couverture": "à couvrir",
        Marque: "Mister Pellets",
      },
    }));
    await api("POST", `${DATA}/${communes.id}`, { records, typecast: true });
    console.log(`+ ${records.length} communes préremplies (tier 1)`);
  }

  console.log("\nHub Airtable prêt. Pense à : champ Marque déjà sur chaque " +
    "table, vues filtrées par marque à créer dans l'UI, interface de " +
    "validation mobile (brief section 3).");
}

main().catch((e) => {
  console.error("\nÉchec :", e.message);
  process.exit(1);
});
