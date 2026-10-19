import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Mister Pellets / Awlest SRL.",
  alternates: { canonical: "https://mister-pellets.be/mentions-legales" },
};

/**
 * Relevé le 19/10/2026 :
 * - hébergement : fonctions Vercel en dub1 (vercel.json), store Blob
 *   mister-pellets-next-blob en fra1, base Supabase eu-west-1 ; adresse de
 *   Vercel Inc. reprise de vercel.com/legal/privacy-notice (version du 01/06/2026) ;
 * - responsable : la BCE (0656.514.212) inscrit un administrateur, pas un gérant.
 */
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

      <article className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure space-y-8 text-mp-ink leading-relaxed">

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
              <em>Mister Pellets</em>{" "}
              est une marque d&apos;Awlest SRL. Sous ce nom, on vend, on pose et on entretient des
              poêles à pellets en Wallonie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <address className="not-italic mt-3">
              <strong>Vercel Inc.</strong>
              <br />
              {/* check-design: allow (n° de boîte de l'adresse de Vercel, pas une couleur) */}
              440 N Barranca Avenue #4133
              <br />
              Covina, CA 91723, États-Unis
            </address>
            <p className="mt-3">
              Vos formulaires passent par ses serveurs de Dublin, en Irlande. Les photos du site
              sont stockées chez Vercel, à Francfort. On garde vos demandes dans notre base de
              données chez Supabase, en Irlande elle aussi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Responsable de la publication</h2>
            <p>
              Le responsable de la publication est l&apos;administrateur d&apos;Awlest SRL.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du site (textes, photos, logos, charte graphique, code source) est la
              propriété exclusive d&apos;Awlest SRL ou de ses partenaires (marques distribuées :
              Edilkamin, EK63, Girolami, Dielle, Ferlux, Austroflamm, Cadel pour les éléments propres à ces marques). Toute
              reproduction, totale ou partielle, sans autorisation écrite préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Responsabilité</h2>
            <p>
              Les informations fournies sur le site sont données à titre indicatif. Awlest SRL met
              tout en œuvre pour offrir des informations à jour et exactes, mais ne peut garantir
              l&apos;absence d&apos;erreurs ou d&apos;omissions. Les caractéristiques techniques et les prix des
              produits peuvent évoluer. En cas de doute, contactez-nous pour confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Données personnelles</h2>
            <p>
              Le traitement des données personnelles est détaillé dans notre{" "}
              <a href="/politique-confidentialite" className="text-mp-orange-ink underline hover:no-underline">
                politique de confidentialité
              </a>{" "}
              et notre{" "}
              <a href="/politique-cookies" className="text-mp-orange-ink underline hover:no-underline">
                politique cookies
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit belge. Tout litige relatif à
              l&apos;utilisation du site relève de la compétence des tribunaux de Namur.
            </p>
          </section>

          <p className="mp-measure text-sm text-mp-ink-soft pt-6 border-t border-mp-sand/40">
            Dernière mise à jour : octobre 2026
          </p>
          </div>
        </div>
      </article>
    </>
  );
}
