import { brandedEmailHtml, emailButton, emailParagraph, escapeHtml, EMAIL_COLORS } from "./email-layout";

/**
 * E-mail « mot de passe oublié » de l'administration (/admin/forgot), en
 * français et aux couleurs du site : Payload l'envoie en anglais par défaut
 * (« Reset Your Password »). Le lien vaut une heure, durée par défaut de
 * `forgotPassword.expiration`.
 *
 * Imports relatifs : la configuration Payload, donc ce module, est aussi
 * chargée par la CLI (`pnpm migrate`), hors de Next.
 */

export const RESET_PASSWORD_SUBJECT = "Réinitialisation de votre mot de passe Mister Pellets";

export function resetPasswordHtml({ url, email }: { url: string; email?: string }): string {
  const C = EMAIL_COLORS;
  const account = email ? ` pour le compte <strong>${escapeHtml(email)}</strong>` : "";
  return brandedEmailHtml({
    title: RESET_PASSWORD_SUBJECT,
    preheader: "Choisissez un nouveau mot de passe, le lien vaut une heure.",
    eyebrow: "Administration du site",
    heading: "Nouveau mot de passe",
    lead: "Le lien ci-dessous vaut une heure.",
    bodyHtml: `${emailParagraph("Bonjour,")}
    ${emailParagraph(`Une réinitialisation du mot de passe de l&#39;administration de mister-pellets.be a été demandée${account}.`, 24)}
    ${emailButton(url, "Choisir un nouveau mot de passe")}
    <p style="margin:16px 0 24px;text-align:center;font-size:12px;line-height:1.6;color:${C.inkSoft}">
      Le bouton ne s&#39;ouvre pas&nbsp;? Copiez ce lien dans votre navigateur&nbsp;:<br>
      <a href="${escapeHtml(url)}" style="color:${C.greenDeep};word-break:break-all">${escapeHtml(url)}</a>
    </p>
    ${emailParagraph("Si vous n&#39;êtes pas à l&#39;origine de cette demande, vous pouvez ignorer cet e-mail : votre mot de passe actuel reste valable.", 0)}`,
    footerNote: "Vous recevez cet e-mail parce qu'une réinitialisation a été demandée sur mister-pellets.be/admin.",
  });
}
