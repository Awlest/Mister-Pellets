import type { CollectionConfig } from "payload";

/**
 * Users — collection système Payload
 * Utilisée pour l'authentification de l'admin /admin.
 */
export const Users: CollectionConfig = {
  slug: "users",
  // Lockout brute-force (cf. audit V20260503 §3.H.5) : après 5 tentatives
  // ratées, compte verrouillé pendant 10 minutes. Protection minimale contre
  // les bots qui tentent des combinaisons email+password.
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes en ms
    cookies: {
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    },
  },
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
