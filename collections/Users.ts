import type { CollectionConfig } from "payload";
import { RESET_PASSWORD_SUBJECT, resetPasswordHtml } from "../lib/admin-email";

/**
 * Users — collection système Payload
 * Utilisée pour l'authentification de l'admin /admin.
 */
export const Users: CollectionConfig = {
  slug: "users",
  // Lockout brute-force (cf. audit V20260503 §3.H.5 + V14.1 demande client) :
  // après 4 tentatives ratées, compte verrouillé pendant 15 minutes.
  // Protection contre les bots qui tentent des combinaisons email+password.
  auth: {
    maxLoginAttempts: 4,
    lockTime: 15 * 60 * 1000, // 15 minutes en ms
    cookies: {
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    },
    // E-mail « mot de passe oublié » en français, aux couleurs du site
    // (lib/admin-email.ts). Le lien reprend la construction de Payload :
    // serverURL + route admin + route reset + jeton.
    forgotPassword: {
      generateEmailSubject: () => RESET_PASSWORD_SUBJECT,
      generateEmailHTML: (args) => {
        const config = args?.req?.payload.config;
        const base = config?.serverURL || process.env.NEXT_PUBLIC_SITE_URL || "";
        const adminRoute = config?.routes?.admin ?? "/admin";
        const resetRoute = config?.admin?.routes?.reset ?? "/reset";
        return resetPasswordHtml({
          url: `${base}${adminRoute}${resetRoute}/${args?.token ?? ""}`,
          email: typeof args?.user?.email === "string" ? args.user.email : undefined,
        });
      },
    },
  },
  // RLS Payload (cf. audit V14.1) : seuls les users authentifiés peuvent
  // lister/lire la collection Users. Pas de read public, pas de signup auto.
  // La création de comptes se fait uniquement par un admin via /admin.
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    admin: ({ req }) => Boolean(req.user),
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
