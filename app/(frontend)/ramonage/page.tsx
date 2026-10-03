import type { Metadata } from "next";
import { ServiceLanding } from "@/components/sections/ServiceLanding";
import { getService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Ramonage de poêle à pellets à Namur et en Wallonie",
  description:
    "Ramonage de poêle à pellets à 90 € TVAC, certificat remis sur place. Namur, Andenne, Gembloux, Huy, 50 km autour de Fernelmont. Rendez-vous au 081 13 83 09.",
  alternates: { canonical: "https://mister-pellets.be/ramonage" },
};

export default function RamonagePage() {
  const service = getService("ramonage");
  if (!service) return null;

  return (
    <ServiceLanding
      service={service}
      title="Ramonage de poêle à pellets en Wallonie"
      intro="Un ramonage par an : c'est ce que demandent la plupart des contrats d'assurance incendie et la notice de votre poêle. 90 € TVAC, certificat remis sur place."
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
          heading: "Obligatoire ? Pas par la loi, mais par votre contrat",
          body: (
            <>
              <p>
                Beaucoup de sites disent le contraire, alors précisons : aucune loi
                wallonne ni fédérale n&apos;impose de ramoner un poêle chaque année. Le
                ministre wallon de l&apos;Énergie l&apos;a confirmé au Parlement en janvier
                2022. L&apos;obligation existe pourtant, ailleurs : dans la plupart des
                contrats d&apos;assurance incendie, dans le bail si vous êtes locataire, dans
                la notice du fabricant, et dans le règlement de police de certaines
                communes.
              </p>
              <p>
                Le point qui coûte cher, c&apos;est l&apos;assurance. Si votre contrat impose
                un ramonage annuel et qu&apos;un feu de cheminée survient, l&apos;assureur peut
                réduire ou refuser son intervention quand le conduit non ramoné a joué dans
                le sinistre (article 65 de la loi du 4 avril 2014 sur les assurances).
                Personne n&apos;a envie d&apos;en débattre après un incendie. C&apos;est pour ça
                qu&apos;on vous remet le certificat sur place, le jour même, et pas par
                courrier trois semaines plus tard.
              </p>
              <p>
                Et même sans contrat, une fois par an reste le bon rythme : un conduit
                encrassé tire mal, la combustion se dégrade et le risque de feu de cheminée
                augmente.
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
            <>
              <p>
                Le ramonage traite le conduit, l&apos;entretien traite l&apos;appareil. Les deux
                se font au même rythme, une fois par an.
              </p>
              <p>
                Le calcul est vite fait&nbsp;: le ramonage seul est à 90 € TVAC, et notre
                entretien complet à <strong>175 € TVAC comprend déjà le ramonage</strong>. Pour
                85 € de plus, vous ajoutez la révision de l&apos;appareil sur le même passage :
                nettoyage de l&apos;échangeur, contrôle de la sonde de fumée, réglage de la
                combustion, remplacement des joints usés. C&apos;est ce que prennent la plupart
                de nos clients.
              </p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "Le ramonage est-il vraiment obligatoire pour un poêle à pellets ?",
          a: "Pas par une loi : ni la Région wallonne ni le fédéral n'imposent de ramonage annuel pour un poêle. Mais la plupart des contrats d'assurance incendie l'exigent, comme la notice du fabricant et parfois le règlement de police de votre commune. En pratique : une fois par an, certificat à l'appui.",
        },
        {
          q: "Combien coûte un ramonage ?",
          a: "90 € TVAC, certificat de ramonage compris et déplacement inclus dans notre zone d'intervention. Si vous prenez l'entretien complet à 175 € TVAC, le ramonage y est déjà compris.",
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
