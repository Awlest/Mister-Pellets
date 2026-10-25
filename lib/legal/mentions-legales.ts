import { BRANDS, COMPANY, CONSUMER_MEDIATION } from "./company";
import { listFr } from "./inline";
import type { LegalBlock, LegalSite } from "./types";

/**
 * Mentions légales (Code de droit économique, art. III.74 et XII.6 ; Code des
 * sociétés et des associations, art. 2:20 pour le RPM).
 *
 * ⚠️ FICHIER COMMUN aux quatre sites d'AWLEST SRL (voir types.ts). Ce qui
 * change d'un site à l'autre (marque, contact, hébergement, outils en ligne,
 * fabricants cités) vient de `site.ts`.
 */
export function mentionsLegales(site: LegalSite): LegalBlock[] {
  const C = COMPANY;
  const others = listFr(BRANDS.filter((b) => b.domain !== site.domain).map((b) => `${b.brand} (${b.domain})`));

  return [
    { h2: "Éditeur du site" },
    {
      p: `Le site ${site.domain} est édité par ${C.name}, ${C.legalForm}. ${site.brand} est une marque d'${C.name}, qui exploite aussi ${others}. Les quatre sites appartiennent à la même société, sous le même numéro d'entreprise.`,
    },
    {
      ul: [
        `Siège social : ${C.seat}.`,
        `Unité d'établissement, atelier, bureau et showroom : ${C.establishment}.`,
        `Numéro d'entreprise (BCE) : ${C.enterpriseNumber}. TVA : ${C.vat}.`,
        `Registre des personnes morales : ${C.register}.`,
        `Contact pour ${site.brand} : [${site.phone}](tel:${site.phoneHref}), [${site.email}](mailto:${site.email}).`,
        `Contact du siège : [${C.phone}](tel:${C.phoneHref}), [${C.email}](mailto:${C.email}).`,
      ],
    },
    { h2: "Responsable de la publication" },
    { p: `L'administrateur d'${C.name}.` },

    { h2: "Hébergement" },
    ...site.hosting.map((p) => ({ p })),

    { h2: "Activité, assurances et agréments" },
    {
      p: "Nous vendons, installons, entretenons et dépannons des équipements de chauffage, de climatisation, de ventilation et de production d'énergie, avec nos propres équipes.",
    },
    {
      p: "Les interventions sur les circuits contenant des fluides frigorigènes fluorés (climatisation, pompes à chaleur) sont réalisées par des techniciens frigoristes certifiés, au sein d'une entreprise agréée en technique du froid, conformément au règlement (UE) 2024/573 et à la réglementation wallonne.",
    },
    {
      p: "Notre responsabilité civile professionnelle est assurée ; les coordonnées de nos assureurs sont communiquées sur simple demande. L'assurance décennale obligatoire de la loi du 31 mai 2017 ne vise que les travaux pour lesquels l'intervention d'un architecte est requise : lorsqu'un chantier y est soumis, l'attestation d'assurance vous est remise avant le début des travaux et nos documents contractuels mentionnent l'assureur et le numéro de police.",
    },

    { h2: "Conditions de vente" },
    {
      p: `Nos [conditions générales de vente et d'installation](${site.paths.terms}) sont les mêmes pour les quatre marques. Elles s'appliquent à chaque devis et y sont annexées.`,
    },

    { h2: "Informations publiées sur ce site" },
    ...site.indicative.map((p) => ({ p })),
    {
      p: "Les informations sur les aides régionales et les taux de TVA sont données à titre informatif et évoluent. Les sources officielles font foi. Nous ne nous substituons ni à l'administration ni aux organismes prêteurs, et nous ne garantissons l'octroi d'aucune aide.",
    },
    {
      p: "Nous veillons à l'exactitude des informations publiées, mais des erreurs ou des omissions restent possibles. En cas de doute sur une caractéristique, un prix ou une disponibilité, contactez-nous : seul le devis engage l'entreprise.",
    },

    { h2: "Propriété intellectuelle" },
    {
      p: `Les textes, les photographies, les illustrations, les logos des marques d'${C.name} et la présentation de ce site sont protégés. Leur reproduction ou leur réutilisation, totale ou partielle, sur quelque support que ce soit, requiert notre accord écrit préalable.`,
    },
    {
      p: `Les marques et logos des fabricants cités (${site.manufacturers}) appartiennent à leurs propriétaires respectifs. Ils sont mentionnés à titre d'information, pour indiquer le matériel que nous vendons et installons.`,
    },

    { h2: "Liens vers d'autres sites" },
    {
      p: "Ce site renvoie vers des sites que nous n'éditons pas (administrations, fabricants, réseaux sociaux). Nous n'exerçons aucun contrôle sur leur contenu et déclinons toute responsabilité à leur égard. Les liens entre les sites de nos quatre marques renvoient vers des sites de la même société.",
    },

    { h2: "Données personnelles et cookies" },
    {
      p: `Ce que nous faisons de vos données est expliqué dans notre [politique de confidentialité](${site.paths.privacy}), et ce que le site enregistre sur votre appareil dans notre [politique cookies](${site.paths.cookies}).`,
    },

    { h2: "Réclamations et médiation" },
    {
      p: `Pour une réclamation, écrivez à [${site.email}](mailto:${site.email}). Si nous ne trouvons pas de solution ensemble, vous pouvez vous adresser gratuitement au ${CONSUMER_MEDIATION.name} (SPF Économie, ${CONSUMER_MEDIATION.address}, [${CONSUMER_MEDIATION.url.replace("https://", "")}](${CONSUMER_MEDIATION.url})).`,
    },

    { h2: "Droit applicable" },
    {
      p: "Le présent site et son utilisation sont régis par le droit belge. Les règles de compétence applicables aux litiges figurent dans nos conditions générales : un consommateur peut toujours saisir le tribunal de son domicile.",
    },
  ];
}
