/**
 * Gabarit des e-mails envoyés par le site, aux couleurs de Mister Pellets.
 *
 * Les clients mail ignorent l'essentiel du CSS moderne : mise en page en
 * tableaux, styles en ligne, largeur 600 px, aucune image indispensable à la
 * lecture (Outlook bloque les images par défaut), et un repli Georgia / Arial
 * pour les polices du site. Fraunces se charge là où c'est permis (Apple Mail,
 * iOS) ; Gmail et Outlook affichent Georgia.
 *
 * Les adresses des images pointent toujours vers la production : un e-mail se
 * lit des mois après son envoi, quel que soit l'environnement qui l'a envoyé.
 *
 * Ton des e-mails clients : vouvoiement, « nous » pour l'équipe, une salutation
 * au prénom, ce qui se passe ensuite avec un délai concret, un moyen simple de
 * nous joindre, et une formule de fin. Pas de « N'hésitez pas », pas de tiret
 * long, pas de point d'exclamation.
 */

export const EMAIL_SITE_URL = "https://mister-pellets.be";

/** Couleurs du site (app/globals.css), en dur : pas de variables CSS en e-mail. */
export const EMAIL_COLORS = {
  greenDarkest: "#102916",
  greenDeep: "#174724",
  orangeFlame: "#F28A20",
  orangeWarm: "#FDB842",
  orangeLight: "#FFE4D1",
  cream: "#F4EDE1",
  beige: "#F0E8DA",
  beigeWarm: "#EAE0CB",
  ink: "#14241B",
  inkSoft: "#4A5A50",
  white: "#FFFFFF",
} as const;

const C = EMAIL_COLORS;

export const SERIF = "Fraunces, Georgia, 'Times New Roman', serif";
export const SANS = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

export const EMAIL_PHONE_DISPLAY = "081 13 83 09";
export const EMAIL_PHONE_HREF = "tel:+3281138309";

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
 * Identité de la société en pied des e-mails clients. Le CSA (art. 2:20) exige
 * sur les documents électroniques de la société : dénomination et forme, siège,
 * numéro d'entreprise, « RPM » et le tribunal du siège. Mêmes libellés que les
 * mentions légales du site : siège à Braives selon la BCE (depuis le
 * 17/03/2026), Fernelmont n'est que le showroom et l'atelier.
 */
export const EMAIL_LEGAL_LINES = [
  "Showroom et atelier : Rue des Fagotis 3A, 5380 Fernelmont",
  "Awlest SRL · Siège social : Rue Saint-Pierre 29, 4260 Braives",
  "Numéro d'entreprise et TVA : BE 0656.514.212 · RPM Liège, division Huy",
] as const;

/**
 * Les mêmes lignes en HTML, séparées par des <br>. Espaces insécables avant les
 * deux-points, après le code postal et « BE », et dans la mention RPM : sur
 * mobile, un retour à la ligne ne coupe ni l'adresse, ni le numéro, ni le
 * tribunal.
 */
const keepTogether = (s: string) => s.replaceAll(" ", "&nbsp;");
export const EMAIL_LEGAL_HTML = EMAIL_LEGAL_LINES.map((line) =>
  escapeHtml(line)
    .replace(/ :/g, "&nbsp;:")
    .replace(/(\d{4}|BE) /g, "$1&nbsp;")
    .replace(/RPM .+$/, keepTogether),
).join("<br>");

/**
 * Prénom tel qu'on l'écrit dans une salutation : « jean-marc » ou
 * « JEAN-MARC », tapés ainsi sur mobile, deviennent « Jean-Marc ». Une casse
 * déjà mixte (« McKenzie ») est laissée telle quelle.
 */
export function displayFirstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  if (first !== first.toLowerCase() && first !== first.toUpperCase()) return first;
  return first
    .toLowerCase()
    .replace(/(^|[-'’])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}

/** « Bonjour Jean, » ou « Bonjour, » quand le nom est vide. */
export function greeting(fullName: string): string {
  const first = displayFirstName(fullName);
  return first ? `Bonjour ${first},` : "Bonjour,";
}

/** Texte saisi par le visiteur, échappé, retours à la ligne conservés. */
export function multilineHtml(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

/** Paragraphe du corps (HTML déjà échappé). */
export function emailParagraph(html: string, marginBottom = 14): string {
  return `<p style="margin:0 0 ${marginBottom}px">${html}</p>`;
}

/** Intertitre du corps, en serif verte. */
export function emailSubheading(text: string): string {
  return `<h2 class="mp-serif" style="margin:24px 0 10px;font-family:${SERIF};font-size:21px;font-weight:600;line-height:1.3;color:${C.greenDeep}">${escapeHtml(text)}</h2>`;
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

export interface EmailRow {
  label: string;
  /** Valeur en HTML déjà échappé. */
  valueHtml: string;
}

/**
 * Encadré récapitulatif crème à filet orange : ce que le client a réservé,
 * configuré ou commandé, à relire d'un coup d'œil.
 */
export function emailRecap(rows: EmailRow[]): string {
  const cells = rows
    .map(
      (r, i) => `
            <tr>
              <td style="padding:15px 0;${i === rows.length - 1 ? "" : `border-bottom:1px solid ${C.beigeWarm};`}">
                <p class="mp-sans" style="margin:0 0 4px;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${C.inkSoft}">${escapeHtml(r.label)}</p>
                <p class="mp-sans" style="margin:0;font-family:${SANS};font-size:16px;line-height:1.5;color:${C.ink}">${r.valueHtml}</p>
              </td>
            </tr>`,
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px">
      <tr>
        <td class="mp-recap" style="background:${C.cream};border:1px solid ${C.beigeWarm};border-left:4px solid ${C.orangeFlame};border-radius:14px;padding:4px 22px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${cells}
          </table>
        </td>
      </tr>
    </table>`;
}

/** Encadré orange clair : la marche à suivre en cas de question ou d'imprévu. */
export function emailNote(html: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 26px">
      <tr>
        <td style="background:${C.orangeLight};border-radius:12px;padding:16px 20px;font-family:${SANS};font-size:15px;line-height:1.55;color:${C.ink}">
          ${html}
        </td>
      </tr>
    </table>`;
}

/**
 * Gmail transforme un nom de domaine écrit en clair en lien bleu, qui jure
 * avec le gabarit. Le domaine du site devient donc un lien à nous, de la
 * couleur du texte qui l'entoure (HTML déjà échappé en entrée).
 */
export function linkSiteDomain(html: string, color: string = C.inkSoft): string {
  return html.replace(
    /mister-pellets\.be/g,
    `<a href="${EMAIL_SITE_URL}" target="_blank" style="color:${color};text-decoration:underline">mister-pellets.be</a>`,
  );
}

/** Lien téléphone du showroom, en vert gras et sans coupure. */
export const EMAIL_PHONE_LINK = `<a href="${EMAIL_PHONE_HREF}" style="color:${C.greenDeep};font-weight:bold;white-space:nowrap">${EMAIL_PHONE_DISPLAY}</a>`;

/**
 * Formule de fin des e-mails clients : « Bien à vous, » par défaut,
 * « À bientôt, » quand un rendez-vous est fixé.
 */
export function emailSignoffHtml(closing = "Bien à vous,"): string {
  return `<p style="margin:0">${escapeHtml(closing)}<br><strong style="color:${C.greenDeep}">L&#39;équipe Mister Pellets</strong></p>`;
}
export function emailSignoffText(closing = "Bien à vous,"): string[] {
  return [closing, "L'équipe Mister Pellets"];
}

/** Pied de la version texte des e-mails clients. */
export const EMAIL_FOOTER_TEXT = ["mister-pellets.be · 081 13 83 09", "", ...EMAIL_LEGAL_LINES] as const;

/**
 * Fiche d'une notification interne : libellés à gauche sur fond crème,
 * valeurs à droite. Une valeur vide est omise.
 */
export function emailFields(rows: EmailRow[]): string {
  const cells = rows
    .filter((r) => r.valueHtml !== "")
    .map(
      (r) => `
      <tr>
        <td valign="top" style="width:36%;padding:9px 12px;background:${C.cream};border-bottom:1px solid ${C.white};font-family:${SANS};font-size:13px;font-weight:bold;color:${C.greenDeep}">${escapeHtml(r.label)}</td>
        <td valign="top" style="padding:9px 12px;border-bottom:1px solid ${C.beigeWarm};font-family:${SANS};font-size:14px;line-height:1.5;color:${C.ink}">${r.valueHtml}</td>
      </tr>`,
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;border-collapse:collapse">${cells}
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
  /**
   * « equipe » pour les notifications internes : bandeau plus court et pied
   * réduit à la mention, sans les lignes légales destinées aux clients.
   */
  audience?: "client" | "equipe";
}

/** Document HTML complet d'un e-mail. */
export function brandedEmailHtml(o: BrandedEmailOptions): string {
  const internal = o.audience === "equipe";
  // Espaces insécables et caractères invisibles après l'aperçu : sans eux,
  // Gmail complète l'aperçu avec le début du corps (le bandeau, le logo…).
  const previewFiller = "&#847;&zwnj;&nbsp;".repeat(60);

  const footerNote = linkSiteDomain(escapeHtml(o.footerNote));
  const footer = internal
    ? footerNote
    : `<strong style="color:${C.greenDeep}">Mister Pellets</strong> · <a href="${EMAIL_SITE_URL}" target="_blank" style="color:${C.greenDeep};font-weight:bold">mister-pellets.be</a> · <a href="${EMAIL_PHONE_HREF}" style="color:${C.inkSoft};white-space:nowrap">${EMAIL_PHONE_DISPLAY}</a><br>
              ${EMAIL_LEGAL_HTML}<br>
              ${footerNote}`;

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
                <img src="${EMAIL_SITE_URL}/email/logo-mister-pellets.png" width="${internal ? 150 : 190}" height="${internal ? 63 : 80}" alt="Mister Pellets"
                     style="display:block;width:${internal ? 150 : 190}px;height:auto;max-width:${internal ? 150 : 190}px;border:0;color:${C.greenDeep};font-family:${SANS};font-size:22px;font-weight:bold">
              </a>
            </td>
          </tr>

          <tr>
            <td style="border-radius:20px;background:${C.white};border:1px solid ${C.beigeWarm}">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td class="mp-pad" bgcolor="${C.greenDeep}" style="background:${C.greenDeep};border-radius:19px 19px 0 0;border-bottom:4px solid ${C.orangeFlame};padding:${internal ? "22px 36px 20px" : "32px 36px 30px"}">
                    <p class="mp-sans" style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${C.orangeWarm}">${escapeHtml(o.eyebrow)}</p>
                    <h1 class="mp-serif mp-h1" style="margin:0 0 10px;font-family:${SERIF};font-size:${internal ? 25 : 31}px;font-weight:600;line-height:1.15;color:${C.cream}">${o.heading}</h1>
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
              ${footer}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
