"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type State = "idle" | "loading" | "success" | "error";

const SUBJECTS = [
  { value: "info-produit", label: "Question sur un produit" },
  { value: "info-pose", label: "Question sur la pose ou l'installation" },
  { value: "info-primes", label: "Question sur les primes Wallonie" },
  { value: "info-entretien", label: "Question sur l'entretien" },
  { value: "info-other", label: "Autre" },
];

export function ContactForm() {
  const [state, setState] = React.useState<State>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      consent: formData.get("consent") === "on",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Une erreur est survenue. Réessaie ou téléphone-nous.");
      }

      setState("success");
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "Erreur inconnue.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl bg-mp-green-light/15 border border-mp-green-light/40 p-8 text-mp-green-deep">
        <h3 className="text-2xl font-semibold mb-2">Message reçu, merci !</h3>
        <p className="leading-relaxed">
          On revient vers toi dans la journée pendant les heures ouvrées. Si c'est urgent, tu peux
          aussi appeler le 0472 04 32 22.
        </p>
        <Button variant="outline" size="default" className="mt-6" onClick={() => setState("idle")}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  const inputClass = cn(
    "w-full rounded-xl border border-mp-sand bg-white px-4 py-3 text-mp-ink",
    "placeholder:text-mp-ink-soft/60 outline-none transition-colors",
    "focus:border-mp-orange-flame focus:ring-2 focus:ring-mp-orange-flame/20",
    "disabled:bg-mp-beige/50 disabled:cursor-not-allowed"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-mp-ink mb-2">
            Nom complet <span className="text-mp-orange-flame">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={state === "loading"}
            className={inputClass}
            placeholder="Sophie Dupont"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-mp-ink mb-2">
            Email <span className="text-mp-orange-flame">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={state === "loading"}
            className={inputClass}
            placeholder="sophie@exemple.be"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-mp-ink mb-2">
            Téléphone (optionnel)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            disabled={state === "loading"}
            className={inputClass}
            placeholder="0470 12 34 56"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-mp-ink mb-2">
            Sujet <span className="text-mp-orange-flame">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            required
            disabled={state === "loading"}
            className={inputClass}
            defaultValue=""
          >
            <option value="" disabled>
              Choisis un sujet…
            </option>
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-mp-ink mb-2">
          Message <span className="text-mp-orange-flame">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          disabled={state === "loading"}
          className={cn(inputClass, "resize-y")}
          placeholder="Décris ta question, ton projet, ou tout ce qui pourrait nous aider à te répondre."
        />
      </div>

      <label htmlFor="consent" className="flex items-start gap-3 cursor-pointer text-sm text-mp-ink-soft">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          disabled={state === "loading"}
          className="mt-1 h-4 w-4 rounded border-mp-sand text-mp-orange-flame focus:ring-mp-orange-flame"
        />
        <span>
          J'accepte que mes données soient utilisées pour répondre à ma demande, conformément à la{" "}
          <a href="/politique-confidentialite" className="text-mp-orange-flame underline hover:no-underline">
            politique de confidentialité
          </a>
          .
        </span>
      </label>

      {state === "error" && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={state === "loading"} className="w-full md:w-auto">
        {state === "loading" ? "Envoi en cours…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
