import type { Metadata } from "next";
import { ServiceLanding } from "@/components/sections/ServiceLanding";
import { getService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Entretien de poêle à pellets à Namur et en Wallonie",
  description:
    "Entretien annuel de poêle à pellets à 175 € TVAC, ramonage et certificat compris. Namur et 50 km autour de Fernelmont. Rendez-vous au 081 13 83 09.",
  alternates: { canonical: "https://mister-pellets.be/entretien-poele-a-pellets" },
};

export default function EntretienPage() {
  const service = getService("entretien-annuel");
  if (!service) return null;

  return (
    <ServiceLanding
      service={service}
      title="Entretien annuel de poêle à pellets"
      intro="Une révision complète une fois par an, ramonage du conduit compris, à 175 € TVAC. L'appareil consomme moins, tombe moins en panne, et votre garantie reste valable."
      included={[
        "Démontage et nettoyage du creuset et du cendrier",
        "Nettoyage de l'échangeur de chaleur et de la chambre de combustion",
        "Nettoyage du conduit interne et du ventilateur d'extraction",
        "Contrôle et nettoyage de la sonde de fumée",
        "Vérification et remplacement des joints usés",
        "Contrôle du tirage et réglage des paramètres de combustion",
        "Ramonage du conduit et certificat, compris dans le tarif",
        "Test de fonctionnement complet avant départ",
      ]}
      sections={[
        {
          heading: "Ce que ça change concrètement",
          body: (
            <>
              <p>
                Un poêle entretenu consomme moins de pellets pour la même chaleur. Quand
                l&apos;échangeur est encrassé, la chaleur part dans le conduit au lieu de
                passer dans la pièce, et l&apos;appareil compense en brûlant davantage. Sur une
                saison de chauffe, l&apos;écart se voit sur la facture de granulés.
              </p>
              <p>
                L&apos;autre effet, moins visible, c&apos;est la panne évitée. La grande
                majorité des dépannages qu&apos;on fait en plein hiver concernent des appareils
                qui n&apos;ont pas été révisés : sonde de fumée encrassée, joints durcis,
                ventilateur d&apos;extraction plein de cendres. Ce sont des pièces qu&apos;on
                nettoie en entretien et qui lâchent quand on ne le fait pas.
              </p>
            </>
          ),
        },
        {
          heading: "L'entretien conditionne votre garantie",
          body: (
            <>
              <p>
                Sur les poêles que nous installons, nous offrons une garantie commerciale de
                5 ans pièces et main d&apos;œuvre, en plus de la garantie légale de 2 ans.
                Cette garantie commerciale est conditionnée à l&apos;entretien annuel — c&apos;est
                écrit dans nos conditions générales, et c&apos;est la même logique chez tous les
                fabricants.
              </p>
              <p>
                Autrement dit, sauter une année d&apos;entretien pour économiser le passage
                revient à renoncer à une couverture qui vaut bien plus cher que l&apos;entretien
                lui-même.
              </p>
            </>
          ),
        },
        {
          heading: "Quand le faire",
          body: (
            <p>
              Le forfait est de 175 € TVAC, ramonage compris, déplacement inclus dans notre
              zone d&apos;intervention. L&apos;idéal est de le faire avant la saison de chauffe, entre mai et septembre :
              les délais sont courts et vous démarrez l&apos;hiver sur un appareil propre. À
              partir d&apos;octobre, la demande grimpe et les créneaux se remplissent. Si votre
              poêle tourne toute l&apos;année ou chauffe une grande surface, un second passage
              en milieu de saison peut se justifier — on vous le dira franchement si c&apos;est
              votre cas, et pas autrement.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "À quelle fréquence faut-il entretenir un poêle à pellets ?",
          a: "Une fois par an au minimum. C'est ce que demandent les fabricants pour maintenir leur garantie, et ce qui conditionne notre garantie commerciale de 5 ans.",
        },
        {
          q: "Est-ce que je peux le faire moi-même ?",
          a: "Le nettoyage courant du creuset et du cendrier, oui, et il faut même le faire régulièrement pendant la saison. L'entretien annuel est autre chose : il demande de démonter l'échangeur, de contrôler la sonde de fumée et de reprendre les paramètres de combustion.",
        },
        {
          q: "Vous entretenez les poêles que vous n'avez pas installés ?",
          a: "Oui, sans problème, tant qu'il s'agit d'un poêle ou d'un insert à pellets. Précisez la marque et le modèle au téléphone pour qu'on prévoie les bons joints.",
        },
        {
          q: "L'entretien et le ramonage, c'est la même chose ?",
          a: "Non. L'entretien porte sur l'appareil, le ramonage sur le conduit. Notre entretien complet à 175 € TVAC comprend les deux, sur le même passage.",
        },
        {
          q: "Combien coûte un entretien annuel ?",
          a: "175 € TVAC, ramonage du conduit et certificat compris, déplacement inclus dans notre zone. C'est un forfait : vous connaissez le montant avant qu'on vienne.",
        },
        {
          q: "L'entretien à 175 € inclut vraiment le ramonage ?",
          a: "Oui. Le ramonage seul coûte 90 € TVAC. En prenant l'entretien complet à 175 €, vous ajoutez la révision de l'appareil pour 85 € de plus, sur le même passage.",
        },
      ]}
    />
  );
}
