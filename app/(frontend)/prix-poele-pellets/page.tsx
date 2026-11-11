import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Flame, Phone, Ruler } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { NextSlot } from "@/components/booking/NextSlot";
import { ROUTES } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BONUS, bonusBadgeFor } from "@/lib/bonus";
import { HAUTEUR, TARIFS, eur } from "@/lib/estimate";
import { DiscountedPrice } from "@/components/forms/DiscountedPrice";
import {
  EXAMPLE_INSTALL_LABEL,
  FROM_INSTALL_LABEL,
  getPricePageData,
  heightNote,
  type PriceExample,
} from "@/lib/price-examples";
import { formatKw } from "@/lib/power";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/services";
import { buildFAQSchema, buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { FAQS } from "@/lib/faqs";
import { PHONE_HOURS } from "@/config/site";
import { typo } from "@/lib/typo";

export const metadata = buildPageMetadata({
  title: "Prix d'un poêle à pellets posé en Wallonie",
  description:
    "Combien coûte un poêle à pellets posé ? Exemples chiffrés avec la pose et la TVA à 6 %, forfaits de pose selon votre cheminée, visite technique offerte.",
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
  const vatNote = typo("TVA à 6 % comprise (maison de plus de 10 ans)");
  const vatShort = typo("TVA à 6 % comprise");
  // Conditions du prix d'appel, à côté du chiffre et visibles sur téléphone :
  // le héros compact masque sa description sous 640 px.
  const fromConditions = from
    ? `${from.fullName} ${formatKw(from.powerKw)} kW posé sur un ${FROM_INSTALL_LABEL.toLowerCase()}, ${vatNote}${
        bonus ? ", bonus de saison déduit" : ""
      }. Prix ferme après la visite technique gratuite.`
    : "Pose, raccordement et mise en service compris. Prix ferme après la visite technique gratuite.";

  // Date du relevé : les prix sont recalculés à chaque régénération de la page.
  const relevedOn = new Date().toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Brussels",
  });
  const laborPrices = installs.map((it) => it.laborTTC);
  const exampleTotals = examples.map((ex) => ex.totalTTC);
  // Réponse directe en tête de page (40 à 60 mots), pour le visiteur pressé
  // comme pour un moteur ou une IA qui cherche le chiffre.
  const directAnswer =
    from && laborPrices.length > 0
      ? `En Wallonie, un poêle à pellets posé coûte à partir de ${eur(from.totalTTC)} TVAC avec un ${FROM_INSTALL_LABEL.toLowerCase()}${
          // pickExamples rend un à trois poêles selon le lot : le nombre suit.
          exampleTotals.length > 1
            ? `, et de ${eur(Math.min(...exampleTotals))} à ${eur(Math.max(...exampleTotals))} pour nos ${exampleTotals.length === 2 ? "deux" : "trois"} exemples avec un ${EXAMPLE_INSTALL_LABEL.toLowerCase()}`
            : exampleTotals.length === 1
              ? `, et ${eur(exampleTotals[0]!)} pour notre exemple avec un ${EXAMPLE_INSTALL_LABEL.toLowerCase()}`
              : ""
        }. La pose seule va de ${eur(Math.min(...laborPrices))} à ${eur(Math.max(...laborPrices))} selon la sortie des fumées. ${vatNote}${bonus ? ", bonus de saison déduit" : ""}.`
      : null;

  const delay = FAQS.find((q) => q.id === "general-delai");
  // Cinq questions de prix, réponses reprises du site (pose, TVA, bonus ou
  // aides, financement, délai).
  const faq = [
    {
      question: "Pourquoi le prix de la pose change-t-il d'une maison à l'autre ?",
      answer:
        "Surtout à cause de la sortie des fumées. Avec une cheminée en bon état, la pose se fait en une journée. Sans cheminée, il faut créer un conduit. Un mur très épais, un étage ou la canalisation d'air chaud ajoutent un supplément. Le prix ferme figure au devis, après la visite technique gratuite.",
    },
    {
      question: "Quelle TVA s'applique à un poêle à pellets posé ?",
      answer:
        "6 % au lieu de 21 % quand nous fournissons et posons le poêle dans un logement privé de plus de 10 ans : le taux réduit s'applique d'office, sur le poêle comme sur la pose. Logement de moins de 10 ans ou construction neuve : 21 %.",
    },
    bonus
      ? {
          question: "Le bonus de saison est-il déjà déduit des prix de cette page ?",
          answer: `Oui. ${BONUS.label}. ${BONUS.conditions}`,
        }
      : {
          question: "Existe-t-il encore une prime pour un poêle à pellets en Wallonie ?",
          answer:
            "Non. La prime Habitation s'est arrêtée le 30 septembre 2026. Il reste la TVA à 6 % sur les logements de plus de 10 ans. Les prêts régionaux Rénopack et Rénoprêt visent une rénovation plus large, et leur liste de travaux ne nomme pas le poêle : le détail est sur la page [aides pour un poêle à pellets](/aides-poele-a-pellets-wallonie).",
        },
    {
      question: "Peut-on payer son poêle en plusieurs fois ?",
      answer:
        "Un financement est possible par Cofidis, sous réserve d'acceptation du prêteur. Les durées, la mensualité et l'exemple représentatif s'affichent dans [le configurateur](/estimation). Attention, emprunter de l'argent coûte aussi de l'argent.",
    },
    ...(delay ? [{ question: delay.question, answer: delay.answer }] : []),
  ];

  return (
    <>
      <JsonLd data={buildFAQSchema(faq)} />
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
          {directAnswer && (
            <p className="mp-measure mb-4 text-center text-lg leading-relaxed text-mp-ink md:text-xl">
              {typo(directAnswer)}
            </p>
          )}
          <p className="mp-measure mb-6 text-center text-base leading-relaxed text-mp-ink-soft md:text-lg">
            {typo(fromConditions)}
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
                  Une heure sur place : on regarde la pièce et le conduit. Devis ferme sous 48 heures.
                </p>
                <NextSlot service="devis-sur-place" className="mt-2 min-h-10 sm:min-h-5" />
              </div>
            </div>
            <Button asChild variant="secondary" size="lg" className="mt-4 w-full">
              <Link href={ROUTES.visit}>
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
            Téléphone : {PHONE_HOURS}. Vous préférez chiffrer vous-même ?{" "}
            <Link href="/estimation" className="text-mp-orange-ink underline hover:no-underline">
              Estimation en ligne en 2 minutes
            </Link>
            .
          </p>
          {bonus ? (
            <p className="mp-measure mt-6 rounded-2xl border border-mp-orange-flame/30 bg-mp-orange-light/30 p-4 text-center text-sm text-mp-ink">
              <strong className="text-mp-green-deep">{typo(BONUS.label)}</strong>. {BONUS.conditions}
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
            <div className="mp-measure mt-10 overflow-x-auto rounded-[20px] border border-mp-sand/40 bg-white">
              <table className="w-full text-left text-sm md:text-base">
                <caption className="caption-bottom px-4 py-3 text-left text-xs text-mp-ink-soft">
                  Exemples de prix posés, relevés le {relevedOn} : poêle et pose avec un{" "}
                  {EXAMPLE_INSTALL_LABEL.toLowerCase()} de {HAUTEUR.defaut} m, {vatNote}
                  {bonus ? ", bonus de saison déduit" : ""}.
                </caption>
                <thead>
                  <tr className="border-b border-mp-sand/40 text-mp-green-deep">
                    <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Modèle</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold sm:px-4">Poêle</th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold sm:px-4">Pose</th>
                    <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">Total TVAC</th>
                  </tr>
                </thead>
                <tbody>
                  {examples.map((ex) => (
                    <tr key={ex.slug} className="border-b border-mp-sand/40 last:border-b-0">
                      <th scope="row" className="px-3 py-3 font-medium text-mp-ink sm:px-4">
                        <Link href={`/produit/${ex.slug}`} className="underline underline-offset-4 decoration-mp-sand hover:text-mp-orange-ink">
                          {ex.fullName}
                        </Link>{" "}
                        <span className="whitespace-nowrap text-mp-ink-soft max-sm:hidden">({formatKw(ex.powerKw)} kW)</span>
                      </th>
                      <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums sm:px-4">{eur(ex.stoveTTC - ex.bonusTTC)}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums sm:px-4">{eur(ex.laborTTC)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums text-mp-green-deep sm:px-4">{eur(ex.totalTTC)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <div className="mp-measure overflow-x-auto rounded-[20px] border border-mp-sand/40 bg-white">
            <table className="w-full text-left">
              <caption className="caption-bottom px-4 py-3 text-left text-xs text-mp-ink-soft md:px-5">
                Forfaits de pose relevés le {relevedOn}, fournitures et mise en service comprises, {vatShort}.
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Type de pose</th>
                  <th scope="col">Prix TVAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mp-sand/40">
                {installs.map((it) => (
                  <tr key={it.key}>
                    <th scope="row" className="min-w-0 p-4 align-top font-normal md:p-5">
                      <span className="block font-semibold text-mp-green-deep">{it.label}</span>
                      <span className="block text-sm text-mp-ink-soft">
                        {it.desc}
                        {it.percements > 0 ? `, ${it.percements} percements renforcés compris` : ""}.
                        {it.heightM > 0 ? ` ${heightNote(it)}` : ""}
                      </span>
                    </th>
                    <td className="p-4 text-right align-top font-semibold text-mp-ink md:p-5">
                      <DiscountedPrice
                        amount={it.laborTTC}
                        full={it.fullTTC}
                        pct={it.discountPct}
                        showStrike={it.showStrike}
                        format={eur}
                        className="max-w-36"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mp-measure mt-4 text-center text-sm text-mp-ink-soft">
            Au-delà de {HAUTEUR.seuilAcces} m de conduit, il faut une nacelle ({eur(TARIFS.options.nacelle * 1.06)}{" "}
            la journée) ou un échafaudage, chiffré sur devis.{" "}
            {installs.some((it) => it.key === "ventouse-facade") &&
              "La ventouse demande un poêle étanche raccordé en concentrique, hors Edilkamin et EK63. "}
            Logement de moins de 10 ans ou construction neuve : TVA à 21 %. Un mur très épais, un étage ou la canalisation
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
              Laissez votre numéro : un technicien vous rappelle dans la journée ouvrée, pose quelques
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
              <Link href={ROUTES.visit}>
                <CalendarCheck aria-hidden />
                Réserver la visite en ligne
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <GoogleReviews tone="beige" />

      <FAQAccordion title="Questions fréquentes sur le prix" items={faq} />
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
          <Row label={typo(`Bonus de saison ${bonusBadgeFor(ex.brand)}`)} value={`- ${eur(ex.bonusTTC)}`} />
        ) : null}
      </dl>
      <div className="mt-auto border-t border-mp-sand/40 pt-4">
        <p className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-mp-ink-soft">Total posé</span>
          <span className="whitespace-nowrap text-2xl font-semibold text-mp-green-deep">{eur(ex.totalTTC)}</span>
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
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-mp-ink-soft">{label}</dt>
      <dd className="whitespace-nowrap font-medium text-mp-ink">{value}</dd>
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
