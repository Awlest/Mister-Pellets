import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";

/** TVA appliquée aux prix du site (21 %), comme `priceTTC` des produits. */
const VAT = 1.21;

/**
 * Accessories — les compléments vendus en plus d'un poêle : thermostat
 * d'ambiance, télécommande, module Wi-Fi, kit de canalisation, kit d'air
 * extérieur, socle, foyer en fonte…
 *
 * Un complément est saisi UNE fois (un code fabricant = une fiche) puis
 * rattaché aux produits par le champ « Compléments en option » de la fiche
 * produit. Changer son prix ici le change sur toutes les fiches qui le
 * proposent.
 *
 * Prix : le tarif fabricant donne le prix HTVA. Le prix TVAC affiché se
 * calcule tout seul (×1,21, arrondi à l'euro comme les variantes) quand il
 * est laissé vide. Sans aucun prix, la fiche affiche « prix sur demande ».
 * Les compléments ne prennent pas le bonus de saison : il ne porte que sur le
 * poêle (lib/bonus.ts).
 */
export const Accessories: CollectionConfig = {
  slug: "accessories",
  labels: { singular: "Complément", plural: "Compléments" },
  admin: {
    useAsTitle: "name",
    group: "Boutique",
    defaultColumns: ["name", "brand", "category", "mpn", "priceTTC"],
    listSearchableFields: ["name", "mpn", "sku"],
    description:
      "Options vendues en plus d'un poêle (thermostat, Wi-Fi, canalisation…). Une fiche par code fabricant, rattachée aux produits depuis leur fiche.",
  },
  access: {
    read: () => true, // public : les prix s'affichent sur les fiches produit
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Prix TVAC déduit du prix HTVA quand il n'est pas saisi.
        if (
          data &&
          typeof data.priceHT === "number" &&
          data.priceHT > 0 &&
          (data.priceTTC == null || data.priceTTC === "")
        ) {
          data.priceTTC = Math.round(data.priceHT * VAT);
        }
        return data;
      },
    ],
    afterChange: [
      () => {
        // Les fiches produit sont en ISR : un prix de complément modifié doit
        // s'y voir sans attendre le prochain build.
        try {
          revalidatePath("/produit/[slug]", "page");
        } catch (err) {
          console.warn("[accessories afterChange] revalidate failed:", err);
        }
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Nom affiché",
      admin: { description: "Court et clair pour un particulier (ex. « Thermostat radio TriKey »)." },
    },
    {
      type: "row",
      fields: [
        {
          name: "brand",
          type: "select",
          required: true,
          label: "Marque",
          options: [
            { label: "Edilkamin", value: "Edilkamin" },
            { label: "EK63", value: "EK63" },
            { label: "Girolami", value: "Girolami" },
            { label: "Dielle", value: "Dielle" },
            { label: "Ferlux", value: "Ferlux" },
            { label: "Austroflamm", value: "Austroflamm" },
            { label: "Cadel", value: "Cadel" },
          ],
          admin: { width: "33%" },
        },
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "autre",
          label: "Catégorie",
          options: [
            { label: "Thermostat et télécommande", value: "thermostat" },
            { label: "Wi-Fi et pilotage à distance", value: "connectivite" },
            { label: "Canalisation de l'air chaud", value: "canalisation" },
            { label: "Raccordement (fumées, air extérieur)", value: "raccordement" },
            { label: "Habillage et installation", value: "habillage" },
            { label: "Fonctionnement (kits, foyer, capteurs)", value: "fonctionnement" },
            { label: "Autre", value: "autre" },
          ],
          admin: { width: "33%", description: "Regroupe les compléments sur la fiche produit." },
        },
        {
          name: "mpn",
          type: "text",
          label: "Code fabricant",
          admin: { width: "34%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "priceHT",
          type: "number",
          label: "Prix HTVA (€)",
          admin: { width: "33%", step: 0.01, description: "Prix du tarif fabricant." },
        },
        {
          name: "priceTTC",
          type: "number",
          label: "Prix TVAC (€)",
          admin: {
            width: "33%",
            step: 0.01,
            description: "Affiché sur les fiches. Vide = calculé depuis le HTVA (×1,21). Les deux vides = « prix sur demande ».",
          },
        },
        {
          name: "sku",
          type: "text",
          required: true,
          unique: true,
          label: "Référence interne",
          admin: { width: "34%", description: "Unique (ex. girolami-5629)." },
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
      maxLength: 200,
      label: "Précision",
      admin: {
        description:
          "Optionnel, une ligne sous le nom (ex. « Indispensable avec le kit Air Diffuser », « Version canalisable seulement »).",
      },
    },
    {
      name: "tariffSource",
      type: "text",
      label: "Source du prix",
      admin: { description: "Tarif et page d'origine (ex. Girolami Catalistino 2026 p. 50)." },
    },
  ],
};
