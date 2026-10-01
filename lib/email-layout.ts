/**
 * Gabarit des e-mails envoyés aux clients, aux couleurs de Mister Pellets.
 *
 * Les clients mail ignorent l'essentiel du CSS moderne : mise en page en
 * tableaux, styles en ligne, largeur 600 px, aucune image indispensable à la
 * lecture (Outlook bloque les images par défaut), et un repli Georgia / Arial
 * pour les polices du site. Fraunces se charge là où c'est permis (Apple Mail,
 * iOS) ; Gmail et Outlook affichent Georgia.
 *
 * Les adresses des images pointent toujours vers la production : un e-mail se
 * lit des mois après son envoi, quel que soit l'environnement qui l'a envoyé.
 */

export const EMAIL_SITE_URL = "https://mister-pellets.be";

/** Couleurs du site (app/globals.css), en dur : pas de variables CSS en e-mail. */
export const EMAIL_COLORS = {
  greenDarkest: "#102916",
  greenDeep: "#174724",
  orangeFlame: "#F28A20",
  orangeWarm: "#FDB842",
  orangeLight: "#FFE4D1",
  cream: "#FAF7F0",
  beige: "#F4F1E8",
  beigeWarm: "#EAE0CB",
  ink: "#14241B",
  inkSoft: "#4A5A50",
  white: "#FFFFFF",
} as const;

const C = EMAIL_COLORS;

export const SERIF = "Fraunces, Georgia, 'Times New Roman', serif";
export const SANS = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

/**
 * Échappe les caractères HTML avant interpolation dans un email.
 * Empêche un visiteur d'injecter du HTML/lien dans les emails internes
 * (phishing interne) ou dans sa propre confirmation (audit 2026-06-12 §P2-2).
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Bouton plein qui tient dans tous les clients, Outlook compris : la marge
 * intérieure est faite de bordures de la couleur du fond, puisque Outlook
 * ignore le padding d'un lien.
 */
export function emailButton(href: string, label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto">
      <tr>
        <td align="center" bgcolor="${C.greenDeep}" style="border-radius:999px">
          <a href="${escapeHtml(href)}" target="_blank" class="mp-sans"
             style="display:inline-block;border-top:14px solid ${C.greenDeep};border-bottom:14px solid ${C.greenDeep};border-left:28px solid ${C.greenDeep};border-right:28px solid ${C.greenDeep};border-radius:999px;background:${C.greenDeep};color:${C.cream};font-family:${SANS};font-size:15px;font-weight:bold;line-height:1.2;text-decoration:none">${label}</a>
        </td>
      </tr>
    </table>`;
}

export interface BrandedEmailOptions {
  /** Titre du document, lu par certains clients. */
  title: string;
  /** Aperçu affiché après le sujet dans la boîte de réception. */
  preheader: string;
  /** Petite ligne en capitales au-dessus du titre, dans le bandeau vert. */
  eyebrow: string;
  /** Titre du bandeau vert (texte déjà échappé). */
  heading: string;
  /** Phrase sous le titre, dans le bandeau vert (HTML déjà échappé). */
  lead: string;
  /** Corps de l'e-mail, sur fond blanc (HTML déjà échappé). */
  bodyHtml: string;
  /** Mention en pied de page qui dit pourquoi on reçoit cet e-mail. */
  footerNote: string;
}

/** Document HTML complet d'un e-mail client. */
export function brandedEmailHtml(o: BrandedEmailOptions): string {
  // Espaces insécables et caractères invisibles après l'aperçu : sans eux,
  // Gmail complète l'aperçu avec le début du corps (le bandeau, le logo…).
  const previewFiller = "&#847;&zwnj;&nbsp;".repeat(60);

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${escapeHtml(o.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&amp;display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    a { color: ${C.greenDeep}; }
    @media (max-width: 620px) {
      .mp-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .mp-recap { padding-left: 16px !important; padding-right: 16px !important; }
      .mp-h1 { font-size: 27px !important; }
    }
  </style>
  <!--[if mso]>
  <style>
    .mp-serif { font-family: Georgia, serif !important; }
    .mp-sans { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.beige}">
  <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.beige}">${escapeHtml(o.preheader)}${previewFiller}</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.beige}" style="background:${C.beige}">
    <tr>
      <td align="center" style="padding:28px 12px 36px">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px">

          <tr>
            <td align="center" style="padding:0 0 22px">
              <a href="${EMAIL_SITE_URL}" target="_blank" style="text-decoration:none">
                <img src="${EMAIL_SITE_URL}/email/logo-mister-pellets.png" width="190" height="80" alt="Mister Pellets"
                     style="display:block;width:190px;height:auto;max-width:190px;border:0;color:${C.greenDeep};font-family:${SANS};font-size:22px;font-weight:bold">
              </a>
            </td>
          </tr>

          <tr>
            <td style="border-radius:20px;background:${C.white};border:1px solid ${C.beigeWarm}">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td class="mp-pad" bgcolor="${C.greenDeep}" style="background:${C.greenDeep};border-radius:19px 19px 0 0;border-bottom:4px solid ${C.orangeFlame};padding:32px 36px 30px">
                    <p class="mp-sans" style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${C.orangeWarm}">${escapeHtml(o.eyebrow)}</p>
                    <h1 class="mp-serif mp-h1" style="margin:0 0 10px;font-family:${SERIF};font-size:31px;font-weight:600;line-height:1.15;color:${C.cream}">${o.heading}</h1>
                    <p class="mp-sans" style="margin:0;font-family:${SANS};font-size:16px;line-height:1.55;color:${C.beigeWarm}">${o.lead}</p>
                  </td>
                </tr>
                <tr>
                  <td class="mp-pad mp-sans" style="padding:30px 36px 34px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink}">
                    ${o.bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" class="mp-sans" style="padding:24px 18px 0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.inkSoft}">
              <strong style="color:${C.greenDeep}">Mister Pellets</strong> · Rue des Fagotis 3A, 5380&nbsp;Fernelmont · <a href="tel:+3281138309" style="color:${C.inkSoft};white-space:nowrap">081 13 83 09</a><br>
              <a href="${EMAIL_SITE_URL}" target="_blank" style="color:${C.greenDeep};font-weight:bold">mister-pellets.be</a> · Awlest SRL · TVA BE 0656.514.212<br>
              ${escapeHtml(o.footerNote)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
