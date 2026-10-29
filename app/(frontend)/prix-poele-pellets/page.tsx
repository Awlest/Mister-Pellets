import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Flame, Phone, Ruler } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { Testimonials } from "@/components/sections/Testimonials";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { NextSlot } from "@/components/booking/NextSlot";
import { ROUTES } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BONUS, bonusBadgeFor } from "@/lib/bonus";
import { HAUTEUR, TARIFS, eur, formatEur } from "@/lib/estimate";
import { DiscountedPrice } from "@/components/forms/DiscountedPrice";
import {
  EXAMPLE_INSTALL_LABEL,
  FROM_INSTALL_LABEL,
  getPricePageData,
  type InstallPrice,
  type PriceExample,
} from "@/lib/price-examples";
import { formatKw } from "@/lib/power";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/services";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Prix d'un poêle à pellets posé en Wallonie",
  description:
    "Combien coûte un poêle à pellets posé ? Exemples chiffrés avec la pose et la TVA à 6 %, forfaits de pose selon votre cheminée. Rappel gratuit avec un prix, visite technique offerte.",
  path: "/prix-poele-pellets",
});

/**
 * Arrivée des annonces « prix » et « devis » (Google Ads, groupe P2). Le
 * visiteur veut un chiffre : il l'a dès le premier écran, puis des exemples
 * réels du catalogue et les forfaits de pose. Trois sorties : réserver la
 * visite technique (en tête depuis le 28/10/2026 : 44 % du budget Ads arrivait
 * ici et la réservation n'apparaissait qu'en bas de page), se faire rappeler
 * ou appeler. Les chiffres se régénèrent avec le catalogue (ISR 60 s, comme
 * /estimation) et suivent le bonus de saison ; le prochain créneau libre se
 * lit dans le navigateur (NextSlot), pas au rendu.
 */
export const revalidate = 60;

export default async function PrixPoelePelletsPage() {
  const { bonus, from, examples, installs } = await getPricePageData();
  const vatNote = "TVA à 6 % comprise (maison de plus de 10 ans)";
  const vatShort = "TVA à 6 % comprise";
  // Conditions du prix d'appel, à côté du chiffre et visibles sur téléphone :
  // le héros compact masque sa description sous 640 px.
  const fromConditions = from
    ? `${from.fullName} ${formatKw(from.powerKw)} kW posé sur un ${FROM_INSTALL_LABEL.toLowerCase()}, ${vatNote}${
        bonus ? ", bonus de saison déduit" : ""
      }. Prix ferme après la visite technique gratuite.`
    : "Pose, raccordement et mise en service compris. Prix ferme après la visite technique gratuite.";

  return (
    <>
      <HeroSecondary
        eyebrow="Prix posé"
        title={
          from ? (
            <>
              Poêle à pellets posé, <span className="mp-italic">dès {eur(from.totalTTC)}</span>
            </>
          ) : (
            <>
              Le prix d&apos;un poêle à pellets <span className="mp-italic">posé chez vous</span>
            </>
          )
        }
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Prix d'un poêle posé" }]}
        compact
      />

      {/* Les gestes du visiteur venu d'une annonce, dans le premier écran. La
          visite technique d'abord : c'est elle qui rend le prix ferme. */}
      <section className="bg-mp-cream pb-10 md:pb-14">
        <div className="mp-shell">
          <p className="mp-measure mb-6 text-center text-base leading-relaxed text-mp-ink-soft md:text-lg">
            {fromConditions}
          </p>
          <Card className="mp-measure mb-6 bg-white p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mp-orange-light text-mp-orange-flame">
                <CalendarCheck className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-mp-green-deep">
                  Visite technique gratuite chez vous
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-mp-ink-soft md:text-base">
                  Une heure sur place : on regarde la pièce et le conduit. Devis ferme sous 48 heures.
                </p>
                <NextSlot service="devis-sur-place" className="mt-2 min-h-10 sm:min-h-5" />
              </div>
            </div>
            <Button asChild variant="secondary" size="lg" className="mt-4 w-full">
              <Link href={ROUTES.bookingWidget}>
                <CalendarCheck aria-hidden />
                Choisir mon créneau
              </Link>
            </Button>
          </Card>
          <div className="mp-measure flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <a href="#rappel">Être rappelé avec un prix</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={PHONE_HREF}>
                <Phone aria-hidden />
                {PHONE_DISPLAY}
              </a>
            </Button>
          </div>
          <p className="mp-measure mt-4 text-center text-sm text-mp-ink-soft">
            Lun-ven 9 h-18 h. Vous préférez chiffrer vous-même ?{" "}
            <Link href="/estimation" className="text-mp-orange-ink underline hover:no-underline">
              Estimation en ligne en 2 minutes
            </Link>
            .
          </p>
          {bonus ? (
            <p className="mp-measure mt-6 rounded-2xl border border-mp-orange-flame/30 bg-mp-orange-light/30 p-4 text-center text-sm text-mp-ink">
              <strong className="text-mp-green-deep">{BONUS.label}</strong>. {BONUS.conditions}
            </p>
          ) : null}
        </div>
      </section>

      {examples.length > 0 ? (
        <section className="bg-mp-beige mp-band">
          <div className="mp-shell">
            <div className="mp-measure mb-10 text-center">
              <h2 className="mb-4 text-3xl font-semibold text-mp-green-deep md:text-5xl">
                Trois exemples, pose comprise
              </h2>
              <p className="text-lg leading-relaxed text-mp-ink-soft">
                Des poêles de notre catalogue, chiffrés avec un {EXAMPLE_INSTALL_LABEL.toLowerCase()}{" "}
                ({HAUTEUR.defaut} m), {vatNote}. Ce sont les prix que vous retrouvez dans
                l&apos;estimation en ligne.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {examples.map((ex) => (
                <ExampleCard key={ex.slug} ex={ex} bonus={bonus} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure mb-10 text-center">
            <h2 className="mb-4 text-3xl font-semibold text-mp-green-deep md:text-5xl">
              Ce qui fait le prix de la pose
            </h2>
            <p className="text-lg leading-relaxed text-mp-ink-soft">
              Surtout la sortie des fumées. Avec une cheminée en bon état, la pose se fait en une
              journée. Sans cheminée, il faut créer un conduit. Forfaits avec
              fournitures et mise en service, {vatShort}.
            </p>
          </div>
          <div className="mp-measure overflow-hidden rounded-[20px] border border-mp-sand/40 bg-white">
            <ul className="divide-y divide-mp-sand/40">
              {installs.map((it) => (
                <li key={it.key} className="flex items-start justify-between gap-4 p-4 md:p-5">
                  <div className="min-w-0">
                    <p className="font-semibold text-mp-green-deep">{it.label}</p>
                    <p className="text-sm text-mp-ink-soft">
                      {it.desc}
                      {it.percements > 0 ? `, ${it.percements} percements renforcés compris` : ""}.
                      {it.heightM > 0 ? ` ${heightNote(it)}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-right font-semibold text-mp-ink">
                    <DiscountedPrice
                      amount={it.laborTTC}
                      full={it.fullTTC}
                      pct={it.discountPct}
                      showStrike={it.showStrike}
                      format={eur}
                      className="max-w-36"
                    />
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mp-measure mt-4 text-center text-sm text-mp-ink-soft">
            Au-delà de {HAUTEUR.seuilAcces} m de conduit, il faut une nacelle ({eur(TARIFS.options.nacelle * 1.06)}{" "}
            la journée) ou un échafaudage, chiffré sur devis. Logement de moins de 10 ans ou
            construction neuve : TVA à 21 %. Un mur très épais, un étage ou la canalisation
            d&apos;air chaud ajoutent un supplément.
          </p>
        </div>
      </section>

      <section id="rappel" className="scroll-mt-6 bg-mp-beige mp-band">
        <div className="mp-shell">
          <div className="mp-measure">
            <h2 className="mb-3 text-3xl font-semibold text-mp-green-deep md:text-4xl">
              Votre prix, au téléphone
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-mp-ink-soft">
              Laissez votre numéro : un technicien vous rappelle dans la journée ouvrée, pose quelques
              questions sur votre maison et vous donne un prix. Aucune obligation.
            </p>
            <Card className="bg-mp-cream p-5 md:p-8">
              <CallbackForm />
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure mb-10 text-center text-3xl font-semibold text-mp-green-deep md:text-5xl">
            Du premier appel au premier feu
          </h2>
          <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Step
              icon={<Phone aria-hidden />}
              n={1}
              title="Un prix au téléphone"
              text="On parle de votre maison, de la pièce à chauffer et de la cheminée. Vous avez un ordre de prix tout de suite."
            />
            <Step
              icon={<Ruler aria-hidden />}
              n={2}
              title="Visite technique gratuite"
              text="On vient voir le conduit et l'emplacement. Devis ferme sous 48 heures, au bon taux de TVA."
            />
            <Step
              icon={<Flame aria-hidden />}
              n={3}
              title="Pose en une journée"
              text="Sur un conduit existant, on installe, on raccorde et on fait le premier feu avec vous en fin de journée."
            />
          </ol>
          <div className="mt-10 flex justify-center">
            <Button asChild variant="secondary" size="default">
              <Link href="/prendre-rendez-vous">
                <CalendarCheck aria-hidden />
                Réserver la visite en ligne
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Testimonials tone="beige" />
    </>
  );
}

function ExampleCard({ ex, bonus }: { ex: PriceExample; bonus: boolean }) {
  return (
    <Card className="flex flex-col bg-white p-5">
      <div className="mb-4 flex items-center gap-4">
        {ex.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- vignette servie en WebP sans l'optimiseur (lib/product-image.ts)
          <img
            src={ex.imageSrc}
            alt=""
            width={72}
            height={72}
            loading="lazy"
            className="h-18 w-18 shrink-0 rounded-xl bg-mp-cream object-contain"
          />
        ) : null}
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-mp-green-deep">{ex.fullName}</h3>
          <p className="text-sm text-mp-ink-soft">{formatKw(ex.powerKw)} kW</p>
        </div>
      </div>
      <dl className="mb-4 space-y-1.5 text-sm">
        <Row label="Poêle" value={eur(ex.stoveTTC)} />
        <div className="flex justify-between gap-3">
          <dt className="text-mp-ink-soft">Pose et raccordement</dt>
          <dd className="font-medium text-mp-ink">
            <DiscountedPrice
              amount={ex.laborTTC}
              full={ex.laborFullTTC}
              pct={ex.laborDiscountPct}
              showStrike={ex.laborShowStrike}
              format={eur}
            />
          </dd>
        </div>
        {bonus && ex.bonusTTC > 0 ? (
          <Row label={`Bonus de saison ${bonusBadgeFor(ex.brand)}`} value={`- ${eur(ex.bonusTTC)}`} />
        ) : null}
      </dl>
      <div className="mt-auto border-t border-mp-sand/40 pt-4">
        <p className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-mp-ink-soft">Total posé</span>
          <span className="text-2xl font-semibold text-mp-green-deep">{eur(ex.totalTTC)}</span>
        </p>
        <Link
          href={`/produit/${ex.slug}`}
          className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-mp-orange-ink hover:underline"
        >
          Voir ce poêle
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

/** « Forfait pour 10 m, 127,20 € par mètre en plus ou en moins. » */
function heightNote(it: InstallPrice): string {
  const base = `Forfait pour ${it.heightM} m`;
  if (it.lessPerMeterTTC === it.morePerMeterTTC) {
    return `${base}, ${formatEur(it.morePerMeterTTC)} par mètre en plus ou en moins.`;
  }
  return `${base}, ${formatEur(it.lessPerMeterTTC)} de moins par mètre en dessous, ${formatEur(it.morePerMeterTTC)} de plus par mètre au-dessus.`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-mp-ink-soft">{label}</dt>
      <dd className="font-medium text-mp-ink">{value}</dd>
    </div>
  );
}

function Step({ icon, n, title, text }: { icon: ReactNode; n: number; title: string; text: string }) {
  return (
    <li className="rounded-[20px] border border-mp-sand/40 bg-white p-6">
      <div className="mb-3 flex items-center gap-3 text-mp-orange-ink [&_svg]:h-5 [&_svg]:w-5">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">Étape {n}</span>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-mp-green-deep">{title}</h3>
      <p className="leading-relaxed text-mp-ink-soft">{text}</p>
    </li>
  );
}
