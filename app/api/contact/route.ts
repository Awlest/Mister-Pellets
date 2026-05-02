import { NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
}

function validate(payload: Partial<ContactPayload>): string | null {
  if (!payload.name || typeof payload.name !== "string" || payload.name.length < 2) {
    return "Nom invalide.";
  }
  if (
    !payload.email ||
    typeof payload.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
  ) {
    return "Email invalide.";
  }
  if (!payload.subject || typeof payload.subject !== "string") {
    return "Sujet manquant.";
  }
  if (!payload.message || typeof payload.message !== "string" || payload.message.length < 10) {
    return "Le message doit faire au moins 10 caractères.";
  }
  if (payload.consent !== true) {
    return "Le consentement est obligatoire.";
  }
  return null;
}

/**
 * Reçoit les messages du formulaire de contact.
 * Phase 5 : envoie un email via Resend + sauvegarde dans Payload (collection ContactMessages).
 * Pour l'instant : log + accepte. On branche l'email plus tard quand RESEND_API_KEY sera configuré.
 */
export async function POST(request: Request) {
  let body: Partial<ContactPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // TODO Phase 5: send via Resend + save Payload
  console.log("[contact] new message", {
    name: body.name,
    email: body.email,
    subject: body.subject,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
