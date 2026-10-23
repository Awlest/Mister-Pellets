/**
 * Demande de rappel de /prix-poele-pellets : règles partagées entre le
 * formulaire (components/forms/CallbackForm.tsx) et l'API (app/api/rappel).
 */

/** Ce qui fait le plus varier le prix de la pose, demandé en une question. */
export const CALLBACK_SITUATIONS = [
  { value: "cheminee", label: "J'ai une cheminée" },
  { value: "sans-cheminee", label: "Pas de cheminée" },
  { value: "ne-sais-pas", label: "Je ne sais pas" },
] as const;

export type CallbackSituation = (typeof CALLBACK_SITUATIONS)[number]["value"];

export const situationLabel = (value: string): string | undefined =>
  CALLBACK_SITUATIONS.find((s) => s.value === value)?.label;

/** Même règle que le formulaire de devis : numéro belge, fixe ou mobile. */
export function isValidBelgianPhone(input: string): boolean {
  const cleaned = input.replace(/[\s.\-()/]/g, "");
  if (cleaned === "") return false;
  return [/^\+32[1-9]\d{7,8}$/, /^0032[1-9]\d{7,8}$/, /^0[1-9]\d{7,8}$/].some((re) =>
    re.test(cleaned),
  );
}

export const isValidPostalCode = (input: string): boolean => /^[1-9]\d{3}$/.test(input.trim());

export const isValidEmail = (input: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());

/**
 * Le formulaire ne demande que le nom et le téléphone, mais la colonne email
 * de contact-messages est obligatoire en base. Plutôt qu'une migration, les
 * demandes sans e-mail y sont rangées avec cette adresse technique, qui ne
 * sert qu'à les reconnaître dans l'admin.
 */
export const CALLBACK_NO_EMAIL = "rappel-sans-email@mister-pellets.be";
