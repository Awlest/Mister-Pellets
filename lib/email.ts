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
  emailFields,
  emailNote,
  emailParagraph,
  emailRecap,
  emailSignoffHtml,
  emailSignoffText,
  emailSubheading,
  escapeHtml,
  greeting,
  multilineHtml,
  EMAIL_COLORS,
  EMAIL_FOOTER_TEXT,
  EMAIL_PHONE_DISPLAY,
  EMAIL_PHONE_LINK,
  EMAIL_SITE_URL,
  SERIF,
  type EmailRow,
} from "@/lib/email-layout";
import { formatKw } from "@/lib/power";
import { PALLET_NET_KG, PELLET_OFFER, formatEuro } from "@/lib/pellets";

/**
 * Helper email. Utilise Resend si RESEND_API_KEY est configuré, sinon log
 * dans la console (mode dev / phase migration).
 *
 * Chaque e-mail client a sa version HTML (gabarit lib/email-layout.ts) et sa
 * version texte. Les notifications internes reprennent le même gabarit, en
 * version « equipe », et gardent leurs sujets : des filtres Gmail s'y fient.
 */

const FROM = process.env.EMAIL_FROM ?? "Mister Pellets <info@awlest.com>";
const TO_INTERNAL = process.env.EMAIL_TO_QUOTES ?? "info@awlest.com";

/**
 * Expéditeur des notifications internes (RDV, devis, estimation, contact,
 * rappel). Il doit différer de EMAIL_FROM : info@mister-pellets.be est une
 * adresse « Envoyer en tant que » du Gmail qui reçoit les demandes, et Gmail
 * range alors la notification dans « Messages envoyés », jamais dans la boîte
 * de réception (constaté le 23/10/2026). Même domaine, déjà vérifié chez
 * Resend ; la réponse part vers le client grâce au replyTo.
 */
const FROM_INTERNAL =
  process.env.EMAIL_FROM_INTERNAL ?? "Site Mister Pellets <notifications@mister-pellets.be>";

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
  /** Expéditeur, EMAIL_FROM par défaut (FROM_INTERNAL pour les notifications internes). */
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

export async function sendEmail({
  label,
  from = FROM,
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
      from,
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
      from,
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

/* === Outils communs === */

const C = EMAIL_COLORS;

const fmtEuros = (n: number) => `${Math.round(n).toLocaleString("fr-BE")} €`;

/** « 25 octobre 2026 à 14:05 », en heure belge (les fonctions tournent en UTC). */
function receivedAt(): string {
  return new Date().toLocaleString("fr-BE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
  });
}

const mailtoLink = (email: string) =>
  `<a href="mailto:${escapeHtml(email)}" style="color:${C.greenDeep};font-weight:bold">${escapeHtml(email)}</a>`;

const telLink = (phone: string) =>
  `<a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}" style="color:${C.greenDeep};font-weight:bold;white-space:nowrap">${escapeHtml(phone)}</a>`;

/** Encadré « Une question ? » commun aux accusés de réception. */
const QUESTION_NOTE_HTML = emailNote(
  `<strong>Une question d&#39;ici là&nbsp;?</strong> Répondez simplement à cet e-mail, ou appelez-nous au ${EMAIL_PHONE_LINK}.`,
);
const QUESTION_NOTE_TEXT = `Une question d'ici là ? Répondez simplement à cet e-mail, ou appelez-nous au ${EMAIL_PHONE_DISPLAY}.`;

/** Version texte d'un e-mail client : paragraphes, formule de fin et pied légal. */
function customerText(paragraphs: string[], closing?: string): string {
  return [...paragraphs, "", ...emailSignoffText(closing), "", ...EMAIL_FOOTER_TEXT].join("\n");
}

/** Message saisi par le visiteur, dans une notification interne. */
function internalMessageBlock(title: string, message?: string): string {
  if (!message) return "";
  return `${emailSubheading(title)}
    <div style="padding:14px 16px;border-left:3px solid ${C.orangeFlame};background:${C.cream};border-radius:8px;font-size:14px;line-height:1.6">${multilineHtml(message)}</div>`;
}

/** Pied des notifications internes. */
const INTERNAL_FOOTER =
  "Notification interne de mister-pellets.be. « Répondre » écrit directement au client.";

/* === Devis en 6 questions (/devis) === */

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
  const rows: EmailRow[] = [
    { label: "E-mail", valueHtml: mailtoLink(quote.email) },
    { label: "Téléphone", valueHtml: quote.phone ? telLink(quote.phone) : "" },
    { label: "Code postal", valueHtml: escapeHtml(quote.postalCode) },
    { label: "Surface", valueHtml: escapeHtml(quote.surface) },
    { label: "PEB", valueHtml: escapeHtml(quote.peb) },
    { label: "Cheminée", valueHtml: escapeHtml(quote.chimney) },
    { label: "Style", valueHtml: escapeHtml(quote.style) },
    { label: "Budget", valueHtml: escapeHtml(quote.budget) },
    { label: "Délai souhaité", valueHtml: escapeHtml(quote.delay) },
  ];

  const html = brandedEmailHtml({
    audience: "equipe",
    title: "Nouvelle demande de devis",
    preheader: `${quote.postalCode}, budget ${quote.budget}, délai ${quote.delay}`,
    eyebrow: "Nouvelle demande de devis",
    heading: escapeHtml(quote.name),
    lead: escapeHtml(`${quote.postalCode} · budget ${quote.budget}`),
    bodyHtml: `${emailFields(rows)}
    ${internalMessageBlock("Message", quote.message)}
    <p style="margin:20px 0 0;font-size:12px;color:${C.inkSoft}">Reçu le ${receivedAt()}.</p>`,
    footerNote: INTERNAL_FOOTER,
  });

  return sendEmail({
    label: "notifyInternalQuote",
    from: FROM_INTERNAL,
    to: TO_INTERNAL,
    subject: `[Devis] ${quote.name} (${quote.postalCode}), ${quote.budget}`,
    html,
    replyTo: quote.email,
  });
}

/** Accusé de réception d'une demande de devis. */
export async function confirmCustomerQuote(quote: { name: string; email: string }) {
  const hello = greeting(quote.name);
  const received =
    "Nous avons bien reçu votre demande de devis pour un poêle à pellets, et nous vous en remercions.";
  // Le délai figure dans le bandeau : le corps ne le répète pas, la version
  // texte (sans bandeau) le garde.
  const delay = "Votre chiffrage personnalisé vous parvient par e-mail sous 48 heures ouvrées.";
  const review = "Notre équipe relit d'abord vos réponses (surface, PEB, conduit, budget) pour chiffrer au plus juste.";

  const html = brandedEmailHtml({
    title: "Votre demande de devis est bien arrivée",
    preheader: delay,
    eyebrow: "Demande de devis reçue",
    heading: "Merci pour votre demande",
    lead: "Votre chiffrage personnalisé vous parvient sous 48 heures ouvrées.",
    bodyHtml: `${emailParagraph(escapeHtml(hello))}
    ${emailParagraph(escapeHtml(received))}
    ${emailParagraph(escapeHtml(review))}
    ${QUESTION_NOTE_HTML}
    ${emailSignoffHtml()}`,
    footerNote: "Vous recevez cet e-mail parce que vous avez demandé un devis sur mister-pellets.be.",
  });

  return sendEmail({
    label: "confirmCustomerQuote",
    to: quote.email,
    subject: "Votre demande de devis est bien arrivée",
    html,
    text: customerText([hello, "", received, "", delay, review, "", QUESTION_NOTE_TEXT]),
  });
}

/* === Rendez-vous réservé en ligne (/prendre-rendez-vous) === */

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
  /** Absent quand le client n'a laissé que son téléphone (/visite-technique). */
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  /**
   * Sort de la confirmation au client : partie, refusée par Resend, ou
   * impossible faute d'e-mail. Dans les deux derniers cas, il faut l'appeler.
   */
  customerConfirmation: "sent" | "failed" | "no-email";
  /** Page où le rendez-vous a été pris, ex. « /visite-technique ». */
  origin?: string;
}) {
  const highlight = (html: string) =>
    `<span style="display:inline-block;padding:2px 8px;border-radius:6px;background:${C.orangeLight}">${html}</span>`;
  const confirmation =
    rdv.customerConfirmation === "sent"
      ? "envoyée par e-mail"
      : rdv.customerConfirmation === "no-email"
        ? highlight("<strong>Pas d&#39;e-mail donné</strong> : appeler le client pour confirmer le rendez-vous.")
        : highlight("<strong>NON envoyée</strong> (refus de Resend, voir les logs « [email] envoi refusé ») : prévenir le client par téléphone.");

  const rows: EmailRow[] = [
    { label: "Client", valueHtml: escapeHtml(rdv.name) },
    { label: "E-mail", valueHtml: rdv.email ? mailtoLink(rdv.email) : "" },
    { label: "Téléphone", valueHtml: rdv.phone ? telLink(rdv.phone) : "" },
    { label: "Adresse", valueHtml: rdv.address ? escapeHtml(rdv.address) : "" },
    { label: "Confirmation client", valueHtml: confirmation },
    { label: "Page", valueHtml: rdv.origin ? escapeHtml(rdv.origin) : "" },
  ];

  const html = brandedEmailHtml({
    audience: "equipe",
    title: "Nouveau rendez-vous réservé en ligne",
    preheader: `${rdv.dayKey} à ${rdv.timeLabel}, ${rdv.durationMin} min, déjà dans l'agenda`,
    eyebrow: "Rendez-vous réservé en ligne",
    heading: escapeHtml(rdv.serviceName),
    lead: escapeHtml(`${rdv.dayKey} à ${rdv.timeLabel} (${rdv.durationMin} min)`),
    bodyHtml: `${emailFields(rows)}
    ${internalMessageBlock("Précisions", rdv.notes)}
    <p style="margin:20px 0 0;font-size:12px;color:${C.inkSoft}">Réservé depuis mister-pellets.be, déjà ajouté à l&#39;agenda.</p>`,
    footerNote: INTERNAL_FOOTER,
  });

  return sendEmail({
    label: "notifyInternalBooking",
    from: FROM_INTERNAL,
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

export interface BookingConfirmation {
  service: {
    slug: string;
    name: string;
    location: "domicile" | "showroom";
    priceLabel: string;
    calendarDescription?: string;
    quantity?: { unit: string; unitPlural: string };
  };
  /** Instant de début, epoch en millisecondes. */
  start: number;
  durationMin: number;
  name: string;
  /** Adresse de la visite, pour un rendez-vous à domicile. */
  address?: string;
  /** Retrait de pellets : palettes réservées et prix du jour (lib/pellets.ts). */
  pickup?: { quantity: number; unitPriceTTC: number };
}

/**
 * Confirmation client d'un rendez-vous réservé en ligne : sujet, HTML aux
 * couleurs du site, version texte et fichier .ics. Ne fait qu'assembler,
 * rien n'est envoyé (aperçus et tests sans risque d'envoi).
 */
export function bookingConfirmationEmail(b: BookingConfirmation) {
  const atHome = b.service.location === "domicile";
  const hello = greeting(b.name);
  const day = frenchDay(b.start);
  const dayWithYear = frenchDay(b.start, true);
  const dayTitle = dayWithYear.charAt(0).toUpperCase() + dayWithYear.slice(1);
  const startLabel = formatSlotTime(b.start);
  const endLabel = formatSlotTime(b.start + b.durationMin * 60000);

  const entry = bookingCalendarEntry(b.service, b.start, b.durationMin, b.pickup?.quantity);
  const googleUrl = googleCalendarUrl(entry);
  const icsUrl = `${EMAIL_SITE_URL}${icsDownloadPath(b.service.slug, b.start, b.pickup?.quantity)}`;
  const ics = buildIcs(entry);

  // Retrait de pellets : mêmes rubriques, autre objet (palettes, prix, paiement).
  const pickup = b.pickup;
  const pallets = pickup
    ? `${pickup.quantity} ${pickup.quantity > 1 ? "palettes" : "palette"}`
    : "";
  const pickupTotal = pickup ? formatEuro(pickup.quantity * pickup.unitPriceTTC) : "";
  // Une palette : le total suffit, le prix unitaire le répéterait.
  const pickupPay = pickup
    ? pickup.quantity > 1
      ? `${formatEuro(pickup.unitPriceTTC)} TVAC la palette, soit ${pickupTotal} TVAC à payer sur place`
      : `${pickupTotal} TVAC à payer sur place`
    : "";

  const subject = pickup
    ? `Retrait de pellets confirmé le ${day} à ${startLabel}`
    : `Rendez-vous confirmé le ${day} à ${startLabel}`;
  const leadText = pickup
    ? pickup.quantity > 1
      ? `Vos ${pallets} de pellets Comfo vous attendent au showroom le ${day} à ${startLabel}.`
      : `Votre palette de pellets Comfo vous attend au showroom le ${day} à ${startLabel}.`
    : atHome
      ? `Nous passons chez vous le ${day} à ${startLabel}.`
      : `Nous vous attendons au showroom le ${day} à ${startLabel}.`;
  const thanks = "Merci pour votre réservation. Le rendez-vous est inscrit dans notre agenda.";
  const preheader = atHome
    ? "Nous venons voir la pièce et le conduit, le devis suit sous 48 heures."
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

  const what = pickup
    ? `${escapeHtml(pallets)} de pellets Comfo<br><span style="color:${C.inkSoft}">${escapeHtml(pickupPay)}</span>`
    : `${escapeHtml(b.service.name)}<br><span style="color:${C.inkSoft}">${escapeHtml(b.service.priceLabel)}, sans engagement · ${b.durationMin}&nbsp;minutes</span>`;

  const guide = pickup
    ? {
        title: "Le jour du retrait",
        paragraphs: [
          `Une palette, ce sont ${PELLET_OFFER.bags} sacs de ${PELLET_OFFER.bagKg} kg : ${PALLET_NET_KG} kg de pellets, sans compter la palette. Venez avec un véhicule ou une remorque qui supporte ce poids.`,
          `Le paiement se fait sur place, à l'enlèvement : ${pickupTotal} TVAC pour ${pallets}, au prix du jour de votre réservation.`,
          "Vous voulez changer le nombre de palettes ? Répondez à cet e-mail avant de venir.",
        ],
      }
    : atHome
    ? {
        title: "Comment se passe la visite",
        paragraphs: [
          "Nous regardons la pièce où ira le poêle, le conduit existant (ou l'endroit où en faire passer un), l'isolation et l'arrivée d'air. La visite dure 30 à 45 minutes ; nous prévoyons une heure pour prendre le temps de répondre à vos questions.",
          "Vous recevez ensuite le devis chiffré sous 48 heures, avec le modèle que nous vous conseillons, la pose et le taux de TVA qui s'applique chez vous.",
          "Si vous avez votre certificat PEB, gardez-le sous la main. Avec la surface à chauffer, c'est ce qui nous fait gagner le plus de temps.",
        ],
      }
    : {
        title: "Votre visite au showroom",
        paragraphs: [
          "Vous pouvez vous garer devant le bâtiment, l'entrée est de plain-pied. Vous voyez les poêles en vrai, flamme comprise, et nous parlons puissance et budget autour d'un café.",
          "Les modèles exposés changent avec les saisons. Vous visez un poêle précis ? Répondez à cet e-mail avec son nom : nous vous dirons la veille s'il est sur place.",
        ],
      };

  const change =
    "Un empêchement ? Appelez-nous au 081 13 83 09 ou répondez à cet e-mail : nous vous proposerons une autre date.";

  const bodyHtml = `
    ${emailParagraph(escapeHtml(hello))}
    ${emailParagraph(escapeHtml(thanks), 22)}
    ${emailRecap([
      {
        label: "Quand",
        valueHtml: `<span class="mp-serif" style="font-family:${SERIF};font-size:21px;font-weight:600;color:${C.greenDeep}">${dayTitle}</span><br>de ${startLabel} à ${endLabel}`,
      },
      { label: "Où", valueHtml: where.html },
      { label: pickup ? "Commande" : "Rendez-vous", valueHtml: what },
    ])}

    ${emailButton(googleUrl, "Ajouter à Google Agenda")}
    <p style="margin:14px 0 30px;text-align:center;font-size:13px;line-height:1.6;color:${C.inkSoft}">
      Apple, Outlook ou un autre agenda ? Ouvrez la pièce jointe,
      ou <a href="${escapeHtml(icsUrl)}" target="_blank" style="color:${C.greenDeep};font-weight:bold">téléchargez le fichier .ics</a>.
    </p>

    ${emailSubheading(guide.title)}
    ${guide.paragraphs.map((p) => emailParagraph(escapeHtml(p), 12)).join("\n    ")}

    ${emailNote(
      `<strong>Un empêchement&nbsp;?</strong> Appelez-nous au ${EMAIL_PHONE_LINK} ou répondez à cet e-mail : nous vous proposerons une autre date.`,
    )}

    ${emailSignoffHtml("À bientôt,")}`;

  const html = brandedEmailHtml({
    title: subject,
    preheader,
    eyebrow: pickup ? "Retrait confirmé" : "Rendez-vous confirmé",
    heading: pickup ? "Votre retrait est confirmé" : "Votre rendez-vous est confirmé",
    lead: escapeHtml(leadText),
    bodyHtml,
    footerNote: "Vous recevez cet e-mail parce que vous avez réservé un rendez-vous sur mister-pellets.be.",
  });

  const text = customerText(
    [
      hello,
      "",
      thanks,
      leadText,
      "",
      `Quand : ${dayWithYear}, de ${startLabel} à ${endLabel}`,
      `Où : ${where.text}`,
      pickup
        ? `Commande : ${pallets} de pellets Comfo, ${pickupPay}`
        : `Rendez-vous : ${b.service.name} (${b.service.priceLabel.toLowerCase()}, sans engagement, ${b.durationMin} minutes)`,
      ...(atHome ? [] : [`Itinéraire : ${SHOWROOM_MAPS_URL}`]),
      "",
      `Ajouter à Google Agenda : ${googleUrl}`,
      `Apple, Outlook ou un autre agenda : ouvrez la pièce jointe, ou téléchargez le fichier .ics : ${icsUrl}`,
      "",
      guide.title,
      ...guide.paragraphs,
      "",
      change,
    ],
    "À bientôt,",
  );

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

/* === Estimation configurée en ligne (/estimation) === */

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
  /** `valueText` remplace le montant (remise, sur devis). */
  lines: { label: string; amountHT: number; valueText?: string }[];
  materialHT: number;
  totalTTC: number;
  /** Partie du chantier chiffrée sur devis (échafaudage), absente du total. */
  quoteNote?: string;
  months?: number | null;
  monthly?: number | null;
  message?: string;
}) {
  const productUrl = `${EMAIL_SITE_URL}/produit/${encodeURIComponent(est.productSlug)}`;
  const rows: EmailRow[] = [
    { label: "E-mail", valueHtml: mailtoLink(est.email) },
    { label: "Téléphone", valueHtml: est.phone ? telLink(est.phone) : "" },
    { label: "Code postal", valueHtml: escapeHtml(est.postalCode) },
    {
      label: "Poêle choisi",
      valueHtml: `<a href="${escapeHtml(productUrl)}" target="_blank" style="color:${C.greenDeep};font-weight:bold">${escapeHtml(est.productName)}</a> (${formatKw(est.powerKw)} kW)`,
    },
    { label: "Matériel", valueHtml: `${fmtEuros(est.materialHT)} HT` },
    ...est.lines.map((l) => ({ label: l.label, valueHtml: escapeHtml(l.valueText ?? `${fmtEuros(l.amountHT)} HT`) })),
    { label: "Type de poêle", valueHtml: escapeHtml(est.stoveKind) },
    { label: "Évacuation", valueHtml: escapeHtml(est.installType) },
    {
      label: "Surface / isolation",
      valueHtml: `${est.surface} m² · ${escapeHtml(est.iso)} · besoin ~${est.needKw} kW`,
    },
    { label: "Niveau", valueHtml: escapeHtml(est.level) },
    { label: "Délai souhaité", valueHtml: escapeHtml(est.delay) },
  ];

  const total = `${fmtEuros(est.totalTTC)} TTC (TVA ${Math.round(est.vatRate * 100)} %)${
    est.quoteNote ? `, ${est.quoteNote}` : ""
  }${est.monthly ? ` · ${fmtEuros(est.monthly)}/mois sur ${est.months} mois` : ""}`;

  const html = brandedEmailHtml({
    audience: "equipe",
    title: "Nouvelle estimation configurée en ligne",
    preheader: `${est.productName}, ${fmtEuros(est.totalTTC)} TTC, ${est.postalCode}`,
    eyebrow: "Nouvelle estimation en ligne",
    heading: escapeHtml(est.name),
    lead: escapeHtml(total),
    bodyHtml: `${emailFields(rows)}
    ${internalMessageBlock("Précisions", est.message)}
    <p style="margin:20px 0 0;font-size:12px;color:${C.inkSoft}">Reçu le ${receivedAt()} · montants de pose issus des forfaits de lib/pose/tarifs.ts.</p>`,
    footerNote: INTERNAL_FOOTER,
  });

  return sendEmail({
    label: "notifyInternalEstimate",
    from: FROM_INTERNAL,
    to: TO_INTERNAL,
    subject: `[Estimation] ${est.name} (${est.postalCode}), ${fmtEuros(est.totalTTC)} · ${est.productName}`,
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
  /** Partie du chantier chiffrée sur devis (échafaudage), absente du total. */
  quoteNote?: string;
}) {
  const hello = greeting(est.name);
  const thanks = "Merci d'avoir configuré votre projet sur notre site. Voici l'estimation que vous avez obtenue.";
  const credit = est.monthly
    ? `Soit environ ${fmtEuros(est.monthly)} par mois sur ${est.months} mois à 0 %.`
    : null;
  const creditWarning = "Attention, emprunter de l'argent coûte aussi de l'argent.";
  const next =
    "Cette estimation n'a pas encore valeur de devis. Nous vous contactons sous 48 heures ouvrées pour convenir de la visite technique gratuite : c'est elle qui confirme le prix ferme, une fois vus l'état du conduit, l'accès et les raccordements.";

  const recapRows: EmailRow[] = [
    { label: "Poêle choisi", valueHtml: `<strong>${escapeHtml(est.productName)}</strong>` },
    {
      label: "Estimation",
      valueHtml: `<span class="mp-serif" style="font-family:${SERIF};font-size:21px;font-weight:600;color:${C.greenDeep}">${fmtEuros(est.totalTTC)} TTC</span><br>poêle et pose compris${
        credit ? `<br><span style="color:${C.inkSoft}">${escapeHtml(credit)}</span>` : ""
      }`,
    },
    ...(est.bonusNote ? [{ label: "Bonus", valueHtml: escapeHtml(est.bonusNote) }] : []),
    ...(est.quoteNote ? [{ label: "Sur devis", valueHtml: escapeHtml(est.quoteNote) }] : []),
  ];

  const html = brandedEmailHtml({
    title: "Votre estimation Mister Pellets",
    preheader: `${est.productName} : ${fmtEuros(est.totalTTC)} TTC, poêle et pose compris.`,
    eyebrow: "Estimation enregistrée",
    heading: "Merci pour votre configuration",
    lead: escapeHtml(`${est.productName} : ${fmtEuros(est.totalTTC)} TTC, poêle et pose compris.`),
    bodyHtml: `${emailParagraph(escapeHtml(hello))}
    ${emailParagraph(escapeHtml(thanks), 22)}
    ${emailRecap(recapRows)}
    ${credit ? `<p style="margin:-14px 0 22px;font-size:12px;color:${C.inkSoft}">${escapeHtml(creditWarning)}</p>` : ""}
    ${emailSubheading("La suite")}
    ${emailParagraph(escapeHtml(next))}
    ${QUESTION_NOTE_HTML}
    ${emailSignoffHtml()}`,
    footerNote: "Vous recevez cet e-mail parce que vous avez demandé une estimation sur mister-pellets.be.",
  });

  const text = customerText([
    hello,
    "",
    thanks,
    "",
    `Poêle choisi : ${est.productName}`,
    `Estimation : ${fmtEuros(est.totalTTC)} TTC, poêle et pose compris.`,
    ...(credit ? [credit, creditWarning] : []),
    ...(est.bonusNote ? [`Bonus : ${est.bonusNote}`] : []),
    ...(est.quoteNote ? [`Sur devis : ${est.quoteNote}`] : []),
    "",
    next,
    "",
    QUESTION_NOTE_TEXT,
  ]);

  return sendEmail({
    label: "confirmCustomerEstimate",
    to: est.email,
    subject: "Votre estimation Mister Pellets",
    html,
    text,
  });
}

/* === Formulaire de contact (/contact) === */

export async function notifyInternalContact(message: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const rows: EmailRow[] = [
    { label: "E-mail", valueHtml: mailtoLink(message.email) },
    { label: "Téléphone", valueHtml: message.phone ? telLink(message.phone) : "" },
    { label: "Sujet", valueHtml: escapeHtml(message.subject) },
  ];

  const html = brandedEmailHtml({
    audience: "equipe",
    title: "Nouveau message de contact",
    preheader: message.message.slice(0, 120),
    eyebrow: "Nouveau message de contact",
    heading: escapeHtml(message.name),
    lead: escapeHtml(message.subject),
    bodyHtml: `${emailFields(rows)}
    ${internalMessageBlock("Message", message.message)}
    <p style="margin:20px 0 0;font-size:12px;color:${C.inkSoft}">Reçu le ${receivedAt()}.</p>`,
    footerNote: INTERNAL_FOOTER,
  });

  return sendEmail({
    label: "notifyInternalContact",
    from: FROM_INTERNAL,
    to: TO_INTERNAL,
    subject: `[Contact] ${message.name}, ${message.subject}`,
    html,
    replyTo: message.email,
  });
}

/**
 * Accusé de réception du formulaire de contact. Le message du visiteur n'y est
 * pas recopié : l'adresse n'est pas vérifiée, et un accusé qui reprendrait un
 * texte libre servirait à envoyer n'importe quoi à n'importe qui depuis notre
 * domaine.
 */
export async function confirmCustomerContact(message: { name: string; email: string }) {
  const hello = greeting(message.name);
  const received = "Merci pour votre message, il est bien arrivé chez nous.";
  // Le délai figure dans le bandeau : le corps ne le répète pas, la version
  // texte (sans bandeau) le garde.
  const delay = "Nous vous répondons dans la journée, pendant les heures ouvrées.";
  const how = "Nous vous répondrons par e-mail, ou par téléphone si vous nous avez laissé un numéro.";
  const urgent = `Si c'est urgent, vous pouvez aussi nous appeler au ${EMAIL_PHONE_DISPLAY}.`;

  const html = brandedEmailHtml({
    title: "Nous avons bien reçu votre message",
    preheader: delay,
    eyebrow: "Message reçu",
    heading: "Merci pour votre message",
    lead: delay,
    bodyHtml: `${emailParagraph(escapeHtml(hello))}
    ${emailParagraph(escapeHtml(received))}
    ${emailParagraph(escapeHtml(how))}
    ${emailNote(`<strong>C&#39;est urgent&nbsp;?</strong> Vous pouvez aussi nous appeler au ${EMAIL_PHONE_LINK}.`)}
    ${emailSignoffHtml()}`,
    footerNote: "Vous recevez cet e-mail parce que vous nous avez écrit depuis mister-pellets.be.",
  });

  return sendEmail({
    label: "confirmCustomerContact",
    to: message.email,
    subject: "Nous avons bien reçu votre message",
    html,
    text: customerText([
      hello,
      "",
      received,
      "",
      "Nous vous répondons dans la journée, pendant les heures ouvrées, par e-mail ou par téléphone si vous nous avez laissé un numéro.",
      "",
      urgent,
    ]),
  });
}

/* === Demande de rappel (/prix-poele-pellets) === */

/**
 * Demande de rappel de la page /prix-poele-pellets (arrivée des annonces
 * « prix » et « devis »). Le sujet ne reprend aucune donnée du client.
 */
export async function notifyInternalCallback(req: {
  name: string;
  email?: string;
  phone: string;
  postalCode?: string;
  situation?: string;
  origin?: string;
}) {
  // Le formulaire ne demande que le nom et le téléphone ; les autres lignes
  // n'apparaissent que si une ancienne version de la page les a envoyées.
  const rows: EmailRow[] = [
    { label: "Téléphone", valueHtml: telLink(req.phone) },
    { label: "E-mail", valueHtml: req.email ? mailtoLink(req.email) : "" },
    { label: "Code postal", valueHtml: req.postalCode ? escapeHtml(req.postalCode) : "" },
    { label: "Évacuation des fumées", valueHtml: req.situation ? escapeHtml(req.situation) : "" },
    { label: "Origine", valueHtml: req.origin ? escapeHtml(req.origin) : "" },
  ];

  const html = brandedEmailHtml({
    audience: "equipe",
    title: "Demande de rappel pour un prix posé",
    preheader: "À rappeler dans la journée ouvrée.",
    eyebrow: "Demande de rappel pour un prix posé",
    heading: escapeHtml(req.name),
    lead: "À rappeler dans la journée ouvrée, depuis la page Prix d&#39;un poêle à pellets posé.",
    bodyHtml: `${emailFields(rows)}
    <p style="margin:20px 0 0;font-size:12px;color:${C.inkSoft}">Reçu le ${receivedAt()}.</p>`,
    footerNote: INTERNAL_FOOTER,
  });

  return sendEmail({
    label: "notifyInternalCallback",
    from: FROM_INTERNAL,
    to: TO_INTERNAL,
    subject: "[Rappel prix] Nouvelle demande de rappel",
    html,
    replyTo: req.email,
  });
}

/* === Commande (boutique, non branchée à ce jour) === */

export async function confirmCustomerOrder(order: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number }[];
  /** Lien tokenisé vers la page de confirmation (anti-IDOR). */
  orderUrl?: string;
}) {
  const hello = greeting(order.customerName);
  const totalLabel = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(order.total);
  const thanks = `Merci pour votre commande ${order.orderNumber}, elle est confirmée.`;
  const next =
    "Nous vous écrivons dès que la livraison est en route. Pour toute question, répondez à cet e-mail ou appelez-nous au 081 13 83 09.";

  const itemsHtml = order.items
    .map((it) => `${it.quantity}&nbsp;×&nbsp;${escapeHtml(it.name)}`)
    .join("<br>");

  const html = brandedEmailHtml({
    title: `Commande ${order.orderNumber} confirmée`,
    preheader: `Total ${totalLabel}. Nous vous écrivons dès que la livraison est en route.`,
    eyebrow: "Commande confirmée",
    heading: "Merci pour votre commande",
    lead: escapeHtml(`Commande ${order.orderNumber} · ${totalLabel} TTC`),
    bodyHtml: `${emailParagraph(escapeHtml(hello))}
    ${emailParagraph(escapeHtml(thanks), 22)}
    ${emailRecap([
      { label: "Articles", valueHtml: itemsHtml },
      {
        label: "Total TTC",
        valueHtml: `<span class="mp-serif" style="font-family:${SERIF};font-size:21px;font-weight:600;color:${C.greenDeep}">${escapeHtml(totalLabel)}</span>`,
      },
    ])}
    ${order.orderUrl ? `${emailButton(order.orderUrl, "Voir ma commande")}<div style="height:26px;line-height:26px">&nbsp;</div>` : ""}
    ${emailParagraph(escapeHtml(next).replace(EMAIL_PHONE_DISPLAY, EMAIL_PHONE_LINK))}
    ${emailSignoffHtml()}`,
    footerNote: "Vous recevez cet e-mail parce que vous avez passé commande sur mister-pellets.be.",
  });

  const text = customerText([
    hello,
    "",
    thanks,
    "",
    ...order.items.map((it) => `${it.quantity} × ${it.name}`),
    `Total TTC : ${totalLabel}`,
    ...(order.orderUrl ? ["", `Voir ma commande : ${order.orderUrl}`] : []),
    "",
    next,
  ]);

  return sendEmail({
    label: "confirmCustomerOrder",
    to: order.customerEmail,
    subject: `Confirmation de commande ${order.orderNumber}, Mister Pellets`,
    html,
    text,
  });
}
