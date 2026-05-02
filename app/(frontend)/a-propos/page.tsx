import type { Metadata } from "next";
import Image from "next/image";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { StatsGrid } from "@/components/sections/StatsGrid";

export const metadata: Metadata = {
  title: "À propos — Mister Pellets, installateur poêles à pellets Wallonie",
  description:
    "Mister Pellets installe des poêles à pellets en Wallonie depuis 2018. Basés à Fernelmont, équipe certifiée RGIE, 400+ installations, 4.9★ sur Google.",
};

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
        description="Mister Pellets, c'est une petite équipe basée en Wallonie, qui prend le temps de bien faire le travail. Depuis 2018, on a installé plus de 400 poêles, dans des maisons de toutes tailles, avec des contraintes parfois compliquées. Voilà comment on bosse."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "À propos" },
        ]}
      />

      {/* Notre histoire */}
      <section className="bg-mp-cream py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 prose prose-lg max-w-none">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            On a commencé avec une frustration
          </h2>
          <div className="space-y-5 text-mp-ink leading-relaxed text-lg">
            <p>
              En 2018, on cherchait à installer un poêle à pellets pour une maison rurale en Hesbaye namuroise. On
              voulait quelque chose de bien fait, qui dure, avec des conseils honnêtes — pas un commercial qui pousse
              le modèle qui rapporte le plus de marge.
            </p>
            <p>
              Ce qu'on a trouvé sur le marché belge ne nous a pas convaincu : trop de promesses vagues, des installateurs
              débordés qui posaient sans vraiment regarder la maison, des SAV qui disparaissaient après la pose. On
              s'est dit qu'on pouvait faire mieux — alors on a monté Mister Pellets.
            </p>
            <p>
              Aujourd'hui, on est une petite équipe à Fernelmont. On installe entre 80 et 120 poêles par an, on connaît
              les maisons wallonnes (mosanes, fermettes rénovées, BBC modernes), et on dit non à un projet quand on
              pense que c'est pas le bon choix pour le client. Ça nous a coûté quelques ventes mais c'est ce qui fait
              qu'on a 4.9 sur 200 avis Google. C'est ce qui nous fait rentrer le matin.
            </p>
          </div>
        </div>
      </section>

      <StatsGrid
        title="Quelques chiffres"
        stats={[
          { value: "+400", label: "installations", detail: "depuis 2018" },
          { value: "4.9", label: "/ 5 sur Google", detail: "200 avis" },
          { value: "5", label: "ans de garantie", detail: "incluse" },
          { value: "RGIE", label: "certifiés", detail: "obligatoire en Belgique" },
        ]}
      />

      {/* Comment on bosse */}
      <section className="bg-mp-beige py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 prose prose-lg max-w-none">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Comment on bosse
          </h2>
          <div className="space-y-5 text-mp-ink leading-relaxed text-lg">
            <p>
              <strong>On commence par regarder la maison.</strong> Pas au téléphone, pas sur photos. On vient sur place
              ou en visio si tu préfères. On regarde la pièce, le conduit existant ou pas, l'isolation, comment tu vis,
              ce que tu cherches. Ensuite seulement on parle de modèles.
            </p>
            <p>
              <strong>On dit ce qu'on pense.</strong> Si ta maison n'a pas besoin d'un 14 kW connecté à 5 000 €, on te le
              dit. Un Ferlux 8 kW à 1 800 € peut suffire. Notre rôle c'est pas de vendre le maximum, c'est de te diriger
              vers ce qui va marcher chez toi pendant 15 ans.
            </p>
            <p>
              <strong>On pose proprement.</strong> Bâches, aspirateur, plaques de protection. On laisse l'endroit comme
              on l'a trouvé. Le premier feu est fait avec toi, on t'explique l'app si le poêle est connecté, on règle la
              programmation. Pas de "on file la doc et au revoir".
            </p>
            <p>
              <strong>On reste joignable.</strong> Le SAV n'est pas un service séparé qui demande 3 semaines pour passer.
              Si ton poêle a un souci 18 mois après la pose, tu nous appelles, on vient. C'est notre nom qu'on protège.
            </p>
          </div>
        </div>
      </section>

      <CTAFinal
        title="On se rencontre ?"
        description="Visite du showroom, visio, ou on vient chez toi pour le diagnostic. Aucune obligation derrière, juste une discussion concrète sur ton projet."
      />
    </>
  );
}
