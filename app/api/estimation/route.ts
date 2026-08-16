import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { notifyInternalEstimate, confirmCustomerEstimate } from "@/lib/email";
import { getEstimateProduct } from "@/lib/estimate-catalog";
import {
  DEFAULT_STATE,
  DUCT_ROOMS_MAX,
  CONDUIT_MAX_M,
  INSTALL_TYPES,
  ISO,
  LEVELS,
  OPTIONS,
  PRIME_CATEGORIES,
  STOVE_KINDS,
  estimate,
  type EstimateState,
  type InstallType,
  type IsoKey,
  type LevelKey,
  type OptionKey,
  type PrimeCategory,
  type StoveKind,
} from "@/lib/estimate";
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

/** Reconstruit un état de configurateur sûr à partir du corps de la requête. */
function sanitizeConfig(raw: Record<string, unknown>): EstimateState {
  const opt: Partial<Record<OptionKey, boolean>> = {};
  const rawOpt = (raw.opt ?? {}) as Record<string, unknown>;
  for (const k of Object.keys(OPTIONS) as OptionKey[]) {
    if (rawOpt[k] === true) opt[k] = true;
  }
  return {
    installType: pick(raw.installType, Object.keys(INSTALL_TYPES) as InstallType[], DEFAULT_STATE.installType),
    conduitM: clamp(raw.conduitM, 4, CONDUIT_MAX_M, DEFAULT_STATE.conduitM),
    stoveKind: pick(raw.stoveKind, Object.keys(STOVE_KINDS) as StoveKind[], DEFAULT_STATE.stoveKind),
    ductRooms: clamp(raw.ductRooms, 1, DUCT_ROOMS_MAX, DEFAULT_STATE.ductRooms),
    surface: clamp(raw.surface, 20, 300, DEFAULT_STATE.surface),
    iso: pick(raw.iso, Object.keys(ISO) as IsoKey[], DEFAULT_STATE.iso),
    level: pick(raw.level, Object.keys(LEVELS) as LevelKey[], DEFAULT_STATE.level),
    housingOver10Years: raw.housingOver10Years !== false,
    productKey: typeof raw.productKey === "string" ? raw.productKey.slice(0, 140) : null,
    opt,
    primeCategory: pick(
      raw.primeCategory,
      Object.keys(PRIME_CATEGORIES) as PrimeCategory[],
      DEFAULT_STATE.primeCategory,
    ),
    financeMonths: null,
  };
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
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
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

  if (name.length < 2) return NextResponse.json({ error: "Nom manquant." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  if (!/^[1-9]\d{3}$/.test(postalCode))
    return NextResponse.json(
      { error: "Code postal belge invalide (4 chiffres entre 1000 et 9999)." },
      { status: 400 },
    );
  if (!isValidBelgianPhone(phone))
    return NextResponse.json(
      { error: "Téléphone belge requis (formats : 0470 12 34 56 ou +32 470 12 34 56)." },
      { status: 400 },
    );
  if (customer.consent !== true)
    return NextResponse.json({ error: "Le consentement est obligatoire." }, { status: 400 });

  const delay = pick(customer.delay, DELAYS, "asap");
  const config = sanitizeConfig((body.config ?? {}) as Record<string, unknown>);

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
      { error: "Le modèle choisi ne correspond plus au type d'installation." },
      { status: 400 },
    );
  }

  const r = estimate(config, product);
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
    `Poêle : ${product.name} (${product.brand}, ${product.powerKw} kW) — /produit/${product.slug}`,
    `Type : ${STOVE_KINDS[config.stoveKind].label} · Évacuation : ${INSTALL_TYPES[config.installType].label}`,
    INSTALL_TYPES[config.installType].perMeter > 0 ? `Conduit : ${config.conduitM} m` : "",
    STOVE_KINDS[config.stoveKind].ducts ? `Pièces canalisées : ${config.ductRooms}` : "",
    `Surface : ${config.surface} m² · Isolation : ${ISO[config.iso].label} · Besoin estimé : ${r.needKw} kW`,
    `Emplacement : ${LEVELS[config.level].label} · Logement > 10 ans : ${config.housingOver10Years ? "oui" : "non"}`,
    "",
    `Matériel : ${r.materialHT} € HT`,
    ...r.laborLines.map((l) => `${l.label} : ${l.amountHT} € HT`),
    `TVA ${Math.round(r.vatRate * 100)} % : ${r.vatAmount} €`,
    `TOTAL : ${r.totalTTC} € TTC`,
    r.prime > 0
      ? `Prime estimée (${PRIME_CATEGORIES[config.primeCategory].label}) : −${r.prime} € → ${r.netAfterPrime} €`
      : `Prime : catégorie de revenus non communiquée`,
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
      installType: INSTALL_TYPES[config.installType].label,
      stoveKind: STOVE_KINDS[config.stoveKind].label,
      surface: config.surface,
      iso: ISO[config.iso].label,
      level: LEVELS[config.level].label,
      vatRate: r.vatRate,
      lines: r.laborLines.map((l) => ({ label: l.label, amountHT: l.amountHT })),
      materialHT: r.materialHT,
      totalTTC: r.totalTTC,
      prime: r.prime,
      netAfterPrime: r.netAfterPrime,
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
    }),
  ]);

  return NextResponse.json({
    ok: true,
    totalTTC: r.totalTTC,
    prime: r.prime,
    netAfterPrime: r.netAfterPrime,
    monthly,
    months,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
