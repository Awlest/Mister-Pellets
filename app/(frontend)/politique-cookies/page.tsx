import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { ConsentSettingsButton } from "@/components/layout/Analytics";
import { buttonVariants } from "@/components/ui/button-variants";

export const metadata: Metadata = {
  title: "Politique cookies",
  description:
    "Les cookies Google du site Mister Pellets, ce qu'ils mesurent, ce qui part chez Google sans votre accord et comment changer d'avis.",
  alternates: { canonical: "https://mister-pellets.be/politique-cookies" },
};

/**
 * Inventaire relevé dans le code le 19/10/2026 : le site ne pose lui-même
 * aucun cookie aux visiteurs (le cookie payload-token ne sert qu'à l'équipe
 * sur /admin). Trois clés du stockage du navigateur, puis les cookies de
 * gtag.js (lib/analytics.ts), posés seulement après Accepter. À tenir à jour
 * à chaque outil ajouté ou retiré.
 */
const COOKIES = [
  {
    category: "Indispensables",
    description:
      "Rangés dans le stockage de votre navigateur, pas dans un cookie. Ils ne servent qu'au site et ne partent nulle part.",
    items: [
      {
        name: "mp-consent",
        purpose: "Votre réponse au bandeau cookies",
        duration: "Jusqu'à ce que vous cliquiez sur « Gérer les cookies » ou effaciez les données du site",
      },
      {
        name: "mp_estimate_draft",
        purpose: "Vos réponses à l'estimation en ligne, si vous quittez la page avant la fin",
        duration: "Effacé à l'envoi de l'estimation",
      },
      {
        name: "mp_quote_draft",
        purpose: "Votre demande de devis en cours",
        duration: "Effacé à l'envoi de la demande",
      },
    ],
  },
  {
    category: "Mesure d'audience",
    description: "Déposés par Google Analytics, uniquement si vous acceptez.",
    items: [
      { name: "_ga, _ga_*", purpose: "Pages vues, provenance de la visite, parcours sur le site", duration: "Jusqu'à 2 ans" },
    ],
  },
  {
    category: "Mesure des annonces",
    description: "Déposés par Google Ads, uniquement si vous acceptez.",
    items: [
      {
        name: "_gcl_au, _gcl_aw, _gcl_gb",
        purpose: "Relier une demande (estimation, rappel, rendez-vous, appel depuis le site) au clic sur notre annonce",
        duration: "90 jours",
      },
      {
        name: "_gcl_ls",
        purpose: "Le même clic, rangé par Google dans le stockage de votre navigateur plutôt que dans un cookie",
        duration: "90 jours",
      },
    ],
  },
];

export default function PolitiqueCookiesPage() {
  return (
    <>
      <HeroSecondary
        title="Politique cookies"
        description="Quels cookies on dépose, pourquoi, et comment changer d'avis."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Politique cookies" },
        ]}
      />

      <article className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure space-y-8 text-mp-ink leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte qu&apos;un site dépose sur votre appareil (ordinateur,
              téléphone, tablette) pour s&apos;en souvenir d&apos;une visite à l&apos;autre. Certains servent au
              fonctionnement du site, d&apos;autres à mesurer l&apos;audience ou l&apos;effet des annonces.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Ce qu&apos;on utilise sur ce site</h2>
            <p>
              Le site lui-même ne vous dépose aucun cookie. Il garde trois informations dans le
              stockage de votre navigateur. Google, lui, ne dépose rien sur votre appareil tant que
              vous n&apos;avez pas accepté.
            </p>

            {COOKIES.map((cat) => (
              <div key={cat.category} className="mt-6">
                <h3 className="text-xl font-semibold text-mp-green-deep mb-2">
                  {cat.category}
                </h3>
                <p className="text-mp-ink-soft mb-4">{cat.description}</p>
                <div className="overflow-x-auto rounded-xl border border-mp-sand/40">
                  <table className="w-full text-sm">
                    <thead className="bg-mp-beige">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-mp-green-deep">Nom</th>
                        <th className="text-left px-4 py-3 font-semibold text-mp-green-deep">Finalité</th>
                        <th className="text-left px-4 py-3 font-semibold text-mp-green-deep">Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((item, i) => (
                        <tr key={i} className="border-t border-mp-sand/40">
                          <td className="px-4 py-3 font-mono text-xs">{item.name}</td>
                          <td className="px-4 py-3">{item.purpose}</td>
                          <td className="px-4 py-3 text-mp-ink-soft">{item.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <p className="mt-6">
              Si vous acceptez, Google peut aussi lire ou déposer ses propres cookies sur ses domaines
              (google.com, doubleclick.net), selon ses règles. Accepter sert à la mesure, pas à la
              publicité personnalisée : le site indique à Google qu&apos;il ne peut pas se servir de
              votre visite pour vous montrer nos annonces ailleurs, même si vous acceptez.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Ce qui part chez Google sans votre accord</h2>
            <p>
              Le site utilise le mode consentement « avancé » de Google. Tant que vous n&apos;avez pas
              répondu, ou si vous refusez, aucun cookie Google n&apos;est déposé. Les pages envoient quand
              même à Google des signaux sans cookie : page vue, demande envoyée, heure, type de
              navigateur et, comme pour toute connexion, votre adresse IP. Google s&apos;en sert pour
              estimer, quand il a assez de données, les visites et les demandes qu&apos;il ne peut pas
              compter une à une.
            </p>
            <p className="mt-3">
              Si vous arrivez par une de nos annonces, le numéro de ce clic (gclid) et un code de
              Google (_gl) peuvent aussi rester dans l&apos;adresse des pages suivantes. Une demande
              envoyée plus loin dans la visite est ainsi reliée à l&apos;annonce, sans rien enregistrer sur
              votre appareil.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Changer d&apos;avis</h2>
            <p>
              À votre première visite, un bandeau vous pose la question : Accepter ou Refuser, deux
              boutons de même taille. Refuser ne bloque rien sur le site.
            </p>
            <p className="mt-3">
              Pour changer d&apos;avis, cliquez sur « Gérer les cookies » en bas de chaque page, ou sur le
              bouton ci-dessous. Votre réponse est oubliée et le bandeau revient. Si vous refusez à
              ce moment-là, on efface aussi ce que Google avait déposé par ce site, cookies et
              stockage du navigateur.
            </p>
            <ConsentSettingsButton className={`${buttonVariants({ variant: "outline" })} mt-4 cursor-pointer`} />
            <p className="mt-6">
              Vous pouvez aussi effacer ou bloquer les cookies depuis votre navigateur :
            </p>
            <ul className="list-disc list-outside ml-5 space-y-1 mt-3">
              <li>Chrome : Paramètres → Confidentialité et sécurité → Cookies</li>
              <li>Firefox : Paramètres → Vie privée et sécurité</li>
              <li>Safari : Préférences → Confidentialité</li>
              <li>Edge : Paramètres → Cookies et autorisations de site</li>
            </ul>
            <p className="mt-3">
              Si vous bloquez aussi le stockage du navigateur, le bandeau reviendra à chaque visite et
              l&apos;estimation en ligne ne gardera pas vos réponses si vous quittez la page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Modification de la politique</h2>
            <p>
              On met cette page à jour quand on ajoute ou retire un outil. La date ci-dessous indique
              la dernière version.
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
