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
    defaultColumns: ["name", "brand", "power", "priceTTC", "stockStatus", "isBestseller"],
    listSearchableFields: ["name", "sku", "slug", "brand"],
    group: "Boutique",
  },
  fields: [
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
          required: true,
          admin: { width: "33%", description: "Prix HTVA (€)" },
        },
        {
          name: "priceTTC",
          type: "number",
          required: true,
          admin: { width: "33%", description: "Prix TTC (€) — TVA 21%" },
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
      defaultValue: "Home & Garden > Household Appliances > Heating > Pellet Stoves",
      admin: { description: "Taxonomie Google Merchant" },
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
  ],
};
