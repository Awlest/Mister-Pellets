import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment Mister Pellets traite vos données personnelles, conformément au RGPD.",
  alternates: { canonical: "https://mister-pellets.be/politique-confidentialite" },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <HeroSecondary
        title="Politique de confidentialité"
        description="Conforme RGPD, règles de traitement de vos données personnelles."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Politique de confidentialité" },
        ]}
      />

      <article className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 space-y-8 text-mp-ink leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Responsable du traitement</h2>
            <p>
              <strong>Awlest SRL</strong> · Rue des Fagotis 3A, 5380 Fernelmont, Belgique · TVA BE
              0656.514.212 · Email contact : info@awlest.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Quelles données on collecte</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>
                <strong>Données d'identification</strong> : nom, prénom, email, téléphone, adresse
                postale (collectées uniquement quand vous remplissez un formulaire ou passez commande).
              </li>
              <li>
                <strong>Données de projet</strong> : informations sur votre maison (surface, PEB,
                cheminée, etc.) collectées via le formulaire de devis pour vous établir une proposition
                pertinente.
              </li>
              <li>
                <strong>Données de navigation</strong> : pages visitées, durée de visite, type
                d'appareil. Collectées uniquement après acceptation des cookies analytiques (cf.
                <a href="/politique-cookies" className="text-mp-orange-flame underline hover:no-underline ml-1">politique cookies</a>).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Pourquoi on collecte ces données</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Vous répondre quand vous nous contactez (base légale : votre consentement / exécution du contrat).</li>
              <li>Vous fournir un devis personnalisé (base légale : exécution précontractuelle).</li>
              <li>Traiter et livrer vos commandes (base légale : exécution du contrat).</li>
              <li>Respecter nos obligations comptables et fiscales (base légale : obligation légale, conservation 7 ans).</li>
              <li>Améliorer notre site (base légale : votre consentement aux cookies analytiques).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Avec qui on partage vos données</h2>
            <p>
              Vos données ne sont <strong>jamais vendues</strong> à des tiers. Elles sont partagées
              uniquement avec nos sous-traitants techniques (hébergeur Combell, prestataire de
              paiement Mollie, fournisseur d'email Resend), tous engagés contractuellement à
              respecter la confidentialité. Pour les commandes, vos données peuvent être transmises
              au fabricant pour les besoins de garantie et SAV.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Combien de temps on les garde</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Données de devis non concrétisé : 12 mois après dernier contact.</li>
              <li>Données client (commande/installation) : 10 ans (obligation légale comptable + garantie).</li>
              <li>Données de navigation analytiques : 26 mois (Google Analytics).</li>
              <li>Newsletter : tant que vous n'avez pas demandé la désinscription.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Vos droits RGPD</h2>
            <p>Vous avez le droit, à tout moment, et gratuitement, de :</p>
            <ul className="list-disc list-outside ml-5 space-y-2 mt-3">
              <li><strong>Accéder</strong> à vos données et en obtenir une copie</li>
              <li><strong>Rectifier</strong> vos données si elles sont incorrectes</li>
              <li><strong>Effacer</strong> vos données (« droit à l'oubli »), sauf obligations légales contraires</li>
              <li><strong>Limiter</strong> le traitement</li>
              <li><strong>Récupérer</strong> vos données dans un format portable</li>
              <li><strong>Vous opposer</strong> au traitement pour motif légitime</li>
              <li><strong>Retirer</strong> votre consentement à tout moment</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits : email à <strong>info@awlest.com</strong> avec votre demande et
              une preuve d'identité. Réponse dans un délai de 30 jours.
            </p>
            <p className="mt-3">
              En cas de désaccord, vous pouvez saisir l'Autorité de protection des données (APD)
              belge :{" "}
              <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-mp-orange-flame underline hover:no-underline">
                autoriteprotectiondonnees.be
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Sécurité</h2>
            <p>
              Toutes les données sont stockées sur des serveurs situés en Europe (Combell pour la
              prod, Supabase eu-west-1 pour la base de données). Connexions chiffrées HTTPS, mots de
              passe hashés, accès admin limité aux personnes autorisées.
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
