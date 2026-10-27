"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_STATE,
  DUCT_ROOMS_MAX,
  CONDUIT_INCLUDED_M,
  CONDUIT_MAX_M,
  INSTALL_TYPES,
  ISO,
  LEVELS,
  OPTIONS,
  STOVE_KINDS,
  estimate,
  eur,
  filterByKind,
  rankProducts,
  recommendedKw,
  type EstimateProduct,
  type EstimateResult,
  type EstimateState,
  type InstallType,
  type IsoKey,
  type LevelKey,
  type OptionKey,
  type StoveKind,
} from "@/lib/estimate";
import { BONUS, bonusLabelFor, isBonusPeriod } from "@/lib/bonus";
import { FIN_LEGAL, FIN_NOTE, SLOGAN_CREDIT, durationsFor, isFinanceable, monthly0 } from "@/lib/financing";

import { BRAND_PARAMS, EVENTS, trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "mp_estimate_draft";

// Volet du détail (mobile et tablette) : sa fenêtre Radix n'est téléchargée
// qu'au premier geste vers le total, beaucoup de visiteurs ne l'ouvrent pas.
const loadRecapSheet = () => import("./EstimateRecapSheet");
const preloadRecapSheet = () => {
  loadRecapSheet().catch(() => {});
};

// Abonnement vide pour useSyncExternalStore : sert à lire des valeurs que seul
// le navigateur connaît (hydratation faite, bonus du jour) avec un instantané
// serveur neutre, pour que le HTML mis en cache ne diffère jamais du rendu client.
const noopSubscribe = () => () => {};

const STEPS = [
  { id: 1, label: "Évacuation" },
  { id: 2, label: "Votre logement" },
  { id: 3, label: "Votre poêle" },
  { id: 4, label: "Options" },
  { id: 5, label: "Financement" },
  { id: 6, label: "La suite" },
];
const STEP_COUNT = STEPS.length;

/**
 * Dernière étape : le visiteur choisit d'être recontacté ou non. Les
 * coordonnées ne sont demandées que sur « oui » ; sur « non », rien ne part,
 * l'estimation reste affichée et le brouillon reste dans le navigateur.
 */
type ContactChoice = "" | "oui" | "non";
const CONTACT_CHOICES: Choice<ContactChoice>[] = [
  { value: "oui", label: "Oui, recontactez-moi", desc: "Nous fixons ensemble la visite technique" },
  { value: "non", label: "Non merci, pas maintenant", desc: "Je garde mon estimation pour l'instant" },
];

/**
 * Modèles montrés d'emblée à l'étape 3, les mieux dimensionnés en tête. Avant,
 * toute la liste vivait dans un cadre de 420 px qui défilait à l'intérieur de
 * la page : sur mobile, deux défilements imbriqués et une liste de 30 à 60
 * lignes. Le reste s'ouvre d'un geste.
 */
const MODELS_PREVIEW = 6;

/** Même validation que le formulaire de devis : numéros belges uniquement. */
function isValidBelgianPhone(input: string): boolean {
  const cleaned = input.replace(/[\s.\-()/]/g, "");
  if (cleaned === "") return false;
  if (/^\+(?!32)/.test(cleaned)) return false;
  if (/^00(?!32)/.test(cleaned)) return false;
  return [/^\+32[1-9]\d{7,8}$/, /^0032[1-9]\d{7,8}$/, /^0[1-9]\d{7,8}$/].some((re) =>
    re.test(cleaned),
  );
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  delay: "" | "asap" | "1-3-mois" | "3-6-mois" | "+6-mois";
  message: string;
  consent: boolean;
}

const EMPTY_CUSTOMER: Customer = {
  name: "",
  email: "",
  phone: "",
  postalCode: "",
  delay: "",
  message: "",
  consent: false,
};

type CustomerField = "postalCode" | "delay" | "name" | "email" | "phone" | "consent";

/** Ordre d'affichage : le premier champ en erreur reçoit le focus à l'envoi. */
const FIELD_ORDER: CustomerField[] = ["postalCode", "delay", "name", "email", "phone", "consent"];
const FIELD_IDS: Record<CustomerField, string> = {
  postalCode: "est-cp",
  delay: "est-delay",
  name: "est-name",
  email: "est-email",
  phone: "est-phone",
  consent: "est-consent",
};

/**
 * Erreurs de l'étape 6, champ par champ. Le bouton d'envoi n'est plus grisé
 * sans explication : un clic sur un formulaire incomplet affiche la raison
 * sous chaque champ et place le curseur sur le premier à corriger.
 */
function customerErrors(c: Customer): Partial<Record<CustomerField, string>> {
  const e: Partial<Record<CustomerField, string>> = {};
  if (!/^[1-9]\d{3}$/.test(c.postalCode)) e.postalCode = "Indiquez un code postal belge à 4 chiffres.";
  if (c.delay === "") e.delay = "Choisissez un délai.";
  if (c.name.trim().length < 2) e.name = "Indiquez votre nom.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = "Vérifiez l'adresse e-mail, par exemple nom@domaine.be.";
  if (!isValidBelgianPhone(c.phone)) e.phone = "Indiquez un numéro belge, par exemple 0470 12 34 56.";
  if (!c.consent) e.consent = "Cochez la case pour que nous puissions vous recontacter.";
  return e;
}

/**
 * Carte de choix (bouton radio ou case à cocher natifs, masqués). Le clavier,
 * les flèches dans un groupe radio et les lecteurs d'écran (« 2 sur 5,
 * sélectionné ») sont gérés par le navigateur ; l'anneau de focus se pose sur
 * la carte entière.
 */
const cardCls = (active: boolean, disabled = false) =>
  cn(
    "flex min-h-11 w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mp-orange-ink",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    active
      ? "border-mp-orange-flame bg-mp-orange-light/40 ring-2 ring-mp-orange-flame/20"
      : "border-mp-sand/40 bg-white hover:border-mp-orange-flame/50 hover:bg-mp-cream",
  );
const legendCls = "mb-3 block text-sm font-medium text-mp-ink";
const inputCls = cn(
  "w-full rounded-xl border border-mp-sand bg-white px-4 py-3 text-base text-mp-ink",
  "placeholder:text-mp-ink-soft/70 outline-none transition-colors",
  "focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20",
  "aria-[invalid=true]:border-red-700 aria-[invalid=true]:focus:ring-red-700/20",
);

/** Brouillon localStorage brut, null s'il est absent ou inaccessible. */
function readDraft(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Brouillon prêt à l'emploi, null s'il est absent ou corrompu. */
function parseDraft(json: string | null): EstimateState | null {
  if (!json) return null;
  try {
    const restored = { ...DEFAULT_STATE, ...JSON.parse(json) } as EstimateState;
    // Un brouillon enregistré quand le plafond était à 4 pièces canalisées
    // afficherait 3 ou 4 alors que le chiffrage s'arrête à DUCT_ROOMS_MAX.
    restored.ductRooms = Math.min(DUCT_ROOMS_MAX, Math.max(1, restored.ductRooms));
    return restored;
  } catch {
    return null;
  }
}

/**
 * Le brouillon n'est lu qu'après l'hydratation : le premier rendu client
 * reproduit le HTML du serveur (état par défaut), puis le formulaire est
 * remonté avec le brouillon via `key`. Avant, l'état initial lisait le brouillon
 * pendant l'hydratation et React signalait un écart (erreur #418) à chaque
 * visiteur qui revenait. Pas de setState dans un effet (audit V20260503
 * §2.H.2) : le choix du brouillon est mémorisé une fois pour toutes.
 */
export function EstimateConfigurator({
  products,
  bonusAtRender = false,
}: {
  products: EstimateProduct[];
  /**
   * Bonus de saison actif au moment du rendu serveur (ISR). Sert d'instantané
   * serveur : le HTML et l'hydratation lisent la même valeur, donc aucun
   * écart d'hydratation, et la ligne du bonus est dans le HTML au lieu de
   * s'insérer au-dessus de la question après coup (décalage de mise en page
   * mesuré à 0,053 sur la prod le 11/10/2026).
   */
  bonusAtRender?: boolean;
}) {
  const hydrated = React.useSyncExternalStore(noopSubscribe, () => true, () => false);
  const draft = React.useMemo(() => (hydrated ? parseDraft(readDraft()) : null), [hydrated]);
  return (
    <EstimateForm
      key={draft ? "brouillon" : "neuf"}
      products={products}
      initialState={draft ?? DEFAULT_STATE}
      bonusAtRender={bonusAtRender}
    />
  );
}

/**
 * Parcours pensé d'abord pour le téléphone (82 % des clics Ads, audit du
 * 11/10/2026) :
 * - la barre d'action (total, Précédent, Suivant) reste collée en bas de
 *   l'écran, au-dessus de la barre de navigation, tant que le formulaire est
 *   à l'écran : « Suivant » était à 1 811 px du haut de la page, et le total
 *   sous le formulaire ;
 * - chaque changement d'étape ramène en haut du formulaire et place le focus
 *   sur la question ;
 * - le détail du chiffrage s'ouvre en volet depuis le total (la colonne de
 *   droite n'existe qu'à partir de 1 024 px).
 * La mensualité n'apparaît pas dans la barre : une publicité chiffrée pour un
 * crédit doit porter l'exemple représentatif (VII.64), ce que fait le volet.
 */
function EstimateForm({
  products,
  initialState,
  bonusAtRender,
}: {
  products: EstimateProduct[];
  initialState: EstimateState;
  bonusAtRender: boolean;
}) {
  const [step, setStep] = React.useState(1);
  const [s, setS] = React.useState<EstimateState>(initialState);
  const [customer, setCustomer] = React.useState<Customer>(EMPTY_CUSTOMER);
  const [contactChoice, setContactChoice] = React.useState<ContactChoice>("");
  const [website, setWebsite] = React.useState(""); // honeypot
  const [submitState, setSubmitState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [touched, setTouched] = React.useState<Partial<Record<CustomerField, boolean>>>({});
  const [triedSubmit, setTriedSubmit] = React.useState(false);
  const [productMissing, setProductMissing] = React.useState(false);
  const [showAllFor, setShowAllFor] = React.useState<StoveKind | null>(null);
  const [recapOpen, setRecapOpen] = React.useState(false);
  const [RecapSheet, setRecapSheet] = React.useState<
    typeof import("./EstimateRecapSheet").default | null
  >(null);

  const openRecap = () => {
    setRecapOpen(true);
    if (RecapSheet) return;
    loadRecapSheet().then(
      (mod) => setRecapSheet(() => mod.default),
      // Réseau coupé, ou version remplacée entre-temps (Turbopack ne retente
      // pas un morceau en échec) : le total reste lisible sur la barre.
      () => setRecapOpen(false),
    );
  };

  const cardRef = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const lastStep = React.useRef(step);

  // Pas de sauvegarde tant que l'état est celui du montage : au premier rendu
  // (état par défaut, brouillon pas encore lu) on écraserait le brouillon.
  React.useEffect(() => {
    if (s === initialState) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }, [s, initialState]);

  // Changement d'étape : retour en haut du formulaire s'il est sorti de
  // l'écran (le bouton Suivant est en bas, la nouvelle question en haut), puis
  // focus sur la question pour les lecteurs d'écran.
  React.useEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    const card = cardRef.current;
    if (card) {
      const top = card.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight / 2) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const set = <K extends keyof EstimateState>(k: K, v: EstimateState[K]) =>
    setS((p) => ({ ...p, [k]: v }));
  const toggleOpt = (k: OptionKey) => setS((p) => ({ ...p, opt: { ...p.opt, [k]: !p.opt[k] } }));

  // Changer de type de poêle invalide le modèle choisi s'il n'est plus éligible.
  const setStoveKind = (kind: StoveKind) =>
    setS((p) => {
      const stillOk =
        p.productKey != null &&
        filterByKind(products, kind).some((x) => x.key === p.productKey);
      return { ...p, stoveKind: kind, productKey: stillOk ? p.productKey : null };
    });

  const cfg = INSTALL_TYPES[s.installType];
  const needKw = recommendedKw(s.surface, s.iso);
  const eligible = React.useMemo(
    () => rankProducts(filterByKind(products, s.stoveKind), needKw),
    [products, s.stoveKind, needKw],
  );
  const product = React.useMemo(
    () => products.find((p) => p.key === s.productKey) ?? null,
    [products, s.productKey],
  );
  const bonusActive = React.useSyncExternalStore(noopSubscribe, isBonusPeriod, () => bonusAtRender);
  const r = estimate(s, product, { bonus: bonusActive });
  const durations = durationsFor(r.totalTTC);
  const months =
    s.financeMonths && durations.includes(s.financeMonths)
      ? s.financeMonths
      : (durations[durations.length - 1] ?? null);
  const monthly = months ? monthly0(r.totalTTC, months) : null;

  const errors = customerErrors(customer);
  const fieldError = (f: CustomerField) => (touched[f] || triedSubmit ? errors[f] : undefined);
  const touch = (f: CustomerField) => setTouched((t) => (t[f] ? t : { ...t, [f]: true }));

  const selectedIdx = eligible.findIndex((p) => p.key === s.productKey);
  // Le modèle repris d'un brouillon reste visible même s'il est loin dans la liste.
  const showAllModels = showAllFor === s.stoveKind || selectedIdx >= MODELS_PREVIEW;
  const shownModels = showAllModels ? eligible : eligible.slice(0, MODELS_PREVIEW);

  const next = () => {
    if (submitState === "loading") return;
    if (step === 3 && !s.productKey) {
      setProductMissing(true);
      document.getElementById("est-models")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (step === STEP_COUNT) {
      // Sans « oui », rien à envoyer (le bouton n'est d'ailleurs pas affiché).
      if (contactChoice !== "oui") return;
      const first = FIELD_ORDER.find((f) => errors[f]);
      if (first) {
        setTriedSubmit(true);
        document.getElementById(FIELD_IDS[first])?.focus();
        return;
      }
      void handleSubmit();
      return;
    }
    setStep(step + 1);
  };
  const prev = () => step > 1 && setStep(step - 1);

  async function handleSubmit() {
    setSubmitState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/estimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: s, customer, months, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Votre demande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez, ou appelez-nous au 081 13 83 09.");
      }
      setSubmitState("success");
      // Conversion principale du site : le visiteur a un prix chiffré et nous a
      // laissé ses coordonnées. La valeur permet à Google Ads d'optimiser sur le
      // montant du projet et pas seulement sur le nombre de formulaires.
      trackEvent(EVENTS.devisChiffre, {
        currency: "EUR",
        value: Math.round(r.totalTTC),
        source: "configurateur",
        ...BRAND_PARAMS,
      });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      requestAnimationFrame(() =>
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (e) {
      setSubmitState("error");
      setErrorMsg(e instanceof Error && e.name === "Error" ? e.message : "Votre demande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez, ou appelez-nous au 081 13 83 09.");
    }
  }

  if (submitState === "success") {
    return (
      <div
        ref={cardRef}
        className="scroll-mt-3 rounded-3xl border border-mp-green-light/40 bg-mp-green-light/15 p-6 text-center text-mp-green-deep sm:p-8 md:p-12 xl:scroll-mt-24"
      >
        <div className="mb-6 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mp-green-mid text-white">
            <Check className="h-8 w-8" aria-hidden />
          </span>
        </div>
        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Estimation envoyée</h2>
        <p className="mx-auto mb-6 mp-measure text-lg leading-relaxed">
          Merci {customer.name}, nous avons votre configuration
          {product ? ` autour du ${product.name}` : ""}.
        </p>
        <p className="mb-8 text-xl font-semibold">
          Estimation : {eur(r.totalTTC)} TTC
        </p>

        {/*
          Le paiement en ligne a été retiré : on explique franchement la suite
          plutôt que de laisser le client attendre un bouton « payer ». Un
          poêle ne se commande pas sans avoir vu le conduit, et cette étape
          évite les mauvaises surprises des deux côtés.
        */}
        <div className="mx-auto mb-8 mp-measure rounded-2xl border border-mp-sand/60 bg-white/70 p-5 text-left sm:p-6">
          <p className="mb-4 font-semibold">La suite, en trois temps</p>
          <ol className="space-y-3 text-mp-ink">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mp-green-deep text-xs font-bold text-mp-cream">1</span>
              <span>
                On vous rappelle sous 48 h ouvrées pour caler la{" "}
                <strong>visite technique</strong>. Vous pouvez aussi{" "}
                <Link href="/prendre-rendez-vous#reserver" className="text-mp-orange-ink underline underline-offset-2 hover:no-underline">
                  choisir votre créneau tout de suite
                </Link>
                .
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mp-green-deep text-xs font-bold text-mp-cream">2</span>
              <span>
                Sur place, on valide le conduit, l&apos;évacuation et l&apos;accès. C&apos;est ce
                qui transforme l&apos;estimation en <strong>prix ferme</strong>, pose comprise.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mp-green-deep text-xs font-bold text-mp-cream">3</span>
              <span>
                Une fois le devis accepté, vous recevez la{" "}
                <strong>facture d&apos;acompte</strong> et on planifie la pose. Rien à payer
                en ligne, rien n&apos;est engagé avant votre accord.
              </span>
            </li>
          </ol>
          <p className="mt-4 text-sm text-mp-ink-soft">
            Une question dans l&apos;intervalle ?{" "}
            <a href="tel:+3281138309" className="whitespace-nowrap font-semibold text-mp-green-deep underline underline-offset-2">
              081 13 83 09
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" size="default" className="w-full max-w-xs sm:w-auto">
            <Link href="/prendre-rendez-vous#reserver">Choisir mon créneau</Link>
          </Button>
          <Button asChild variant="outline" size="default" className="w-full max-w-xs sm:w-auto">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  const loading = submitState === "loading";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* ============ Colonne formulaire ============
          overflow: clip et non overflow-hidden : hidden ferait de la carte un
          conteneur de défilement, et la barre d'action ne collerait plus au
          bas de l'écran (même piège que html/body, globals.css). */}
      <div
        ref={cardRef}
        className="scroll-mt-3 rounded-3xl border border-mp-sand/40 bg-white shadow-md [overflow:clip] xl:scroll-mt-24"
      >
        {/* Honeypot anti-spam : caché aux humains, tentant pour les bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="hp-website-est">Ne pas remplir ce champ</label>
          <input
            id="hp-website-est"
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="border-b border-mp-sand/40 bg-mp-cream px-4 py-4 sm:px-6 sm:py-5 md:px-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
              Étape {step} sur {STEP_COUNT}
            </span>
            <span className="text-sm font-medium text-mp-green-deep">{STEPS[step - 1]?.label}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-mp-sand/40" aria-hidden>
            <div
              className="h-full w-full origin-left rounded-full bg-mp-orange-flame transition-transform duration-(--mp-duration-enter) ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${step / STEP_COUNT})` }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 md:min-h-[420px] md:p-10">
          {/* Bonus de saison : replié sur une ligne, conditions à un geste. Il
              occupait 5 lignes au-dessus de chaque question sur mobile. */}
          {bonusActive && (
            <details className="group mb-5 rounded-xl border border-mp-orange-flame/30 bg-mp-orange-light/30 text-sm text-mp-ink">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 [&::-webkit-details-marker]:hidden">
                <span>
                  <strong className="text-mp-green-deep">Jusqu&apos;à {BONUS.badge}</strong>, déjà déduit du total
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-mp-ink-soft transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
              </summary>
              <p className="px-4 pb-3 leading-relaxed">{BONUS.label}. {BONUS.conditions}</p>
            </details>
          )}

          {/* ---------- 1. Évacuation des fumées ---------- */}
          {step === 1 && (
            <>
              <StepHeading ref={headingRef}>Comment sortent les fumées chez vous ?</StepHeading>
              <p className="mb-6 text-mp-ink-soft md:mb-8">
                C&apos;est ce qui pèse le plus dans le coût de la pose. Si vous hésitez entre deux
                réponses, prenez la plus probable, nous vérifions tout lors de la visite.
              </p>
              <ChoiceGroup
                name="installType"
                legend="Évacuation des fumées"
                legendHidden
                value={s.installType}
                onChange={(v) => set("installType", v)}
                className="sm:grid-cols-2"
                choices={(Object.keys(INSTALL_TYPES) as InstallType[]).map((k) => ({
                  value: k,
                  label: INSTALL_TYPES[k].label,
                  desc: INSTALL_TYPES[k].desc,
                }))}
              />

              {cfg.perMeter > 0 && (
                <div className="mt-8">
                  <RangeField
                    id="conduit"
                    label="Hauteur de conduit à poser"
                    unit="m"
                    min={4}
                    max={CONDUIT_MAX_M}
                    step={1}
                    value={s.conduitM}
                    onChange={(v) => set("conduitM", v)}
                    decLabel="Réduire la hauteur de conduit"
                    incLabel="Augmenter la hauteur de conduit"
                  >
                    <p className="mt-2 text-sm text-mp-ink-soft">
                      {CONDUIT_INCLUDED_M} m compris dans le forfait, au-delà nous comptons au mètre.
                      En général : un rez seul, 5 à 6 m ; un rez + un étage, 8 à 10 m.
                    </p>
                  </RangeField>
                </div>
              )}
            </>
          )}

          {/* ---------- 2. Le logement ---------- */}
          {step === 2 && (
            <>
              <StepHeading ref={headingRef}>Parlez-nous de votre logement</StepHeading>
              <p className="mb-6 text-mp-ink-soft md:mb-8">
                De quoi calculer la puissance qu&apos;il vous faut, et le taux de TVA applicable.
              </p>

              <div className="mb-8">
                <RangeField
                  id="surface"
                  label="Surface à chauffer"
                  unit="m²"
                  min={20}
                  max={300}
                  step={5}
                  value={s.surface}
                  onChange={(v) => set("surface", v)}
                  decLabel="Réduire la surface"
                  incLabel="Augmenter la surface"
                >
                  <p className="mt-2 text-sm text-mp-ink-soft">
                    La surface du rez si vous voulez chauffer le bas, la surface habitable totale pour
                    un canalisable ou un hydro.
                  </p>
                </RangeField>
              </div>

              <div className="mb-8">
                <ChoiceGroup
                  name="iso"
                  legend="Isolation du bâtiment"
                  value={s.iso}
                  onChange={(v) => set("iso", v)}
                  className="sm:grid-cols-2"
                  choices={(Object.keys(ISO) as IsoKey[]).map((k) => ({
                    value: k,
                    label: ISO[k].label,
                    desc: `${ISO[k].desc} · ${ISO[k].wattsPerM2} W/m²`,
                  }))}
                />
              </div>

              <div className="mb-8">
                <ChoiceGroup
                  name="level"
                  legend="Où le poêle sera-t-il installé ?"
                  value={s.level}
                  onChange={(v) => set("level", v)}
                  className="sm:grid-cols-3"
                  choices={(Object.keys(LEVELS) as LevelKey[]).map((k) => ({
                    value: k,
                    label: LEVELS[k].label,
                  }))}
                />
              </div>

              <ChoiceGroup
                name="housing"
                legend="Votre logement a-t-il plus de 10 ans ?"
                value={s.housingOver10Years ? "oui" : "non"}
                onChange={(v) => set("housingOver10Years", v === "oui")}
                className="sm:grid-cols-2"
                choices={[
                  { value: "oui", label: "Oui, plus de 10 ans", desc: "TVA à 6 % sur tout le devis" },
                  { value: "non", label: "Non, ou je ne sais pas", desc: "TVA à 21 %" },
                ]}
                hint={
                  <p className="mt-3 text-sm text-mp-ink-soft">
                    La TVA à 6 % s&apos;applique aux logements privés de plus de 10 ans quand
                    l&apos;installateur fournit et pose le poêle. Nous le confirmons sur le devis.
                  </p>
                }
              />
            </>
          )}

          {/* ---------- 3. Le poêle ---------- */}
          {step === 3 && (
            <>
              <StepHeading ref={headingRef}>Quel type de poêle, et lequel ?</StepHeading>
              <p className="mb-6 text-mp-ink-soft">
                Pour {s.surface} m² avec cette isolation, comptez environ{" "}
                <strong className="text-mp-green-deep">
                  {needKw.toString().replace(".", ",")} kW
                </strong>
                . Nous mettons en tête les modèles qui collent à ce besoin.
              </p>

              <div className="mb-6">
                <ChoiceGroup
                  name="stoveKind"
                  legend="Type de poêle"
                  value={s.stoveKind}
                  onChange={setStoveKind}
                  className="sm:grid-cols-2"
                  choices={(Object.keys(STOVE_KINDS) as StoveKind[]).map((k) => ({
                    value: k,
                    label: STOVE_KINDS[k].label,
                    desc: STOVE_KINDS[k].desc,
                    disabled: filterByKind(products, k).length === 0,
                  }))}
                />
              </div>

              {STOVE_KINDS[s.stoveKind].ducts && (
                <div className="mb-6 rounded-xl border border-mp-sand/40 bg-mp-cream p-4">
                  <p id="est-ducts-label" className={legendCls}>
                    Combien de pièces à desservir par les gaines ?
                  </p>
                  <div className="inline-flex items-center gap-2" role="group" aria-labelledby="est-ducts-label">
                    <StepButton
                      label="Moins de pièces"
                      onClick={() => set("ductRooms", Math.max(1, s.ductRooms - 1))}
                      disabled={s.ductRooms <= 1}
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </StepButton>
                    <output aria-live="polite" className="w-12 text-center text-xl font-semibold tabular-nums text-mp-green-deep">
                      {s.ductRooms}
                    </output>
                    <StepButton
                      label="Plus de pièces"
                      onClick={() => set("ductRooms", Math.min(DUCT_ROOMS_MAX, s.ductRooms + 1))}
                      disabled={s.ductRooms >= DUCT_ROOMS_MAX}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </StepButton>
                  </div>
                </div>
              )}

              <fieldset id="est-models" className="min-w-0 scroll-mt-6">
                <legend className={legendCls}>
                  Choisissez votre modèle{" "}
                  <span className="font-normal text-mp-ink-soft">({eligible.length} disponibles)</span>
                </legend>
                {productMissing && !s.productKey && (
                  <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    Choisissez un modèle pour continuer.
                  </p>
                )}
                {eligible.length === 0 ? (
                  <p className="rounded-xl border border-mp-sand/40 bg-mp-cream p-4 text-sm text-mp-ink-soft">
                    Aucun modèle de ce type n&apos;est chiffrable en ligne pour le moment. Appelez-nous
                    au{" "}
                    <a href="tel:+3281138309" className="whitespace-nowrap font-semibold text-mp-green-deep underline">
                      081 13 83 09
                    </a>
                    , nous avons d&apos;autres références en stock.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {shownModels.map((p) => {
                        const active = s.productKey === p.key;
                        const fit = p.powerKw >= needKw * 0.75 && p.powerKw <= needKw * 1.45;
                        const ttc = Math.round(p.priceHT * (s.housingOver10Years ? 1.06 : 1.21));
                        return (
                          <label key={p.key} className={cn(cardCls(active), "items-center p-3 sm:gap-4 sm:p-4")}>
                            <input
                              type="radio"
                              name="productKey"
                              value={p.key}
                              checked={active}
                              onChange={() => set("productKey", p.key)}
                              className="sr-only"
                            />
                            {/* Sélection marquée par la pastille radio, à côté de
                                la vignette et non posée dessus (DESIGN.md). */}
                            <RadioDot active={active} />
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-mp-beige-warm sm:h-16 sm:w-16">
                              {p.imageSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.imageSrc}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className="absolute inset-0 size-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-mp-sand">
                                  <Flame className="h-6 w-6" aria-hidden />
                                </span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs uppercase tracking-wider text-mp-ink-soft">
                                {p.brand}
                              </span>
                              <span className="line-clamp-2 font-semibold leading-snug text-mp-green-deep">
                                {p.name}
                              </span>
                              <span className="block text-sm text-mp-ink-soft">
                                {p.powerKw.toString().replace(".", ",")} kW
                                {fit && <span className="text-mp-green-mid"> · bien dimensionné</span>}
                              </span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block font-semibold tabular-nums text-mp-green-deep">{eur(ttc)}</span>
                              <span className="block text-xs text-mp-ink-soft">
                                {p.fromVariant ? "poêle seul, dès" : "poêle seul"}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {!showAllModels && eligible.length > MODELS_PREVIEW && (
                      <button
                        type="button"
                        onClick={() => setShowAllFor(s.stoveKind)}
                        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-mp-sand px-4 text-sm font-semibold text-mp-green-deep transition-colors hover:border-mp-green-deep"
                      >
                        Voir les {eligible.length - MODELS_PREVIEW} autres modèles
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </>
                )}
              </fieldset>
            </>
          )}

          {/* ---------- 4. Options ---------- */}
          {step === 4 && (
            <>
              <StepHeading ref={headingRef}>Quelque chose à ajouter ?</StepHeading>
              <p className="mb-6 text-mp-ink-soft md:mb-8">
                Cochez ce qui s&apos;applique. Rien n&apos;est définitif, nous ajustons après la
                visite technique.
              </p>
              <fieldset className="min-w-0">
                <legend className="sr-only">Options de pose</legend>
                <div className="space-y-3">
                  {(Object.keys(OPTIONS) as OptionKey[])
                    .filter((k) => !OPTIONS[k].roofOnly || cfg.roofWork)
                    .map((k) => {
                      const on = !!s.opt[k];
                      const ttc = Math.round(
                        OPTIONS[k].priceHT * (s.housingOver10Years ? 1.06 : 1.21),
                      );
                      return (
                        <label key={k} className={cardCls(on)}>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleOpt(k)}
                            className="sr-only"
                          />
                          <CheckMark on={on} />
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-mp-green-deep">
                              {OPTIONS[k].label}
                            </span>
                            <span className="block text-sm text-mp-ink-soft">{OPTIONS[k].desc}</span>
                            <span className="mt-1 block text-sm font-semibold tabular-nums text-mp-orange-ink">
                              + {eur(ttc)}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                </div>
              </fieldset>
              <p className="mt-6 rounded-xl border border-mp-sand/40 bg-mp-cream p-4 text-sm text-mp-ink-soft">
                Compris d&apos;office dans nos poses : la mise en service, le réglage de la
                combustion, le nettoyage du chantier et la remise du certificat de conformité.
              </p>
            </>
          )}

          {/* ---------- 5. Financement ----------
            * La prime Habitation (choix de la catégorie de revenus) a disparu
            * de cette étape le 03/10/2026 : le régime s'est arrêté le 30/09/2026
            * et le Rénopack qui le remplace ne se chiffre pas poêle par poêle.
            */}
          {step === 5 && (
            <>
              <StepHeading ref={headingRef}>Payer en plusieurs fois</StepHeading>
              <p className="mb-6 text-mp-ink-soft md:mb-8">
                Le total comprend déjà la TVA qui s&apos;applique chez vous (étape 2). Vous pouvez
                l&apos;étaler à 0 %.
              </p>

              <div className="mb-8 rounded-xl border border-mp-sand/40 bg-mp-cream p-4 text-sm leading-relaxed text-mp-ink">
                <strong className="text-mp-green-deep">Et la prime Wallonie ?</strong>{" "}
                Elle a pris fin le 30 septembre 2026 : il n&apos;y a plus de prime régionale à déduire pour un poêle.
                Si votre maison est classée PEB E, F ou G et que vous préparez une rénovation plus
                large, le Rénopack peut financer le poêle avec le reste des travaux.{" "}
                <Link
                  href="/primes-energie-wallonie-2026"
                  className="font-semibold text-mp-green-deep underline hover:no-underline"
                >
                  Les aides qui restent
                </Link>
                .
              </div>

              {isFinanceable(r.totalTTC) && durations.length > 0 ? (
                <fieldset className="min-w-0">
                  <legend className={legendCls}>Étaler le paiement à 0 %</legend>
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                    {durations.map((m) => {
                      const active = months === m;
                      return (
                        <label key={m} className={cn(cardCls(active), "flex-col items-center gap-0 px-2 py-2.5 text-center sm:px-4")}>
                          <input
                            type="radio"
                            name="financeMonths"
                            value={m}
                            checked={active}
                            onChange={() => set("financeMonths", m)}
                            className="sr-only"
                          />
                          <span className="block font-semibold text-mp-green-deep">{m} mois</span>
                          <span className="block text-sm tabular-nums text-mp-ink-soft">
                            {eur(monthly0(r.totalTTC, m) ?? 0)}/mois
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-4 rounded-xl border border-mp-orange-flame/30 bg-mp-orange-light/30 p-4">
                    <span className="block text-2xl font-semibold tabular-nums text-mp-green-deep">
                      {eur(monthly ?? 0)}/mois
                    </span>
                    <span className="mt-1 block text-sm text-mp-ink-soft">
                      sur {months} mois, TAEG 0 %, pour {eur(r.totalTTC)} TTC
                      {r.bonusHT > 0 ? ", bonus de saison déduit" : ""}. {FIN_NOTE}
                    </span>
                  </p>
                </fieldset>
              ) : (
                <p className="rounded-xl border border-mp-sand/40 bg-mp-cream p-4 text-sm text-mp-ink-soft">
                  Le financement s&apos;applique de 200 à 50 000 €. Choisissez d&apos;abord votre
                  poêle à l&apos;étape précédente pour voir la mensualité.
                </p>
              )}
              <p className="mt-4 text-xs leading-relaxed text-mp-ink-soft">
                <strong className="text-mp-ink">{SLOGAN_CREDIT}</strong> {FIN_LEGAL}
              </p>
            </>
          )}

          {/* ---------- 6. La suite : recontact ou non ---------- */}
          {step === 6 && (
            <>
              <StepHeading ref={headingRef}>Voulez-vous qu&apos;on vous recontacte ?</StepHeading>
              <p className="mb-6 text-mp-ink-soft">
                Votre estimation est prête :{" "}
                <strong className="whitespace-nowrap text-mp-green-deep">{eur(r.totalTTC)} TTC</strong>,
                pose comprise. Elle est calculée sans avoir vu votre maison. Pendant la visite
                technique, gratuite, il nous arrive de trouver moins cher : un conduit existant qui
                suffit, un poêle un cran moins puissant, un trajet plus court pour les fumées.
              </p>
              <ChoiceGroup
                name="contactChoice"
                legend="Voulez-vous qu'on vous recontacte ?"
                legendHidden
                value={contactChoice}
                choices={CONTACT_CHOICES}
                onChange={setContactChoice}
                className="sm:grid-cols-2"
              />

              {contactChoice === "non" && (
                <div
                  role="status"
                  className="mt-6 rounded-xl border border-mp-sand/60 bg-mp-cream p-4 text-mp-ink sm:p-5"
                >
                  <p>
                    C&apos;est noté, nous ne vous recontacterons pas. Votre configuration reste
                    enregistrée dans ce navigateur : vous la retrouverez en revenant sur cette page.
                  </p>
                  <p className="mt-3">
                    Si vous changez d&apos;avis, choisissez « Oui » ci-dessus, appelez le{" "}
                    <a href="tel:+3281138309" className="whitespace-nowrap font-semibold text-mp-green-deep underline underline-offset-2">
                      081 13 83 09
                    </a>{" "}
                    ou{" "}
                    <Link href="/prendre-rendez-vous#reserver" className="font-semibold text-mp-orange-ink underline underline-offset-2 hover:no-underline">
                      réservez la visite en ligne
                    </Link>
                    .
                  </p>
                </div>
              )}

              {contactChoice === "oui" && (
                <div className="mt-8 space-y-4">
                  <p className="text-mp-ink-soft">
                    Nous vous rappelons sous 48 h ouvrées pour caler la visite. Pas de spam, pas de
                    vente forcée.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="est-cp" label="Code postal" required error={fieldError("postalCode")}>
                      <input
                        id="est-cp"
                        type="text"
                        inputMode="numeric"
                        enterKeyHint="next"
                        maxLength={4}
                        required
                        aria-invalid={!!fieldError("postalCode")}
                        aria-describedby={fieldError("postalCode") ? "est-cp-err" : undefined}
                        value={customer.postalCode}
                        onChange={(e) =>
                          setCustomer({ ...customer, postalCode: e.target.value.replace(/[^0-9]/g, "") })
                        }
                        onBlur={() => touch("postalCode")}
                        className={inputCls}
                        placeholder="5380"
                        autoComplete="postal-code"
                      />
                    </Field>
                    <Field id="est-delay" label="Délai souhaité" required error={fieldError("delay")}>
                      <select
                        id="est-delay"
                        required
                        aria-invalid={!!fieldError("delay")}
                        aria-describedby={fieldError("delay") ? "est-delay-err" : undefined}
                        value={customer.delay}
                        onChange={(e) => {
                          setCustomer({ ...customer, delay: e.target.value as Customer["delay"] });
                          touch("delay");
                        }}
                        onBlur={() => touch("delay")}
                        className={inputCls}
                      >
                        <option value="" disabled>
                          Choisissez…
                        </option>
                        <option value="asap">Le plus vite possible</option>
                        <option value="1-3-mois">Dans 1 à 3 mois</option>
                        <option value="3-6-mois">Dans 3 à 6 mois</option>
                        <option value="+6-mois">Plus de 6 mois (je me renseigne)</option>
                      </select>
                    </Field>
                  </div>
                  <Field id="est-name" label="Nom complet" required error={fieldError("name")}>
                    <input
                      id="est-name"
                      type="text"
                      enterKeyHint="next"
                      required
                      minLength={2}
                      aria-invalid={!!fieldError("name")}
                      aria-describedby={fieldError("name") ? "est-name-err" : undefined}
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      onBlur={() => touch("name")}
                      className={inputCls}
                      placeholder="Sophie Dupont"
                      autoComplete="name"
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field id="est-email" label="Email" required error={fieldError("email")}>
                      <input
                        id="est-email"
                        type="email"
                        inputMode="email"
                        enterKeyHint="next"
                        required
                        aria-invalid={!!fieldError("email")}
                        aria-describedby={fieldError("email") ? "est-email-err" : undefined}
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        onBlur={() => touch("email")}
                        className={inputCls}
                        placeholder="sophie@exemple.be"
                        autoComplete="email"
                      />
                    </Field>
                    <Field
                      id="est-phone"
                      label="Téléphone"
                      required
                      note="(BE uniquement)"
                      error={fieldError("phone")}
                    >
                      <input
                        id="est-phone"
                        type="tel"
                        inputMode="tel"
                        enterKeyHint="next"
                        required
                        aria-invalid={!!fieldError("phone")}
                        aria-describedby={fieldError("phone") ? "est-phone-err" : undefined}
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        onBlur={() => touch("phone")}
                        className={inputCls}
                        placeholder="0470 12 34 56"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                  <Field id="est-message" label="Précisions (optionnel)">
                    <textarea
                      id="est-message"
                      rows={3}
                      value={customer.message}
                      onChange={(e) => setCustomer({ ...customer, message: e.target.value })}
                      className={cn(inputCls, "resize-y")}
                      placeholder="Accès particulier, projet en cours, contraintes de planning…"
                    />
                  </Field>
                  <div>
                    <label
                      htmlFor="est-consent"
                      className="flex cursor-pointer items-start gap-3 py-1 text-sm text-mp-ink-soft"
                    >
                      <input
                        id="est-consent"
                        type="checkbox"
                        required
                        aria-invalid={!!fieldError("consent")}
                        aria-describedby={fieldError("consent") ? "est-consent-err" : undefined}
                        checked={customer.consent}
                        onChange={(e) => {
                          setCustomer({ ...customer, consent: e.target.checked });
                          touch("consent");
                        }}
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-mp-orange-ink"
                      />
                      <span>
                        J&apos;accepte que mes données soient utilisées pour me recontacter,
                        conformément à la{" "}
                        <a
                          href="/politique-confidentialite"
                          className="text-mp-orange-ink underline hover:no-underline"
                        >
                          politique de confidentialité
                        </a>
                        .
                      </span>
                    </label>
                    {fieldError("consent") && (
                      <p id="est-consent-err" className="mt-1.5 text-sm text-red-700">
                        {fieldError("consent")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {submitState === "error" && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Barre d'action. Sous 1 024 px elle colle au bas de l'écran, posée sur
            la barre de navigation, puis au ras de l'écran quand celle-ci se
            replie (--mp-bottomnav-offset, globals.css), le tout dans les limites
            du formulaire : arrivée en bas de la carte, elle reprend sa place.
            mp-actionbar et sa hauteur minimale : le bandeau cookies se pose
            au-dessus (globals.css). */}
        <div
          className={cn(
            "mp-actionbar sticky bottom-[calc(var(--mp-bottomnav-offset)_+_0.5rem)] z-20 min-h-[var(--mp-actionbar-h)]",
            // Fond opaque et filet, sans flou ni ombre (DESIGN.md). Le saut de
            // `bottom` quand la barre du bas se replie n'est pas animé : seuls
            // opacité et transform s'animent sur le site.
            "border-t border-mp-sand/40 bg-mp-cream px-4 py-3",
            "sm:px-6 lg:static lg:px-8 lg:py-5",
          )}
        >
          <div className="flex items-center gap-3">
            {/* Le total reste dans la barre tant que le formulaire n'est pas ouvert. */}
            {(step < STEP_COUNT || contactChoice !== "oui") && (
              <button
                type="button"
                onPointerDown={preloadRecapSheet}
                onFocus={preloadRecapSheet}
                onClick={openRecap}
                aria-haspopup="dialog"
                className="-my-1 min-h-11 min-w-0 flex-1 rounded-xl py-1 pr-2 text-left lg:hidden"
              >
                <span className="block text-xs font-medium text-mp-ink-soft">
                  {product ? "Total posé, TTC" : "Pose estimée, TTC"}
                </span>
                <span className="flex items-center gap-1 text-lg font-semibold leading-tight tabular-nums text-mp-green-deep">
                  {eur(r.totalTTC)}
                  <ChevronUp className="h-4 w-4 text-mp-ink-soft" aria-hidden />
                  <span className="sr-only">, voir le détail</span>
                </span>
              </button>
            )}
            {step > 1 && (
              <Button
                variant="ghost"
                size="default"
                onClick={prev}
                disabled={loading}
                className="w-11 shrink-0 px-0 lg:w-auto lg:px-6"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span className="sr-only lg:not-sr-only">Précédent</span>
              </Button>
            )}
            <span className="hidden flex-1 lg:block" aria-hidden />
            {(step < STEP_COUNT || contactChoice === "oui") && (
              <Button
                variant="primary"
                size="default"
                onClick={next}
                disabled={loading}
                className={cn("shrink-0 px-5 lg:px-6", step === STEP_COUNT && "flex-1 sm:flex-none")}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Envoi…
                  </>
                ) : step === STEP_COUNT ? (
                  <>
                    Envoyer ma demande <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                ) : (
                  <>
                    Suivant <ArrowRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ============ Colonne récapitulatif (desktop) ============ */}
      <aside className="hidden rounded-3xl border border-mp-sand/40 bg-white p-6 shadow-md lg:sticky lg:top-24 lg:block">
        <p className="text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
          Votre estimation
        </p>
        <Recap product={product} s={s} r={r} needKw={needKw} monthly={monthly} months={months} />
      </aside>

      {/* ============ Détail en volet (mobile et tablette), monté au premier appui ============ */}
      {RecapSheet && (
        <RecapSheet open={recapOpen} onOpenChange={setRecapOpen}>
          <Recap product={product} s={s} r={r} needKw={needKw} monthly={monthly} months={months} />
        </RecapSheet>
      )}
    </div>
  );
}

/** Question de l'étape : reçoit le focus à chaque changement d'étape. */
const StepHeading = React.forwardRef<HTMLHeadingElement, { children: React.ReactNode }>(
  function StepHeading({ children }, ref) {
    return (
      <h2
        ref={ref}
        tabIndex={-1}
        className="mb-2 text-2xl font-semibold text-mp-green-deep outline-none md:text-3xl"
      >
        {children}
      </h2>
    );
  },
);

interface Choice<K extends string> {
  value: K;
  label: string;
  desc?: string;
  disabled?: boolean;
}

/** Groupe de cartes à choix unique, sur de vrais boutons radio. */
function ChoiceGroup<K extends string>({
  name,
  legend,
  legendHidden = false,
  value,
  choices,
  onChange,
  className,
  hint,
}: {
  name: string;
  legend: string;
  legendHidden?: boolean;
  value: K;
  choices: Choice<K>[];
  onChange: (v: K) => void;
  className?: string;
  hint?: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className={legendHidden ? "sr-only" : legendCls}>{legend}</legend>
      <div className={cn("grid gap-3", className)}>
        {choices.map((c) => {
          const active = value === c.value;
          return (
            <label key={c.value} className={cardCls(active, c.disabled)}>
              <input
                type="radio"
                name={name}
                value={c.value}
                checked={active}
                disabled={c.disabled}
                onChange={() => onChange(c.value)}
                className="sr-only"
              />
              <RadioDot active={active} />
              <span className="min-w-0">
                <span className="block font-semibold text-mp-green-deep">{c.label}</span>
                {c.desc && <span className="mt-0.5 block text-sm text-mp-ink-soft">{c.desc}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {hint}
    </fieldset>
  );
}

/** Pastille radio dessinée : la sélection ne repose pas que sur la couleur. */
function RadioDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 bg-white transition-colors",
        active ? "border-mp-orange-ink" : "border-mp-sand",
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full bg-mp-orange-ink transition-transform motion-reduce:transition-none",
          active ? "scale-100" : "scale-0",
        )}
      />
    </span>
  );
}

function CheckMark({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors",
        on ? "border-mp-orange-flame bg-mp-orange-flame text-mp-green-darkest" : "border-mp-sand bg-white",
      )}
    >
      {on && <Check className="h-4 w-4" />}
    </span>
  );
}

function StepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-mp-sand bg-white text-mp-green-deep transition-colors hover:border-mp-green-deep disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/**
 * Curseur avec boutons − et + de 44 px : le pouce natif d'un curseur fait une
 * quinzaine de pixels sur mobile, et viser 135 m² au doigt sur 56 positions
 * relève de la chance. La valeur s'affiche au-dessus, à droite du libellé.
 */
function RangeField({
  id,
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  decLabel,
  incLabel,
  children,
}: {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  decLabel: string;
  incLabel: string;
  children?: React.ReactNode;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-mp-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-xl font-semibold tabular-nums text-mp-green-deep">
          {value} <span className="text-sm font-normal text-mp-ink-soft">{unit}</span>
        </output>
      </div>
      <div className="flex items-center gap-2">
        <StepButton label={decLabel} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min}>
          <Minus className="h-4 w-4" aria-hidden />
        </StepButton>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          aria-valuetext={`${value} ${unit}`}
          className="mp-range min-w-0 flex-1"
          style={{ "--mp-range-fill": `${fill}%` } as React.CSSProperties}
        />
        <StepButton label={incLabel} onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max}>
          <Plus className="h-4 w-4" aria-hidden />
        </StepButton>
      </div>
      {children}
    </div>
  );
}

/** Libellé, champ et message d'erreur sous le champ (lié par aria-describedby). */
function Field({
  id,
  label,
  required,
  note,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  note?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-mp-ink">
        {label}
        {required && <span className="text-mp-orange-ink"> *</span>}
        {note && <span className="ml-1 text-xs font-normal text-mp-ink-soft">{note}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Récapitulatif chiffré : colonne de droite sur desktop, volet sur mobile. */
function Recap({
  product,
  s,
  r,
  needKw,
  monthly,
  months,
}: {
  product: EstimateProduct | null;
  s: EstimateState;
  r: EstimateResult;
  needKw: number;
  monthly: number | null;
  months: number | null;
}) {
  return (
    <>
      {product ? (
        <>
          <h3 className="mt-2 text-xl font-semibold text-mp-green-deep">{product.name}</h3>
          <p className="text-sm text-mp-ink-soft">
            {product.brand} · {product.powerKw.toString().replace(".", ",")} kW ·{" "}
            {STOVE_KINDS[s.stoveKind].label}
          </p>
        </>
      ) : (
        <>
          <h3 className="mt-2 text-xl font-semibold text-mp-green-deep">Modèle à choisir</h3>
          <p className="text-sm text-mp-ink-soft">
            Étape 3 : choisissez le poêle, le total se met à jour.
          </p>
        </>
      )}

      <div
        className={cn(
          "mt-4 rounded-xl border p-3 text-sm",
          r.wellSized === false
            ? "border-mp-orange-flame/40 bg-mp-orange-light/30 text-mp-ink"
            : "border-mp-green-light/40 bg-mp-green-light/10 text-mp-green-deep",
        )}
      >
        Besoin estimé : {needKw.toString().replace(".", ",")} kW pour {s.surface} m².
        {r.wellSized === false && product && (
          <>
            {" "}
            Le {product.powerKw.toString().replace(".", ",")} kW s&apos;en éloigne, nous
            validerons ce point à la visite.
          </>
        )}
      </div>

      <dl className="mt-5 space-y-1 border-t border-mp-sand/40 pt-4 text-sm">
        <Row
          label={product ? `Poêle ${product.brand}` : "Poêle"}
          value={r.materialHT > 0 ? eur(r.materialHT) : "à choisir"}
        />
        {r.bonusHT > 0 && <Row label={bonusLabelFor(product?.brand)} value={`-${eur(r.bonusHT)}`} />}
        {r.laborLines.map((l) => (
          <Row key={l.key} label={l.label} value={eur(l.amountHT)} muted />
        ))}
        <Row label={`TVA ${Math.round(r.vatRate * 100)} %`} value={eur(r.vatAmount)} muted />
      </dl>

      <div className="mt-4 flex items-end justify-between border-t border-mp-sand/40 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
          Total TTC posé
        </span>
        <span className="text-2xl font-semibold tabular-nums text-mp-green-deep">{eur(r.totalTTC)}</span>
      </div>

      {monthly != null && (
        <p className="mt-3 rounded-xl border border-mp-orange-flame/30 bg-mp-orange-light/30 p-3 text-sm text-mp-ink">
          ou <strong className="text-mp-green-deep">{eur(monthly)}/mois</strong> sur {months} mois
          à 0 %
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-mp-ink-soft">
        Estimation indicative TTC, matériel et pose compris, TVA{" "}
        {Math.round(r.vatRate * 100)} %. Les forfaits de pose sont des budgets moyens : le prix
        ferme est établi après la visite technique gratuite.
        {r.bonusHT > 0 && ` ${bonusLabelFor(product?.brand)} déduit. ${BONUS.conditions}`}
      </p>
      {monthly != null && (
        <p className="mt-2 text-xs leading-relaxed text-mp-ink-soft">
          <strong className="text-mp-ink">{SLOGAN_CREDIT}</strong> {FIN_LEGAL}
        </p>
      )}
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <dt className={cn("min-w-0", muted ? "text-mp-ink-soft" : "text-mp-ink")}>{label}</dt>
      <dd className={cn("shrink-0 tabular-nums", muted ? "text-mp-ink-soft" : "text-mp-ink")}>
        {value}
      </dd>
    </div>
  );
}
