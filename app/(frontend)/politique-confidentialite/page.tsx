import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Ce que Mister Pellets fait de vos données : formulaires, rendez-vous, mesure Google, durées de conservation et vos droits RGPD.",
  alternates: { canonical: "https://mister-pellets.be/politique-confidentialite" },
};

/**
 * Relevé le 19/10/2026 dans le code et les outils :
 * - formulaires : app/api/{estimation,quote,rappel,contact,rdv/book}, base
 *   Supabase eu-west-1, fonctions Vercel dub1 (vercel.json), e-mails Resend
 *   (domaine en eu-west-1) vers info@awlest.com, rendez-vous dans Google Agenda ;
 * - mesure : mode consentement avancé et url_passthrough (lib/analytics.ts),
 *   détaillés dans la politique cookies ;
 * - Google Analytics : conservation réglée à 2 mois (événements) et 14 mois
 *   (utilisateur, remis à zéro à chaque visite) sur G-XZH50KSFW4 et sur
 *   G-S7R1T5NQ58, la propriété liée à la balise Google Ads.
 * Panier et paiement en ligne retirés le 04/09/2026 ; aucune newsletter dans le code.
 */
export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <HeroSecondary
        title="Politique de confidentialité"
        description="Ce qu'on garde de vous, pourquoi, et comment le faire corriger ou effacer."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Politique de confidentialité" },
        ]}
      />

      <article className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure space-y-8 text-mp-ink leading-relaxed">

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
                <strong>Vos coordonnées</strong>{" "}: nom, e-mail, téléphone, code postal, et votre
                adresse quand on vient chez vous. On ne les a que si vous remplissez un formulaire
                (estimation, devis, rappel, contact, rendez-vous), ou si vous nous appelez ou nous
                écrivez.
              </li>
              <li>
                <strong>Votre projet</strong>{" "}: surface, isolation ou PEB, type de conduit, âge du
                logement, poêle choisi. Ce sont vos réponses à l&apos;estimation ou à la demande de
                devis. Sans elles, pas de prix qui tienne la route.
              </li>
              <li>
                <strong>L&apos;origine d&apos;une demande de rappel</strong>{" "}: si vous arrivez par une
                de nos annonces, le formulaire de rappel ajoute « Google Ads » et le nom de la
                campagne à votre demande.
              </li>
              <li>
                <strong>Votre visite sur le site</strong>{" "}: pages vues, provenance, type
                d&apos;appareil et de navigateur. Si vous acceptez les cookies, Google Analytics et
                Google Ads relient ces informations à un identifiant rangé dans votre navigateur. Si
                vous refusez, ou tant que vous n&apos;avez pas répondu, Google ne dépose aucun cookie.
                Les pages lui envoient quand même des signaux sans cookie : page vue, demande
                envoyée, heure, navigateur et adresse IP. Et si vous arrivez par une annonce, le
                numéro de ce clic peut rester dans l&apos;adresse des pages suivantes. Le détail est
                dans la{" "}
                <a href="/politique-cookies" className="text-mp-orange-ink underline hover:no-underline">politique cookies</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Pourquoi on collecte ces données</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>
                Vous répondre quand vous nous écrivez ou demandez un rappel (base légale : votre
                consentement, ou l&apos;exécution du contrat).
              </li>
              <li>
                Vous faire une estimation ou un devis, et fixer la visite technique (base légale :
                mesures précontractuelles prises à votre demande).
              </li>
              <li>
                Livrer et poser votre poêle, puis assurer la garantie et l&apos;entretien (base légale :
                exécution du contrat).
              </li>
              <li>Tenir notre comptabilité (base légale : obligation légale).</li>
              <li>
                Mesurer l&apos;audience du site pour l&apos;améliorer (base légale : votre consentement aux
                cookies de mesure d&apos;audience).
              </li>
              <li>
                Savoir quelles annonces Google nous amènent des demandes et, si vous acceptez,
                laisser Google vous montrer nos annonces sur d&apos;autres sites (base légale : votre
                consentement aux cookies de mesure publicitaire ; pour les signaux sans cookie
                envoyés sans votre accord, notre intérêt légitime à savoir si nos annonces valent ce
                qu&apos;elles coûtent).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Avec qui on partage vos données</h2>
            <p>
              On ne vend vos données à personne. Elles passent par quelques prestataires, chacun
              pour un travail précis :
            </p>
            <ul className="list-disc list-outside ml-5 space-y-2 mt-3">
              <li>Vercel héberge le site. Vos formulaires passent par ses serveurs de Dublin.</li>
              <li>Supabase garde notre base de données, en Irlande.</li>
              <li>
                Resend envoie les e-mails du site, vos confirmations comme nos notifications
                internes, depuis l&apos;Irlande.
              </li>
              <li>
                OVH fait suivre les e-mails adressés à info@mister-pellets.be, sans en garder de
                copie.
              </li>
              <li>
                Google : notre messagerie, où arrivent vos demandes, l&apos;agenda où on note vos
                rendez-vous, et Google Analytics et Google Ads pour la mesure décrite plus haut.
              </li>
            </ul>
            <p className="mt-3">
              Quand on vous installe un poêle, on peut transmettre vos coordonnées au fabricant pour
              la garantie et le service après-vente.
            </p>
            <p className="mt-3">
              Vercel, Supabase, Resend et Google sont des sociétés américaines. Vos formulaires sont
              stockés en Irlande, mais Google peut traiter les données de la messagerie, de
              l&apos;agenda et de la mesure aux États-Unis. Il le fait dans le cadre du Data Privacy
              Framework, l&apos;accord de transfert entre l&apos;Union européenne et les États-Unis,
              auquel il adhère.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Combien de temps on les garde</h2>
            <ul className="list-disc list-outside ml-5 space-y-2">
              <li>Demande sans suite (estimation, devis, rappel, message) : 12 mois après notre dernier échange.</li>
              <li>
                Client (devis signé, facture, installation) : 10 ans après la facture. C&apos;est la
                durée que le Code de la TVA impose pour les factures, et elle couvre aussi la garantie.
              </li>
              <li>
                Google Analytics : 2 mois pour le détail des visites, 14 mois après votre dernière
                visite pour ce qui est rattaché à votre navigateur.
              </li>
              <li>Mesure des annonces : 90 jours (cookies Google Ads).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Vos droits RGPD</h2>
            <p>Vous avez le droit, à tout moment, et gratuitement, de :</p>
            <ul className="list-disc list-outside ml-5 space-y-2 mt-3">
              <li><strong>Accéder</strong> à vos données et en obtenir une copie</li>
              <li><strong>Rectifier</strong> vos données si elles sont incorrectes</li>
              <li><strong>Effacer</strong>{" "}vos données (« droit à l&apos;oubli »), sauf obligations légales contraires</li>
              <li><strong>Limiter</strong> le traitement</li>
              <li><strong>Récupérer</strong> vos données dans un format portable</li>
              <li><strong>Vous opposer</strong> au traitement pour motif légitime</li>
              <li><strong>Retirer</strong> votre consentement à tout moment</li>
            </ul>
            <p className="mt-4">
              Pour les cookies, le plus simple est le bouton « Gérer les cookies » en bas de chaque
              page.
            </p>
            <p className="mt-3">
              Pour le reste, écrivez à <strong>info@awlest.com</strong>. Si on a un doute sur votre
              identité, on peut vous demander de la confirmer. On vous répond dans le mois.
            </p>
            <p className="mt-3">
              En cas de désaccord, vous pouvez saisir l&apos;Autorité de protection des données (APD)
              belge :{" "}
              <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="text-mp-orange-ink underline hover:no-underline">
                autoriteprotectiondonnees.be
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Sécurité</h2>
            <p>
              Vos formulaires sont stockés en Irlande (base Supabase) et le site tourne sur les
              serveurs Vercel de Dublin. Les connexions sont chiffrées (HTTPS), les mots de passe de
              l&apos;administration sont hachés, et seule notre équipe y a accès.
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
