"use client";

import * as React from "react";
import { Calendar, Check, Loader2, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OnlineService {
  slug: string;
  name: string;
  durationLabel: string;
  location: "domicile" | "showroom";
}

interface DaySlots {
  date: string;
  times: Array<{ start: number; label: string }>;
}

interface Props {
  services: OnlineService[];
  phoneDisplay: string;
  phoneHref: string;
}

const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** « 2026-09-15 » → « mardi 15 septembre ». */
function humanDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, 12));
  return `${WEEKDAYS[date.getUTCDay()]} ${d} ${MONTHS[(m ?? 1) - 1]}`;
}

/**
 * Réservation d'un rendez-vous commercial, adossée à l'agenda de Dorian.
 *
 * Trois étapes : le service, puis le créneau, puis les coordonnées. Les
 * créneaux affichés viennent de l'agenda réel, mais ne font pas foi : le
 * serveur revalide la disponibilité au moment de l'envoi, et cette interface
 * doit savoir afficher proprement le cas « créneau pris entre-temps ».
 */
export function BookingWidget({ services, phoneDisplay, phoneHref }: Props) {
  const [serviceSlug, setServiceSlug] = React.useState<string>(services[0]?.slug ?? "");
  const [days, setDays] = React.useState<DaySlots[] | null>(null);
  const [configured, setConfigured] = React.useState(true);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [slotsError, setSlotsError] = React.useState<string | null>(null);

  const [activeDay, setActiveDay] = React.useState<string | null>(null);
  const [chosenStart, setChosenStart] = React.useState<number | null>(null);

  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", address: "", notes: "", website: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState<{ date: string; time: string } | null>(null);

  const service = services.find((s) => s.slug === serviceSlug);

  // Remise à zéro PENDANT LE RENDU quand le service change, et non dans un
  // effet : c'est le motif recommandé par React pour réagir à un changement
  // d'entrée, et ça évite le rendu en cascade que provoquerait un setState
  // synchrone dans un useEffect.
  const [loadedFor, setLoadedFor] = React.useState<string | null>(null);
  // Incrémenté pour forcer un rechargement des créneaux à service constant
  // (cas « ce créneau vient d'être pris »).
  const [reloadToken, setReloadToken] = React.useState(0);
  if (serviceSlug !== loadedFor) {
    setLoadedFor(serviceSlug);
    setDays(null);
    setActiveDay(null);
    setChosenStart(null);
    setSlotsError(null);
    setLoadingSlots(Boolean(serviceSlug));
  }

  React.useEffect(() => {
    if (!serviceSlug) return;
    // Sans annulation, changer de service deux fois de suite pouvait laisser
    // la réponse la plus lente écraser la plus récente : les créneaux affichés
    // n'auraient plus correspondu au service sélectionné.
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/rdv/slots?service=${encodeURIComponent(serviceSlug)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur inattendue.");
        if (controller.signal.aborted) return;
        setConfigured(data.configured !== false);
        setDays(data.days ?? []);
        setActiveDay(data.days?.[0]?.date ?? null);
      } catch (e) {
        if (controller.signal.aborted) return;
        setSlotsError(e instanceof Error ? e.message : "Erreur inattendue.");
      } finally {
        if (!controller.signal.aborted) setLoadingSlots(false);
      }
    })();
    return () => controller.abort();
  }, [serviceSlug, reloadToken]);

  const update = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const needsAddress = service?.location === "domicile";
  const formValid =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    (!needsAddress || form.address.trim().length >= 5);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || chosenStart == null || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/rdv/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: serviceSlug, start: chosenStart, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "SLOT_TAKEN") {
          setChosenStart(null);
          setDays(null);
          setActiveDay(null);
          setLoadingSlots(true);
          setReloadToken((t) => t + 1);
        }
        throw new Error(data.error ?? "La réservation n'a pas abouti.");
      }
      setConfirmed({ date: data.date, time: data.time });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Confirmation ----------
  if (confirmed) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mp-orange-light text-mp-orange-flame">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-semibold text-mp-green-deep mb-2">
          Rendez-vous confirmé
        </h3>
        <p className="text-mp-ink-soft leading-relaxed max-w-md mx-auto">
          {service?.name} le <strong className="text-mp-green-deep">{humanDay(confirmed.date)}</strong>{" "}
          à <strong className="text-mp-green-deep">{confirmed.time}</strong>. Vous recevez
          l&apos;invitation par email, avec la possibilité de l&apos;ajouter à votre agenda.
        </p>
        <p className="text-sm text-mp-ink-soft mt-4">
          Un imprévu ? Appelez le{" "}
          <a href={phoneHref} className="text-mp-orange-flame underline hover:no-underline font-semibold">
            {phoneDisplay}
          </a>
          .
        </p>
      </Card>
    );
  }

  // ---------- Réservation indisponible ----------
  if (!configured || (slotsError && !days)) {
    return (
      <Card className="p-8">
        <h3 className="text-xl font-semibold text-mp-green-deep mb-2">
          Réservation en ligne indisponible
        </h3>
        <p className="text-mp-ink-soft leading-relaxed mb-5">
          {slotsError ??
            "La prise de rendez-vous en ligne n'est pas encore active. On cale votre créneau par téléphone, c'est immédiat."}
        </p>
        <Button asChild variant="primary" size="lg">
          <a href={phoneHref}>
            <Phone className="h-4 w-4" />
            {phoneDisplay}
          </a>
        </Button>
      </Card>
    );
  }

  const activeTimes = days?.find((d) => d.date === activeDay)?.times ?? [];

  return (
    <Card className="p-6 md:p-8">
      {/* Étape 1 — service */}
      <fieldset className="mb-7">
        <legend className="text-sm font-semibold text-mp-green-deep mb-3">
          1. Quel type de rendez-vous&nbsp;?
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setServiceSlug(s.slug)}
              aria-pressed={serviceSlug === s.slug}
              className={cn(
                "text-left rounded-xl border px-4 py-3 transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame",
                serviceSlug === s.slug
                  ? "border-mp-orange-flame bg-mp-orange-light/40"
                  : "border-mp-sand hover:border-mp-orange-warm",
              )}
            >
              <span className="block font-semibold text-mp-green-deep">{s.name}</span>
              <span className="block text-xs text-mp-ink-soft mt-0.5">
                {s.durationLabel} · {s.location === "domicile" ? "À domicile" : "Au showroom"}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Étape 2 — créneau */}
      <fieldset className="mb-7">
        <legend className="text-sm font-semibold text-mp-green-deep mb-3">
          2. Choisissez un créneau
        </legend>

        {loadingSlots && (
          <p className="flex items-center gap-2 text-sm text-mp-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Lecture des disponibilités…
          </p>
        )}

        {!loadingSlots && days && days.length === 0 && (
          <p className="text-sm text-mp-ink-soft">
            Aucun créneau libre dans les 30 prochains jours. Appelez le{" "}
            <a href={phoneHref} className="text-mp-orange-flame underline hover:no-underline font-semibold">
              {phoneDisplay}
            </a>
            , on trouvera une solution.
          </p>
        )}

        {!loadingSlots && days && days.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => { setActiveDay(d.date); setChosenStart(null); }}
                  aria-pressed={activeDay === d.date}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame",
                    activeDay === d.date
                      ? "border-mp-green-deep bg-mp-green-deep text-mp-cream"
                      : "border-mp-sand text-mp-ink hover:border-mp-orange-warm",
                  )}
                >
                  {humanDay(d.date)}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {activeTimes.map((t) => (
                <button
                  key={t.start}
                  type="button"
                  onClick={() => setChosenStart(t.start)}
                  aria-pressed={chosenStart === t.start}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm tabular-nums transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame",
                    chosenStart === t.start
                      ? "border-mp-orange-flame bg-mp-orange-flame text-white font-semibold"
                      : "border-mp-sand text-mp-ink hover:border-mp-orange-warm",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}
      </fieldset>

      {/* Étape 3 — coordonnées */}
      <form onSubmit={submit}>
        <fieldset disabled={chosenStart == null} className={cn(chosenStart == null && "opacity-45")}>
          <legend className="text-sm font-semibold text-mp-green-deep mb-3">
            3. Vos coordonnées
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="bk-name" className="block text-sm font-medium mb-1.5">
                Nom complet <span className="text-mp-orange-flame">*</span>
              </label>
              <input
                id="bk-name" required value={form.name} autoComplete="name"
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-xl border border-mp-sand bg-white px-4 py-2.5 outline-none focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20"
              />
            </div>
            <div>
              <label htmlFor="bk-email" className="block text-sm font-medium mb-1.5">
                Email <span className="text-mp-orange-flame">*</span>
              </label>
              <input
                id="bk-email" type="email" required value={form.email} autoComplete="email"
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border border-mp-sand bg-white px-4 py-2.5 outline-none focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20"
              />
            </div>
            <div>
              <label htmlFor="bk-phone" className="block text-sm font-medium mb-1.5">
                Téléphone
              </label>
              <input
                id="bk-phone" type="tel" value={form.phone} autoComplete="tel"
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-xl border border-mp-sand bg-white px-4 py-2.5 outline-none focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20"
              />
            </div>
            {needsAddress && (
              <div className="sm:col-span-2">
                <label htmlFor="bk-address" className="block text-sm font-medium mb-1.5">
                  Adresse de la visite <span className="text-mp-orange-flame">*</span>
                </label>
                <input
                  id="bk-address" required value={form.address} autoComplete="street-address"
                  placeholder="Rue, numéro, code postal, commune"
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full rounded-xl border border-mp-sand bg-white px-4 py-2.5 outline-none focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20"
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label htmlFor="bk-notes" className="block text-sm font-medium mb-1.5">
                Votre projet en deux mots
              </label>
              <textarea
                id="bk-notes" rows={3} value={form.notes}
                placeholder="Surface à chauffer, conduit existant ou non, modèle qui vous intéresse…"
                onChange={(e) => update("notes", e.target.value)}
                className="w-full rounded-xl border border-mp-sand bg-white px-4 py-2.5 outline-none focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20"
              />
            </div>
          </div>

          {/* Piège à robots : invisible, jamais rempli par un humain. */}
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off"
            aria-hidden="true" value={form.website}
            onChange={(e) => update("website", e.target.value)}
            className="absolute left-[-9999px] h-px w-px opacity-0"
          />

          {submitError && (
            <p className="mt-4 rounded-xl bg-mp-orange-light/60 border border-mp-orange-flame/30 px-4 py-3 text-sm text-mp-ink">
              {submitError}
            </p>
          )}

          <Button
            type="submit" variant="primary" size="lg"
            className="w-full justify-center mt-5"
            disabled={!formValid || submitting}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Réservation…</>
            ) : (
              <><Calendar className="h-4 w-4" />Confirmer le rendez-vous</>
            )}
          </Button>
        </fieldset>
      </form>

      {chosenStart == null && (
        <p className="mt-4 flex items-center gap-2 text-sm text-mp-ink-soft">
          <ArrowLeft className="h-4 w-4" />
          Choisissez d&apos;abord un créneau ci-dessus.
        </p>
      )}
    </Card>
  );
}
