import { createSign } from "crypto";
import { busyFromEvents, type CalendarEvent, type Interval } from "@/lib/booking";

/**
 * Accès à l'agenda Google de Dorian via un compte de service.
 *
 * Pas de librairie `googleapis` : on signe nous-mêmes le JWT et on appelle
 * l'API REST. Trois appels suffisent (events.list, events.insert et
 * events.delete), et ça évite d'embarquer une dépendance de plusieurs
 * mégaoctets dans le bundle serveur.
 *
 * Le compte de service n'a aucun accès par défaut. Deux façons de lui en
 * donner, gérées toutes les deux ici :
 *
 *  1. PARTAGE de l'agenda avec son adresse e-mail, depuis Google Agenda, avec
 *     au moins le droit de voir le détail des événements.
 *     Fonctionne avec un simple compte Gmail, mais Google refuse alors
 *     d'ajouter des invités à l'événement (« Service accounts cannot invite
 *     attendees without Domain-Wide Delegation »), et un domaine Workspace peut
 *     interdire le partage externe.
 *  2. DÉLÉGATION AU NIVEAU DU DOMAINE (Workspace) : le compte de service
 *     emprunte l'identité de GOOGLE_SA_SUBJECT. Rien à partager, et les
 *     invitations client partent normalement.
 *
 * Variables d'environnement attendues :
 *   GOOGLE_SA_EMAIL        adresse du compte de service
 *   GOOGLE_SA_PRIVATE_KEY  clé privée du fichier JSON (les \n peuvent être échappés)
 *   GOOGLE_CALENDAR_ID     identifiant de l'agenda, ex. dorian@awlest.com
 *   GOOGLE_SA_SUBJECT      (facultatif) utilisateur à impersonnaliser, mode 2
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar";
const API = "https://www.googleapis.com/calendar/v3";

export function isCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SA_EMAIL &&
      process.env.GOOGLE_SA_PRIVATE_KEY &&
      process.env.GOOGLE_CALENDAR_ID,
  );
}

function calendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID as string;
}

/** Utilisateur emprunté par le compte de service, si la délégation est active. */
function impersonatedSubject(): string | null {
  const sub = process.env.GOOGLE_SA_SUBJECT?.trim();
  return sub ? sub : null;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Jeton d'accès OAuth, mis en cache jusqu'à une minute avant expiration. */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const email = process.env.GOOGLE_SA_EMAIL as string;
  // Vercel stocke les sauts de ligne échappés : on les restaure.
  const key = (process.env.GOOGLE_SA_PRIVATE_KEY as string).replace(/\\n/g, "\n");

  const iat = Math.floor(Date.now() / 1000);
  const subject = impersonatedSubject();
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat,
      exp: iat + 3600,
      // `sub` n'est accepté que si la délégation au niveau du domaine autorise
      // ce compte de service sur ce scope ; sinon Google renvoie unauthorized_client.
      ...(subject ? { sub: subject } : {}),
    }),
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64url(signer.sign(key));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Authentification Google refusée (${res.status}) : ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

/**
 * Plages occupées de l'agenda sur la période demandée.
 *
 * On lit les événements eux-mêmes et non freeBusy : freeBusy applique les
 * règles de Google, pour qui un événement affiché « disponible » ou posé sur
 * la journée entière laisse le créneau libre. Ici la règle est « rien dans
 * l'agenda » (cf. busyFromEvents). Seuls les champs utiles au calcul sont
 * demandés, et rien de leur contenu ne sort du serveur : le navigateur ne
 * reçoit que des créneaux.
 *
 * `excludeEventId` écarte un événement du calcul : celui qu'on vient de créer,
 * quand on vérifie après coup que personne d'autre n'a pris le créneau.
 */
export async function getBusyIntervals(
  fromInstant: number,
  toInstant: number,
  excludeEventId?: string,
): Promise<Interval[]> {
  const token = await getAccessToken();
  const events: CalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin: new Date(fromInstant).toISOString(),
      timeMax: new Date(toInstant).toISOString(),
      // Une occurrence par événement récurrent, pour que chaque semaine compte.
      singleEvents: "true",
      maxResults: "2500",
      fields: "nextPageToken,items(id,status,eventType,start,end,attendees(self,responseStatus))",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `${API}/calendars/${encodeURIComponent(calendarId())}/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(
        `Lecture de l'agenda impossible (${res.status}) : ${detail.slice(0, 300)}. ` +
          `Vérifier l'accès de ${process.env.GOOGLE_SA_EMAIL} à l'agenda.`,
      );
    }

    const data = (await res.json()) as { items?: CalendarEvent[]; nextPageToken?: string };
    events.push(...(data.items ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return busyFromEvents(excludeEventId ? events.filter((e) => e.id !== excludeEventId) : events);
}

export interface BookingDetails {
  serviceName: string;
  startInstant: number;
  endInstant: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** Adresse d'intervention, pour un rendez-vous à domicile. */
  address?: string;
  notes?: string;
  /** Lieu affiché dans l'événement. */
  locationLabel: string;
}

/** Crée le rendez-vous dans l'agenda et invite le client. */
export async function createEvent(details: BookingDetails): Promise<{ id: string; htmlLink?: string }> {
  const token = await getAccessToken();

  const descriptionLines = [
    `Prise de rendez-vous depuis mister-pellets.be`,
    ``,
    `Client : ${details.customerName}`,
    `Email : ${details.customerEmail}`,
    details.customerPhone ? `Téléphone : ${details.customerPhone}` : null,
    details.address ? `Adresse : ${details.address}` : null,
    details.notes ? `` : null,
    details.notes ? `Précisions du client :` : null,
    details.notes ? details.notes : null,
  ].filter((l): l is string => l !== null);

  // Sans délégation, Google refuse tout événement comportant des invités.
  // On garde alors l'email du client dans la description : le rendez-vous est
  // enregistré, seule l'invitation automatique manque.
  const canInvite = impersonatedSubject() !== null;

  const res = await fetch(
    `${API}/calendars/${encodeURIComponent(calendarId())}/events?sendUpdates=${canInvite ? "all" : "none"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `${details.serviceName} — ${details.customerName}`,
        description: descriptionLines.join("\n"),
        location: details.address || details.locationLabel,
        start: { dateTime: new Date(details.startInstant).toISOString() },
        end: { dateTime: new Date(details.endInstant).toISOString() },
        ...(canInvite
          ? { attendees: [{ email: details.customerEmail, displayName: details.customerName }] }
          : {}),
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "email", minutes: 24 * 60 },
          ],
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Création du rendez-vous impossible (${res.status}) : ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id: string; htmlLink?: string };
  return { id: data.id, htmlLink: data.htmlLink };
}

/**
 * Retire un rendez-vous qu'on vient de créer. Le client reçoit l'annulation de
 * l'invitation qui venait de partir.
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const token = await getAccessToken();
  const canInvite = impersonatedSubject() !== null;
  const res = await fetch(
    `${API}/calendars/${encodeURIComponent(calendarId())}/events/${encodeURIComponent(eventId)}?sendUpdates=${canInvite ? "all" : "none"}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  // 410 : déjà supprimé, le résultat voulu est atteint.
  if (!res.ok && res.status !== 410) {
    const detail = await res.text();
    throw new Error(`Suppression du rendez-vous impossible (${res.status}) : ${detail.slice(0, 300)}`);
  }
}
