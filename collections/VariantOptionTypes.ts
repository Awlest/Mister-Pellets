import type { CollectionConfig } from "payload";
import { slugify } from "../lib/slugify";

/**
 * VariantOptionTypes — les AXES de variation produit.
 *
 * Exemples : « Matériau », « Couleur », « Sortie des fumées ».
 * Chaque axe définit comment ses valeurs s'affichent sur la page produit
 * (boutons texte / pastilles couleur / icônes).
 *
 * Collection de configuration : créée vide, peuplée par le seed
 * scripts/seed-variant-options.ts. Migration 100% additive — n'affecte
 * aucune donnée produit existante.
 */
export const VariantOptionTypes: CollectionConfig = {
  slug: "variant-option-types",
  admin: {
    useAsTitle: "label",
    group: "Configuration",
    defaultColumns: ["label", "slug", "displayMode", "sortOrder"],
  },
  // RLS Payload (cf. audit V14.1) : lecture publique (le frontend lit les
  // axes pour afficher les sélecteurs), écriture réservée aux admins.
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-normalise le slug (le frontend et le feed Merchant s'en
        // servent comme clé de query param — pas de majuscules/accents).
        if (data?.slug && typeof data.slug === "string") {
          data.slug = slugify(data.slug);
        } else if (data?.label && typeof data.label === "string") {
          data.slug = slugify(data.label);
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: { description: "Nom affiché de l'axe (ex: Matériau, Couleur)" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "Identifiant technique (auto-normalisé). Utilisé dans les query params du feed Merchant.",
      },
    },
    {
      name: "displayMode",
      type: "select",
      required: true,
      defaultValue: "text",
      options: [
        { label: "Boutons texte", value: "text" },
        { label: "Pastilles couleur", value: "color" },
        { label: "Icônes", value: "icon" },
      ],
      admin: {
        description: "Comment les valeurs de cet axe s'affichent sur la page produit.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 100,
      admin: { description: "Ordre d'affichage des axes (plus petit = plus haut)." },
    },
  ],
};
