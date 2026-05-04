"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, Home, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary global frontend (cf. audit V20260503 §2.M.2).
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
    <section className="bg-mp-cream py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
        <p className="text-sm uppercase tracking-wider font-semibold text-mp-orange-flame mb-3">
          Quelque chose s&apos;est mal passé
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4 leading-tight">
          On a une erreur sur cette page
        </h1>
        <p className="text-lg text-mp-ink-soft leading-relaxed mb-8 max-w-xl mx-auto">
          Notre équipe a été notifiée. En attendant, tu peux réessayer ou
          repartir d&apos;une page connue.
        </p>
        {error.digest && (
          <p className="text-xs text-mp-ink-soft/70 mb-6">
            Référence : <code className="font-mono">{error.digest}</code>
          </p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="primary" size="lg" onClick={() => reset()}>
            <RefreshCw className="h-5 w-5" />
            Réessayer
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="h-5 w-5" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">
              <Phone className="h-5 w-5" />
              Nous contacter
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
