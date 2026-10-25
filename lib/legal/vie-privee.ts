import { COMPANY, DATA_AUTHORITY } from "./company";
import type { LegalBlock, LegalSite } from "./types";

/**
 * Politique de confidentialité.
 *
 * ⚠️ FICHIER COMMUN aux quatre sites d'AWLEST SRL (voir types.ts). Les
 * traitements propres au site (formulaires, prestataires, mesure d'audience)
 * viennent de `site.ts`, qui doit décrire ce que le site FAIT réellement : un
 * formulaire ou un outil ajouté se reporte dans `site.ts` le jour même.
 *
 * Durées communes aux quatre sites : demande sans suite, 12 mois après le
 * dernier échange (décision de Dorian du 19/10/2026, suppression à la main
 * dans l'administration) ; client, 7 ans après la dernière facture (Code de
 * la TVA, art. 60, ramené de 10 à 7 ans par la loi du 18/12/2025 avec effet
 * au 01/01/2023 ; pièces comptables : CDE art. III.86).
 */
export function viePrivee(site: LegalSite): LegalBlock[] {
  const C = COMPANY;
  const mail = `[${site.email}](mailto:${site.email})`;

  return [
    {
      p: `Cette page explique quelles données ${site.brand} reçoit sur ${site.domain}, ce que nous en faisons, combien de temps nous les gardons et comment exercer vos droits. Elle décrit ce que le site fait réellement, et suit le même modèle sur les sites des quatre marques d'${C.name}.`,
    },

    { h2: "Qui est responsable de vos données" },
    {
      p: `${C.name}, ${C.seat}, numéro d'entreprise ${C.enterpriseNumber}, qui exploite la marque ${site.brand}. Pour toute question sur vos données : ${mail} ou [${site.phone}](tel:${site.phoneHref}). Nous n'avons pas désigné de délégué à la protection des données, la loi ne l'imposant pas pour nos traitements ; votre demande est traitée par la direction.`,
    },

    { h2: "Ce que nous recevons" },
    {
      p: "Nous ne recevons que ce que vous nous transmettez vous-même, et ce qui est nécessaire à la mesure décrite plus bas lorsque le site en a une.",
    },
    {
      ul: [
        ...site.collected,
        "**Quand vous nous appelez ou nous écrivez** : ce que vous choisissez de nous dire.",
        "**Quand vous devenez client** : les informations du devis, de la facture, du chantier (photos, fiche d'intervention) et de l'entretien de votre installation.",
      ],
    },
    {
      p: "Nous ne demandons aucune donnée sensible (santé, opinions, origine) et nous ne prenons aucune décision automatisée à votre sujet.",
    },

    { h2: "Pourquoi, et sur quelle base" },
    {
      ul: [
        "**Vous répondre, fixer la visite technique et établir votre devis** : les démarches préalables à un contrat, à votre demande.",
        "**Livrer, poser, entretenir et garantir votre installation** : l'exécution du contrat.",
        "**Tenir notre comptabilité et conserver nos factures** : nos obligations légales.",
        "**Utiliser des photos de chantier, sans personne ni adresse identifiable, comme références** : notre intérêt légitime, auquel vous pouvez vous opposer à tout moment.",
        ...site.purposes,
      ],
    },
    {
      p: "Nous ne vous envoyons pas de lettre d'information et nous ne vendons, ne louons ni ne cédons vos données à personne.",
    },

    { h2: "Qui y a accès" },
    {
      p: `L'équipe d'${C.name}, et les prestataires techniques ci-dessous, chacun pour un travail précis, sur nos instructions et sans pouvoir les utiliser pour son propre compte.`,
    },
    { ul: site.processors },
    {
      p: "Selon votre dossier, nous transmettons aussi le nécessaire au fabricant de votre appareil (garantie, service après-vente), au sous-traitant éventuel à qui une partie du chantier serait confiée, à notre comptable, et aux autorités lorsque la loi l'impose.",
    },

    { h2: "Transferts hors de l'Union européenne" },
    { p: site.transfers },

    { h2: "Combien de temps nous les gardons" },
    {
      ul: [
        "**Demande restée sans suite** (devis, rappel, message, rendez-vous) : 12 mois après notre dernier échange.",
        "**Client** : 7 ans après la dernière facture, la durée de conservation que la loi impose pour les factures et les pièces comptables, et au moins la durée des garanties de votre installation.",
        ...site.retention,
      ],
    },

    { h2: "Vos droits" },
    {
      p: "Vous pouvez, gratuitement et à tout moment, accéder à vos données et en obtenir une copie, les faire rectifier ou effacer, en limiter l'usage, les recevoir dans un format lisible par machine, vous opposer à un traitement fondé sur notre intérêt légitime et retirer votre accord quand vous l'avez donné. L'effacement trouve sa limite dans ce que la loi nous oblige à conserver, comme les factures.",
    },
    {
      p: `Écrivez à ${mail} ou à [${C.email}](mailto:${C.email}) en précisant votre demande. Nous répondons dans un délai d'un mois. Si nous avons un doute raisonnable sur votre identité, nous pouvons vous demander de la confirmer.`,
    },
    {
      p: `Si notre réponse ne vous satisfait pas, vous pouvez introduire une réclamation auprès de l'${DATA_AUTHORITY.name}, ${DATA_AUTHORITY.address}, [${DATA_AUTHORITY.email}](mailto:${DATA_AUTHORITY.email}), [${DATA_AUTHORITY.url.replace("https://", "")}](${DATA_AUTHORITY.url}).`,
    },

    { h2: "Sécurité" },
    {
      p: "Les échanges avec ce site sont chiffrés (HTTPS). Les données des formulaires sont conservées dans une base de données professionnelle, avec sauvegardes. L'administration du site est réservée à notre équipe, protégée par mot de passe, et les mots de passe n'y sont jamais stockés en clair.",
    },

    { h2: "Cookies" },
    {
      p: `Ce que le site enregistre sur votre appareil, et comment changer d'avis, est détaillé dans notre [politique cookies](${site.paths.cookies}).`,
    },

    { h2: "Modification de cette page" },
    {
      p: "Nous mettons cette page à jour quand nos traitements évoluent, en même temps sur les quatre sites. La version applicable est celle publiée au moment où vous nous transmettez vos données ; la date de mise à jour figure sur la page.",
    },
  ];
}
