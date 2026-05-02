import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { ContactForm } from "@/components/forms/ContactForm";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact, Mister Pellets Wallonie",
  description:
    "Contacte Mister Pellets à Fernelmont : téléphone, email, adresse showroom, horaires. On répond dans la journée pendant les heures ouvrées.",
};

const PHONE = "0472 04 32 22";
const EMAIL = "info@awlest.com";

export default function ContactPage() {
  return (
    <>
      <HeroSecondary
        title="Une question ? On répond."
        description="Téléphone, email ou formulaire. On revient vers toi dans la journée pendant les heures ouvrées (lun-ven 9h-18h, sam 9h-13h)."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Contact" },
        ]}
      />

      <section className="bg-mp-cream py-12 md:py-20">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
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

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-mp-beige border border-mp-sand/40">
                <MapPin className="h-5 w-5 text-mp-orange-flame mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-mp-ink-soft uppercase tracking-wider block mb-1">Showroom & atelier</span>
                  <address className="not-italic text-mp-ink leading-relaxed">
                    Rue des Fagotis 3A
                    <br />
                    5380 Fernelmont
                    <br />
                    Belgique
                  </address>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-mp-beige border border-mp-sand/40">
                <Clock className="h-5 w-5 text-mp-orange-flame mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs text-mp-ink-soft uppercase tracking-wider block mb-1">Horaires</span>
                  <ul className="text-mp-ink space-y-1 leading-relaxed">
                    <li>Lundi - Vendredi : 9h - 18h</li>
                    <li>Samedi : 9h - 13h</li>
                    <li className="text-mp-ink-soft">Dimanche : fermé</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-semibold text-mp-green-deep mb-2">
                Ou écris-nous directement
              </h2>
              <p className="text-mp-ink-soft mb-8">
                Pour un devis personnalisé, prends 60 secondes pour remplir le{" "}
                <a href="/demande-de-devis" className="text-mp-orange-flame underline hover:no-underline">
                  formulaire de devis
                </a>{" "}
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
