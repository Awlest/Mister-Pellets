import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandsGrid } from "@/components/sections/BrandsGrid";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { PrimesBlock } from "@/components/sections/PrimesBlock";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd, LOCAL_BUSINESS_SCHEMA } from "@/components/seo/JsonLd";
import { buildFAQSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Poêle à pellets en Wallonie, vente, pose, entretien",
  description:
    "Edilkamin, EK63 et Girolami : poêles à pellets vendus et posés en Wallonie. Pose en 1 jour, prime Wallonie 2026 jusqu'à 960 €, livraison gratuite dans 20 km autour de Fernelmont. Devis en 60 secondes.",
};

const FAQ_HOMEPAGE = [
  {
    question: "Combien coûte un poêle à pellets installé en Wallonie ?",
    answer:
      "Pour une maison standard avec conduit existant, comptez entre 4 000 et 8 000 € tout compris (poêle + pose + raccordement). Un hydro complet pour remplacer une chaudière démarre plutôt à 8 000 € et peut monter à 14 000 € selon la puissance et la complexité du raccordement aux radiateurs. La Prime Habitation Wallonie 2026 ramène 160 à 960 € de cette facture selon votre catégorie de revenus.",
  },
  {
    question: "Quelle puissance de poêle pour quelle surface ?",
    answer:
      "La règle de base en Wallonie : 1 kW pour 10 m² si la maison est PEB B, 1 kW pour 12-15 m² en PEB A, 1 kW pour 7-8 m² en PEB E ou pire. Une maison de 100 m² PEB C demande donc autour de 12 kW. On affine toujours sur place avant le devis : surface, isolation, hauteur sous plafond, conduit existant, mode de vie.",
  },
  {
    question: "Combien de temps prend la pose d'un poêle à pellets ?",
    answer:
      "Une pose standard sur conduit existant se fait en une journée, du démontage de l'ancien appareil au premier feu avec vous en fin d'après-midi. Un canalisable avec gaines vers d'autres pièces prend 1,5 jour en moyenne. Un hydro complet avec raccordement aux radiateurs et désembouage compte 2 à 3 jours.",
  },
  {
    question: "Faut-il un audit logement pour la prime Wallonie 2026 ?",
    answer:
      "Oui, depuis le 14 février 2025, un audit logement préalable est obligatoire pour la quasi-totalité des primes Habitation, y compris pour un poêle à pellets isolé. Coût 800 à 1 200 € TVAC, validité 5 ans. C'est un changement majeur par rapport à l'ancien régime.",
  },
  {
    question: "Le SAV est-il assuré après la pose ?",
    answer:
      "Oui. Garantie 5 ans pièces et main d'œuvre incluse, intervention SAV sous 48 à 72 heures dans la zone Fernelmont et 50 km autour. On reste l'interlocuteur unique pour l'entretien annuel obligatoire et les éventuelles révisions techniques. Pas de SAV sous-traité à un tiers.",
  },
  {
    question: "Vous livrez et posez partout en Wallonie ?",
    answer:
      "Livraison gratuite dans un rayon de 20 km autour de notre showroom de Fernelmont. Au-delà : 50 € en Wallonie, 100 € à Bruxelles, 100 € en Flandre. On livre partout en Belgique, et côté pose on couvre les 5 provinces wallonnes au cas par cas.",
  },
  {
    question: "Quelles marques de poêles distribuez-vous ?",
    answer:
      "On distribue trois marques italiennes, choisies parce qu'on les connaît à fond. Edilkamin (depuis 1963), c'est la référence du chauffage biomasse : gamme très large (air, canalisable, étanche, hydro, inserts) et Wi-Fi de série. EK63, c'est la marque sœur du groupe Edilkamin, plus moderne et connectée, à un prix plus accessible. Girolami (Rome, depuis 1970), c'est le polycombustible et le brevet Source Feeding (le brasier se nettoie tout seul), avec des modèles hybrides bois et pellets et des hydros pour remplacer une chaudière. Nous, on vous dirige vers celle qui colle à votre projet, pas vers celle qui rapporte le plus.",
  },
];

export default function HomePage() {
  const faqSchema = buildFAQSchema(FAQ_HOMEPAGE);

  return (
    <>
      <JsonLd data={[LOCAL_BUSINESS_SCHEMA, faqSchema]} />

      {/* HERO, logo central doublé + spacing 35 px max (cf. doc V1.3 §P7) */}
      <section className="relative overflow-hidden bg-mp-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[500px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(242,138,32,0.18) 0%, rgba(242,138,32,0) 70%)",
          }}
        />

        {/* Bloc logo dédié : padding vertical réduit de 50 % (35 → 17,5 px)
          * suite validation client. Logo 320 px mobile / 400 px desktop. */}
        <div
          className="flex justify-center relative"
          style={{ paddingTop: "17.5px", paddingBottom: "17.5px" }}
        >
          <Image
            src="/logo-mister-pellets-full.svg"
            alt="Mister Pellets"
            width={640}
            height={640}
            priority
            className="h-[320px] w-[320px] md:h-[400px] md:w-[400px] object-contain"
          />
        </div>

        <div className="container mx-auto max-w-[1280px] px-4 md:px-6 pb-10 md:pb-16 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-mp-green-deep mb-5">
              Le bon poêle à pellets, <span className="mp-italic">installé chez vous</span> en Wallonie
            </h1>

            <p className="text-base md:text-xl text-mp-ink-soft leading-relaxed mb-7 max-w-2xl mx-auto">
              Edilkamin, EK63 et Girolami : trois marques italiennes, et on ne pose que celles-là.
              Diagnostic à domicile gratuit, devis chiffré sous 48 heures, pose en une journée,
              prime Habitation Wallonie 2026 déjà déduite. Basés à Fernelmont, on couvre les 5
              provinces wallonnes depuis 2016.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-7">
              <Button asChild variant="primary" size="lg">
                <Link href="/demande-de-devis">Devis en 60 secondes</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/boutique">Voir la boutique</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 items-center justify-center text-sm font-medium text-mp-ink-soft">
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-mp-green-deep text-base">+800</span>
                poêles vendus et installés depuis 2016
              </span>
              <span className="text-mp-sand">·</span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-mp-green-mid" />
                Pose en 1 jour
              </span>
              <span className="text-mp-sand">·</span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-mp-green-mid" />
                50 km autour de Fernelmont
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION CHOIX, réponse directe en H2 (GEO) */}
      <section className="bg-mp-beige py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-5">
            Comment choisir son poêle à pellets en Wallonie ?
          </h2>
          <div className="space-y-4 text-mp-ink leading-relaxed text-base md:text-lg">
            <p>
              Le bon choix dépend de quatre paramètres concrets : la surface à chauffer, le niveau
              d'isolation (PEB), la présence ou non d'un conduit existant, et l'usage principal
              (chauffage d'appoint d'une pièce de vie, chauffage central de la maison, ou
              remplacement d'une vieille chaudière mazout).
            </p>
            <p>
              Pour une pièce de vie ouverte de 60 à 100 m² bien isolée, un poêle à air pulsé étanche
              de 6 à 10 kW suffit largement. Pour une maison de 100 à 150 m² avec étage, on passe
              sur un canalisable qui distribue la chaleur dans 1 ou 2 chambres via des gaines
              isolées. Pour remplacer une chaudière mazout sur une grande maison wallonne 4 façades,
              on choisit un hydro de 18 à 24 kW raccordé aux radiateurs existants via un ballon
              tampon.
            </p>
            <p>
              La règle de dimensionnement la plus simple, valable pour le climat wallon : multipliez
              votre surface par 0,10 si la PEB est bonne (A-B), par 0,12 si elle est moyenne (C-D), et
              par 0,15 si elle est faible (E-G). Vous obtenez la puissance cible en kW. Sur le terrain
              on affine toujours en regardant la maison : sous-dimensionner brûle le matériel,
              sur-dimensionner provoque encrassement et inconfort.
            </p>
            <p>
              Le diagnostic à domicile, qu'on fait gratuitement dans la zone Fernelmont et 50 km
              autour, dure 30 à 45 minutes. On regarde la pièce d'installation, le conduit existant,
              l'arrivée d'air comburant possible, l'isolation, l'évacuation des fumées la plus
              naturelle. C'est de cette visite que sort le devis chiffré sous 48 heures, avec la
              prime déjà déduite.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/guides/quelle-puissance-poele-pellets"
              className="group block rounded-2xl bg-mp-cream border border-mp-sand/40 p-5 hover:border-mp-orange-flame transition-colors"
            >
              <span className="block text-sm font-semibold text-mp-green-deep mb-1">
                Calculer la puissance
              </span>
              <span className="block text-xs text-mp-ink-soft mb-3">
                Méthode complète selon PEB et surface
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mp-orange-flame group-hover:gap-2.5 transition-all">
                Voir le guide
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
            <Link
              href="/guides/poele-pellets-canalisable"
              className="group block rounded-2xl bg-mp-cream border border-mp-sand/40 p-5 hover:border-mp-orange-flame transition-colors"
            >
              <span className="block text-sm font-semibold text-mp-green-deep mb-1">
                Comprendre le canalisable
              </span>
              <span className="block text-xs text-mp-ink-soft mb-3">
                Diffuser la chaleur sur 2-3 pièces
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mp-orange-flame group-hover:gap-2.5 transition-all">
                Voir le guide
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
            <Link
              href="/guides/poele-pellets-hydro"
              className="group block rounded-2xl bg-mp-cream border border-mp-sand/40 p-5 hover:border-mp-orange-flame transition-colors"
            >
              <span className="block text-sm font-semibold text-mp-green-deep mb-1">
                Remplacer une chaudière
              </span>
              <span className="block text-xs text-mp-ink-soft mb-3">
                Passage mazout vers hydro pellets
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mp-orange-flame group-hover:gap-2.5 transition-all">
                Voir le guide
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* TABLEAU COMPARATIF, option B (cf. doc V1.2 §H5) :
          cards empilées sur mobile, format tableau classique sur sm+ */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-5">
            Poêle à pellets vs autres modes de chauffage
          </h2>
          <p className="text-base md:text-lg text-mp-ink-soft leading-relaxed mb-8">
            Quatre modes de chauffage dominent le résidentiel wallon. Voici comment ils se comparent en
            2026 sur le coût d'usage, l'investissement initial et l'autonomie.
          </p>

          {(() => {
            const rows = [
              {
                solution: "Poêle à pellets",
                emoji: "🔥",
                highlight: true,
                investissement: "4 000 à 14 000 €",
                coutAnnuel: "700 à 1 100 €",
                autonomie: "2 à 7 jours",
              },
              {
                solution: "Chaudière mazout",
                emoji: "🛢️",
                investissement: "8 000 à 15 000 €",
                coutAnnuel: "2 200 à 2 800 €",
                autonomie: "Cuve 2 à 3 ans",
              },
              {
                solution: "Chaudière gaz",
                emoji: "⛽",
                investissement: "5 000 à 12 000 €",
                coutAnnuel: "1 600 à 2 200 €",
                autonomie: "Réseau continu",
              },
              {
                solution: "Pompe à chaleur air-eau",
                emoji: "💨",
                investissement: "12 000 à 22 000 €",
                coutAnnuel: "800 à 1 400 €",
                autonomie: "Réseau continu",
              },
            ];

            return (
              <>
                {/* Vue mobile : cards empilées (jusqu'à sm) */}
                <div className="space-y-4 sm:hidden">
                  {rows.map((r) => (
                    <article
                      key={r.solution}
                      className={`rounded-2xl border p-5 ${
                        r.highlight
                          ? "bg-mp-orange-light/40 border-mp-orange-flame/40 ring-1 ring-mp-orange-flame/20"
                          : "bg-mp-cream border-mp-sand/40"
                      }`}
                    >
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-mp-green-deep mb-3">
                        <span aria-hidden>{r.emoji}</span>
                        {r.solution}
                      </h3>
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                        <dt className="text-mp-ink-soft">Investissement</dt>
                        <dd className="text-mp-ink font-medium text-right">{r.investissement}</dd>
                        <dt className="text-mp-ink-soft">Coût annuel*</dt>
                        <dd className="text-mp-ink font-medium text-right">{r.coutAnnuel}</dd>
                        <dt className="text-mp-ink-soft">Autonomie</dt>
                        <dd className="text-mp-ink font-medium text-right">{r.autonomie}</dd>
                      </dl>
                    </article>
                  ))}
                </div>

                {/* Vue tablette/desktop : tableau classique (sm+) */}
                <div className="hidden sm:block">
                  <table className="w-full text-sm border-collapse rounded-2xl overflow-hidden bg-mp-cream border border-mp-sand/40">
                    <thead className="bg-mp-green-deep text-mp-cream">
                      <tr>
                        <th className="p-4 text-left font-semibold">Solution</th>
                        <th className="p-4 text-left font-semibold">Investissement</th>
                        <th className="p-4 text-left font-semibold">Coût annuel*</th>
                        <th className="p-4 text-left font-semibold">Autonomie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr
                          key={r.solution}
                          className={
                            r.highlight
                              ? "bg-mp-orange-light/30"
                              : i % 2 === 0
                                ? "bg-mp-cream"
                                : "bg-mp-beige/40"
                          }
                        >
                          <td className="p-4 border-t border-mp-sand/30 text-mp-ink font-semibold">
                            <span className="mr-1.5" aria-hidden>{r.emoji}</span>
                            {r.solution}
                          </td>
                          <td className="p-4 border-t border-mp-sand/30 text-mp-ink">{r.investissement}</td>
                          <td className="p-4 border-t border-mp-sand/30 text-mp-ink">{r.coutAnnuel}</td>
                          <td className="p-4 border-t border-mp-sand/30 text-mp-ink">{r.autonomie}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}

          <p className="mt-4 text-xs text-mp-ink-soft italic">
            * Estimation pour une maison wallonne 130 m² PEB C, prix combustibles avril 2026.
            Le pellet et la pompe à chaleur sortent en tête sur le coût d'usage. La pompe à chaleur
            demande plus d'investissement initial mais s'amortit sur 8 à 12 ans. Le pellet a l'avantage
            du combustible local et d'une autonomie sans contrat fournisseur.
          </p>
        </div>
      </section>

      <BrandsGrid />

      {/* SECTION COÛT */}
      <section className="bg-mp-beige py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-5">
            Combien coûte un poêle à pellets installé ?
          </h2>
          <div className="space-y-4 text-mp-ink leading-relaxed text-base md:text-lg">
            <p>
              Le ticket d'entrée pour un poêle à air pulsé étanche posé en Wallonie démarre autour
              de 4 000 € TVAC tout compris (matériel + pose + raccordement au conduit existant).
              Sur ce segment, on conseille typiquement un EK63 ou un Edilkamin d'entrée de gamme.
            </p>
            <p>
              Pour un canalisable de 10 à 14 kW qui chauffe 1 ou 2 pièces supplémentaires via gaines,
              compte 5 500 à 7 500 € TVAC. C'est la majorité de notre activité, sur des maisons à
              étage. Les modèles EK63 et Edilkamin Mood ou Cherie Up dominent ce segment.
            </p>
            <p>
              Pour un hydro complet de 18 à 24 kW raccordé aux radiateurs existants, prévoyez 8 000 à
              14 000 € TVAC selon la puissance, la complexité du circuit, le ballon tampon, et le
              démantèlement éventuel d'une cuve mazout. C'est le poste le plus important, mais c'est
              aussi celui où l'économie sur le combustible rentabilise le plus vite (5 à 9 ans
              typiquement).
            </p>
            <p>
              Sur l'ensemble de ces fourchettes, la TVA est de 6 % au lieu de 21 % parce que
              l'écrasante majorité des logements wallons concernés ont plus de 10 ans. Cette TVA
              réduite est appliquée d'office par l'installateur, ce n'est pas une prime à demander.
              S'ajoutent ensuite la Prime Habitation Wallonie 2026 (160 à 960 € selon catégorie de
              revenus) et d'éventuelles primes communales (cuve mazout, rénovation chauffage).
            </p>
          </div>
        </div>
      </section>

      <ProcessSteps
        steps={[
          {
            title: "Diagnostic à domicile",
            description: "On vient sur place. Surface, isolation, conduit, accès. 30 à 45 minutes, sans engagement.",
          },
          {
            title: "Devis chiffré sous 48h",
            description: "Modèle adapté, prix TVAC, prime Wallonie déjà calculée, délai annoncé.",
          },
          {
            title: "Pose en 1 journée",
            description: "Bâches, plaques de protection, raccordement, premier feu avec vous en fin d'aprèm.",
          },
          {
            title: "Mise en route + SAV",
            description: "Garantie 5 ans pièces et main d'œuvre, intervention sous 48-72 h, entretien annuel.",
          },
        ]}
      />

      <PrimesBlock />

      {/* SECTION DÉLAIS */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-5">
            Délais et déroulement d'une installation Mister Pellets
          </h2>
          <div className="space-y-4 text-mp-ink leading-relaxed text-base md:text-lg">
            <p>
              Du premier contact à la mise en service, comptez 3 à 6 semaines en saison normale, un
              peu plus long de septembre à décembre où la demande est forte. Le diagnostic à
              domicile peut être planifié dans la semaine qui suit votre appel ou votre formulaire.
              Le devis tombe sous 48 heures ouvrées après visite.
            </p>
            <p>
              Une fois le devis signé, on commande le matériel (stock atelier ou usine selon
              modèle). Les modèles courants sont disponibles sous 5 à 10 jours. Pour les
              configurations spécifiques (couleurs rares, hydros sur-mesure), prévoyez 3 à 5 semaines.
              On vous donne une date de pose ferme dans le devis.
            </p>
            <p>
              Le jour de la pose, l'équipe arrive entre 8 h et 9 h, démonte l'ancien appareil le
              cas échéant, prépare la zone (bâches, plaques de protection). Le poêle est mis en
              place, raccordé, étanchéifié. Le premier feu se fait avec vous en fin d'après-midi,
              avec la formation à l'app si le poêle est connecté et le réglage de la programmation
              hebdomadaire selon votre rythme de vie.
            </p>
          </div>
        </div>
      </section>

      <Testimonials />

      <FAQAccordion
        title="Questions fréquentes des Wallons"
        description="Les sept questions que les clients nous posent en premier. Si vous avez un cas particulier, le téléphone reste le moyen le plus rapide."
        items={FAQ_HOMEPAGE}
      />

      <CTAFinal
        title="Devis chiffré en 60 secondes"
        description="Vous remplissez surface, type d'usage, contraintes. On vous recontacte sous 24 h ouvrées avec une fourchette de prix et un créneau de diagnostic. Sans engagement."
      />
    </>
  );
}
