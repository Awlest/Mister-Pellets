"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TIME_ZONE = "Europe/Brussels";
/** Espace insécable : « 11 h 30 » ne se coupe pas en fin de ligne. */
const NBSP = "\u00a0";

/** Jour civil belge « AAAA-MM-JJ » d'un instant. */
function dayKey(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(ms);
}

/** « demain à 11 h 30 », « jeudi 29 octobre à 9 h », « lundi 1er décembre à 16 h 30 ». */
function slotLabel(start: number, now: number): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("fr-BE", {
      timeZone: TIME_ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(start)
      .map((p) => [p.type, p.value]),
  );
  const hour = `${Number(parts.hour)}${NBSP}h`;
  const time = parts.minute === "00" ? hour : `${hour}${NBSP}${parts.minute}`;
  if (dayKey(start) === dayKey(now + 86_400_000)) return `demain à ${time}`;
  const day = parts.day === "1" ? "1er" : parts.day;
  return `${parts.weekday} ${day} ${parts.month} à ${time}`;
}

/**
 * Prochain créneau libre d'un service réservable en ligne, lu dans l'agenda
 * (/api/rdv/slots) une fois la page affichée. Accroche d'un bouton vers
 * l'agenda : il ne réserve rien. Tant que la réponse n'est pas là, ou si
 * l'agenda est vide, injoignable ou non configuré, la phrase générique reste :
 * même hauteur, pas de saut de mise en page.
 */
export function NextSlot({ service, className }: { service: string; className?: string }) {
  const [label, setLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/rdv/slots?service=${encodeURIComponent(service)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { days?: Array<{ times?: Array<{ start: number }> }> } | null) => {
        const first = data?.days?.[0]?.times?.[0];
        if (first) setLabel(slotLabel(first.start, Date.now()));
      })
      .catch(() => {
        // Réseau coupé ou page quittée : la phrase générique suffit.
      });
    return () => controller.abort();
  }, [service]);

  return (
    <p className={cn("text-sm text-mp-ink-soft", className)} aria-live="polite">
      {label ? (
        <>
          Prochain créneau libre :{" "}
          <strong className="font-semibold text-mp-green-deep">{label}</strong>
        </>
      ) : (
        "Créneaux du lundi au vendredi, directement dans notre agenda."
      )}
    </p>
  );
}
