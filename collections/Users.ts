import type { CollectionConfig } from "payload";

/**
 * Users — collection système Payload
 * Utilisée pour l'authentification de l'admin /admin.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role", "createdAt"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nom",
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "admin",
      options: [
        { label: "Admin (tout)", value: "admin" },
        { label: "Editor (contenu uniquement)", value: "editor" },
        { label: "Viewer (lecture seule)", value: "viewer" },
      ],
    },
  ],
};
