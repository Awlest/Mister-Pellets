import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Mister Pellets / Awlest SRL.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <HeroSecondary
        title="Mentions légales"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Mentions légales" },
        ]}
      />

      <article className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 space-y-8 text-mp-ink leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Éditeur du site</h2>
            <p>
              Le site <strong>mister-pellets.be</strong> est édité par :
            </p>
            <address className="not-italic mt-3">
              <strong>Awlest SRL</strong>
              <br />
              Rue des Fagotis 3A
              <br />
              5380 Fernelmont, Belgique
              <br />
              TVA : BE 0656.514.212
              <br />
              Téléphone : 0472 04 32 22
              <br />
              Email : info@awlest.com
            </address>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Marque commerciale</h2>
            <p>
              <em>Mister Pellets</em> est la marque commerciale exploitée par Awlest SRL pour ses
              activités de vente, installation et entretien de poêles à pellets en Wallonie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Hébergement</h2>
            <p>
              Le site est hébergé par <strong>Combell</strong> (datacenter Bruxelles). Pendant la
              phase de construction, des déploiements de prévisualisation sont également hébergés
              par Vercel Inc. (États-Unis), accessibles uniquement via authentification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Directeur de publication</h2>
            <p>
              Le directeur de la publication est le gérant de Awlest SRL.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Propriété intellectuelle</h2>
            <p>
              L'ensemble du site (textes, photos, logos, charte graphique, code source) est la
              propriété exclusive de Awlest SRL ou de ses partenaires (marques distribuées :
              Edilkamin, EK63, Dielle, Ferlux pour les éléments propres à ces marques). Toute
              reproduction, totale ou partielle, sans autorisation écrite préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Responsabilité</h2>
            <p>
              Les informations fournies sur le site sont données à titre indicatif. Awlest SRL met
              tout en œuvre pour offrir des informations à jour et exactes, mais ne peut garantir
              l'absence d'erreurs ou d'omissions. Les caractéristiques techniques et les prix des
              produits peuvent évoluer. En cas de doute, contactez-nous pour confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Données personnelles</h2>
            <p>
              Le traitement des données personnelles est détaillé dans notre{" "}
              <a href="/politique-confidentialite" className="text-mp-orange-flame underline hover:no-underline">
                politique de confidentialité
              </a>{" "}
              et notre{" "}
              <a href="/politique-cookies" className="text-mp-orange-flame underline hover:no-underline">
                politique cookies
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit belge. Tout litige relatif à
              l'utilisation du site relève de la compétence des tribunaux de Namur.
            </p>
          </section>

          <p className="text-sm text-mp-ink-soft pt-6 border-t border-mp-sand/40">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-BE", { year: "numeric", month: "long" })}
          </p>
        </div>
      </article>
    </>
  );
}
