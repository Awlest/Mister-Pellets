import type { Metadata } from "next";
import { HeroSecondary } from "@/components/sections/HeroSecondary";

export const metadata: Metadata = {
  title: "Politique cookies",
  description: "Liste détaillée des cookies utilisés par Mister Pellets et comment les paramétrer.",
  alternates: { canonical: "https://mister-pellets.be/politique-cookies" },
};

const COOKIES = [
  {
    category: "Essentiels",
    description: "Indispensables au fonctionnement du site. Pas de consentement requis.",
    items: [
      { name: "mp_session", purpose: "Session utilisateur (panier, login admin)", duration: "Session" },
      { name: "mp_cookie_consent", purpose: "Mémorise votre choix sur le bandeau cookies", duration: "12 mois" },
    ],
  },
  {
    category: "Analytiques",
    description: "Mesure d'audience anonyme. Activés uniquement après votre consentement.",
    items: [
      { name: "_ga, _ga_*", purpose: "Google Analytics 4, pages vues, durée, parcours", duration: "26 mois" },
      { name: "_clck, _clsk", purpose: "Microsoft Clarity, heatmaps anonymes", duration: "12 mois" },
    ],
  },
  {
    category: "Fonctionnels",
    description: "Améliorent l'expérience. Activés uniquement après votre consentement.",
    items: [
      { name: "youtube_*", purpose: "Lecture des vidéos YouTube intégrées (si applicable)", duration: "Variable" },
    ],
  },
];

export default function PolitiqueCookiesPage() {
  return (
    <>
      <HeroSecondary
        title="Politique cookies"
        description="Quels cookies on dépose, pourquoi, et comment les contrôler."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Politique cookies" },
        ]}
      />

      <article className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 space-y-8 text-mp-ink leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, mobile,
              tablette) lors de la visite d'un site. Il permet de mémoriser des informations sur votre
              navigation : préférences, panier, session. Certains sont indispensables au
              fonctionnement, d'autres servent à mesurer l'audience ou à proposer des fonctionnalités
              optionnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Comment on utilise les cookies sur ce site</h2>
            <p>
              On distingue 3 catégories de cookies selon leur finalité :
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
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Comment paramétrer ou refuser les cookies</h2>
            <p>
              Sur votre première visite, un bandeau vous demande votre choix : accepter, refuser, ou
              personnaliser par catégorie. Vous pouvez modifier vos préférences à tout moment en cliquant
              sur le lien « Cookies » en bas de chaque page.
            </p>
            <p className="mt-3">
              Vous pouvez aussi gérer les cookies directement depuis votre navigateur :
            </p>
            <ul className="list-disc list-outside ml-5 space-y-1 mt-3">
              <li>Chrome : Paramètres → Confidentialité et sécurité → Cookies</li>
              <li>Firefox : Paramètres → Vie privée et sécurité</li>
              <li>Safari : Préférences → Confidentialité</li>
              <li>Edge : Paramètres → Cookies et autorisations de site</li>
            </ul>
            <p className="mt-3">
              ⚠️ Bloquer tous les cookies, y compris les essentiels, peut empêcher certaines
              fonctionnalités du site (panier, session, formulaires).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-mp-green-deep mb-3">Modification de la politique</h2>
            <p>
              Cette politique peut évoluer pour s'adapter aux nouveaux outils ou à la réglementation.
              Toute modification significative vous sera signalée via le bandeau cookies.
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
