import type { Metadata } from "next";
import { ServiceLanding } from "@/components/sections/ServiceLanding";
import { getService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Ramonage de poêle à pellets à Namur et en Wallonie",
  description:
    "Ramonage annuel de votre poêle à pellets, certificat remis sur place. Fernelmont, Namur, Andenne, Gembloux, Huy. Rendez-vous par téléphone au 081 13 83 09.",
  alternates: { canonical: "https://mister-pellets.be/ramonage" },
};

export default function RamonagePage() {
  const service = getService("ramonage");
  if (!service) return null;

  return (
    <ServiceLanding
      service={service}
      title="Ramonage de poêle à pellets"
      intro="Le ramonage annuel du conduit est obligatoire, et c'est la première chose que votre assurance demandera en cas de sinistre. On le fait, et on vous remet le certificat sur place."
      included={[
        "Ramonage mécanique complet du conduit de fumée",
        "Contrôle du chapeau et de la sortie en toiture",
        "Vérification des distances de sécurité",
        "Contrôle du tirage après ramonage",
        "Certificat de ramonage remis sur place",
        "Protection du sol et aspiration des suies",
      ]}
      sections={[
        {
          heading: "Pourquoi c'est obligatoire",
          body: (
            <>
              <p>
                En Wallonie, le ramonage du conduit est imposé une fois par an pour un
                appareil à combustible solide, et le pellet en fait partie. Ce n&apos;est pas
                une formalité administrative : un conduit encrassé tire mal, la combustion
                se dégrade, et le risque de feu de cheminée augmente.
              </p>
              <p>
                Le point qui coûte cher, c&apos;est l&apos;assurance. En cas de sinistre lié
                à l&apos;appareil, l&apos;assureur réclame le certificat de ramonage de
                l&apos;année. Sans lui, la prise en charge peut être refusée. C&apos;est la
                raison pour laquelle on vous le remet sur place, le jour même, et pas par
                courrier trois semaines plus tard.
              </p>
            </>
          ),
        },
        {
          heading: "Un poêle à pellets, ça s'encrasse aussi",
          body: (
            <>
              <p>
                On entend souvent que le pellet est propre et qu&apos;il ne salit pas. C&apos;est
                vrai comparé au bois bûche, mais la combustion produit quand même des cendres
                volantes et des dépôts qui se déposent dans le conduit, surtout sur les
                parcours longs ou avec des coudes.
              </p>
              <p>
                Un conduit qui se bouche progressivement se signale toujours de la même façon :
                le poêle s&apos;encrasse plus vite, il faut nettoyer le creuset plus souvent, et
                finissent par apparaître des extinctions en pleine chauffe. Quand on en arrive
                là, le ramonage seul ne suffit plus et il faut aussi un entretien complet.
              </p>
            </>
          ),
        },
        {
          heading: "Ramonage seul ou avec l'entretien",
          body: (
            <p>
              Le ramonage traite le conduit, l&apos;entretien traite l&apos;appareil. Les deux
              se font au même rythme, une fois par an, et la plupart de nos clients les
              regroupent sur le même passage : c&apos;est un seul déplacement, donc moins cher
              que deux interventions séparées. Dites-le au téléphone, on cale les deux
              ensemble.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Le ramonage est-il vraiment obligatoire pour un poêle à pellets ?",
          a: "Oui. Le pellet est un combustible solide, le ramonage annuel du conduit s'applique comme pour un poêle à bois. Le certificat vous sera demandé par votre assurance en cas de sinistre.",
        },
        {
          q: "Combien de temps ça prend ?",
          a: "Comptez environ une heure pour un ramonage seul. Si on le combine avec l'entretien annuel du poêle, prévoyez plutôt deux heures sur place.",
        },
        {
          q: "Vous ramonez aussi les cheminées classiques et les chaudières ?",
          a: "Non. On intervient uniquement sur les conduits raccordés à un poêle ou un insert à pellets. Pour une cheminée à bois bûches ou une chaudière mazout, il faut passer par un ramoneur généraliste.",
        },
        {
          q: "Faut-il que le poêle soit froid ?",
          a: "Oui, l'appareil doit être à l'arrêt depuis la veille au soir. On vous le rappelle lors de la prise de rendez-vous.",
        },
        {
          q: "Vous vous déplacez jusqu'où ?",
          a: "Jusqu'à 50 km autour de Fernelmont : Namur, Andenne, Éghezée, Gembloux, Huy, Ciney, et le reste de la zone en Wallonie.",
        },
      ]}
    />
  );
}
