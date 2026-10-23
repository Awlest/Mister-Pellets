"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENTS, trackEvent } from "@/lib/analytics";
import { isValidBelgianPhone } from "@/lib/callback";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/services";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";
type Field = "name" | "phone" | "consent";

/**
 * Origine de la visite, lue dans l'adresse de la page d'arrivée : campagne
 * (utm_campaign) et clic d'annonce (gclid). Sert à relier une demande à
 * Google Ads, ce que les autres formulaires ne permettent pas.
 */
function readOrigin(): string {
  const q = new URLSearchParams(window.location.search);
  const parts: string[] = [];
  const source = q.get("utm_source");
  const campaign = q.get("utm_campaign");
  if (q.has("gclid") || q.has("gbraid") || q.has("wbraid")) parts.push("Google Ads");
  else if (source) parts.push(source);
  if (campaign) parts.push(`campagne ${campaign}`);
  return parts.join(", ");
}

/**
 * Demande de rappel courte (/prix-poele-pellets) : le nom et le téléphone,
 * pour le visiteur venu d'une annonce « prix » sur son téléphone. Le
 * technicien pose ses questions en rappelant ; le chiffrage complet reste
 * dans /estimation.
 */
export function CallbackForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [serverError, setServerError] = React.useState("");
  const [errors, setErrors] = React.useState<Partial<Record<Field, string>>>({});
  const originRef = React.useRef("");

  React.useEffect(() => {
    originRef.current = readOrigin();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim();

    const next: Partial<Record<Field, string>> = {};
    if (value("name").length < 2) next.name = "Indiquez votre nom.";
    if (!isValidBelgianPhone(value("phone"))) next.phone = "Numéro belge, par exemple 0470 12 34 56.";
    if (data.get("consent") !== "on") next.consent = "Cochez la case pour qu'on puisse vous rappeler.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }

    setStatus("loading");
    setServerError("");
    try {
      const res = await fetch("/api/rappel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          phone: value("phone"),
          origin: originRef.current,
          consent: true,
          website: data.get("website"),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Envoi impossible. Appelez-nous au ${PHONE_DISPLAY}.`);
      }
      trackEvent(EVENTS.formulaireDevis, { source: "rappel-prix" });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : `Envoi impossible. Appelez-nous au ${PHONE_DISPLAY}.`);
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-[20px] border border-mp-green-light/40 bg-mp-green-light/15 p-6 text-mp-green-deep md:p-8"
      >
        <h3 className="mb-2 text-2xl font-semibold">C&apos;est noté, on vous rappelle</h3>
        <p className="leading-relaxed">
          Un technicien vous appelle dans la journée ouvrée pour vous donner un prix et fixer, si
          vous le souhaitez, la visite technique gratuite. Pressé ? Appelez directement le{" "}
          <a href={PHONE_HREF} className="font-semibold underline hover:no-underline">
            {PHONE_DISPLAY}
          </a>
          .
        </p>
      </div>
    );
  }

  const disabled = status === "loading";
  const inputClass = (field: Field) =>
    cn(
      "w-full rounded-xl border bg-white px-4 py-3 text-base text-mp-ink outline-none transition-colors",
      "placeholder:text-mp-ink-soft/60 focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20",
      "disabled:cursor-not-allowed disabled:bg-mp-beige/50",
      errors[field] ? "border-mp-orange-ink" : "border-mp-sand",
    );
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`rappel-${field}-error`} className="mt-1.5 text-sm text-mp-orange-ink">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `rappel-${field}-error` : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="rappel-website">Ne pas remplir ce champ</label>
        <input id="rappel-website" type="text" name="website" autoComplete="off" tabIndex={-1} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rappel-name" className="mb-2 block text-sm font-medium text-mp-ink">
            Nom
          </label>
          <input
            id="rappel-name"
            name="name"
            type="text"
            autoComplete="name"
            disabled={disabled}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={inputClass("name")}
          />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="rappel-phone" className="mb-2 block text-sm font-medium text-mp-ink">
            Téléphone
          </label>
          <input
            id="rappel-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0470 12 34 56"
            disabled={disabled}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            className={inputClass("phone")}
          />
          {errorText("phone")}
        </div>
      </div>

      <div>
        <label htmlFor="rappel-consent" className="flex cursor-pointer items-start gap-3 text-sm text-mp-ink-soft">
          <input
            id="rappel-consent"
            name="consent"
            type="checkbox"
            disabled={disabled}
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("consent")}
            className="mt-1 h-4 w-4 rounded border-mp-sand accent-mp-orange-flame"
          />
          <span>
            J&apos;accepte que mes données soient utilisées pour me recontacter, conformément à la{" "}
            <a href="/politique-confidentialite" className="text-mp-orange-ink underline hover:no-underline">
              politique de confidentialité
            </a>
            .
          </span>
        </label>
        {errorText("consent")}
      </div>

      {status === "error" && serverError ? (
        <p role="alert" className="rounded-xl border border-mp-orange-ink/40 bg-mp-orange-light/40 p-4 text-sm text-mp-ink">
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" variant="primary" size="lg" disabled={disabled} className="w-full sm:w-auto">
          {disabled ? "Envoi…" : "Être rappelé avec un prix"}
        </Button>
        <a
          href={PHONE_HREF}
          className="inline-flex min-h-11 items-center justify-center gap-2 text-base font-semibold text-mp-green-deep underline-offset-4 hover:underline"
        >
          <Phone className="h-4 w-4" aria-hidden />
          ou appelez le {PHONE_DISPLAY}
        </a>
      </div>
    </form>
  );
}
