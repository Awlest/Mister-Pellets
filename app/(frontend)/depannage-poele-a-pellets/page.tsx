import type { Metadata } from "next";
import { ServiceLanding } from "@/components/sections/ServiceLanding";
import { getService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Dépannage de poêle à pellets à Namur et en Wallonie",
  description:
    "Poêle à pellets en panne ? Dépannage toutes marques à 110 € TVAC la première heure, déplacement inclus. Intervention sous 48 à 72 h. Appelez le 081 13 83 09.",
  alternates: { canonical: "https://mister-pellets.be/depannage-poele-a-pellets" },
};

export default function DepannagePage() {
  const service = getService("depannage");
  if (!service) return null;

  return (
    <ServiceLanding
      service={service}
      title="Dépannage de poêle à pellets"
      intro="Votre poêle ne s'allume plus, s'éteint tout seul ou affiche un code erreur. On diagnostique sur place et on répare, en général sous 48 à 72 heures. 110 € TVAC la première heure, déplacement inclus."
      included={[
        "Diagnostic complet sur place",
        "Lecture et interprétation des codes erreur",
        "Contrôle de la résistance d'allumage et du motoréducteur",
        "Contrôle de la sonde de fumée et du pressostat",
        "Vérification du tirage et de l'arrivée d'air",
        "Remplacement des pièces défectueuses",
        "Test de fonctionnement en charge avant départ",
      ]}
      sections={[
        {
          heading: "Les pannes qu'on voit le plus souvent",
          body: (
            <>
              <p>
                <strong>Le poêle ne s&apos;allume plus.</strong> Neuf fois sur dix, c&apos;est
                la résistance d&apos;allumage, une pièce d&apos;usure qui fatigue au bout de
                quelques milliers de démarrages. Elle se remplace en une intervention.
              </p>
              <p>
                <strong>Il s&apos;éteint tout seul en pleine chauffe.</strong> Généralement une
                sonde de fumée encrassée ou un conduit qui tire mal. C&apos;est le symptôme
                typique d&apos;un appareil qui n&apos;a pas été entretenu depuis deux saisons.
              </p>
              <p>
                <strong>Il ne prend plus de pellets.</strong> Le motoréducteur de la vis sans
                fin, ou un corps étranger coincé dans la vis — il arrive qu&apos;un caillou ou
                une agrafe passe avec un sac de mauvaise qualité.
              </p>
              <p>
                <strong>Un code erreur s&apos;affiche.</strong> Notez-le et donnez-le nous au
                téléphone. Chaque fabricant a sa nomenclature, et le code oriente déjà le
                diagnostic — parfois même vers quelque chose que vous pouvez régler seul en
                cinq minutes, auquel cas on vous le dira sans nous déplacer.
              </p>
            </>
          ),
        },
        {
          heading: "Appelez avant de démonter",
          body: (
            <p>
              Une partie des appels qu&apos;on reçoit concerne des poêles où quelqu&apos;un a
              déjà ouvert la carte électronique ou débranché des connecteurs. Ça complique le
              diagnostic et ça peut annuler la garantie du fabricant. Décrivez-nous le symptôme
              au téléphone, on saura souvent dire s&apos;il s&apos;agit d&apos;un réglage, d&apos;un
              nettoyage ou d&apos;une vraie panne.
            </p>
          ),
        },
        {
          heading: "Délais et zone",
          body: (
            <>
              <p>
                On intervient sous 48 à 72 heures dans la zone de 50 km autour de Fernelmont.
                En plein pic de froid, ce délai peut s&apos;allonger : c&apos;est le moment où
                tout le monde appelle en même temps, et on préfère l&apos;annoncer honnêtement
                plutôt que de promettre le lendemain.
              </p>
              <p>
                Côté tarif&nbsp;: 110 € TVAC la première heure, puis 60 € TVAC par heure
                supplémentaire, déplacement compris. Les pièces remplacées sont facturées en
                plus, et on vous annonce leur prix avant de les poser. La majorité des
                interventions tient dans la première heure.
              </p>
              <p>
                Le dépannage concerne uniquement les poêles et inserts à pellets. Pour une
                chaudière, une cuisinière ou un poêle à bûches, il faut passer par un autre
                intervenant.
              </p>
            </>
          ),
        },
      ]}
      faq={[
        {
          q: "Vous dépannez les poêles que vous n'avez pas vendus ?",
          a: "Oui, toutes marques, tant que c'est un poêle ou un insert à pellets. Donnez-nous la marque, le modèle et le code erreur au téléphone.",
        },
        {
          q: "Sous combien de temps intervenez-vous ?",
          a: "En général sous 48 à 72 heures. En période de grand froid, le délai peut s'allonger, on vous l'annonce lors de l'appel.",
        },
        {
          q: "Combien coûte une intervention ?",
          a: "110 € TVAC pour la première heure, puis 60 € TVAC par heure supplémentaire. Le déplacement est compris dans ce tarif. Les pièces éventuellement remplacées sont facturées en plus.",
        },
        {
          q: "Le déplacement est-il facturé si vous ne réparez pas ?",
          a: "La première heure à 110 € TVAC couvre le déplacement et le diagnostic, même si la réparation nécessite une pièce à commander. Vous connaissez donc le montant minimum avant qu'on se déplace.",
        },
        {
          q: "Mon poêle est encore sous garantie, que faire ?",
          a: "Dites-le nous à l'appel. Si nous l'avons installé, la panne est couverte par notre garantie commerciale de 5 ans pièces et main d'œuvre, sous réserve que l'entretien annuel ait bien été fait.",
        },
        {
          q: "Puis-je prendre rendez-vous en ligne pour un dépannage ?",
          a: "Non, uniquement par téléphone. Un dépannage demande de connaître le symptôme, le modèle et l'urgence avant de bloquer un créneau : c'est ce qui permet d'arriver avec la bonne pièce.",
        },
      ]}
    />
  );
}
