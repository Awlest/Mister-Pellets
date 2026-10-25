import { COMPANY } from "./company";
import type { LegalBlock, LegalSite } from "./types";

/**
 * Politique cookies (loi du 30 juillet 2018, art. 10/2, et RGPD).
 *
 * ⚠️ FICHIER COMMUN aux quatre sites d'AWLEST SRL (voir types.ts).
 * L'inventaire, la mesure et le mode de consentement viennent de `site.ts`,
 * relevés dans le code du site : un cookie, une clé de stockage ou un outil
 * ajouté ou retiré se reporte dans `site.ts` le jour même.
 */
export function cookies(site: LegalSite): LegalBlock[] {
  return [
    { h2: "En bref" },
    { p: site.cookieSummary },

    { h2: "Cookies et stockage du navigateur" },
    {
      p: "Un cookie est un petit fichier qu'un site dépose sur votre appareil (ordinateur, téléphone, tablette) pour s'en souvenir d'une visite à l'autre. Le stockage du navigateur joue le même rôle, sans être envoyé au site à chaque page. La loi traite les deux de la même façon : ce qui n'est pas strictement nécessaire au service que vous demandez ne peut être enregistré qu'avec votre accord.",
    },

    { h2: "Ce que ce site enregistre sur votre appareil" },
    ...site.storage.flatMap((group): LegalBlock[] => [
      { h3: group.title },
      { p: group.note },
      {
        table: {
          head: ["Nom", "Finalité", "Durée"],
          rows: group.items.map((item) => [item.name, item.purpose, item.duration]),
        },
      },
    ]),
    ...site.measurement,

    { h2: "Votre choix" },
    ...site.consentText.map((p) => ({ p })),
    ...(site.consentBanner ? [{ consent: true } as const] : []),
    {
      p: "Vous pouvez aussi effacer ou bloquer les cookies et les données de site depuis les réglages de votre navigateur (Chrome : Paramètres, Confidentialité et sécurité ; Firefox : Paramètres, Vie privée et sécurité ; Safari : Réglages, Confidentialité ; Edge : Paramètres, Cookies et autorisations de site). Le site continue de fonctionner, mais les réponses que vous avez commencé à saisir ne sont plus gardées.",
    },

    { h2: "Liens vers d'autres services" },
    {
      p: "Quand vous suivez un lien vers un autre service (fiche Google, réseau social, messagerie, site d'un fabricant), vous quittez ce site et les règles de ce service s'appliquent. Aucun contenu de ces services n'est intégré dans nos pages.",
    },

    { h2: "Questions" },
    {
      p: `Pour toute question sur cette page : [${site.email}](mailto:${site.email}). L'usage de vos données est détaillé dans notre [politique de confidentialité](${site.paths.privacy}). Cette page est tenue à jour par ${COMPANY.name} à chaque outil ajouté ou retiré.`,
    },
  ];
}
