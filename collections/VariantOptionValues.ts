import type { CollectionConfig } from "payload";
import { slugify } from "../lib/slugify";

/**
 * VariantOptionValues — les VALEURS possibles d'un axe de variation.
 *
 * Exemples : « Noir », « Acier », « Sortie haute ». Chaque valeur est
 * rattachée à un axe (variant-option-types) via le champ optionType.
 *
 * Collection de configuration : créée vide, peuplée par le seed
 * scripts/seed-variant-options.ts. Migration 100% additive.
 */
export const VariantOptionValues: CollectionConfig = {
  slug: "variant-option-values",
  admin: {
    useAsTitle: "label",
    group: "Configuration",
    defaultColumns: ["label", "optionType", "slug"],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
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
      admin: { description: "Valeur affichée (ex: Noir, Acier, Sortie haute)" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      admin: { description: "Identifiant technique (auto-normalisé)." },
    },
    {
      name: "optionType",
      type: "relationship",
      relationTo: "variant-option-types",
      required: true,
      admin: { description: "Axe de variation auquel cette valeur appartient." },
    },
    {
      name: "colorHex",
      type: "text",
      admin: {
        description:
          "Code hex (ex: #1a1a1a). Utilisé si l'axe parent est en mode « Pastilles couleur ».",
      },
    },
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Icône SVG. Utilisée si l'axe parent est en mode « Icônes ».",
      },
    },
  ],
};
