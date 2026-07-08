import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";

/**
 * Slugifie une chaîne pour générer des URLs propres :
 * - lowercase
 * - retire les accents (é → e, è → e, …)
 * - remplace tout caractère non alphanumérique par un tiret
 * - dédoublonne les tirets, trim les tirets en bordure
 *
 * Utilisé en hook beforeChange pour normaliser le slug saisi par les
 * éditeurs admin et éviter les URLs cassées (capitales, espaces, accents).
 */
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les diacritiques (accents)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Products — collection des poêles à pellets distribués.
 * Phase 5 : schéma riche pour les 61 produits Wix à importer.
 *
 * Convention slug : {marque}-{modèle}-{puissance}kw-{type?}
 *   ex: edilkamin-blade-9kw, ek63-tweed-90, dielle-iride-22-hydro
 *
 * Le slug est auto-normalisé via hook beforeChange (lowercase + tirets, no
 * accents) pour empêcher les URLs cassées si l'éditeur saisit des majuscules
 * ou des accents.
 */
export const Products: CollectionConfig = {
  slug: "products",
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-slugify : si le slug est saisi avec des majuscules / accents /
        // espaces, on le normalise. Si vide, on dérive depuis le name.
        if (data.slug && typeof data.slug === "string") {
          data.slug = slugify(data.slug);
        } else if (data.name && typeof data.name === "string") {
          data.slug = slugify(data.name);
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        // Revalidation instantanée des pages Next.js cachées dès qu'un produit
        // est créé/modifié dans l'admin. Sans ce hook, les pages SSG du CDN
        // Vercel restent figées jusqu'au prochain build, et l'éditeur croit
        // que ses modifs ne s'appliquent pas.
        try {
          // Page produit (slug courant)
          if (doc?.slug && typeof doc.slug === "string") {
            revalidatePath(`/produit/${doc.slug}`);
          }
          // Si le slug a changé, on revalide aussi l'ancien (il restera en
          // 404 sinon, car generateStaticParams a généré une page pour lui).
          if (
            previousDoc?.slug &&
            typeof previousDoc.slug === "string" &&
            previousDoc.slug !== doc?.slug
          ) {
            revalidatePath(`/produit/${previousDoc.slug}`);
          }
          // Liste boutique (compteur, vignettes, prix)
          revalidatePath("/boutique");
          // Pages villes qui peuvent référencer ce produit
          revalidatePath("/poeles-pellets/[ville]", "page");
        } catch (err) {
          // En dev local le revalidatePath peut échouer ; ne bloque pas le save
          console.warn("[products afterChange] revalidate failed:", err);
        }
        return doc;
      },
    ],
    afterDelete: [
      ({ doc }) => {
        // Idem au delete : revalide pour que la page produit disparaisse
        // de la boutique et que l'URL retourne 404 immédiatement.
        try {
          if (doc?.slug && typeof doc.slug === "string") {
            revalidatePath(`/produit/${doc.slug}`);
          }
          revalidatePath("/boutique");
        } catch (err) {
          console.warn("[products afterDelete] revalidate failed:", err);
        }
        return doc;
      },
    ],
  },
  // RLS Payload (cf. audit V14.1) : explicite chaque opération.
  access: {
    read: () => true, // public (la boutique consulte le catalogue)
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: [
      "name",
      "brand",
      "power",
      "priceTTC",
      "stockStatus",
      "hiddenFromBoutique",
    ],
    listSearchableFields: ["name", "sku", "slug", "brand"],
    group: "Boutique",
  },
  fields: [
    // ===== VISIBILITÉ BOUTIQUE =====
    // Champ unique pour permettre à l'équipe de cacher un produit du listing
    // sans le supprimer. La page produit (URL directe /produit/{slug}) reste
    // accessible pour ne pas casser d'éventuels liens externes ou favoris.
    // Pour masquer en masse : sélectionner plusieurs produits dans le listing
    // admin → bouton "Edit" en haut → toggle ce champ → "Save changes".
    {
      name: "hiddenFromBoutique",
      type: "checkbox",
      defaultValue: false,
      label: "Masquer de la boutique",
      admin: {
        description:
          "Si coché, le produit n'apparaît plus dans la liste de la boutique ni dans les filtres. L'URL directe /produit/{slug} reste accessible.",
        position: "sidebar",
      },
    },

    // ===== IDENTIFIANTS =====
    {
      type: "row",
      fields: [
        {
          name: "sku",
          type: "text",
          required: true,
          unique: true,
          admin: { width: "33%", description: "Référence interne unique" },
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: { width: "67%", description: "URL : /produit/{slug}/" },
        },
      ],
    },

    // ===== IDENTITÉ =====
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Nom commercial complet (ex: Edilkamin Blade Plus 9 kW)" },
    },
    {
      type: "row",
      fields: [
        {
          name: "brand",
          type: "select",
          required: true,
          options: [
            { label: "Edilkamin", value: "Edilkamin" },
            { label: "EK63", value: "EK63" },
            { label: "Girolami", value: "Girolami" },
            { label: "Dielle", value: "Dielle" },
            { label: "Ferlux", value: "Ferlux" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "model",
          type: "text",
          required: true,
          admin: { width: "50%", description: "ex: Blade Plus, Tweed 90+, Iride 22" },
        },
      ],
    },
    {
      name: "productType",
      type: "select",
      required: true,
      options: [
        { label: "Standard (air pulsé / convection)", value: "standard" },
        { label: "Canalisable", value: "canalisable" },
        { label: "Hydro", value: "hydro" },
        { label: "Hybride bois + pellets", value: "hybride" },
        { label: "Insert encastrable", value: "insert" },
      ],
      admin: {
        description: "Ce qu'EST le poêle (taxonomie V1.3)",
      },
    },
    {
      name: "combustible",
      type: "select",
      required: true,
      defaultValue: "pellet",
      options: [
        { label: "Pellets", value: "pellet" },
        { label: "Bois (bûches)", value: "bois" },
        { label: "Hybride (bois + pellets)", value: "hybride" },
      ],
      admin: {
        description:
          "Combustible — filtre boutique. Pour un modèle proposé en plusieurs combustibles, choisir le combustible principal (le choix pellet/hybride à l'achat se gère en variante). Le caractère hydro/ventilé se règle via la case « Hydro » ci-dessous.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "diffusion",
          type: "select",
          required: true,
          defaultValue: "ventilation-forcee",
          options: [
            { label: "Ventilation forcée", value: "ventilation-forcee" },
            { label: "Convection naturelle (silencieux)", value: "convection-naturelle" },
          ],
          admin: { width: "50%", description: "COMMENT la chaleur sort" },
        },
        {
          name: "color",
          type: "select",
          required: true,
          defaultValue: "dark",
          options: [
            { label: "Tons clairs (blanc, crème, ivoire)", value: "light" },
            { label: "Tons foncés (noir, anthracite, bordeaux)", value: "dark" },
            { label: "Tons naturels (acier, fonte, bois, pierre)", value: "natural" },
          ],
          admin: { width: "50%", description: "Catégorie de couleur regroupée" },
        },
      ],
    },

    // ===== PRIX =====
    {
      type: "row",
      fields: [
        {
          name: "priceHT",
          type: "number",
          admin: { width: "33%", description: "Prix HTVA (€). Laisser vide = « sur devis »." },
        },
        {
          name: "priceTTC",
          type: "number",
          admin: { width: "33%", description: "Prix TTC (€) — TVA 21%. Laisser vide = « sur devis »." },
        },
        {
          name: "promoPrice",
          type: "number",
          admin: { width: "33%", description: "Prix promo TTC (optionnel)" },
        },
      ],
    },
    {
      name: "installationPrice",
      type: "number",
      admin: { description: "Prix pose typique (€) — TVA 6%" },
    },

    // ===== CARACTÉRISTIQUES TECHNIQUES =====
    {
      type: "row",
      fields: [
        {
          name: "power",
          type: "number",
          required: true,
          admin: { width: "33%", description: "Puissance (kW)" },
        },
        {
          name: "heatedVolumeM3",
          type: "number",
          admin: {
            width: "33%",
            description:
              "Volume de chauffe maximal (m³) — donnée constructeur, à saisir telle quelle.",
          },
        },
        {
          name: "efficiency",
          type: "number",
          admin: { width: "33%", description: "Rendement (%)" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "energyClass",
          type: "select",
          options: [
            { label: "A++", value: "A++" },
            { label: "A+", value: "A+" },
            { label: "A", value: "A" },
            { label: "B", value: "B" },
            { label: "C", value: "C" },
          ],
          admin: { width: "25%" },
        },
        {
          name: "emissions",
          type: "number",
          admin: { width: "25%", description: "Émissions CO (mg/m³)" },
        },
        {
          name: "hopperCapacity",
          type: "number",
          admin: { width: "25%", description: "Réservoir pellets (kg)" },
        },
        {
          name: "weight",
          type: "number",
          admin: { width: "25%", description: "Poids (kg)" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "isAirtight",
          type: "checkbox",
          label: "Étanche (BBC compatible)",
          admin: { width: "25%" },
        },
        {
          name: "isCanalizable",
          type: "checkbox",
          label: "Canalisable",
          admin: { width: "25%" },
        },
        {
          name: "isHydro",
          type: "checkbox",
          label: "Hydro (chauffage central)",
          admin: { width: "25%" },
        },
        {
          name: "isConnected",
          type: "checkbox",
          label: "Connecté (WiFi)",
          admin: { width: "25%" },
        },
      ],
    },
    {
      name: "dimensions",
      type: "group",
      admin: { description: "Dimensions externes (cm)" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "width",  type: "number", admin: { width: "33%" } },
            { name: "height", type: "number", admin: { width: "33%" } },
            { name: "depth",  type: "number", admin: { width: "33%" } },
          ],
        },
      ],
    },

    // ===== GOOGLE MERCHANT =====
    {
      type: "row",
      fields: [
        {
          name: "gtin",
          type: "text",
          admin: { width: "50%", description: "Code-barres EAN (optionnel mais recommandé Merchant)" },
        },
        {
          name: "mpn",
          type: "text",
          admin: { width: "50%", description: "Référence fabricant (Merchant required si pas de GTIN)" },
        },
      ],
    },
    {
      name: "googleProductCategory",
      type: "text",
      admin: {
        description:
          "Taxonomie Google Merchant officielle. Laisser vide = auto : « Home & Garden > Wood Stoves » (poêles) ou « Home & Garden > Fireplaces » (inserts).",
      },
    },

    // ===== MÉDIAS =====
    {
      name: "mainImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Photo principale (carrée idéale 1200×1200)" },
    },
    {
      name: "galleryImages",
      type: "array",
      labels: { singular: "Image", plural: "Galerie" },
      maxRows: 8,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },

    // ===== DÉCLINAISONS DE COULEUR =====
    {
      name: "colorVariants",
      type: "array",
      labels: { singular: "Couleur", plural: "Déclinaisons de couleur" },
      maxRows: 8,
      admin: {
        description:
          "Couleurs disponibles pour ce produit. Le prix et les options techniques restent identiques, seuls le code EAN et les photos peuvent varier.",
        initCollapsed: true,
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "colorName",
              type: "text",
              required: true,
              admin: { width: "40%", description: "ex: Noir, Crème, Bordeaux" },
            },
            {
              name: "colorHex",
              type: "text",
              admin: {
                width: "20%",
                description: "Hexa pour la pastille (ex: #14241B, #F4F1E8)",
              },
            },
            {
              name: "gtin",
              type: "text",
              admin: {
                width: "40%",
                description: "Code EAN-13 spécifique à cette couleur",
              },
            },
          ],
        },
        {
          name: "mainImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description:
              "Photo principale de cette couleur. Si vide, la photo principale du produit est utilisée.",
          },
        },
        {
          name: "galleryImages",
          type: "array",
          labels: { singular: "Image", plural: "Galerie de la couleur" },
          maxRows: 8,
          admin: {
            description: "Si vide, la galerie principale du produit est utilisée.",
          },
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
          ],
        },
      ],
    },

    // ===== CONTENU RÉDACTIONNEL =====
    {
      name: "shortDescription",
      type: "textarea",
      maxLength: 200,
      admin: { description: "1-2 lignes pour les cards (max 200 chars)" },
    },
    {
      name: "description",
      type: "richText",
      admin: { description: "Description longue éditable (markdown rich text)" },
    },
    {
      name: "features",
      type: "array",
      labels: { singular: "Point fort", plural: "Points forts" },
      maxRows: 6,
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              admin: { width: "40%" },
            },
            {
              name: "description",
              type: "text",
              required: true,
              admin: { width: "60%" },
            },
          ],
        },
      ],
    },
    {
      name: "technicalSheet",
      type: "upload",
      relationTo: "media",
      admin: { description: "Fiche technique PDF (optionnel)" },
    },

    // ===== SEO =====
    {
      type: "row",
      fields: [
        {
          name: "metaTitle",
          type: "text",
          maxLength: 70,
          admin: { width: "50%", description: "max 70 chars" },
        },
        {
          name: "metaDescription",
          type: "textarea",
          maxLength: 160,
          admin: { width: "50%", description: "max 160 chars" },
        },
      ],
    },

    // ===== STOCK & DISPONIBILITÉ =====
    {
      type: "row",
      fields: [
        {
          name: "stock",
          type: "number",
          defaultValue: 0,
          admin: { width: "33%" },
        },
        {
          name: "stockStatus",
          type: "select",
          required: true,
          defaultValue: "in_stock",
          options: [
            { label: "En stock", value: "in_stock" },
            { label: "Sur commande", value: "on_order" },
            { label: "Rupture temporaire", value: "out_of_stock" },
            { label: "Discontinué", value: "discontinued" },
          ],
          admin: { width: "33%" },
        },
        {
          name: "deliveryDelay",
          type: "text",
          defaultValue: "48-72h",
          admin: { width: "33%", description: "ex: 48-72h, 4-6 sem." },
        },
      ],
    },

    // ===== MARKETING =====
    {
      type: "row",
      fields: [
        {
          name: "isBestseller",
          type: "checkbox",
          label: "Best-seller",
          admin: { width: "33%" },
        },
        {
          name: "isFeatured",
          type: "checkbox",
          label: "Mis en avant",
          admin: { width: "33%" },
        },
        {
          name: "isNew",
          type: "checkbox",
          label: "Nouveau",
          admin: { width: "33%" },
        },
      ],
    },

    // ===== VARIANTES PRODUIT (système générique multi-axes) =====
    // AJOUT ADDITIF — ne remplace PAS le champ `colorVariants` ci-dessus.
    // `colorVariants` reste le système simple « déclinaisons de couleur »
    // utilisé par les ~118 produits déjà encodés (prix unique, photos par
    // couleur). Ce bloc-ci est le système générique multi-axes (matériau,
    // sortie des fumées, alimentation…) avec un prix/SKU par combinaison.
    //
    // Toute l'UI ci-dessous est masquée tant que `hasVariants` n'est pas
    // coché : les produits existants ne voient AUCUN changement dans leur
    // interface d'édition. Aucune donnée existante n'est touchée.
    {
      name: "hasVariants",
      type: "checkbox",
      defaultValue: false,
      label: "Ce produit a des variantes",
      admin: {
        description:
          "Active la gestion des variantes ci-dessous. Si décoché, le produit fonctionne avec son prix et son SKU principal (comportement actuel inchangé).",
      },
    },
    {
      name: "variantOptions",
      type: "array",
      label: "Options de variantes (axes de configuration)",
      admin: {
        condition: (_, siblingData) => siblingData?.hasVariants === true,
        description:
          "Définir les axes de variation. Exemple : Matériau, Couleur, Sortie des fumées.",
        initCollapsed: true,
      },
      fields: [
        {
          name: "optionType",
          type: "relationship",
          relationTo: "variant-option-types",
          required: true,
        },
        {
          name: "values",
          type: "relationship",
          relationTo: "variant-option-values",
          hasMany: true,
          required: true,
          filterOptions: ({ siblingData }) => ({
            optionType: {
              equals: (siblingData as { optionType?: string | number } | undefined)
                ?.optionType,
            },
          }),
        },
      ],
    },
    {
      name: "variants",
      type: "array",
      label: "Combinaisons disponibles",
      admin: {
        condition: (_, siblingData) => siblingData?.hasVariants === true,
        description:
          "Une ligne par combinaison réelle disponible. Les combinaisons absentes ici sont automatiquement grisées sur le site.",
        initCollapsed: true,
      },
      fields: [
        {
          name: "optionValues",
          type: "relationship",
          relationTo: "variant-option-values",
          hasMany: true,
          required: true,
          admin: {
            description:
              "Sélectionner UNE valeur par axe défini ci-dessus (ex : Acier + Noir + Sortie haute).",
          },
        },
        {
          type: "row",
          fields: [
            {
              name: "sku",
              type: "text",
              required: true,
              admin: { width: "40%", description: "Référence unique de la variante" },
            },
            {
              name: "gtin",
              type: "text",
              admin: { width: "30%", description: "Code-barres EAN de la variante" },
            },
            {
              name: "mpn",
              type: "text",
              admin: { width: "30%", description: "Référence fabricant de la variante" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "price",
              type: "number",
              required: true,
              admin: { width: "33%", step: 0.01, description: "Prix TTC (€)" },
            },
            {
              name: "salePrice",
              type: "number",
              admin: { width: "33%", step: 0.01, description: "Prix promo TTC (€)" },
            },
            {
              name: "stockStatus",
              type: "select",
              defaultValue: "in_stock",
              options: [
                { label: "En stock", value: "in_stock" },
                { label: "Sur commande", value: "on_order" },
                { label: "Rupture temporaire", value: "out_of_stock" },
              ],
              admin: { width: "34%" },
            },
          ],
        },
        {
          name: "leadTimeDays",
          type: "number",
          admin: { description: "Délai de livraison de cette variante (jours) — optionnel." },
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            description:
              "Optionnel. Si renseigné, l'image principale change quand cette variante est sélectionnée.",
          },
        },
        // ===== MÉTADONNÉES D'IMPORT TARIF =====
        // Sous-champs additifs (section 5 du brief variantes EK63/Edilkamin).
        // Tracent le calcul de la variante depuis le tarif fabricant. Optionnels
        // — les variantes encodées avant la migration 20260520 ont ces champs
        // à null.
        {
          type: "row",
          fields: [
            {
              name: "manufacturerStructureSku",
              type: "text",
              admin: { width: "50%", description: "Code structure fabricant (6 chiffres, ex. 817920)" },
            },
            {
              name: "manufacturerColorSku",
              type: "text",
              admin: { width: "50%", description: "Code série couleur (7 chiffres, système B uniquement)" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "codingSystem",
              type: "select",
              options: [
                { label: "A (code complet par couleur)", value: "A" },
                { label: "B (structure + série couleur)", value: "B" },
              ],
              admin: { width: "33%", description: "Système de codage détecté au tarif" },
            },
            {
              name: "computedPriceHT",
              type: "number",
              admin: { width: "33%", step: 0.01, description: "Prix HT calculé depuis le tarif" },
            },
            {
              name: "priceSource",
              type: "text",
              admin: { width: "34%", description: "Trace du calcul (ex. structure 2520 + serie 150)" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "tariffSource",
              type: "text",
              admin: { width: "70%", description: "Édition du tarif (ex. Edilkamin Mai 2026)" },
            },
            {
              name: "importBatchId",
              type: "text",
              admin: { width: "30%", description: "Identifiant du lot d'import (annulation ciblée)" },
            },
          ],
        },
      ],
    },
  ],
};
