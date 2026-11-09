import type { Access, FieldAccess } from "payload";

/**
 * Règles d'accès de l'admin selon le rôle du compte (collection users).
 *
 * Admin : le rôle « admin », ou un compte sans rôle. La colonne est NOT NULL
 * avec « admin » pour défaut depuis la première migration (20260502_074301),
 * et le champ a le même défaut dans l'admin : un compte existant ne perd donc
 * aucun droit. Viewer : lecture seule sur les leads et les commandes.
 */
type RoleHolder = { role?: string | null } | null | undefined;

export function isAdminUser(user: RoleHolder): boolean {
  return Boolean(user) && (user?.role == null || user.role === "admin");
}

/** Tout compte connecté, quel que soit son rôle. */
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

export const isAdmin: Access = ({ req }) => isAdminUser(req.user);

/** Champ modifiable par un admin seulement (ex. le rôle d'un compte). */
export const isAdminField: FieldAccess = ({ req }) => isAdminUser(req.user);

/** Un admin, ou le compte lui-même : chacun garde la main sur son mot de passe. */
export const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false;
  if (isAdminUser(req.user)) return true;
  return { id: { equals: req.user.id } };
};

/** Écriture sur les leads et les commandes : tout compte sauf « viewer ». */
export const canEditLeads: Access = ({ req }) => Boolean(req.user) && req.user?.role !== "viewer";
