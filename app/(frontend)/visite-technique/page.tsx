import type { ReactNode } from "react";
import { CalendarCheck, Clock, FileText, Flame, Home, Phone, Ruler, ShieldCheck } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getService, PHONE_DISPLAY, PHONE_HREF } from "@/lib/services";
import { buildPageMetadata } from "@/lib/seo";

/*
 * Page d'arrivée des annonces Google « visite technique » (01/11/2026).
 *
 * Le visiteur vient réserver la visite à domicile, rien d'autre : l'agenda
 * arrive dans le premier écran du téléphone, le service est déjà choisi, et
 * seul le téléphone est obligatoire (l'e-mail apporte la confirmation écrite).
 * /prendre-rendez-vous reste la page de tous les rendez-vous (showroom, SAV).
 *
 * Hors index : elle reprend l'agenda de /prendre-rendez-vous et vit des
 * annonces et des liens du site, pas de la recherche naturelle.
 */
export const metadata = buildPageMetadata({
  title: "Visite technique gratuite pour votre poêle à pellets",
  description:
    "Mister Pellets vient voir la pièce et le conduit, puis vous recevez un devis ferme sous 48 heures. Choisissez votre créneau dans notre agenda.",
  path: "/visite-technique",
  noindex: true,
});

const SERVICE_SLUG = "devis-sur-place";

export default function VisiteTechniquePage() {
  const service = getService(SERVICE_SLUG);

  return (
    <>
      <HeroSecondary
        eyebrow="Devis sur place · Gratuit"
        title={
          <>
            Visite technique <span className="mp-italic">gratuite</span> chez vous
          </>
        }
        description="On vient voir la pièce et le conduit, puis vous recevez un devis ferme sous 48 heures, pose et TVA comprises."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Visite technique" }]}
        compact
      />

      {/* L'agenda dans le premier écran : c'est pour lui que le visiteur
          arrive. scroll-mt-16 : hauteur de l'en-tête collant sur grand écran. */}
      <section id="reserver" className="bg-mp-cream pb-12 pt-6 scroll-mt-16 md:pb-16 md:pt-10">
        <div className="mp-shell">
          <ul className="mp-measure mb-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-mp-ink md:text-base">
            <Fact icon={<Clock aria-hidden />}>1 heure chez vous</Fact>
            <Fact icon={<FileText aria-hidden />}>Devis ferme sous 48 h</Fact>
            <Fact icon={<ShieldCheck aria-hidden />}>Aucune obligation</Fact>
          </ul>

          {service ? (
            <BookingWidget
              services={[
                {
                  slug: service.slug,
                  name: service.name,
                  durationLabel: service.durationLabel,
                  location: service.location,
                },
              ]}
              phoneDisplay={PHONE_DISPLAY}
              phoneHref={PHONE_HREF}
              contact="phone"
              origin="/visite-technique"
            />
          ) : null}

          <p className="mp-measure mt-6 text-center text-sm text-mp-ink-soft">
            Vous préférez en parler d&apos;abord ?{" "}
            <a href={PHONE_HREF} className="whitespace-nowrap font-semibold text-mp-green-deep underline underline-offset-2 hover:no-underline">
              {PHONE_DISPLAY}
            </a>
            , du lundi au vendredi de 9 h à 18 h.
          </p>
        </div>
      </section>

      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure mx-auto mb-10 text-center text-3xl font-semibold text-mp-green-deep md:text-5xl">
            Ce qu&apos;on regarde chez vous
          </h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Point
              icon={<Home aria-hidden />}
              title="La pièce"
              text="Où placer le poêle, la surface à chauffer, l'isolation et l'arrivée d'air. C'est ce qui décide de la puissance du poêle."
            />
            <Point
              icon={<Ruler aria-hidden />}
              title="Le conduit"
              text="Une cheminée en bon état se tube. Sans cheminée, on choisit avec vous entre une ventouse en façade et un conduit neuf."
            />
            <Point
              icon={<Flame aria-hidden />}
              title="Le devis"
              text="Sous 48 heures : le modèle, la pose, le délai, au bon taux de TVA (6 % dans une maison de plus de 10 ans)."
            />
          </ul>
          <p className="mp-measure mx-auto mt-8 text-center text-base leading-relaxed text-mp-ink-soft md:text-lg">
            Le devis accepté, on planifie la pose. Sur un conduit existant, elle se fait en une
            journée, premier feu compris.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <a href="#reserver">
                <CalendarCheck aria-hidden />
                Choisir mon créneau
              </a>
            </Button>
          </div>
        </div>
      </section>

      <GoogleReviews tone="cream" />

      <section className="bg-mp-beige mp-band-sm">
        <div className="mp-shell text-center">
          <p className="mp-measure mx-auto text-base text-mp-ink">
            Une question avant de réserver ?
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <a href={PHONE_HREF}>
                <Phone aria-hidden />
                {PHONE_DISPLAY}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-mp-orange-flame">
      {icon}
      {children}
    </li>
  );
}

function Point({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <li>
      <Card className="h-full p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-mp-orange-light text-mp-orange-flame [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-mp-green-deep">{title}</h3>
        <p className="text-sm leading-relaxed text-mp-ink-soft md:text-base">{text}</p>
      </Card>
    </li>
  );
}
