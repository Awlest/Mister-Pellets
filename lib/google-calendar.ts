import { createSign } from "crypto";
import type { Interval } from "@/lib/booking";

/**
 * Accès à l'agenda Google de Dorian via un compte de service.
 *
 * Pas de librairie `googleapis` : on signe nous-mêmes le JWT et on appelle
 * l'API REST. Deux appels suffisent (freeBusy et events.insert), et ça évite
 * d'embarquer une dépendance de plusieurs mégaoctets dans le bundle serveur.
 *
 * Le compte de service n'a aucun accès par défaut : c'est le PARTAGE de
 * l'agenda avec son adresse e-mail, côté Google Agenda, qui lui ouvre les
 * droits. C'est ce qui permet à ce montage de fonctionner que le compte soit
 * Google Workspace ou un simple compte Gmail.
 *
 * Variables d'environnement attendues :
 *   GOOGLE_SA_EMAIL        adresse du compte de service
 *   GOOGLE_SA_PRIVATE_KEY  clé privée du fichier JSON (les \n peuvent être échappés)
 *   GOOGLE_CALENDAR_ID     identifiant de l'agenda, ex. dorian@awlest.com
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
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat,
      exp: iat + 3600,
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
 * freeBusy ne renvoie que des intervalles, jamais le contenu des événements :
 * on n'expose donc aucune donnée privée de l'agenda au navigateur.
 */
export async function getBusyIntervals(
  fromInstant: number,
  toInstant: number,
): Promise<Interval[]> {
  const token = await getAccessToken();
  const res = await fetch(`${API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: new Date(fromInstant).toISOString(),
      timeMax: new Date(toInstant).toISOString(),
      items: [{ id: calendarId() }],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Lecture de l'agenda impossible (${res.status}) : ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }>; errors?: unknown[] }>;
  };
  const entry = data.calendars?.[calendarId()];
  if (entry?.errors?.length) {
    throw new Error(
      `Agenda inaccessible : ${JSON.stringify(entry.errors).slice(0, 200)}. ` +
        `Vérifier que l'agenda est bien partagé avec ${process.env.GOOGLE_SA_EMAIL}.`,
    );
  }

  return (entry?.busy ?? []).map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
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

  const res = await fetch(
    `${API}/calendars/${encodeURIComponent(calendarId())}/events?sendUpdates=all`,
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
        attendees: [{ email: details.customerEmail, displayName: details.customerName }],
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
