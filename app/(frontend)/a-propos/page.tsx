import { CTAFinal } from "@/components/sections/CTAFinal";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { StatsGrid } from "@/components/sections/StatsGrid";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "À propos, Mister Pellets, installateur poêles à pellets en Wallonie",
  description:
    "Mister Pellets installe des poêles à pellets en Wallonie depuis 2016. Plus de 800 poêles vendus et installés. Basés à Fernelmont (Awlest SRL).",
  path: "/a-propos",
});

export default function AProposPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="Notre histoire"
        title={
          <>
            Installer le bon poêle, <span className="mp-italic">comme il faut</span>, à Fernelmont
          </>
        }
        description="Mister Pellets, c'est une petite équipe basée en Wallonie, qui prend le temps de bien faire le travail. Depuis 2016, plus de 800 poêles à pellets vendus et installés, dans des maisons de toutes tailles, avec des contraintes parfois compliquées. Voilà comment on bosse."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "À propos" },
        ]}
      />

      {/* Notre histoire */}
      <section className="bg-mp-cream py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            On a commencé avec une frustration
          </h2>
          <div className="space-y-5 text-mp-ink leading-relaxed text-lg">
            <p>
              En 2016, on cherchait à installer un poêle à pellets pour une maison rurale en Hesbaye namuroise. On
              voulait quelque chose de bien fait, qui dure, avec des conseils honnêtes, pas un commercial qui pousse
              le modèle qui rapporte le plus de marge.
            </p>
            <p>
              Ce qu'on a trouvé sur le marché belge ne nous a pas convaincu. Trop de promesses vagues, des installateurs
              débordés qui posaient sans vraiment regarder la maison, des SAV qui disparaissaient après la pose. On
              s'est dit qu'on pouvait faire mieux. Alors on a monté Mister Pellets.
            </p>
            <p>
              Aujourd'hui, on est une petite équipe à Fernelmont. On vend et on installe entre 80 et 120 poêles par an.
              On connaît les maisons wallonnes (mosanes, fermettes rénovées, BBC modernes). Et on dit non à un projet
              quand on pense que ce n'est pas le bon choix pour le client. Ça nous a coûté quelques ventes mais c'est
              ce qui nous permet de tenir notre standard de qualité sur la durée.
            </p>
          </div>
        </div>
      </section>

      <StatsGrid
        title="Quelques chiffres"
        stats={[
          { value: "+800", label: "poêles vendus et installés", detail: "depuis 2016" },
          { value: "9 ans", label: "d'expérience", detail: "spécialisés pellets" },
          { value: "5 ans", label: "de garantie", detail: "incluse sur la pose" },
          { value: "20 km", label: "autour de Fernelmont", detail: "livraison gratuite" },
        ]}
      />

      {/* Mister Pellets / Awlest, clarification factuelle (autorisée ici, cf. brief §9.4) */}
      <section className="bg-mp-cream py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Mister Pellets et Awlest, c'est quoi le lien ?
          </h2>
          <div className="space-y-5 text-mp-ink leading-relaxed text-lg">
            <p>
              Mister Pellets est la marque commerciale spécialisée dans les poêles à pellets d'Awlest SRL,
              société active en Wallonie depuis 2016. Concrètement, quand vous recevez un devis ou une facture
              de notre part, le nom <strong>Awlest</strong> apparaît sur le document, parce que c'est la
              société qui porte juridiquement l'activité.
            </p>
            <p>
              Mister Pellets, c'est le visage métier. Awlest, c'est la structure légale derrière. Même équipe,
              même showroom à Fernelmont, même numéro de TVA (BE 0656.514.212). Pas de filiale, pas de
              sous-traitance cachée.
            </p>
            <p>
              L'activité d'Awlest, qui couvre les poêles à pellets sous la marque Mister Pellets et d'autres
              services connexes, est notée 4,9 sur 5 sur Google par les clients depuis 2016. Comme la marque
              commerciale Mister Pellets a été lancée plus récemment, on préfère ne pas afficher ces avis
              comme étant ceux de Mister Pellets directement. Ils existent, ils sont vérifiables sur la fiche
              Google d'Awlest, mais on reste honnêtes sur la source.
            </p>
          </div>
        </div>
      </section>

      {/* Comment on bosse */}
      <section className="bg-mp-beige py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Comment on bosse
          </h2>
          <div className="space-y-5 text-mp-ink leading-relaxed text-lg">
            <p>
              <strong>On commence par regarder la maison.</strong> Pas au téléphone, pas sur photos. On vient sur place
              ou en visio si vous préférez. On regarde la pièce, le conduit existant ou pas, l'isolation, comment vous vivez,
              ce que vous cherchez. Ensuite seulement on parle de modèles.
            </p>
            <p>
              <strong>On dit ce qu'on pense.</strong> Si votre maison n'a pas besoin d'un 14 kW connecté à 5 000 €, on vous
              le dit. Un EK63 d'entrée de gamme autour de 2 000 € peut suffire. Notre rôle n'est pas de vendre le maximum, c'est de vous
              diriger vers ce qui va marcher chez vous pendant 15 ans.
            </p>
            <p>
              <strong>On pose proprement.</strong> Bâches, aspirateur, plaques de protection. On laisse l'endroit comme
              on l'a trouvé. Le premier feu est fait avec vous, on vous explique l'app si le poêle est connecté, on règle la
              programmation. Pas de "on file la doc et au revoir".
            </p>
            <p>
              <strong>On reste joignable.</strong> Le SAV n'est pas un service séparé qui demande 3 semaines pour passer.
              Si votre poêle a un souci 18 mois après la pose, vous nous appelez, on vient. C'est notre nom qu'on protège.
            </p>
          </div>
        </div>
      </section>

      {/* Cadre légal de l'activité */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Le cadre dans lequel on bosse
          </h2>
          <div className="space-y-5 text-mp-ink leading-relaxed text-lg">
            <p>
              Awlest SRL est inscrite à la Banque-Carrefour des Entreprises sous le numéro
              BE 0656.514.212, avec accès à la profession requis pour la pose et l'entretien d'appareils
              de chauffage. Notre siège est au Rue des Fagotis 3A, 5380 Fernelmont (province de Namur).
            </p>
            <p>
              Côté matériel, on ne distribue que des poêles à pellets conformes au règlement écoconception
              2022 (lot 20), avec rendement saisonnier d'au moins 87 %. C'est la condition d'éligibilité aux
              primes Région wallonne, et c'est aussi notre filtre de sélection à l'amont. Pas de stock B,
              pas de modèles déclassés.
            </p>
            <p>
              Pour la pose, l'attestation de conformité de l'installation et la facture détaillée vous sont
              remises à la fin du chantier. Ce sont les deux pièces que la Région demande pour traiter
              votre dossier de prime. On rédige aussi le récapitulatif technique (puissance, type d'évacuation,
              modèle exact) pour qu'il soit téléversable directement sur Mon Espace Wallonie.
            </p>
          </div>
        </div>
      </section>

      <CTAFinal
        title="On se rencontre ?"
        description="Visite du showroom, visio, ou on vient chez vous pour le diagnostic. Aucune obligation derrière, juste une discussion concrète sur votre projet."
      />
    </>
  );
}
