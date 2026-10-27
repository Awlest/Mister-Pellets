import type { Metadata } from "next";
import { CalendarDays, Check, MapPin, Phone } from "lucide-react";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SHOWROOM_ADDRESS, SHOWROOM_MAPS_URL } from "@/lib/booking-calendar";
import {
  COMFO,
  PALLET_NET_KG,
  PELLET_OFFER,
  formatEuro,
  isPelletLaunchPeriod,
  launchLastDayLabel,
  launchNextDayLabel,
  pelletPriceHT,
  pelletPricePerBag,
  pelletPricePerKg,
  pelletPriceTTC,
} from "@/lib/pellets";
import { PELLET_PICKUP, PHONE_DISPLAY, PHONE_HREF } from "@/lib/services";
import { SITE_URL, buildFAQSchema, buildPageMetadata } from "@/lib/seo";

// Le prix change à minuit le dernier jour du lancement : le cron
// app/api/cron/bonus invalide la page cette nuit-là, et ce délai d'une heure
// rattrape un cron manqué.
export const revalidate = 3600;

const PHOTO = "/pellets/comfo-pellets-palette.webp";
const PHOTO_SMALL = "/pellets/comfo-pellets-palette-400.webp";

export function generateMetadata(): Metadata {
  const launch = isPelletLaunchPeriod();
  const price = formatEuro(pelletPriceTTC());
  return buildPageMetadata({
    title: `Palette de pellets Comfo ${PALLET_NET_KG} kg à ${price} TVAC, retrait à Fernelmont`,
    description: launch
      ? `${PELLET_OFFER.bags} sacs de ${PELLET_OFFER.bagKg} kg de pellets Comfo ${COMFO.certificationsShort}, ${price} TVAC la palette jusqu'au ${launchLastDayLabel}, puis ${formatEuro(PELLET_OFFER.priceTTC)}. Retrait sur rendez-vous à Fernelmont, paiement sur place.`
      : `${PELLET_OFFER.bags} sacs de ${PELLET_OFFER.bagKg} kg de pellets Comfo ${COMFO.certificationsShort}, ${price} TVAC la palette. Retrait sur rendez-vous à Fernelmont, paiement sur place.`,
    path: PELLET_OFFER.path,
  });
}

const FAQ = [
  {
    question: "Livrez-vous la palette ?",
    answer:
      "Non. La palette se retire au showroom de Fernelmont, sur rendez-vous, et se paie sur place au moment de l'enlèvement.",
  },
  {
    question: "Quel prix s'applique si je réserve le 2 novembre pour un retrait plus tard ?",
    answer: `Le prix retenu est celui du jour où vous réservez. Une réservation faite au plus tard le ${launchLastDayLabel} se paie ${formatEuro(PELLET_OFFER.launch.priceTTC)} la palette, même si vous passez la prendre la semaine suivante. Le prix est rappelé dans l'e-mail de confirmation.`,
  },
  {
    question: "Ces pellets conviennent-ils à mon poêle ?",
    answer: COMFO.compatibilityAnswer,
  },
  {
    question: "Quel véhicule prévoir ?",
    answer: `Une palette, ce sont ${PELLET_OFFER.bags} sacs de ${PELLET_OFFER.bagKg} kg, soit ${PALLET_NET_KG} kg de pellets sans compter la palette. Venez avec une camionnette ou une remorque qui supporte ce poids.`,
  },
  {
    question: "Comment conserver les sacs ?",
    answer:
      "Au sec, à l'abri de la pluie et loin d'un sol humide : sur la palette, dans un garage ou un abri fermé, c'est très bien. Un pellet qui prend l'humidité gonfle et tombe en poussière, et il brûle mal.",
  },
];

export default function PalettePelletsComfoPage() {
  const launch = isPelletLaunchPeriod();
  const priceTTC = pelletPriceTTC();
  const url = `${SITE_URL}${PELLET_OFFER.path}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${PELLET_OFFER.name}, ${PELLET_OFFER.bags} sacs de ${PELLET_OFFER.bagKg} kg`,
    description: COMFO.schemaDescription,
    image: [`${SITE_URL}${PHOTO}`],
    brand: { "@type": "Brand", name: "Comfo" },
    category: "Granulés de bois pour poêle à pellets",
    ...(COMFO.gtin13 ? { gtin13: COMFO.gtin13 } : {}),
    weight: { "@type": "QuantitativeValue", value: PALLET_NET_KG, unitCode: "KGM" },
    offers: {
      "@type": "Offer",
      url,
      price: priceTTC.toFixed(2),
      priceCurrency: "EUR",
      ...(launch ? { priceValidUntil: PELLET_OFFER.launch.to } : {}),
      availability: "https://schema.org/LimitedAvailability",
      itemCondition: "https://schema.org/NewCondition",
      availableDeliveryMethod: "https://schema.org/OnSitePickup",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };

  return (
    <>
      <JsonLd data={[productSchema, buildFAQSchema(FAQ)]} />

      {/* Produit : photo à gauche, achat à droite dès 1 024 px. Empilés en
          mobile : nom et pastilles, photo réduite, puis le prix, qui tient
          ainsi dans le premier écran ; la présentation vient après. */}
      <section className="bg-mp-cream pt-8 pb-12 md:pb-16 border-b border-mp-sand/30">
        <div className="mp-shell">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Boutique", href: "/boutique" },
              { label: PELLET_OFFER.name },
            ]}
            className="mb-8"
          />

          <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0">
            <div className="lg:col-start-2 lg:row-start-1">
              <div className="flex flex-wrap items-center gap-2 mb-2 lg:mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-mp-orange-ink">
                  Comfo
                </span>
                <Badge variant="default">{COMFO.originBadge}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-mp-green-deep mb-4 leading-tight">
                {PELLET_OFFER.name}
              </h1>
              <div className="flex flex-wrap gap-2 lg:mb-8">
                {COMFO.badges.map((b) => (
                  <Badge key={b} variant="default">
                    {b}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Photo en hauteur (une palette), sur le fond blanc du visuel,
                limitée en hauteur sur téléphone pour que le prix suive vite. */}
            <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <div className="flex justify-center rounded-3xl border border-mp-sand/40 bg-white p-4 sm:p-6">
                {/* eslint-disable-next-line @next/next/no-img-element -- images servies sans l'optimiseur Vercel (next.config.ts), deux tailles préparées */}
                <img
                  src={PHOTO}
                  srcSet={`${PHOTO_SMALL} 400w, ${PHOTO} 666w`}
                  sizes="(min-width: 1024px) 370px, (min-width: 640px) 240px, 136px"
                  width={666}
                  height={1254}
                  alt={COMFO.photoAlt}
                  fetchPriority="high"
                  className="h-auto max-h-64 w-auto sm:max-h-[28rem] lg:max-h-[44rem]"
                />
              </div>
            </div>

            <div className="min-w-0 mt-2 lg:col-start-2 lg:row-start-2 lg:mt-0">
              <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-6 mb-6">
                <span className="text-xs text-mp-ink-soft block">
                  {launch ? "Prix de lancement, TVA comprise" : "Prix TVA comprise"}
                  {launch ? (
                    <Badge variant="primary" className="ml-2">
                      Jusqu&apos;au {launchLastDayLabel}
                    </Badge>
                  ) : null}
                </span>
                <span
                  className="text-4xl font-semibold text-mp-green-deep tabular-nums"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatEuro(priceTTC)}
                  <span className="text-base font-medium text-mp-ink-soft ml-1">TVAC la palette</span>
                </span>
                <span className="block text-sm text-mp-ink-soft mt-1 tabular-nums">
                  soit {formatEuro(pelletPriceHT(priceTTC))} HTVA (TVA 6&nbsp;%),{" "}
                  {formatEuro(pelletPricePerBag(priceTTC))} le sac de {PELLET_OFFER.bagKg}&nbsp;kg,{" "}
                  {formatEuro(pelletPricePerKg(priceTTC))} le kg
                </span>
                {launch ? (
                  <p className="mt-3 text-sm text-mp-green-deep">
                    À partir du {launchNextDayLabel} :{" "}
                    <span className="font-semibold">{formatEuro(PELLET_OFFER.priceTTC)} TVAC</span> la
                    palette. Le prix retenu est celui du jour de votre réservation.
                  </p>
                ) : null}
                <ul className="mt-4 text-sm text-mp-ink space-y-2 leading-relaxed">
                  <li className="flex gap-2">
                    <MapPin className="h-4 w-4 mt-1 shrink-0 text-mp-green-deep" aria-hidden />
                    <span>
                      Retrait sur rendez-vous au showroom, {SHOWROOM_ADDRESS.replace("5380 ", "5380\u00a0")}.
                      Pas de livraison.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 mt-1 shrink-0 text-mp-green-deep" aria-hidden />
                    <span>Paiement sur place, à l&apos;enlèvement. Vous ne payez rien en ligne.</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 mt-1 shrink-0 text-mp-green-deep" aria-hidden />
                    <span>Stock limité à {PELLET_OFFER.stock}&nbsp;palettes.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild variant="primary" size="lg" className="w-full">
                  <a href="#reserver">
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    Réserver mon retrait
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <a href={PHONE_HREF}>
                    <Phone className="h-4 w-4" aria-hidden />
                    Réserver par téléphone, {PHONE_DISPLAY}
                  </a>
                </Button>
              </div>

              <p className="mt-8 text-lg text-mp-ink-soft leading-relaxed">{COMFO.intro}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fiche technique : chaque valeur vient d'une source citée dans lib/pellets.ts. */}
      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <div className="mp-measure">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4 text-center">
              Ce qu&apos;il y a sur la palette
            </h2>
            <p className="text-lg text-mp-ink-soft mb-10 leading-relaxed text-center">
              {COMFO.specsIntro}
            </p>
            <dl className="rounded-2xl border border-mp-sand/40 bg-mp-cream divide-y divide-mp-sand/40">
              {COMFO.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[13rem_1fr] sm:gap-4">
                  <dt className="text-sm font-semibold text-mp-green-deep">{s.label}</dt>
                  <dd className="min-w-0 text-mp-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-mp-ink-soft leading-relaxed">{COMFO.specsNote}</p>
          </div>
        </div>
      </section>

      <ProcessSteps
        title="Le retrait, comment ça se passe"
        steps={[
          {
            title: "Réservez un créneau",
            description: `Du lundi au vendredi, au plus tôt 24 heures à l'avance, en précisant combien de palettes il vous faut. En ligne plus bas, ou au ${PHONE_DISPLAY}.`,
          },
          {
            title: "La confirmation arrive par e-mail",
            description:
              "Elle reprend le jour, l'heure, l'adresse et le montant à payer, calculé au prix du jour de votre réservation.",
          },
          {
            title: "Passez au showroom",
            description: `${SHOWROOM_ADDRESS}, avec une camionnette ou une remorque : une palette pèse près d'une tonne.`,
          },
          {
            title: "Payez à l'enlèvement",
            description: "Vous réglez sur place, au moment de l'emporter, et vous repartez avec la palette.",
          },
        ]}
      />

      {/* Réservation du retrait dans l'agenda, comme les rendez-vous du
          showroom (lib/services.ts, PELLET_PICKUP). scroll-mt-16 : hauteur de
          l'en-tête collant sur grand écran. */}
      <section id="reserver" className="bg-mp-cream mp-band scroll-mt-16">
        <div className="mp-shell">
          <div className="mp-measure mb-10 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
              Réservez votre retrait
            </h2>
            <p className="text-lg text-mp-ink-soft leading-relaxed">
              Choisissez le jour, l&apos;heure et le nombre de palettes. La confirmation part aussitôt
              par e-mail. Plus de {PELLET_OFFER.maxPerBooking}&nbsp;palettes, ou pas de créneau qui
              vous convient ? Appelez le{" "}
              <a href={PHONE_HREF} className="font-semibold text-mp-orange-ink underline hover:no-underline">
                {PHONE_DISPLAY}
              </a>
              .
            </p>
            <p className="mt-3 text-sm text-mp-ink-soft">
              <a
                href={SHOWROOM_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-mp-orange-ink underline-offset-4 hover:underline"
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Itinéraire vers le showroom
              </a>
            </p>
          </div>

          <BookingWidget
            services={[
              {
                slug: PELLET_PICKUP.slug,
                name: PELLET_PICKUP.name,
                durationLabel: PELLET_PICKUP.durationLabel,
                location: PELLET_PICKUP.location,
                notesField: PELLET_PICKUP.notesField,
                quantity: PELLET_PICKUP.quantity,
                calendarDescription: PELLET_PICKUP.calendarDescription,
                isLead: PELLET_PICKUP.isLead,
              },
            ]}
            phoneDisplay={PHONE_DISPLAY}
            phoneHref={PHONE_HREF}
          />
        </div>
      </section>

      <FAQAccordion tone="beige" items={FAQ} />
    </>
  );
}
