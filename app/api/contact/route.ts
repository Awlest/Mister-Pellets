import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered } from "@/lib/rate-limit";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
}

function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "[invalid]";
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}
function redactName(name: string): string {
  return name.length > 0 ? `${name.charAt(0)}***` : "[empty]";
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
  // 1. Rate limit anti-spam (5 requêtes / heure / IP, cf. audit §3.BLOQUANT.2)
  const limited = rateLimitResponse(request, { routeKey: "contact", max: 5 });
  if (limited) return limited;

  let body: Partial<ContactPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  // 2. Honeypot
  if (isHoneypotTriggered(body as Record<string, unknown>)) {
    console.warn("[contact] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  // 3. Validation métier
  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // TODO Phase 5: send via Resend + save Payload
  // PII redactés dans les logs (cf. audit §3.H.1)
  console.log("[contact] new message", {
    name: redactName(body.name!),
    email: redactEmail(body.email!),
    subject: body.subject,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
