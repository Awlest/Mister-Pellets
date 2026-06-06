import Link from "next/link";
import Image from "next/image";
import { Home, ShoppingBag, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTAFinal } from "@/components/sections/CTAFinal";

export const metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

/**
 * Page 404 brandée (cf. audit V20260503 §1.H.3).
 */
export default function NotFound() {
  return (
    <>
      <section className="bg-mp-cream py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
          <Image
            src="/logo-mister-pellets-mascotte.svg"
            alt=""
            width={120}
            height={120}
            className="mx-auto mb-6 h-24 w-24 opacity-60"
          />
          <p className="text-sm uppercase tracking-wider font-semibold text-mp-orange-flame mb-3">
            Erreur 404
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4 leading-tight">
            Cette page n&apos;existe pas, ou plus
          </h1>
          <p className="text-lg text-mp-ink-soft leading-relaxed mb-8 max-w-xl mx-auto">
            Le lien que vous avez suivi est cassé, ou la page a été déplacée. Pas
            grave, voici de quoi retomber sur vos pattes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/">
                <Home className="h-5 w-5" />
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/boutique">
                <ShoppingBag className="h-5 w-5" />
                Voir la boutique
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
      <CTAFinal
        title="Vous cherchiez quelque chose de précis ?"
        description="Si vous savez ce que vous cherchez mais que vous ne le trouvez plus, dites-nous, on retrouve la bonne page ou on ouvre un nouveau projet ensemble."
      />
    </>
  );
}
