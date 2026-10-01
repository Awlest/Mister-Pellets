"use client";

import * as React from "react";
import { EVENTS, trackEvent } from "@/lib/analytics";
import {
  Calendar,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { bookingCalendarEntry, googleCalendarUrl, icsDownloadPath } from "@/lib/booking-calendar";

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
const WEEKDAYS_SHORT = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** « 2026-09-15 » → jour de la semaine, quantième et mois (0 = janvier). */
function dayParts(iso: string): { weekday: number; day: number; month: number } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, 12));
  return { weekday: date.getUTCDay(), day: d ?? 1, month: (m ?? 1) - 1 };
}

/** « 1er » pour le premier du mois, comme on l'écrit en français. */
function dayNumber(day: number): string {
  return day === 1 ? "1er" : String(day);
}

/** « 2026-09-15 » → « mardi 15 septembre ». */
function humanDay(iso: string): string {
  const p = dayParts(iso);
  return `${WEEKDAYS[p.weekday]} ${dayNumber(p.day)} ${MONTHS[p.month]}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Jours affichés : « Du 8 au 15 octobre », « Du 29 octobre au 5 novembre ». */
function rangeLabel(first: string, last: string): string {
  const a = dayParts(first);
  const b = dayParts(last);
  if (first === last) return `Le ${dayNumber(a.day)} ${MONTHS[a.month]}`;
  if (a.month === b.month) return `Du ${dayNumber(a.day)} au ${dayNumber(b.day)} ${MONTHS[b.month]}`;
  return `Du ${dayNumber(a.day)} ${MONTHS[a.month]} au ${dayNumber(b.day)} ${MONTHS[b.month]}`;
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`;
}

/*
 * Bandeau des jours : il n'affiche que des jours ENTIERS, autant que la carte
 * en contient (3 à 7), et des flèches mènent aux suivants. Il défilait
 * auparavant en largeur dans un <fieldset> qui, par défaut, refuse de
 * rétrécir sous la largeur de son contenu : toute l'étape s'élargissait à
 * 1 750 px et les jours, puis les horaires, sortaient de la carte, coupés par
 * le bord de l'écran. Sur mobile, on ne voyait que 2 jours sur 13 et aucun
 * moyen d'aller plus loin (constaté en prod le 01/10/2026).
 */
const DAY_MIN_WIDTH = 64; // px
const DAY_GAP = 8; // px, soit gap-2
const DAYS_PER_PAGE_MIN = 3;
const DAYS_PER_PAGE_MAX = 7;
const SWIPE_MIN_PX = 48;

function daysPerPage(width: number): number {
  if (width <= 0) return 4;
  const fit = Math.floor((width + DAY_GAP) / (DAY_MIN_WIDTH + DAY_GAP));
  return Math.min(DAYS_PER_PAGE_MAX, Math.max(DAYS_PER_PAGE_MIN, fit));
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
  const [confirmed, setConfirmed] = React.useState<{
    date: string;
    time: string;
    start: number;
    durationMin: number;
  } | null>(null);

  // Largeur disponible pour le bandeau des jours, et sens du dernier
  // changement de page (pour l'animation : -1 recul, 1 avance).
  const [stripWidth, setStripWidth] = React.useState(0);
  const [slideDir, setSlideDir] = React.useState<-1 | 0 | 1>(0);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);

  const measureStrip = React.useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    setStripWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStripWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        setSlideDir(0);
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
      setConfirmed({
        date: data.date,
        time: data.time,
        start: chosenStart,
        durationMin: typeof data.durationMin === "number" ? data.durationMin : 60,
      });
      trackEvent(EVENTS.rdvReserve, { service: serviceSlug, date: data.date });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Confirmation ----------
  if (confirmed) {
    const entry = service ? bookingCalendarEntry(service, confirmed.start, confirmed.durationMin) : null;
    return (
      <Card className="mx-auto max-w-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mp-orange-light text-mp-orange-flame">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-semibold text-mp-green-deep mb-2">
          Rendez-vous confirmé
        </h3>
        <p className="text-mp-ink-soft leading-relaxed max-w-md mx-auto">
          {service?.name} le <strong className="text-mp-green-deep">{humanDay(confirmed.date)}</strong>{" "}
          à <strong className="text-mp-green-deep">{confirmed.time}</strong>. La confirmation
          vient de partir à <strong className="text-mp-green-deep wrap-break-word">{form.email}</strong>.
        </p>
        <p className="text-sm text-mp-ink-soft mt-2 max-w-md mx-auto">
          Rien reçu d&apos;ici quelques minutes ? Regardez dans les courriers indésirables.
        </p>

        {entry && service && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-mp-green-deep mb-3">Ajoutez-le à votre agenda</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="outline" size="default">
                <a href={googleCalendarUrl(entry)} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus aria-hidden />
                  Google Agenda
                </a>
              </Button>
              <Button asChild variant="outline" size="default">
                <a href={icsDownloadPath(service.slug, confirmed.start)} download>
                  <Download aria-hidden />
                  Apple, Outlook (.ics)
                </a>
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-mp-ink-soft mt-6">
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
      <Card className="mx-auto max-w-3xl p-8">
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
  const chosenTime = activeTimes.find((t) => t.start === chosenStart);

  // Page de jours affichée : celle qui contient le jour actif. Changer de
  // page sélectionne son premier jour, pour que les horaires affichés
  // dessous appartiennent toujours à un jour visible.
  const perPage = daysPerPage(stripWidth);
  const activeIndex = Math.max(0, days?.findIndex((d) => d.date === activeDay) ?? 0);
  const pageStart = Math.floor(activeIndex / perPage) * perPage;
  const visibleDays = days?.slice(pageStart, pageStart + perPage) ?? [];
  const hasPages = (days?.length ?? 0) > perPage;
  const canPrev = pageStart > 0;
  const canNext = pageStart + perPage < (days?.length ?? 0);

  function goToPage(direction: -1 | 1) {
    if (!days || (direction === -1 ? !canPrev : !canNext)) return;
    const target = days[pageStart + direction * perPage];
    if (!target) return;
    setSlideDir(direction);
    setActiveDay(target.date);
    setChosenStart(null);
  }

  function onTouchEnd(e: React.TouchEvent) {
    const from = touchStart.current;
    touchStart.current = null;
    const touch = e.changedTouches[0];
    if (!from || !touch) return;
    const dx = touch.clientX - from.x;
    const dy = touch.clientY - from.y;
    // Geste horizontal franc seulement : un défilement de la page qui
    // dévie un peu ne doit pas changer de semaine.
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    goToPage(dx < 0 ? 1 : -1);
  }

  const navButton = (direction: -1 | 1) => {
    const enabled = direction === -1 ? canPrev : canNext;
    const Icon = direction === -1 ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        onClick={() => goToPage(direction)}
        // aria-disabled plutôt que disabled : un bouton désactivé perd le
        // focus, et l'utilisateur au clavier se retrouverait en haut de page.
        aria-disabled={!enabled}
        aria-label={direction === -1 ? "Jours précédents" : "Jours suivants"}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame focus-visible:ring-offset-2 focus-visible:ring-offset-mp-cream",
          enabled
            ? "border-mp-sand text-mp-green-deep hover:border-mp-orange-flame hover:text-mp-orange-flame"
            : "cursor-not-allowed border-mp-sand/50 text-mp-ink-soft/40",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </button>
    );
  };

  return (
    <Card className="mx-auto max-w-3xl p-6 md:p-8">
      {/* Étape 1 — service */}
      <fieldset className="mb-7 min-w-0">
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

      {/* Étape 2 — créneau. min-w-0 : sans lui, le fieldset prend la largeur
        * de son contenu au lieu de celle de la carte (cf. plus haut). */}
      <fieldset className="mb-7 min-w-0">
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
            <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
              <p className="min-w-0 text-sm font-semibold text-mp-ink" aria-live="polite">
                {visibleDays.length > 0 &&
                  rangeLabel(visibleDays[0]!.date, visibleDays[visibleDays.length - 1]!.date)}
              </p>
              {hasPages && (
                <div className="flex shrink-0 gap-2">
                  {navButton(-1)}
                  {navButton(1)}
                </div>
              )}
            </div>

            <div
              ref={measureStrip}
              role="group"
              aria-label="Jours disponibles"
              className="overflow-hidden touch-pan-y touch-pinch-zoom"
              onTouchStart={(e) => {
                const t = e.touches[0];
                touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
              }}
              onTouchEnd={onTouchEnd}
            >
              <div
                key={pageStart}
                className={cn(
                  "grid gap-2",
                  slideDir === 1 && "motion-safe:animate-[mp-days-next_220ms_ease-out]",
                  slideDir === -1 && "motion-safe:animate-[mp-days-prev_220ms_ease-out]",
                )}
                style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
              >
                {visibleDays.map((d) => {
                  const p = dayParts(d.date);
                  const active = activeDay === d.date;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => { setActiveDay(d.date); setChosenStart(null); }}
                      aria-pressed={active}
                      aria-label={`${humanDay(d.date)}, ${plural(d.times.length, "créneau libre", "créneaux libres")}`}
                      className={cn(
                        "flex min-h-[4.75rem] flex-col items-center justify-center rounded-xl border px-1 py-2 transition-colors",
                        // Anneau de focus à l'intérieur : le bandeau masque ce
                        // qui dépasse, pour l'animation de changement de page.
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mp-orange-flame",
                        active
                          ? "border-mp-green-deep bg-mp-green-deep text-mp-cream"
                          : "border-mp-sand bg-white text-mp-ink hover:border-mp-orange-warm",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-wide",
                          active ? "text-mp-cream/85" : "text-mp-ink-soft",
                        )}
                      >
                        {WEEKDAYS_SHORT[p.weekday]}
                      </span>
                      <span aria-hidden className="font-display text-xl font-semibold leading-tight tabular-nums">
                        {p.day}
                      </span>
                      <span aria-hidden className={cn("text-xs", active ? "text-mp-cream/85" : "text-mp-ink-soft")}>
                        {MONTHS_SHORT[p.month]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeDay && (
              <div className="mt-5">
                <p className="mb-2.5 text-sm text-mp-ink-soft">
                  <span className="font-semibold text-mp-green-deep">{capitalize(humanDay(activeDay))}</span>
                  {" · "}
                  {plural(activeTimes.length, "créneau libre", "créneaux libres")}
                </p>
                <div
                  role="group"
                  aria-label={`Horaires du ${humanDay(activeDay)}`}
                  className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2"
                >
                  {activeTimes.map((t) => (
                    <button
                      key={t.start}
                      type="button"
                      onClick={() => setChosenStart(t.start)}
                      aria-pressed={chosenStart === t.start}
                      className={cn(
                        "min-h-11 rounded-lg border px-2 py-2 text-sm tabular-nums transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame",
                        chosenStart === t.start
                          ? "border-mp-orange-flame bg-mp-orange-flame text-white font-semibold"
                          : "border-mp-sand bg-white text-mp-ink hover:border-mp-orange-warm",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </fieldset>

      {/* Étape 3 — coordonnées */}
      <form onSubmit={submit}>
        <fieldset disabled={chosenStart == null} className={cn("min-w-0", chosenStart == null && "opacity-45")}>
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

          {/* Rappel du créneau juste avant l'envoi : le client relit ce qu'il
            * réserve sans remonter jusqu'au bandeau des jours. */}
          {activeDay && chosenTime && (
            <p className="mt-5 rounded-xl border border-mp-sand bg-mp-beige px-4 py-3 text-sm text-mp-ink">
              Votre créneau :{" "}
              <strong className="text-mp-green-deep">
                {humanDay(activeDay)} à {chosenTime.label}
              </strong>
              {service && (
                <>, {service.durationLabel}, {service.location === "domicile" ? "à domicile" : "au showroom"}</>
              )}
              .
            </p>
          )}

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
