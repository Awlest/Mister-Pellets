import { Resend } from "resend";
import { belgianParts, formatSlotTime } from "@/lib/booking";
import {
  bookingCalendarEntry,
  buildIcs,
  googleCalendarUrl,
  icsDownloadPath,
  SHOWROOM_ADDRESS,
  SHOWROOM_MAPS_URL,
} from "@/lib/booking-calendar";
import {
  brandedEmailHtml,
  emailButton,
  escapeHtml,
  EMAIL_COLORS,
  EMAIL_SITE_URL,
  SERIF,
} from "@/lib/email-layout";

/**
 * Helper email. Utilise Resend si RESEND_API_KEY est configuré, sinon log
 * dans la console (mode dev / phase migration).
 *
 * Le user fournira la vraie clé Resend en Phase 8 (analytics) ou plus tôt.
 */

const FROM = process.env.EMAIL_FROM ?? "Mister Pellets <info@awlest.com>";
const TO_INTERNAL = process.env.EMAIL_TO_QUOTES ?? "info@awlest.com";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

interface SendEmailParams {
  /** Nom de l'e-mail dans les logs, qui ne reprennent ni le sujet ni le destinataire. */
  label: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

export async function sendEmail({
  label,
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: SendEmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  const resend = getResend();

  if (!resend) {
    // Mode console fallback (RESEND_API_KEY non configuré)
    console.log("[email:console-fallback]", {
      from: FROM,
      to,
      subject,
      replyTo,
      preview: text ?? html.replace(/<[^>]+>/g, "").substring(0, 200),
    });
    return { ok: true, id: "console-fallback" };
  }

  // Le SDK Resend ne lève pas d'exception quand l'API refuse un envoi (domaine
  // non vérifié, validation, panne réseau) : il renvoie `{ data: null, error }`.
  // Les deux chemins d'échec finissent donc dans le même log : sans lui, un
  // refus ne laisse aucune trace (cas de la notification RDV jusqu'au 29/09/2026).
  let error: { message: string; statusCode?: number | null; name?: string };
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
      attachments,
    });

    if (!result.error) return { ok: true, id: result.data?.id };
    error = result.error;
  } catch (err) {
    error = { message: err instanceof Error ? err.message : "Erreur inconnue" };
  }

  // Ni destinataire ni sujet : ils contiennent des données du client.
  console.error("[email] envoi refusé", { label, error });
  return { ok: false, error: error.message };
}

/**
 * Récap interne pour info@awlest.com.
 */
export async function notifyInternalQuote(quote: {
  name: string;
  email: string;
  phone?: string;
  postalCode: string;
  surface: string;
  peb: string;
  chimney: string;
  style: string;
  budget: string;
  delay: string;
  message?: string;
}) {
  const html = `
    <h2 style="color:#174724;font-family:Georgia,serif">Nouvelle demande de devis</h2>
    <p><strong>${escapeHtml(quote.name)}</strong> · ${escapeHtml(quote.email)}${quote.phone ? ` · ${escapeHtml(quote.phone)}` : ""}</p>
    <table cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="background:#FAF7F0;width:40%"><strong>Code postal</strong></td><td>${quote.postalCode}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Surface</strong></td><td>${quote.surface}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>PEB</strong></td><td>${quote.peb}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Cheminée</strong></td><td>${quote.chimney}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Style</strong></td><td>${quote.style}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Budget</strong></td><td>${quote.budget}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Délai souhaité</strong></td><td>${quote.delay}</td></tr>
    </table>
    ${quote.message ? `<h3 style="color:#174724">Message :</h3><p>${escapeHtml(quote.message).replace(/\n/g, "<br>")}</p>` : ""}
    <p style="color:#6B7280;font-size:12px;margin-top:24px">Reçu le ${new Date().toLocaleString("fr-BE", { dateStyle: "long", timeStyle: "short" })}</p>
  `;

  return sendEmail({
    label: "notifyInternalQuote",
    to: TO_INTERNAL,
    subject: `[Devis] ${quote.name} (${quote.postalCode}), ${quote.budget}`,
    html,
    replyTo: quote.email,
  });
}

export async function confirmCustomerQuote(quote: { name: string; email: string }) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h1 style="color:#174724;font-family:Georgia,serif">Bonjour ${escapeHtml(quote.name.split(" ")[0] ?? quote.name)},</h1>
      <p>On a bien reçu votre demande de devis. Notre équipe l'examine et vous recontacte par email
      sous <strong>48h ouvrées</strong> avec un chiffrage personnalisé.</p>
      <p>Si c'est urgent, vous pouvez nous appeler directement au <a href="tel:+3281138309" style="color:#F28A20">081 13 83 09</a>.</p>
      <p style="margin-top:32px;padding-top:16px;border-top:1px solid #EAE0CB;color:#4A5A50;font-size:13px">
        Mister Pellets · Awlest SRL · Rue des Fagotis 3A, 5380 Fernelmont · TVA BE 0656.514.212
      </p>
    </div>
  `;

  return sendEmail({
    label: "confirmCustomerQuote",
    to: quote.email,
    subject: "Votre demande de devis Mister Pellets a bien été reçue",
    html,
  });
}

/**
 * Récap interne d'un rendez-vous réservé en ligne (/prendre-rendez-vous).
 * Le rendez-vous est déjà dans l'agenda de Dorian quand cet email part : il
 * prévient l'équipe, il ne confirme rien au client.
 */
export async function notifyInternalBooking(rdv: {
  serviceName: string;
  /** Jour en heure belge, ex. « 2026-10-20 » (belgianDayKey). */
  dayKey: string;
  /** Heure de début en heure belge, ex. « 10:00 » (formatSlotTime). */
  timeLabel: string;
  durationMin: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  /** La confirmation est-elle partie chez le client ? Sinon, il faut l'appeler. */
  customerConfirmed: boolean;
}) {
  const confirmationRow = rdv.customerConfirmed
    ? `<tr><td style="background:#FAF7F0"><strong>Confirmation client</strong></td><td>envoyée par e-mail</td></tr>`
    : `<tr><td style="background:#FFE4D1"><strong>Confirmation client</strong></td><td style="background:#FFE4D1"><strong>NON envoyée</strong> (refus de Resend, voir les logs « [email] envoi refusé ») : prévenir le client par téléphone.</td></tr>`;

  const html = `
    <h2 style="color:#174724;font-family:Georgia,serif">Nouveau rendez-vous réservé en ligne</h2>
    <p style="font-size:18px;color:#174724"><strong>${escapeHtml(rdv.serviceName)}</strong> · ${rdv.dayKey} à ${rdv.timeLabel} (${rdv.durationMin} min)</p>
    <table cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="background:#FAF7F0;width:40%"><strong>Client</strong></td><td>${escapeHtml(rdv.name)}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Email</strong></td><td>${escapeHtml(rdv.email)}</td></tr>
      ${rdv.phone ? `<tr><td style="background:#FAF7F0"><strong>Téléphone</strong></td><td>${escapeHtml(rdv.phone)}</td></tr>` : ""}
      ${rdv.address ? `<tr><td style="background:#FAF7F0"><strong>Adresse</strong></td><td>${escapeHtml(rdv.address)}</td></tr>` : ""}
      ${confirmationRow}
    </table>
    ${rdv.notes ? `<h3 style="color:#174724">Précisions :</h3><p>${escapeHtml(rdv.notes).replace(/\n/g, "<br>")}</p>` : ""}
    <p style="color:#6B7280;font-size:12px;margin-top:24px">Réservé depuis mister-pellets.be, ajouté à l'agenda.</p>
  `;

  return sendEmail({
    label: "notifyInternalBooking",
    to: TO_INTERNAL,
    subject: `Nouveau RDV : ${rdv.serviceName}, ${rdv.dayKey} à ${rdv.timeLabel}`,
    html,
    replyTo: rdv.email,
  });
}

const WEEKDAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** « jeudi 8 octobre » (« 1er » pour le premier du mois), en heure belge. */
function frenchDay(instant: number, withYear = false): string {
  const p = belgianParts(instant);
  const day = p.day === 1 ? "1er" : String(p.day);
  return `${WEEKDAYS_FR[p.weekday]} ${day} ${MONTHS_FR[p.month - 1]}${withYear ? ` ${p.year}` : ""}`;
}

/**
 * Prénom tel qu'on l'écrit dans une salutation : « jean-marc » ou
 * « JEAN-MARC », tapés ainsi sur mobile, deviennent « Jean-Marc ». Une casse
 * déjà mixte (« McKenzie ») est laissée telle quelle.
 */
function displayFirstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  if (first !== first.toLowerCase() && first !== first.toUpperCase()) return first;
  return first
    .toLowerCase()
    .replace(/(^|[-'’])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}

export interface BookingConfirmation {
  service: {
    slug: string;
    name: string;
    location: "domicile" | "showroom";
    priceLabel: string;
  };
  /** Instant de début, epoch en millisecondes. */
  start: number;
  durationMin: number;
  name: string;
  /** Adresse de la visite, pour un rendez-vous à domicile. */
  address?: string;
}

/**
 * Confirmation client d'un rendez-vous réservé en ligne : sujet, HTML aux
 * couleurs du site, version texte et fichier .ics. Ne fait qu'assembler,
 * rien n'est envoyé (aperçus et tests sans risque d'envoi).
 */
export function bookingConfirmationEmail(b: BookingConfirmation) {
  const C = EMAIL_COLORS;
  const atHome = b.service.location === "domicile";
  const firstName = displayFirstName(b.name);
  const day = frenchDay(b.start);
  const dayWithYear = frenchDay(b.start, true);
  const dayTitle = dayWithYear.charAt(0).toUpperCase() + dayWithYear.slice(1);
  const startLabel = formatSlotTime(b.start);
  const endLabel = formatSlotTime(b.start + b.durationMin * 60000);

  const entry = bookingCalendarEntry(b.service, b.start, b.durationMin);
  const googleUrl = googleCalendarUrl(entry);
  const icsUrl = `${EMAIL_SITE_URL}${icsDownloadPath(b.service.slug, b.start)}`;
  const ics = buildIcs(entry);

  const subject = `Rendez-vous confirmé le ${day} à ${startLabel}`;
  const heading = firstName ? `C&#39;est noté, ${escapeHtml(firstName)}.` : "C&#39;est noté.";
  const leadText = atHome
    ? `On passe chez vous le ${day} à ${startLabel}.`
    : `On vous attend au showroom le ${day} à ${startLabel}.`;
  const preheader = atHome
    ? "On vient voir la pièce et le conduit, le devis suit sous 48 heures."
    : `${SHOWROOM_ADDRESS}, parking devant le bâtiment.`;

  const where = atHome
    ? {
        html: `<strong>À votre domicile</strong>${b.address ? `<br>${escapeHtml(b.address)}` : ""}`,
        text: `à votre domicile${b.address ? `, ${b.address}` : ""}`,
      }
    : {
        html: `<strong>Showroom Mister Pellets</strong><br>${escapeHtml(SHOWROOM_ADDRESS).replace("5380 ", "5380&nbsp;")}<br><a href="${escapeHtml(SHOWROOM_MAPS_URL)}" target="_blank" style="color:${C.greenDeep};font-weight:bold">Voir l&#39;itinéraire</a>`,
        text: `Showroom Mister Pellets, ${SHOWROOM_ADDRESS}`,
      };

  const what = `${escapeHtml(b.service.name)}<br><span style="color:${C.inkSoft}">${escapeHtml(b.service.priceLabel)}, sans engagement · ${b.durationMin}&nbsp;minutes</span>`;

  const guide = atHome
    ? {
        title: "Comment se passe la visite",
        paragraphs: [
          "On regarde la pièce où ira le poêle, le conduit existant (ou l'endroit où en faire passer un), l'isolation et l'arrivée d'air. La visite dure 30 à 45 minutes ; on bloque une heure pour avoir le temps de répondre à vos questions.",
          "Vous recevez le devis chiffré sous 48 heures, avec le modèle qu'on vous conseille et la prime Wallonie déjà déduite.",
          "Si vous avez votre certificat PEB, sortez-le. Avec la surface à chauffer, c'est ce qui nous fait gagner le plus de temps.",
        ],
      }
    : {
        title: "Votre visite au showroom",
        paragraphs: [
          "Garez-vous devant le bâtiment, l'entrée est de plain-pied. Vous voyez les poêles en vrai, flamme comprise, et on parle puissance et budget autour d'un café.",
          "Les modèles exposés changent avec les saisons. Vous visez un poêle précis ? Répondez à cet e-mail avec son nom, on vous dit la veille s'il est sur place.",
        ],
      };

  const row = (label: string, valueHtml: string, last = false) => `
      <tr>
        <td style="padding:15px 0;${last ? "" : `border-bottom:1px solid ${C.beigeWarm};`}">
          <p class="mp-sans" style="margin:0 0 4px;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${C.inkSoft}">${label}</p>
          <p class="mp-sans" style="margin:0;font-size:16px;line-height:1.5;color:${C.ink}">${valueHtml}</p>
        </td>
      </tr>`;

  const bodyHtml = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px">
      <tr>
        <td class="mp-recap" style="background:${C.cream};border:1px solid ${C.beigeWarm};border-left:4px solid ${C.orangeFlame};border-radius:14px;padding:4px 22px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${row("Quand", `<span class="mp-serif" style="font-family:${SERIF};font-size:21px;font-weight:600;color:${C.greenDeep}">${dayTitle}</span><br>de ${startLabel} à ${endLabel}`)}
            ${row("Où", where.html)}
            ${row("Rendez-vous", what, true)}
          </table>
        </td>
      </tr>
    </table>

    ${emailButton(googleUrl, "Ajouter à Google Agenda")}
    <p style="margin:14px 0 30px;text-align:center;font-size:13px;line-height:1.6;color:${C.inkSoft}">
      Apple, Outlook ou un autre agenda ? Ouvrez la pièce jointe,
      ou <a href="${escapeHtml(icsUrl)}" target="_blank" style="color:${C.greenDeep};font-weight:bold">téléchargez le fichier .ics</a>.
    </p>

    <h2 class="mp-serif" style="margin:0 0 10px;font-family:${SERIF};font-size:21px;font-weight:600;line-height:1.3;color:${C.greenDeep}">${guide.title}</h2>
    ${guide.paragraphs.map((p) => `<p style="margin:0 0 12px">${escapeHtml(p)}</p>`).join("\n    ")}

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 26px">
      <tr>
        <td style="background:${C.orangeLight};border-radius:12px;padding:16px 20px;font-size:15px;line-height:1.55;color:${C.ink}">
          <strong>Un empêchement ?</strong> Appelez-nous au
          <a href="tel:+3281138309" style="color:${C.greenDeep};font-weight:bold;white-space:nowrap">081 13 83 09</a>
          ou répondez à cet e-mail, on vous trouve une autre date.
        </td>
      </tr>
    </table>

    <p style="margin:0">À bientôt,<br><strong style="color:${C.greenDeep}">L&#39;équipe Mister Pellets</strong></p>`;

  const html = brandedEmailHtml({
    title: subject,
    preheader,
    eyebrow: "Rendez-vous confirmé",
    heading,
    lead: escapeHtml(leadText),
    bodyHtml,
    footerNote: "Vous recevez cet e-mail parce que vous avez réservé un rendez-vous sur mister-pellets.be.",
  });

  const text = [
    firstName ? `C'est noté, ${firstName}.` : "C'est noté.",
    leadText,
    "",
    `Quand : ${dayWithYear}, de ${startLabel} à ${endLabel}`,
    `Où : ${where.text}`,
    `Rendez-vous : ${b.service.name} (${b.service.priceLabel.toLowerCase()}, sans engagement, ${b.durationMin} minutes)`,
    ...(atHome ? [] : [`Itinéraire : ${SHOWROOM_MAPS_URL}`]),
    "",
    `Ajouter à Google Agenda : ${googleUrl}`,
    `Apple, Outlook ou un autre agenda : ouvrez la pièce jointe, ou téléchargez le fichier .ics : ${icsUrl}`,
    "",
    guide.title,
    ...guide.paragraphs,
    "",
    "Un empêchement ? Appelez-nous au 081 13 83 09 ou répondez à cet e-mail, on vous trouve une autre date.",
    "",
    "À bientôt,",
    "L'équipe Mister Pellets",
    "Rue des Fagotis 3A, 5380 Fernelmont · mister-pellets.be",
  ].join("\n");

  return { subject, html, text, ics };
}

/**
 * Envoie la confirmation au client. Depuis le 01/10/2026, c'est le seul
 * message qu'il reçoit : l'invitation Google n'est plus envoyée (cf.
 * `sendGoogleInvite` dans lib/google-calendar.ts).
 */
export async function confirmCustomerBooking(b: BookingConfirmation & { email: string }) {
  const { subject, html, text, ics } = bookingConfirmationEmail(b);
  return sendEmail({
    label: "confirmCustomerBooking",
    to: b.email,
    subject,
    html,
    text,
    attachments: [
      {
        filename: "rendez-vous-mister-pellets.ics",
        content: Buffer.from(ics, "utf-8"),
        contentType: "text/calendar; charset=utf-8; method=PUBLISH",
      },
    ],
  });
}

/**
 * Récap interne d'une estimation configurée en ligne (/estimation).
 * Plus riche que le devis en 6 questions : on a le modèle choisi, le détail de
 * la main d'œuvre et le total chiffré, de quoi rappeler le client en connaissant
 * déjà son projet.
 */
export async function notifyInternalEstimate(est: {
  name: string;
  email: string;
  phone?: string;
  postalCode: string;
  delay: string;
  productName: string;
  productSlug: string;
  powerKw: number;
  needKw: number;
  installType: string;
  stoveKind: string;
  surface: number;
  iso: string;
  level: string;
  vatRate: number;
  lines: { label: string; amountHT: number }[];
  materialHT: number;
  totalTTC: number;
  prime: number;
  netAfterPrime: number;
  months?: number | null;
  monthly?: number | null;
  message?: string;
}) {
  const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-BE")} €`;
  const linesHtml = est.lines
    .map(
      (l) =>
        `<tr><td style="background:#FAF7F0">${escapeHtml(l.label)}</td><td>${fmt(l.amountHT)} HT</td></tr>`,
    )
    .join("");

  const html = `
    <h2 style="color:#174724;font-family:Georgia,serif">Nouvelle estimation configurée en ligne</h2>
    <p><strong>${escapeHtml(est.name)}</strong> · ${escapeHtml(est.email)}${est.phone ? ` · ${escapeHtml(est.phone)}` : ""} · ${escapeHtml(est.postalCode)}</p>
    <p style="font-size:18px;color:#174724"><strong>${fmt(est.totalTTC)} TTC</strong> (TVA ${Math.round(est.vatRate * 100)} %)${est.prime > 0 ? ` · ${fmt(est.netAfterPrime)} après prime estimée de ${fmt(est.prime)}` : ""}${est.monthly ? ` · ${fmt(est.monthly)}/mois sur ${est.months} mois` : ""}</p>
    <table cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="background:#FAF7F0;width:45%"><strong>Poêle choisi</strong></td><td>${escapeHtml(est.productName)} (${est.powerKw} kW) — /produit/${escapeHtml(est.productSlug)}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Matériel</strong></td><td>${fmt(est.materialHT)} HT</td></tr>
      ${linesHtml}
      <tr><td style="background:#FAF7F0"><strong>Type de poêle</strong></td><td>${escapeHtml(est.stoveKind)}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Évacuation</strong></td><td>${escapeHtml(est.installType)}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Surface / isolation</strong></td><td>${est.surface} m² · ${escapeHtml(est.iso)} · besoin ~${est.needKw} kW</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Niveau</strong></td><td>${escapeHtml(est.level)}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Délai souhaité</strong></td><td>${escapeHtml(est.delay)}</td></tr>
    </table>
    ${est.message ? `<h3 style="color:#174724">Précisions :</h3><p>${escapeHtml(est.message).replace(/\n/g, "<br>")}</p>` : ""}
    <p style="color:#6B7280;font-size:12px;margin-top:24px">Reçu le ${new Date().toLocaleString("fr-BE", { dateStyle: "long", timeStyle: "short" })} · montants de pose issus des forfaits indicatifs de lib/estimate.ts</p>
  `;

  return sendEmail({
    label: "notifyInternalEstimate",
    to: TO_INTERNAL,
    subject: `[Estimation] ${est.name} (${est.postalCode}) — ${fmt(est.totalTTC)} · ${est.productName}`,
    html,
    replyTo: est.email,
  });
}

/** Confirmation client d'une estimation configurée en ligne. */
export async function confirmCustomerEstimate(est: {
  name: string;
  email: string;
  productName: string;
  totalTTC: number;
  monthly?: number | null;
  months?: number | null;
  /** Mention du bonus de saison quand il est compris dans le total. */
  bonusNote?: string;
}) {
  const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-BE")} €`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h1 style="color:#174724;font-family:Georgia,serif">Bonjour ${escapeHtml(est.name.split(" ")[0] ?? est.name)},</h1>
      <p>Nous avons bien reçu votre configuration autour du <strong>${escapeHtml(est.productName)}</strong>.</p>
      <p style="font-size:18px"><strong>Estimation : ${fmt(est.totalTTC)} TTC</strong>, poêle et pose compris.${
        est.monthly ? ` Soit environ ${fmt(est.monthly)} par mois sur ${est.months} mois à 0 %.` : ""
      }</p>
      ${est.bonusNote ? `<p style="color:#174724"><strong>${escapeHtml(est.bonusNote)}</strong></p>` : ""}
      <p>C'est une estimation, pas encore un devis : nous vous recontactons sous <strong>48h ouvrées</strong>
      pour convenir de la visite technique gratuite, seule façon de confirmer le prix ferme (état du
      conduit, accès, raccordements).</p>
      <p>Une question d'ici là ? <a href="tel:+3281138309" style="color:#F28A20">081 13 83 09</a>.</p>
      <p style="color:#4A5A50;font-size:12px">Attention, emprunter de l'argent coûte aussi de l'argent.</p>
      <p style="margin-top:32px;padding-top:16px;border-top:1px solid #EAE0CB;color:#4A5A50;font-size:13px">
        Mister Pellets · Awlest SRL · Rue des Fagotis 3A, 5380 Fernelmont · TVA BE 0656.514.212
      </p>
    </div>
  `;

  return sendEmail({
    label: "confirmCustomerEstimate",
    to: est.email,
    subject: "Votre estimation Mister Pellets",
    html,
  });
}

export async function notifyInternalContact(message: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const html = `
    <h2 style="color:#174724;font-family:Georgia,serif">Nouveau message de contact</h2>
    <p><strong>${escapeHtml(message.name)}</strong> · ${escapeHtml(message.email)}${message.phone ? ` · ${escapeHtml(message.phone)}` : ""}</p>
    <p><strong>Sujet :</strong> ${escapeHtml(message.subject)}</p>
    <hr style="border:none;border-top:1px solid #EAE0CB;margin:16px 0">
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6">${escapeHtml(message.message).replace(/\n/g, "<br>")}</div>
  `;

  return sendEmail({
    label: "notifyInternalContact",
    to: TO_INTERNAL,
    subject: `[Contact] ${message.name}, ${message.subject}`,
    html,
    replyTo: message.email,
  });
}

export async function confirmCustomerOrder(order: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number }[];
  /** Lien tokenisé vers la page de confirmation (anti-IDOR). */
  orderUrl?: string;
}) {
  const itemsHtml = order.items
    .map((it) => `<li>${it.quantity}× ${escapeHtml(it.name)}</li>`)
    .join("");

  const ctaHtml = order.orderUrl
    ? `<p style="margin-top:20px"><a href="${escapeHtml(order.orderUrl)}" style="display:inline-block;background:#174724;color:#fff;text-decoration:none;padding:12px 22px;border-radius:9999px;font-weight:600">Voir ma commande</a></p>`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h1 style="color:#174724;font-family:Georgia,serif">Merci ${escapeHtml(order.customerName.split(" ")[0] ?? order.customerName)} !</h1>
      <p>Votre commande <strong>${escapeHtml(order.orderNumber)}</strong> est confirmée.</p>
      <h3 style="color:#174724">Récap</h3>
      <ul style="padding-left:20px">${itemsHtml}</ul>
      <p style="font-size:18px;margin-top:16px"><strong>Total TTC : ${new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(order.total)}</strong></p>
      ${ctaHtml}
      <p>On vous envoie un mail dès que la livraison est en route. Pour toute question : <a href="tel:+3281138309" style="color:#F28A20">081 13 83 09</a> ou <a href="mailto:info@awlest.com" style="color:#F28A20">info@awlest.com</a>.</p>
    </div>
  `;

  return sendEmail({
    label: "confirmCustomerOrder",
    to: order.customerEmail,
    subject: `Confirmation de commande ${order.orderNumber}, Mister Pellets`,
    html,
  });
}
