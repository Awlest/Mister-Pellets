import { NextResponse } from "next/server";

interface QuotePayload {
  surface: string;
  peb: string;
  chimney: string;
  style: string;
  budget: string;
  postalCode: string;
  delay: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
}

const REQUIRED_STEPS: (keyof QuotePayload)[] = [
  "surface", "peb", "chimney", "style", "budget", "postalCode", "delay", "name", "email",
];

function validate(payload: Partial<QuotePayload>): string | null {
  for (const key of REQUIRED_STEPS) {
    const v = payload[key];
    if (!v || typeof v !== "string" || v.length === 0) {
      return `Champ manquant : ${key}`;
    }
  }
  if (typeof payload.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Email invalide.";
  }
  if (typeof payload.postalCode !== "string" || !/^[0-9]{4}$/.test(payload.postalCode)) {
    return "Code postal belge invalide (4 chiffres).";
  }
  if (payload.consent !== true) {
    return "Le consentement est obligatoire.";
  }
  return null;
}

/**
 * Reçoit les demandes de devis du formulaire 6 étapes.
 * Phase 5 : sauvegarde dans Payload (collection Quotes) + envoi email Resend
 *           à info@awlest.com + email de confirmation client.
 * Pour l'instant : log + accepte. Wiring complet plus tard.
 */
export async function POST(request: Request) {
  let body: Partial<QuotePayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // TODO Phase 5: payload save + Resend email
  console.log("[quote] new request", {
    name: body.name,
    email: body.email,
    postalCode: body.postalCode,
    surface: body.surface,
    budget: body.budget,
    delay: body.delay,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
