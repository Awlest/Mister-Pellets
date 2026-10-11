"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, Home, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

/**
 * Error boundary global frontend (cf. audit V20260503 §2.M.2).
 *
 * Next charge ce composant sur chaque page, avant toute erreur : les boutons
 * prennent donc les classes de buttonVariants plutôt que le composant
 * Button, qui embarque tailwind-merge (8 Ko compressés) et Slot.
 */
export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Brancher Sentry ici en Phase 8 (audit §3.M.1).
    console.error("[frontend-error]", error);
  }, [error]);

  return (
    <section className="bg-mp-cream mp-band">
      <div className="mp-shell text-center">
        <p className="mp-measure mx-auto text-sm uppercase tracking-wider font-semibold text-mp-orange-ink mb-3">
          Quelque chose s&apos;est mal passé
        </p>
        <h1 className="mp-measure mx-auto text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4 leading-tight">
          On a une erreur sur cette page
        </h1>
        <p className="mp-measure mx-auto text-lg text-mp-ink-soft leading-relaxed mb-8 max-w-xl mx-auto">
          Notre équipe a été notifiée. En attendant, vous pouvez réessayer ou
          repartir d&apos;une page connue.
        </p>
        {error.digest && (
          <p className="text-xs text-mp-ink-soft/70 mb-6">
            Référence : <code className="font-mono">{error.digest}</code>
          </p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            <RefreshCw className="h-5 w-5" />
            Réessayer
          </button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <Home className="h-5 w-5" />
            Retour à l&apos;accueil
          </Link>
          <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <Phone className="h-5 w-5" />
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
