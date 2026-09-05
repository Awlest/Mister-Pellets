"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Flame, Loader2 } from "lucide-react";
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
  PRIME_CATEGORIES,
  STOVE_KINDS,
  estimate,
  eur,
  filterByKind,
  rankProducts,
  recommendedKw,
  type EstimateProduct,
  type EstimateState,
  type InstallType,
  type IsoKey,
  type LevelKey,
  type OptionKey,
  type PrimeCategory,
  type StoveKind,
} from "@/lib/estimate";
import { FIN_LEGAL, FIN_NOTE, SLOGAN_CREDIT, durationsFor, isFinanceable, monthly0 } from "@/lib/financing";

const STORAGE_KEY = "mp_estimate_draft";

const STEPS = [
  { id: 1, label: "Évacuation" },
  { id: 2, label: "Votre logement" },
  { id: 3, label: "Votre poêle" },
  { id: 4, label: "Options" },
  { id: 5, label: "Prime & financement" },
  { id: 6, label: "Coordonnées" },
];
const STEP_COUNT = STEPS.length;

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

const cardCls = (active: boolean) =>
  cn(
    "rounded-xl border-2 p-4 text-left transition-all min-h-[44px]",
    active
      ? "border-mp-orange-flame bg-mp-orange-light/40 ring-2 ring-mp-orange-flame/20"
      : "border-mp-sand/40 bg-white hover:border-mp-orange-flame/50 hover:bg-mp-cream",
  );
const legendCls = "block text-sm font-medium text-mp-ink mb-3";
const inputCls = cn(
  "w-full rounded-xl border border-mp-sand bg-white px-4 py-3 text-mp-ink",
  "placeholder:text-mp-ink-soft/60 outline-none transition-colors",
  "focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20",
);

export function EstimateConfigurator({ products }: { products: EstimateProduct[] }) {
  const [step, setStep] = React.useState(1);
  const [s, setS] = React.useState<EstimateState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const draft = window.localStorage.getItem(STORAGE_KEY);
      if (draft) return { ...DEFAULT_STATE, ...JSON.parse(draft) };
    } catch {
      // localStorage indisponible ou brouillon corrompu : on repart à zéro
    }
    return DEFAULT_STATE;
  });
  const [customer, setCustomer] = React.useState<Customer>(EMPTY_CUSTOMER);
  const [website, setWebsite] = React.useState(""); // honeypot
  const [submitState, setSubmitState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }, [s]);

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
  const r = estimate(s, product);
  const durations = durationsFor(r.totalTTC);
  const months =
    s.financeMonths && durations.includes(s.financeMonths)
      ? s.financeMonths
      : (durations[durations.length - 1] ?? null);
  const monthly = months ? monthly0(r.totalTTC, months) : null;

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
      case 2:
      case 4:
      case 5:
        return true;
      case 3:
        return s.productKey !== null;
      case 6:
        return (
          /^[1-9]\d{3}$/.test(customer.postalCode) &&
          customer.delay !== "" &&
          customer.name.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) &&
          isValidBelgianPhone(customer.phone) &&
          customer.consent
        );
      default:
        return false;
    }
  };

  const next = () => {
    if (!canGoNext()) return;
    if (step < STEP_COUNT) setStep(step + 1);
    else void handleSubmit();
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
        throw new Error(data.error ?? "Erreur lors de l'envoi.");
      }
      setSubmitState("success");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    } catch (e) {
      setSubmitState("error");
      setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  if (submitState === "success") {
    return (
      <div className="rounded-3xl border border-mp-green-light/40 bg-mp-green-light/15 p-8 text-center text-mp-green-deep md:p-12">
        <div className="mb-6 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mp-green-light text-white">
            <Check className="h-8 w-8" />
          </span>
        </div>
        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Estimation envoyée</h2>
        <p className="mx-auto mb-6 mp-measure text-lg leading-relaxed">
          Merci {customer.name}, nous avons votre configuration
          {product ? ` autour du ${product.name}` : ""}.
        </p>
        <p className="mb-8 text-xl font-semibold">
          Estimation : {eur(r.totalTTC)} TTC
          {r.prime > 0 ? ` · ${eur(r.netAfterPrime)} après prime estimée` : ""}
        </p>

        {/*
          Le paiement en ligne a été retiré : on explique franchement la suite
          plutôt que de laisser le client attendre un bouton « payer ». Un
          poêle ne se commande pas sans avoir vu le conduit, et cette étape
          évite les mauvaises surprises des deux côtés.
        */}
        <div className="mx-auto mb-8 mp-measure rounded-2xl border border-mp-sand/60 bg-white/70 p-6 text-left">
          <p className="mb-4 font-semibold">La suite, en trois temps</p>
          <ol className="space-y-3 text-mp-ink">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mp-green-deep text-xs font-bold text-mp-cream">1</span>
              <span>
                On vous rappelle sous 48 h ouvrées pour caler la{" "}
                <strong>visite technique</strong> — vous pouvez aussi{" "}
                <Link href="/prendre-rendez-vous" className="text-mp-orange-flame underline underline-offset-2 hover:no-underline">
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
            Une question dans l&apos;intervalle ? 081 13 83 09.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" size="default">
            <Link href="/prendre-rendez-vous">Choisir mon créneau</Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* ============ Colonne formulaire ============ */}
      <div className="overflow-hidden rounded-3xl border border-mp-sand/40 bg-white shadow-md">
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

        <div className="border-b border-mp-sand/40 bg-mp-cream px-6 py-5 md:px-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
              Étape {step} sur {STEP_COUNT}
            </span>
            <span className="text-sm font-medium text-mp-green-deep">{STEPS[step - 1]?.label}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-mp-sand/40">
            <div
              className="h-full rounded-full bg-mp-orange-flame transition-all duration-500"
              style={{ width: `${(step / STEP_COUNT) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-[420px] p-6 md:p-10">
          {/* ---------- 1. Évacuation des fumées ---------- */}
          {step === 1 && (
            <>
              <h2 className="mb-2 text-2xl font-semibold text-mp-green-deep md:text-3xl">
                Comment sortent les fumées chez vous ?
              </h2>
              <p className="mb-8 text-mp-ink-soft">
                C&apos;est ce qui pèse le plus dans le coût de la pose. Si vous hésitez entre deux
                réponses, prenez la plus probable, nous vérifions tout lors de la visite.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(INSTALL_TYPES) as InstallType[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={s.installType === k}
                    onClick={() => set("installType", k)}
                    className={cardCls(s.installType === k)}
                  >
                    <span className="mb-0.5 block font-semibold text-mp-green-deep">
                      {INSTALL_TYPES[k].label}
                    </span>
                    <span className="block text-sm text-mp-ink-soft">{INSTALL_TYPES[k].desc}</span>
                  </button>
                ))}
              </div>

              {cfg.perMeter > 0 && (
                <div className="mt-8">
                  <label htmlFor="conduit" className={legendCls}>
                    Hauteur de conduit à poser
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="conduit"
                      type="range"
                      min={4}
                      max={CONDUIT_MAX_M}
                      step={1}
                      value={s.conduitM}
                      onChange={(e) => set("conduitM", +e.target.value)}
                      className="h-2 flex-1 cursor-pointer accent-mp-orange-flame"
                    />
                    <span className="min-w-[64px] text-right text-xl font-semibold text-mp-green-deep">
                      {s.conduitM} <span className="text-sm font-normal text-mp-ink-soft">m</span>
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-mp-ink-soft">
                    {CONDUIT_INCLUDED_M} m compris dans le forfait, au-delà nous comptons au mètre.
                    En général : un rez seul, 5 à 6 m ; un rez + un étage, 8 à 10 m.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ---------- 2. Le logement ---------- */}
          {step === 2 && (
            <>
              <h2 className="mb-2 text-2xl font-semibold text-mp-green-deep md:text-3xl">
                Parlez-nous de votre logement
              </h2>
              <p className="mb-8 text-mp-ink-soft">
                De quoi calculer la puissance qu&apos;il vous faut, et le taux de TVA applicable.
              </p>

              <div className="mb-8">
                <label htmlFor="surface" className={legendCls}>
                  Surface à chauffer
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="surface"
                    type="range"
                    min={20}
                    max={300}
                    step={5}
                    value={s.surface}
                    onChange={(e) => set("surface", +e.target.value)}
                    className="h-2 flex-1 cursor-pointer accent-mp-orange-flame"
                  />
                  <span className="min-w-[86px] text-right text-xl font-semibold text-mp-green-deep">
                    {s.surface} <span className="text-sm font-normal text-mp-ink-soft">m²</span>
                  </span>
                </div>
                <p className="mt-2 text-sm text-mp-ink-soft">
                  La surface du rez si vous voulez chauffer le bas, la surface habitable totale pour
                  un canalisable ou un hydro.
                </p>
              </div>

              <div className="mb-8">
                <span className={legendCls}>Isolation du bâtiment</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(ISO) as IsoKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={s.iso === k}
                      onClick={() => set("iso", k)}
                      className={cardCls(s.iso === k)}
                    >
                      <span className="mb-0.5 block font-semibold text-mp-green-deep">
                        {ISO[k].label}
                      </span>
                      <span className="block text-sm text-mp-ink-soft">
                        {ISO[k].desc} · {ISO[k].wattsPerM2} W/m²
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <span className={legendCls}>Où le poêle sera-t-il installé ?</span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(LEVELS) as LevelKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={s.level === k}
                      onClick={() => set("level", k)}
                      className={cardCls(s.level === k)}
                    >
                      <span className="block font-semibold text-mp-green-deep">{LEVELS[k].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={legendCls}>Votre logement a-t-il plus de 10 ans ?</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={s.housingOver10Years}
                    onClick={() => set("housingOver10Years", true)}
                    className={cardCls(s.housingOver10Years)}
                  >
                    <span className="mb-0.5 block font-semibold text-mp-green-deep">
                      Oui, plus de 10 ans
                    </span>
                    <span className="block text-sm text-mp-ink-soft">TVA à 6 % sur tout le devis</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={!s.housingOver10Years}
                    onClick={() => set("housingOver10Years", false)}
                    className={cardCls(!s.housingOver10Years)}
                  >
                    <span className="mb-0.5 block font-semibold text-mp-green-deep">
                      Non, ou je ne sais pas
                    </span>
                    <span className="block text-sm text-mp-ink-soft">TVA à 21 %</span>
                  </button>
                </div>
                <p className="mt-3 text-sm text-mp-ink-soft">
                  La TVA à 6 % s&apos;applique aux logements privés de plus de 10 ans quand la pose
                  est facturée par l&apos;installateur. Nous le confirmons sur le devis.
                </p>
              </div>
            </>
          )}

          {/* ---------- 3. Le poêle ---------- */}
          {step === 3 && (
            <>
              <h2 className="mb-2 text-2xl font-semibold text-mp-green-deep md:text-3xl">
                Quel type de poêle, et lequel ?
              </h2>
              <p className="mb-6 text-mp-ink-soft">
                Pour {s.surface} m² avec cette isolation, comptez environ{" "}
                <strong className="text-mp-green-deep">
                  {needKw.toString().replace(".", ",")} kW
                </strong>
                . Nous mettons en tête les modèles qui collent à ce besoin.
              </p>

              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {(Object.keys(STOVE_KINDS) as StoveKind[]).map((k) => {
                  const count = filterByKind(products, k).length;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={s.stoveKind === k}
                      disabled={count === 0}
                      onClick={() => setStoveKind(k)}
                      className={cn(cardCls(s.stoveKind === k), count === 0 && "opacity-40")}
                    >
                      <span className="mb-0.5 block font-semibold text-mp-green-deep">
                        {STOVE_KINDS[k].label}
                      </span>
                      <span className="block text-sm text-mp-ink-soft">{STOVE_KINDS[k].desc}</span>
                    </button>
                  );
                })}
              </div>

              {STOVE_KINDS[s.stoveKind].ducts && (
                <div className="mb-6 rounded-xl border border-mp-sand/40 bg-mp-cream p-4">
                  <span className={legendCls}>Combien de pièces à desservir par les gaines ?</span>
                  <div className="inline-flex items-center overflow-hidden rounded-xl border border-mp-sand">
                    <button
                      type="button"
                      aria-label="Moins de pièces"
                      className="h-11 w-11 text-xl text-mp-green-deep hover:bg-mp-beige-warm"
                      onClick={() => set("ductRooms", Math.max(1, s.ductRooms - 1))}
                    >
                      −
                    </button>
                    <span className="w-14 text-center text-xl font-semibold text-mp-green-deep">
                      {s.ductRooms}
                    </span>
                    <button
                      type="button"
                      aria-label="Plus de pièces"
                      className="h-11 w-11 text-xl text-mp-green-deep hover:bg-mp-beige-warm"
                      onClick={() => set("ductRooms", Math.min(DUCT_ROOMS_MAX, s.ductRooms + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <span className={legendCls}>
                Choisissez votre modèle{" "}
                <span className="font-normal text-mp-ink-soft">({eligible.length} disponibles)</span>
              </span>
              {eligible.length === 0 ? (
                <p className="rounded-xl border border-mp-sand/40 bg-mp-cream p-4 text-sm text-mp-ink-soft">
                  Aucun modèle de ce type n&apos;est chiffrable en ligne pour le moment. Appelez-nous
                  au 081 13 83 09, nous avons d&apos;autres références en stock.
                </p>
              ) : (
                <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {eligible.map((p) => {
                    const active = s.productKey === p.key;
                    const fit = p.powerKw >= needKw * 0.75 && p.powerKw <= needKw * 1.45;
                    const ttc = Math.round(p.priceHT * (s.housingOver10Years ? 1.06 : 1.21));
                    return (
                      <li key={p.key}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => set("productKey", p.key)}
                          className={cn(cardCls(active), "flex w-full items-center gap-4")}
                        >
                          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-mp-beige-warm">
                            {p.imageSrc ? (
                              <Image
                                src={p.imageSrc}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-mp-sand">
                                <Flame className="h-6 w-6" />
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs uppercase tracking-wider text-mp-ink-soft">
                              {p.brand}
                            </span>
                            <span className="block truncate font-semibold text-mp-green-deep">
                              {p.name}
                            </span>
                            <span className="block text-sm text-mp-ink-soft">
                              {p.powerKw.toString().replace(".", ",")} kW
                              {fit && (
                                <span className="ml-2 text-mp-green-light">· bien dimensionné</span>
                              )}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block font-semibold text-mp-green-deep">{eur(ttc)}</span>
                            <span className="block text-xs text-mp-ink-soft">
                              {p.fromVariant ? "poêle seul, dès" : "poêle seul"}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {/* ---------- 4. Options ---------- */}
          {step === 4 && (
            <>
              <h2 className="mb-2 text-2xl font-semibold text-mp-green-deep md:text-3xl">
                Quelque chose à ajouter ?
              </h2>
              <p className="mb-8 text-mp-ink-soft">
                Cochez ce qui s&apos;applique. Rien n&apos;est définitif, nous ajustons après la
                visite technique.
              </p>
              <div className="space-y-3">
                {(Object.keys(OPTIONS) as OptionKey[])
                  .filter((k) => !OPTIONS[k].roofOnly || cfg.roofWork)
                  .map((k) => {
                    const on = !!s.opt[k];
                    const ttc = Math.round(
                      OPTIONS[k].priceHT * (s.housingOver10Years ? 1.06 : 1.21),
                    );
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleOpt(k)}
                        className={cn(cardCls(on), "flex w-full items-center justify-between gap-4")}
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-mp-green-deep">
                            {OPTIONS[k].label}
                          </span>
                          <span className="block text-sm text-mp-ink-soft">{OPTIONS[k].desc}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-medium text-mp-orange-flame">
                            + {eur(ttc)}
                          </span>
                          <span
                            className={cn(
                              "grid h-6 w-6 place-items-center rounded border-2",
                              on
                                ? "border-mp-orange-flame bg-mp-orange-flame text-white"
                                : "border-mp-sand",
                            )}
                          >
                            {on && <Check className="h-4 w-4" />}
                          </span>
                        </span>
                      </button>
                    );
                  })}
              </div>
              <p className="mt-6 rounded-xl border border-mp-sand/40 bg-mp-cream p-4 text-sm text-mp-ink-soft">
                Compris d&apos;office dans nos poses : la mise en service, le réglage de la
                combustion, le nettoyage du chantier et la remise du certificat de conformité.
              </p>
            </>
          )}

          {/* ---------- 5. Prime & financement ---------- */}
          {step === 5 && (
            <>
              <h2 className="mb-2 text-2xl font-semibold text-mp-green-deep md:text-3xl">
                Prime Wallonie et paiement en plusieurs fois
              </h2>
              <p className="mb-8 text-mp-ink-soft">
                Deux leviers pour alléger la facture : la prime Habitation, et l&apos;étalement du
                paiement à 0 %.
              </p>

              <div className="mb-8">
                <span className={legendCls}>
                  Vos revenus de référence (pour estimer la prime Habitation)
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(PRIME_CATEGORIES) as PrimeCategory[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={s.primeCategory === k}
                      onClick={() => set("primeCategory", k)}
                      className={cardCls(s.primeCategory === k)}
                    >
                      <span className="mb-0.5 block font-semibold text-mp-green-deep">
                        {PRIME_CATEGORIES[k].label}
                      </span>
                      <span className="block text-sm text-mp-ink-soft">
                        {PRIME_CATEGORIES[k].coef > 0
                          ? `Prime de base ${160 * PRIME_CATEGORIES[k].coef} €, plafonnée à ${Math.round(
                              PRIME_CATEGORIES[k].capRatio * 100,
                            )} % du montant TVAC`
                          : "Nous verrons ensemble à quelle catégorie vous appartenez"}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-mp-ink-soft">
                  Estimation indicative. Un audit logement préalable est obligatoire et le montant
                  définitif dépend de votre dossier.{" "}
                  <Link
                    href="/primes-energie-wallonie-2026"
                    className="text-mp-orange-flame underline hover:no-underline"
                  >
                    Tout savoir sur la prime
                  </Link>
                  .
                </p>
              </div>

              <div>
                <span className={legendCls}>Étaler le paiement à 0 %</span>
                {isFinanceable(r.totalTTC) && durations.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {durations.map((m) => (
                        <button
                          key={m}
                          type="button"
                          aria-pressed={months === m}
                          onClick={() => set("financeMonths", m)}
                          className={cn(cardCls(months === m), "px-4 py-2 text-center")}
                        >
                          <span className="block font-semibold text-mp-green-deep">{m} mois</span>
                          <span className="block text-sm text-mp-ink-soft">
                            {eur(monthly0(r.totalTTC, m) ?? 0)}/mois
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 rounded-xl border border-mp-orange-flame/30 bg-mp-orange-light/30 p-4">
                      <span className="block text-2xl font-semibold text-mp-green-deep">
                        {monthly != null ? `${eur(monthly)}/mois` : "—"}
                      </span>
                      <span className="mt-1 block text-sm text-mp-ink-soft">
                        sur {months} mois, TAEG 0 %, pour {eur(r.totalTTC)} TTC. {FIN_NOTE}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="rounded-xl border border-mp-sand/40 bg-mp-cream p-4 text-sm text-mp-ink-soft">
                    Le financement s&apos;applique de 200 à 50 000 €. Choisissez d&apos;abord votre
                    poêle à l&apos;étape précédente pour voir la mensualité.
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-mp-ink-soft">
                  <strong className="text-mp-ink">{SLOGAN_CREDIT}</strong> {FIN_LEGAL}
                </p>
              </div>
            </>
          )}

          {/* ---------- 6. Coordonnées ---------- */}
          {step === 6 && (
            <>
              <h2 className="mb-2 text-2xl font-semibold text-mp-green-deep md:text-3xl">
                Où vous envoyons-nous cette estimation ?
              </h2>
              <p className="mb-6 text-mp-ink-soft">
                Nous vous rappelons sous 48h ouvrées pour caler la visite technique. Pas de spam, pas
                de vente forcée.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="est-cp" className="mb-2 block text-sm font-medium text-mp-ink">
                      Code postal <span className="text-mp-orange-flame">*</span>
                    </label>
                    <input
                      id="est-cp"
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={customer.postalCode}
                      onChange={(e) =>
                        setCustomer({ ...customer, postalCode: e.target.value.replace(/[^0-9]/g, "") })
                      }
                      className={inputCls}
                      placeholder="5380"
                      autoComplete="postal-code"
                    />
                  </div>
                  <div>
                    <label htmlFor="est-delay" className="mb-2 block text-sm font-medium text-mp-ink">
                      Délai souhaité <span className="text-mp-orange-flame">*</span>
                    </label>
                    <select
                      id="est-delay"
                      required
                      value={customer.delay}
                      onChange={(e) =>
                        setCustomer({ ...customer, delay: e.target.value as Customer["delay"] })
                      }
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
                  </div>
                </div>
                <div>
                  <label htmlFor="est-name" className="mb-2 block text-sm font-medium text-mp-ink">
                    Nom complet <span className="text-mp-orange-flame">*</span>
                  </label>
                  <input
                    id="est-name"
                    type="text"
                    required
                    minLength={2}
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className={inputCls}
                    placeholder="Sophie Dupont"
                    autoComplete="name"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="est-email" className="mb-2 block text-sm font-medium text-mp-ink">
                      Email <span className="text-mp-orange-flame">*</span>
                    </label>
                    <input
                      id="est-email"
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className={inputCls}
                      placeholder="sophie@exemple.be"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="est-phone" className="mb-2 block text-sm font-medium text-mp-ink">
                      Téléphone <span className="text-mp-orange-flame">*</span>
                      <span className="ml-1 text-xs font-normal text-mp-ink-soft">(BE uniquement)</span>
                    </label>
                    <input
                      id="est-phone"
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className={inputCls}
                      placeholder="0470 12 34 56"
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="est-message" className="mb-2 block text-sm font-medium text-mp-ink">
                    Précisions (optionnel)
                  </label>
                  <textarea
                    id="est-message"
                    rows={3}
                    value={customer.message}
                    onChange={(e) => setCustomer({ ...customer, message: e.target.value })}
                    className={cn(inputCls, "resize-y")}
                    placeholder="Accès particulier, projet en cours, contraintes de planning…"
                  />
                </div>
                <label
                  htmlFor="est-consent"
                  className="flex cursor-pointer items-start gap-3 text-sm text-mp-ink-soft"
                >
                  <input
                    id="est-consent"
                    type="checkbox"
                    required
                    checked={customer.consent}
                    onChange={(e) => setCustomer({ ...customer, consent: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-mp-sand text-mp-orange-flame focus:ring-mp-orange-flame"
                  />
                  <span>
                    J&apos;accepte que mes données soient utilisées pour me recontacter,
                    conformément à la{" "}
                    <a
                      href="/politique-confidentialite"
                      className="text-mp-orange-flame underline hover:no-underline"
                    >
                      politique de confidentialité
                    </a>
                    .
                  </span>
                </label>
              </div>
            </>
          )}

          {submitState === "error" && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="border-t border-mp-sand/40 bg-mp-cream px-4 py-5 sm:px-6 md:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Button
              variant="ghost"
              size="default"
              onClick={prev}
              disabled={step === 1 || submitState === "loading"}
              className={cn("w-full justify-center sm:w-auto", step === 1 && "invisible h-0 sm:h-auto")}
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="primary"
              size="default"
              onClick={next}
              disabled={!canGoNext() || submitState === "loading"}
              className="w-full justify-center sm:w-auto"
            >
              {submitState === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi…
                </>
              ) : step === STEP_COUNT ? (
                <>
                  Recevoir mon estimation <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Suivant <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {step === 3 && !s.productKey && (
            <p className="mt-3 text-center text-sm text-mp-ink-soft sm:text-right">
              Sélectionnez un modèle pour continuer.
            </p>
          )}
        </div>
      </div>

      {/* ============ Colonne récapitulatif ============ */}
      <aside className="rounded-3xl border border-mp-sand/40 bg-white p-6 shadow-md lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
          Votre estimation
        </p>
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
          Besoin estimé : {needKw.toString().replace(".", ",")} kW pour {s.surface} m²
          {r.wellSized === false && product && (
            <>
              {" "}
              — le {product.powerKw.toString().replace(".", ",")} kW s&apos;en éloigne, nous
              validerons ce point à la visite.
            </>
          )}
        </div>

        <dl className="mt-5 space-y-1 border-t border-mp-sand/40 pt-4 text-sm">
          <Row
            label={product ? `Poêle ${product.brand}` : "Poêle"}
            value={r.materialHT > 0 ? eur(r.materialHT) : "—"}
          />
          {r.laborLines.map((l) => (
            <Row key={l.key} label={l.label} value={eur(l.amountHT)} muted />
          ))}
          <Row label={`TVA ${Math.round(r.vatRate * 100)} %`} value={eur(r.vatAmount)} muted />
        </dl>

        <div className="mt-4 flex items-end justify-between border-t border-mp-sand/40 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
            Total TTC posé
          </span>
          <span className="text-2xl font-semibold text-mp-green-deep">{eur(r.totalTTC)}</span>
        </div>

        {r.prime > 0 && (
          <div className="mt-2 flex items-end justify-between text-sm">
            <span className="text-mp-ink-soft">
              Après prime estimée ({eur(r.prime)})
            </span>
            <span className="font-semibold text-mp-green-light">{eur(r.netAfterPrime)}</span>
          </div>
        )}

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
        </p>
        {monthly != null && (
          <p className="mt-2 text-[11px] leading-relaxed text-mp-ink-soft/80">
            <strong className="text-mp-ink-soft">{SLOGAN_CREDIT}</strong> {FIN_LEGAL}
          </p>
        )}
      </aside>
    </div>
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
