import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente, Awlest SRL / Mister Pellets.",
  alternates: { canonical: "https://mister-pellets.be/cgv" },
};

export default function CGVPage() {
  return (
    <>
      <HeroSecondary
        title="Conditions générales de vente"
        description="Version applicable à toutes les commandes passées sur mister-pellets.be."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "CGV" },
        ]}
      />

      <article className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 space-y-8 text-mp-ink leading-relaxed">
          <p className="text-sm text-mp-ink-soft p-4 rounded-xl bg-mp-orange-light/40 border border-mp-orange-warm/40">
            ⚠️ <strong>Document à finaliser</strong> avant la mise en production officielle. Le client doit
            faire valider ces conditions par un juriste belge. Cette version est un brouillon de référence.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">1. Objet</h2>
            <p>
              Les présentes conditions générales régissent les ventes de produits et de services
              effectuées par Awlest SRL (ci-après « Mister Pellets ») via le site mister-pellets.be
              ainsi que par devis. Toute commande implique l'acceptation pleine et entière des
              présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">2. Identité du vendeur</h2>
            <p>
              <strong>Awlest SRL</strong> · Siège social : Rue des Fagotis 3A, 5380 Fernelmont,
              Belgique · TVA : BE 0656.514.212 · Téléphone : 0472 04 32 22 · Email : info@awlest.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">3. Produits et services</h2>
            <p>
              Mister Pellets distribue des poêles à pellets des marques Edilkamin, EK63, Dielle et
              Ferlux. Mister Pellets propose également des prestations de pose, mise en service,
              entretien annuel et tubage de cheminée. Les caractéristiques techniques sont fournies
              à titre indicatif d'après les données fabricant.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">4. Prix</h2>
            <p>
              Les prix affichés sur le site sont en euros, toutes taxes comprises (TVA 21 % sur les
              produits). La pose et la mise en service bénéficient du taux de TVA réduit à 6 % pour
              les habitations privées de plus de 10 ans, conformément à la législation belge. Les
              prix sont garantis pour la durée du devis (30 jours) sauf modification du tarif
              fabricant.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">5. Commande</h2>
            <p>
              La commande se confirme soit par signature du devis, soit par paiement en ligne via le
              site. Mister Pellets se réserve le droit de refuser une commande pour des raisons
              légitimes (rupture de stock, anomalie de prix, motif technique).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">6. Paiement</h2>
            <p>
              Pour les ventes en ligne : paiement intégral à la commande via Stripe (cartes,
              Bancontact). Pour les devis avec pose : acompte de 30 % à la signature, solde à la fin
              de la pose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">7. Livraison</h2>
            <p>
              Livraison gratuite des poêles dans un rayon de 50 km autour de Fernelmont. Au-delà, un
              forfait de 85 € s'applique pour la Belgique. Les délais de livraison sont indicatifs :
              48h à 4-6 semaines selon la disponibilité du modèle. Mister Pellets informe le client
              de tout retard significatif.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">8. Pose et installation</h2>
            <p>
              La pose est réalisée par notre équipe (Awlest SRL, inscrite à la Banque-Carrefour
              des Entreprises sous le numéro BE 0656.514.212, accès à la profession requis).
              Une visite technique préalable est obligatoire pour valider la faisabilité (conduit,
              distances de sécurité, accès). La pose comprend le raccordement au conduit, la mise
              en service, et la formation initiale du client.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">9. Droit de rétractation</h2>
            <p>
              Conformément au Code de droit économique belge, le consommateur dispose d'un délai de
              <strong> 14 jours</strong> à compter de la réception du produit pour exercer son droit
              de rétractation, sans avoir à motiver sa décision. Les frais de retour sont à la charge
              du consommateur. Ce droit ne s'applique pas aux produits installés ou aux prestations
              de pose déjà exécutées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">10. Garantie légale</h2>
            <p>
              Tous les produits bénéficient de la garantie légale de conformité de 2 ans applicable
              en Belgique. Mister Pellets offre en complément une garantie commerciale de 5 ans
              pièces et main d'œuvre sur les poêles installés par notre équipe, sous réserve de
              l'entretien annuel.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">11. Service après-vente</h2>
            <p>
              Le SAV est assuré directement par Mister Pellets pour les poêles installés par notre
              équipe. Délai d'intervention typique : 48h à 5 jours selon la nature de la panne. Pour
              les poêles non installés par nous, nous renvoyons vers le réseau SAV de la marque.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">12. Données personnelles et litiges</h2>
            <p>
              Le traitement des données est détaillé dans notre{" "}
              <a href="/politique-confidentialite" className="text-mp-orange-flame underline hover:no-underline">
                politique de confidentialité
              </a>
              . En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les
              tribunaux de Namur sont compétents. Le consommateur peut également saisir le Service
              de médiation pour le consommateur (Belgique).
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
