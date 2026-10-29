import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { notifyInternalEstimate, confirmCustomerEstimate } from "@/lib/email";
import { getEstimateProduct } from "@/lib/estimate-catalog";
import { formatKw } from "@/lib/power";
import {
  DEFAULT_STATE,
  ISO,
  LEVELS,
  STOVE_KINDS,
  SURFACE,
  estimate,
  formatEur,
  isCanalisable,
  type EstimateLine,
  type EstimateState,
  type InstallType,
  type IsoKey,
  type StoveKind,
} from "@/lib/estimate";
import { describeEvacuation, describePose, missingAnswers, sanitizePose } from "@/lib/pose/moteur";
import { TARIFS } from "@/lib/pose/tarifs";
import { BONUS, bonusLabelFor } from "@/lib/bonus";
import { durationsFor, monthly0 } from "@/lib/financing";

/**
 * Reçoit les estimations configurées sur /estimation.
 *
 * ⚠️ Le total envoyé par le navigateur n'est JAMAIS repris tel quel : on
 * revalide chaque choix, on relit le prix du poêle en base et on recalcule le
 * chiffrage côté serveur. Ce qui part en e-mail et en base est donc toujours
 * cohérent avec le catalogue et les forfaits du moment.
 */

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  delay?: string;
  message?: string;
  consent?: boolean;
}

const DELAYS = ["asap", "1-3-mois", "3-6-mois", "+6-mois"] as const;

function isValidBelgianPhone(input: string): boolean {
  const cleaned = input.replace(/[\s.\-()/]/g, "");
  if (cleaned === "") return false;
  if (/^\+(?!32)/.test(cleaned)) return false;
  if (/^00(?!32)/.test(cleaned)) return false;
  return [/^\+32[1-9]\d{7,8}$/, /^0032[1-9]\d{7,8}$/, /^0[1-9]\d{7,8}$/].some((re) =>
    re.test(cleaned),
  );
}

function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "[invalid]";
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}

const clamp = (n: unknown, min: number, max: number, fallback: number): number => {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
};

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

/**
 * Reconstruit un état de configurateur sûr à partir du corps de la requête.
 * La pose (évacuation, hauteur, accès, canalisation, étage, options) passe par
 * les listes blanches du moteur commun ; null si l'évacuation est inconnue.
 */
function sanitizeConfig(raw: Record<string, unknown>): EstimateState | null {
  const pose = sanitizePose(raw, TARIFS);
  if (!pose) return null;
  return {
    ...pose,
    stoveKind: pick(raw.stoveKind, Object.keys(STOVE_KINDS) as StoveKind[], DEFAULT_STATE.stoveKind),
    surface: clamp(raw.surface, SURFACE.min, SURFACE.max, DEFAULT_STATE.surface),
    iso: pick(raw.iso, Object.keys(ISO) as IsoKey[], DEFAULT_STATE.iso),
    productKey: typeof raw.productKey === "string" ? raw.productKey.slice(0, 140) : null,
    financeMonths: null,
  };
}

/** Montant d'une ligne de pose pour le récap : remise et « sur devis » en clair. */
function lineValue(l: EstimateLine): string {
  if (l.onQuote) return "sur devis";
  if (l.fullHT !== undefined) return `${formatEur(l.amountHT)} HT (au lieu de ${formatEur(l.fullHT)}, -${l.discountPct} %)`;
  return `${formatEur(l.amountHT)} HT`;
}

/** Tranches de la collection Quotes (le configurateur travaille en valeurs exactes). */
const surfaceBucket = (m2: number) =>
  m2 < 80 ? "moins-80" : m2 < 120 ? "80-120" : m2 < 180 ? "120-180" : "180-plus";
const budgetBucket = (ttc: number) =>
  ttc < 3000 ? "moins-3000" : ttc < 5000 ? "3000-5000" : ttc < 7500 ? "5000-7500" : "7500-plus";
/** Les sorties sans cheminée sont connues ; le diamètre d'un conduit existant, non. */
const chimneyBucket = (t: InstallType) =>
  t === "conduit-existant" || t === "tubage" ? "ne-sais-pas" : "aucune";

export async function POST(request: Request) {
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;

  const limited = rateLimitResponse(request, { routeKey: "estimation", max: 5 });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Votre demande n'a pas pu être lue. Rechargez la page et réessayez." }, { status: 400 });
  }

  // Honeypot : on répond 200 sans rien traiter pour ne pas informer le bot.
  if (isHoneypotTriggered(body)) {
    console.warn("[estimation] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  const customer = (body.customer ?? {}) as Customer;
  const name = typeof customer.name === "string" ? customer.name.trim().slice(0, 120) : "";
  const email = typeof customer.email === "string" ? customer.email.trim().slice(0, 160) : "";
  const phone = typeof customer.phone === "string" ? customer.phone.trim().slice(0, 40) : "";
  const postalCode = typeof customer.postalCode === "string" ? customer.postalCode.trim() : "";
  const message = typeof customer.message === "string" ? customer.message.slice(0, 2000) : "";

  if (name.length < 2) return NextResponse.json({ error: "Merci d'indiquer votre nom." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Cette adresse e-mail ne semble pas valide. Pouvez-vous la vérifier ?" }, { status: 400 });
  if (!/^[1-9]\d{3}$/.test(postalCode))
    return NextResponse.json(
      { error: "Ce code postal ne semble pas belge : il compte 4 chiffres, entre 1000 et 9999." },
      { status: 400 },
    );
  if (!isValidBelgianPhone(phone))
    return NextResponse.json(
      { error: "Merci d'indiquer un numéro de téléphone belge, par exemple 0470 12 34 56 ou +32 470 12 34 56." },
      { status: 400 },
    );
  if (customer.consent !== true)
    return NextResponse.json({ error: "Merci de cocher la case d'accord : sans elle, nous ne pouvons pas enregistrer votre demande." }, { status: 400 });

  const delay = pick(customer.delay, DELAYS, "asap");
  const config = sanitizeConfig((body.config ?? {}) as Record<string, unknown>);
  if (!config) {
    return NextResponse.json(
      { error: "Le type d'évacuation n'est pas reconnu. Revenez à l'étape 1 pour le choisir à nouveau." },
      { status: 400 },
    );
  }

  // Le prix du poêle est relu en base : le client ne peut pas l'imposer.
  const product = config.productKey ? await getEstimateProduct(config.productKey) : undefined;
  if (!product) {
    return NextResponse.json(
      { error: "Ce modèle n'est plus disponible. Revenez à l'étape 3 pour en choisir un autre." },
      { status: 400 },
    );
  }
  // Un poêle d'un autre type que celui coché fausserait la main d'œuvre.
  const allowedTypes = STOVE_KINDS[config.stoveKind].productTypes as readonly string[];
  if (!allowedTypes.includes(product.productType)) {
    return NextResponse.json(
      { error: "Le modèle choisi ne convient pas au type d'installation retenu. Revenez à l'étape 3 pour en choisir un autre." },
      { status: 400 },
    );
  }

  // Mêmes réponses obligatoires que dans le navigateur : sans elles, pas d'estimation.
  const canalisable = isCanalisable(product);
  const missing = missingAnswers(config, canalisable);
  if (missing.includes("access")) {
    return NextResponse.json(
      { error: "Au-delà de 12 m de conduit, choisissez la nacelle ou l'échafaudage à l'étape 1." },
      { status: 400 },
    );
  }
  if (missing.includes("ducts")) {
    return NextResponse.json(
      { error: "Dites-nous si vous voulez la canalisation d'air chaud, à l'étape 3." },
      { status: 400 },
    );
  }

  const r = estimate(config, product);
  const quoteNote = r.onQuote ? "Échafaudage en plus, chiffré sur devis après la visite." : undefined;
  const durations = durationsFor(r.totalTTC);
  const requestedMonths = typeof body.months === "number" ? body.months : null;
  const months =
    requestedMonths && durations.includes(requestedMonths)
      ? requestedMonths
      : (durations[durations.length - 1] ?? null);
  const monthly = months ? monthly0(r.totalTTC, months) : null;

  console.log("[estimation] new request", {
    email: redactEmail(email),
    postalCode,
    product: product.slug,
    totalTTC: r.totalTTC,
    timestamp: new Date().toISOString(),
  });

  // Récap lisible stocké avec le lead : la collection Quotes n'a pas de colonnes
  // dédiées au configurateur, et on ne veut pas d'une migration de schéma pour
  // du texte de contexte. Les champs enum existants reçoivent la tranche
  // correspondante, le détail exact vit ici.
  const recap = [
    message ? `${message}\n` : "",
    "--- Estimation configurée en ligne ---",
    `Poêle : ${product.name} (${product.brand}, ${formatKw(product.powerKw)} kW), /produit/${product.slug}`,
    `Type : ${STOVE_KINDS[config.stoveKind].label}`,
    ...describePose(config, canalisable),
    `Surface : ${config.surface} m² · Isolation : ${ISO[config.iso].label} · Besoin estimé : ${r.needKw} kW`,
    "",
    `Matériel : ${r.materialHT} € HT`,
    r.bonusHT > 0 ? `${bonusLabelFor(product.brand)} : -${r.bonusHT} € HT (${BONUS.conditions})` : "",
    ...r.laborLines.map((l) => `${l.label} : ${lineValue(l)}`),
    `TVA ${Math.round(r.vatRate * 100)} % : ${r.vatAmount} €`,
    `TOTAL : ${r.totalTTC} € TTC${r.onQuote ? " (échafaudage en plus, sur devis)" : ""}`,
    monthly ? `Financement 0 % : ${monthly} €/mois sur ${months} mois` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Sauvegarde du lead. Si la base est injoignable on ne bloque pas l'e-mail :
  // mieux vaut un lead reçu par mail qu'un lead perdu.
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "quotes",
      overrideAccess: true,
      data: {
        name,
        email,
        phone,
        postalCode,
        surface: surfaceBucket(config.surface) as never,
        peb: "ne-sais-pas" as never, // le configurateur demande l'isolation, pas le PEB
        chimney: chimneyBucket(config.installType) as never,
        style: "peu-importe" as never, // le modèle exact est déjà choisi
        budget: budgetBucket(r.totalTTC) as never,
        delay: delay as never,
        message: recap,
        consent: true,
        status: "new",
      } as never,
    });
  } catch (err) {
    console.error("[estimation] payload save failed", err);
  }

  await Promise.allSettled([
    notifyInternalEstimate({
      name,
      email,
      phone,
      postalCode,
      delay,
      productName: product.name,
      productSlug: product.slug,
      powerKw: product.powerKw,
      needKw: r.needKw,
      installType: describeEvacuation(config),
      stoveKind: STOVE_KINDS[config.stoveKind].label,
      surface: config.surface,
      iso: ISO[config.iso].label,
      level: LEVELS[config.level].label,
      vatRate: r.vatRate,
      lines: [
        ...(r.bonusHT > 0
          ? [{ label: `${bonusLabelFor(product.brand)} (${BONUS.conditions})`, amountHT: -r.bonusHT }]
          : []),
        ...r.laborLines.map((l) => ({ label: l.label, amountHT: l.amountHT, valueText: lineValue(l) })),
      ],
      materialHT: r.materialHT,
      totalTTC: r.totalTTC,
      quoteNote,
      months,
      monthly,
      message,
    }),
    confirmCustomerEstimate({
      name,
      email,
      productName: product.name,
      totalTTC: r.totalTTC,
      monthly,
      months,
      bonusNote: r.bonusHT > 0 ? `${bonusLabelFor(product.brand)} déduit. ${BONUS.conditions}` : undefined,
      quoteNote,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    totalTTC: r.totalTTC,
    monthly,
    months,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
