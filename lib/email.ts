import { Resend } from "resend";

/**
 * Helper email. Utilise Resend si RESEND_API_KEY est configuré, sinon log
 * dans la console (mode dev / phase migration).
 *
 * Le user fournira la vraie clé Resend en Phase 8 (analytics) ou plus tôt.
 */

const FROM = process.env.EMAIL_FROM ?? "Mister Pellets <info@awlest.com>";
const TO_INTERNAL = process.env.EMAIL_TO_QUOTES ?? "info@awlest.com";

/**
 * Échappe les caractères HTML avant interpolation dans un email.
 * Empêche un visiteur d'injecter du HTML/lien dans les emails internes
 * (phishing interne) ou dans sa propre confirmation (audit 2026-06-12 §P2-2).
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
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

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    });

    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" };
  }
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
    to: quote.email,
    subject: "Votre demande de devis Mister Pellets a bien été reçue",
    html,
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
}) {
  const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-BE")} €`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h1 style="color:#174724;font-family:Georgia,serif">Bonjour ${escapeHtml(est.name.split(" ")[0] ?? est.name)},</h1>
      <p>Nous avons bien reçu votre configuration autour du <strong>${escapeHtml(est.productName)}</strong>.</p>
      <p style="font-size:18px"><strong>Estimation : ${fmt(est.totalTTC)} TTC</strong>, poêle et pose compris.${
        est.monthly ? ` Soit environ ${fmt(est.monthly)} par mois sur ${est.months} mois à 0 %.` : ""
      }</p>
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
    to: order.customerEmail,
    subject: `Confirmation de commande ${order.orderNumber}, Mister Pellets`,
    html,
  });
}
