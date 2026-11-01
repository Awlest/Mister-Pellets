import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { ContactForm } from "@/components/forms/ContactForm";
import { formatPhone } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";
import { PHONE_HOURS_LONG, VISIT_HOURS_LONG } from "@/config/site";

export const metadata = buildPageMetadata({
  title: "Contact, Mister Pellets Wallonie",
  description:
    "Contactez Mister Pellets à Fernelmont : téléphone, email, adresse et horaires. Showroom uniquement sur rendez-vous. On répond dans la journée pendant les heures ouvrées.",
  path: "/contact",
});

const PHONE = "081 13 83 09";
const EMAIL = "info@awlest.com";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Mister+Pellets+Rue+des+Fagotis+3A+5380+Fernelmont";

export default function ContactPage() {
  return (
    <>
      <HeroSecondary
        title="Une question ? On répond."
        description={`Téléphone, email ou formulaire. On décroche ${PHONE_HOURS_LONG}, et on répond aux messages dans la journée ouvrée.`}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Contact" },
        ]}
      />

      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Coordonnées */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-2xl font-semibold text-mp-green-deep mb-2">Coordonnées</h2>

              <a
                href={`tel:${formatPhone(PHONE)}`}
                className="flex items-start gap-4 p-5 rounded-2xl bg-mp-beige border border-mp-sand/40 hover:border-mp-orange-flame transition-colors"
              >
                <Phone className="h-5 w-5 text-mp-orange-flame mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-mp-ink-soft uppercase tracking-wider block mb-1">Téléphone</span>
                  <span className="text-lg font-semibold text-mp-green-deep">{PHONE}</span>
                </div>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="flex items-start gap-4 p-5 rounded-2xl bg-mp-beige border border-mp-sand/40 hover:border-mp-orange-flame transition-colors"
              >
                <Mail className="h-5 w-5 text-mp-orange-flame mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-mp-ink-soft uppercase tracking-wider block mb-1">Email</span>
                  <span className="text-lg font-semibold text-mp-green-deep break-all">{EMAIL}</span>
                </div>
              </a>

              {/* Le rendez-vous est annoncé dans le bloc adresse lui-même, avant
                * le lien d'itinéraire : c'est là que regarde quelqu'un qui
                * s'apprête à prendre la route. */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-mp-beige border border-mp-sand/40">
                <MapPin className="h-5 w-5 text-mp-orange-flame mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-mp-ink-soft uppercase tracking-wider block mb-1">Showroom & atelier</span>
                  <p className="mb-2 font-semibold text-mp-orange-ink">Uniquement sur rendez-vous</p>
                  <address className="not-italic text-mp-ink leading-relaxed">
                    Rue des Fagotis 3A
                    <br />
                    5380 Fernelmont
                    <br />
                    Belgique
                  </address>
                  <p className="mt-3 text-sm text-mp-ink-soft leading-relaxed">
                    La visite est gratuite et dure 45 minutes. Un conseiller vous attend à
                    l&apos;heure prévue.
                  </p>
                  <div className="mt-1 flex flex-col items-start">
                    <a
                      href="/prendre-rendez-vous#reserver"
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-mp-orange-ink underline hover:no-underline"
                    >
                      Réserver une visite en ligne
                    </a>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-sm text-mp-orange-ink underline hover:no-underline"
                    >
                      Itinéraire sur Google Maps
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-mp-beige border border-mp-sand/40">
                <Clock className="h-5 w-5 text-mp-orange-flame mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-mp-ink-soft uppercase tracking-wider block mb-1">Horaires du téléphone</span>
                  <ul className="text-mp-ink space-y-1 leading-relaxed">
                    <li>Lundi au vendredi : 9&nbsp;h à 19&nbsp;h</li>
                    <li className="text-mp-ink-soft">Samedi et dimanche : fermé, répondeur</li>
                  </ul>
                  <p className="mt-3 text-sm text-mp-ink-soft">
                    Visites du showroom uniquement sur rendez-vous, {VISIT_HOURS_LONG}.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-semibold text-mp-green-deep mb-2">
                Ou écrivez-nous directement
              </h2>
              <p className="text-mp-ink-soft mb-8">
                Pour un devis personnalisé, prenez 60 secondes pour remplir le{" "}
                <a href="/demande-de-devis" className="text-mp-orange-ink underline hover:no-underline">
                  formulaire de devis
                </a>
                , c'est plus précis. Ce formulaire de contact est pour les questions générales.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
