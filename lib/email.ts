import { Resend } from "resend";

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
    <p><strong>${quote.name}</strong> · ${quote.email}${quote.phone ? ` · ${quote.phone}` : ""}</p>
    <table cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="background:#FAF7F0;width:40%"><strong>Code postal</strong></td><td>${quote.postalCode}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Surface</strong></td><td>${quote.surface}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>PEB</strong></td><td>${quote.peb}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Cheminée</strong></td><td>${quote.chimney}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Style</strong></td><td>${quote.style}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Budget</strong></td><td>${quote.budget}</td></tr>
      <tr><td style="background:#FAF7F0"><strong>Délai souhaité</strong></td><td>${quote.delay}</td></tr>
    </table>
    ${quote.message ? `<h3 style="color:#174724">Message :</h3><p>${quote.message.replace(/\n/g, "<br>")}</p>` : ""}
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
      <h1 style="color:#174724;font-family:Georgia,serif">Bonjour ${quote.name.split(" ")[0]},</h1>
      <p>On a bien reçu votre demande de devis. Notre équipe l'examine et vous recontacte par email
      sous <strong>48h ouvrées</strong> avec un chiffrage personnalisé.</p>
      <p>Si c'est urgent, vous pouvez nous appeler directement au <a href="tel:+32472043222" style="color:#F28A20">0472 04 32 22</a>.</p>
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

export async function notifyInternalContact(message: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const html = `
    <h2 style="color:#174724;font-family:Georgia,serif">Nouveau message de contact</h2>
    <p><strong>${message.name}</strong> · ${message.email}${message.phone ? ` · ${message.phone}` : ""}</p>
    <p><strong>Sujet :</strong> ${message.subject}</p>
    <hr style="border:none;border-top:1px solid #EAE0CB;margin:16px 0">
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6">${message.message.replace(/\n/g, "<br>")}</div>
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
}) {
  const itemsHtml = order.items
    .map((it) => `<li>${it.quantity}× ${it.name}</li>`)
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h1 style="color:#174724;font-family:Georgia,serif">Merci ${order.customerName.split(" ")[0]} !</h1>
      <p>Votre commande <strong>${order.orderNumber}</strong> est confirmée.</p>
      <h3 style="color:#174724">Récap</h3>
      <ul style="padding-left:20px">${itemsHtml}</ul>
      <p style="font-size:18px;margin-top:16px"><strong>Total TTC : ${new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR" }).format(order.total)}</strong></p>
      <p>On vous envoie un mail dès que la livraison est en route. Pour toute question : <a href="tel:+32472043222" style="color:#F28A20">0472 04 32 22</a> ou <a href="mailto:info@awlest.com" style="color:#F28A20">info@awlest.com</a>.</p>
    </div>
  `;

  return sendEmail({
    to: order.customerEmail,
    subject: `Confirmation de commande ${order.orderNumber}, Mister Pellets`,
    html,
  });
}
