import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { PrimesBlock } from "@/components/sections/PrimesBlock";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import {
  AIDES_SOURCES,
  AIDES_VERIFIED_AT,
  LOAN_MAX,
  MEBAR_MAX,
  RENOPACK_CATEGORIES,
} from "@/lib/aides";

/**
 * Aides pour un poêle à pellets en Wallonie, page réécrite le 03/10/2026.
 *
 * La prime Habitation (régime temporaire du 14/02/2025 au 30/09/2026) est
 * terminée. L'URL ne change pas : c'est elle que Google, les liens internes et
 * les redirections /primes et /aides (next.config.ts) connaissent. Chiffres,
 * liens et date de vérification : lib/aides.ts.
 */
export const metadata = buildPageMetadata({
  title: "Prime poêle à pellets Wallonie : les aides après le 1er octobre 2026",
  description:
    "Plus de prime régionale pour un poêle à pellets depuis le 1er octobre 2026. Ce qui reste : TVA à 6 %, Rénopack et Rénoprêt (PEB E, F, G), MEBAR.",
  path: "/primes-energie-wallonie-2026",
});

const LINK = "font-semibold text-mp-green-deep underline hover:no-underline";

const FAQ_ITEMS = [
  {
    question: "Y a-t-il encore une prime pour un poêle à pellets en Wallonie ?",
    answer:
      "Non, plus depuis le 1er octobre 2026, sauf pour les ménages à très petits revenus (subvention MEBAR, via le CPAS). Le régime temporaire des primes Habitation, qui couvrait le poêle à pellets, s'est arrêté le 30 septembre 2026. La Région soutient maintenant la rénovation par deux prêts, le Rénopack et le Rénoprêt, réservés aux maisons classées E, F ou G qui gagnent le label exigé après travaux. Un poêle posé seul y donne rarement accès.",
  },
  {
    question: "Mon poêle a été posé en septembre 2026, puis-je encore demander la prime ?",
    answer:
      "Seulement si la demande a été introduite au plus tard le 30 septembre 2026 à 23 h 59 : c'était la limite du régime temporaire, pour les travaux comme pour le dossier. La seule porte encore ouverte concerne les projets lancés avant le 14 février 2025, avec un devis daté et signé avant cette date : ils peuvent passer par les anciennes conditions jusqu'au 30 septembre 2027. En cas de doute sur votre dossier, le 1718 répond gratuitement.",
  },
  {
    question: "Le Rénopack peut-il financer un poêle à pellets ?",
    answer:
      "Oui, si le poêle fait partie d'un projet qui remplit les conditions. La SWCS cite l'installation d'un poêle biomasse parmi les travaux qu'elle finance. Mais le prêt finance un projet entier : il faut un audit logement de moins d'un an, une maison classée E, F ou G, et des travaux qui la font monter au moins en D (depuis F ou G) ou en C (depuis E). En général, ce saut demande aussi d'isoler.",
  },
  {
    question: "Combien rapporte le Rénopack selon mes revenus ?",
    answer:
      "C'est un prêt à 0 % dont une partie ne se rembourse pas : 50 % en catégorie C1 (revenus jusqu'à 28 900 €), 40 % en C2 (jusqu'à 41 100 €) et 15 % en C3 (jusqu'à 67 100 €). En C4, jusqu'à 122 800 €, c'est le Rénoprêt, à taux zéro ou préférentiel, sans part effacée. Les seuils sont indexés au 1er janvier 2026 et baissent de 5 000 € par personne à charge. On peut emprunter jusqu'à 75 000 € pour une maison unifamiliale.",
  },
  {
    question: "La TVA à 6 % s'applique-t-elle encore à un poêle à pellets ?",
    answer:
      "Oui. Elle est fédérale et la réforme wallonne n'y change rien. Si le logement a plus de 10 ans et sert d'habitation privée, et si nous fournissons et posons le poêle, toute la facture est à 6 % au lieu de 21 %. Depuis le 29 juillet 2025, seuls les appareils au gaz, au mazout ou au charbon sont repassés à 21 %. Un poêle acheté sans pose reste à 21 %.",
  },
  {
    question: "Existe-t-il une aide pour les petits revenus ?",
    answer:
      "Oui, la subvention MEBAR. Elle s'adresse aux ménages dont les revenus ne dépassent pas le revenu d'intégration sociale majoré de 30 %, et elle peut financer l'installation d'un poêle, jusqu'à 2 000 €. La demande passe par le CPAS de votre commune, avant tout achat et avant le début des travaux.",
  },
  {
    question: "Ma commune donne-t-elle une prime pour un poêle ?",
    answer:
      "Certaines communes ont leurs propres primes énergie. Beaucoup étaient calquées sur la prime régionale qui vient de disparaître, et leurs règlements sont en train de changer. Appelez le service énergie ou le guichet de votre commune avant d'en tenir compte dans votre budget.",
  },
  {
    question: "Que fait Mister Pellets pour mon dossier ?",
    answer:
      "On vous remet un devis détaillé poste par poste, utile à l'auditeur comme à la SWCS, puis la facture et l'attestation de conformité de l'installation après la pose. La demande de prêt, elle, se fait auprès de la SWCS ou du Fonds du Logement. Si un Rénopack est en vue, parlez-nous de l'audit avant de choisir le poêle : sa puissance doit correspondre à la maison une fois isolée.",
  },
];

export default function PrimesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />

      <HeroSecondary
        eyebrow={`Aides Wallonie · vérifié le ${AIDES_VERIFIED_AT}`}
        title={
          <>
            Prime poêle à pellets&nbsp;: <span className="mp-italic">ce qui change</span> au 1er octobre 2026
          </>
        }
        description="La prime Habitation pour un poêle à pellets s'est arrêtée le 30 septembre 2026. La Wallonie passe à des prêts, réservés aux logements les moins bien isolés. Voici ce qui reste, vérifié sur les sites de la Région et du SPF Finances."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Aides poêle à pellets 2026" },
        ]}
      />

      {/* L'essentiel en 3 paragraphes, réponse directe pour les LLMs (GEO) */}
      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6">
            L&apos;essentiel en 30 secondes
          </h2>
          <div className="mp-measure space-y-4 text-mp-ink leading-relaxed text-lg">
            <p>
              Jusqu&apos;au 30 septembre 2026, un poêle à pellets ouvrait le droit à une prime
              Habitation, calculée selon vos revenus. Ce régime temporaire est fini : les travaux
              devaient être terminés et la demande introduite ce jour-là, avant 23 h 59. Depuis le
              1er octobre, la Région ne verse plus de prime par poste de travaux.
            </p>
            <p>
              Le soutien passe maintenant par deux prêts gérés par la Société wallonne du Crédit
              social (SWCS) et le Fonds du Logement de Wallonie : le Rénopack, à 0 % avec une partie
              effacée de 15 à 50 % selon vos revenus, et le Rénoprêt, à taux zéro ou préférentiel.
              Ils visent les maisons classées E, F ou G, avec un audit avant les travaux et un saut
              de label à atteindre. Le poêle peut faire partie du projet ; à lui seul, il le
              justifie rarement.
            </p>
            <p>
              Ce qui ne change pas : la TVA à 6 % au lieu de 21 % quand nous posons le poêle dans un
              logement de plus de 10 ans, directement sur la facture. Et pour les ménages aux
              revenus les plus modestes, la subvention MEBAR (jusqu&apos;à {MEBAR_MAX}) passe
              toujours par le CPAS.
            </p>
          </div>
        </div>
      </section>

      <PrimesBlock showLink={false} />

      {/* Fin du régime temporaire et mesure transitoire */}
      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            La fin de la prime, en pratique
          </h2>
          <div className="mp-measure space-y-4 text-mp-ink leading-relaxed text-lg">
            <p>
              Le régime temporaire, lancé le 14 février 2025, s&apos;est arrêté le 30 septembre 2026
              à 23 h 59. Les travaux devaient être terminés et la demande introduite avant cette
              heure-là. Une facture de septembre sans dossier déposé ne donne donc plus droit à la
              prime.
            </p>
            <p>
              Une exception : les ménages qui avaient signé un devis daté avant le 14 février 2025
              peuvent encore demander la prime aux anciennes conditions, jusqu&apos;au 30 septembre
              2027. Le Gouvernement wallon l&apos;a décidé le 24 septembre 2026, en levant au
              passage l&apos;obligation d&apos;avoir versé un acompte de 20 %. La mesure
              s&apos;applique après sa publication au Moniteur belge : le 1718 vous dira si elle est
              en vigueur au moment où vous appelez.{" "}
              <a
                href={AIDES_SOURCES.transitoire}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                Le communiqué du SPW Énergie
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Rénopack et Rénoprêt */}
      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            Rénopack et Rénoprêt : qui y a droit
          </h2>
          <div className="mp-measure space-y-8 text-mp-ink leading-relaxed">
            <p className="text-lg">
              Les deux prêts suivent la même logique : la Région finance un projet qui fait monter
              la maison de classe PEB, pas un appareil. La part effacée dépend des revenus du ménage.
            </p>

            <figure className="-mx-4 md:mx-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse rounded-2xl overflow-hidden bg-mp-cream border border-mp-sand/40">
                <thead className="bg-mp-green-deep text-mp-cream">
                  <tr>
                    <th scope="col" className="p-3 md:p-4 text-left font-semibold">Catégorie</th>
                    <th scope="col" className="p-3 md:p-4 text-left font-semibold">Revenus du ménage</th>
                    <th scope="col" className="p-3 md:p-4 text-left font-semibold">Prêt</th>
                    <th scope="col" className="p-3 md:p-4 text-left font-semibold">Part non remboursée</th>
                  </tr>
                </thead>
                <tbody>
                  {RENOPACK_CATEGORIES.map((row, i) => (
                    <tr key={row.category} className={i % 2 === 0 ? "bg-mp-beige/40" : "bg-mp-cream"}>
                      <th scope="row" className="p-3 md:p-4 border-t border-mp-sand/30 text-left font-semibold text-mp-green-deep">
                        {row.category}
                      </th>
                      <td className="p-3 md:p-4 border-t border-mp-sand/30">{row.income}</td>
                      <td className="p-3 md:p-4 border-t border-mp-sand/30">{row.loan}</td>
                      <td className="p-3 md:p-4 border-t border-mp-sand/30 tabular-nums">{row.forgiven}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <figcaption className="text-xs text-mp-ink-soft italic mt-2 px-4 md:px-0">
                Montants indexés au 1er janvier 2026, diminués de 5 000 € par personne à charge.
                Source :{" "}
                <a href={AIDES_SOURCES.regime} target="_blank" rel="noopener noreferrer" className="underline">
                  wallonie.be
                </a>
                , mis à jour le 25 septembre 2026.
              </figcaption>
            </figure>

            <div>
              <h3 className="text-xl font-semibold text-mp-green-deep mb-3">Les conditions à remplir</h3>
              <ul className="space-y-2">
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Une maison classée G ou F qui atteint au moins le label D après travaux, ou une maison classée E qui atteint au moins le label C.</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Un audit logement réalisé ou actualisé moins d&apos;un an avant la demande de prêt. C&apos;est lui qui fixe le label de départ et la liste des travaux.</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Pour le Rénopack, un droit réel sur le logement (propriétaire, usufruitier) et l&apos;engagement d&apos;y habiter au plus tard 24 mois après l&apos;octroi du prêt.</li>
                <li className="flex gap-3"><span className="text-mp-orange-flame">•</span> Un emprunt plafonné à {LOAN_MAX.house} pour une maison unifamiliale et à {LOAN_MAX.apartment} par appartement.</li>
              </ul>
            </div>

            <p>
              Des dérogations existent quand le label visé est impossible à atteindre pour des
              raisons techniques, fonctionnelles ou économiques. Les taux et les durées du Rénoprêt
              sont fixés par la SWCS et le Fonds du Logement, qui instruisent les demandes.
            </p>
          </div>
        </div>
      </section>

      {/* Le poêle dans un projet Rénopack : l'avis de l'installateur */}
      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            Et le poêle à pellets, dans tout ça ?
          </h2>
          <div className="mp-measure space-y-4 text-mp-ink leading-relaxed text-lg">
            <p>
              Soyons francs : pour la plupart de nos clients, le Rénopack ne change rien. Une maison
              en C ou en D n&apos;est pas visée. Une maison en E, F ou G l&apos;est, mais elle doit
              gagner au moins deux classes, et ce saut demande en général d&apos;isoler le toit, les
              murs ou les châssis en plus de changer le chauffage.
            </p>
            <p>
              Si vous êtes dans ce cas, l&apos;ordre compte. D&apos;abord l&apos;audit, qui fixe le
              label de départ et la liste des travaux. Ensuite la{" "}
              <a
                href={AIDES_SOURCES.swcsPreinscription}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                préinscription sur le site de la SWCS
              </a>
              , qui ne vaut pas demande d&apos;aide mais permet à leurs équipes de vous recontacter.
              La SWCS cite l&apos;installation d&apos;un poêle biomasse parmi les{" "}
              <a
                href={AIDES_SOURCES.swcsTravaux}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                travaux qu&apos;elle finance
              </a>
              .
            </p>
            <p>
              Parlez-nous de l&apos;audit avant de choisir le poêle. Une maison qu&apos;on isole perd
              moins de chaleur : la puissance doit correspondre à la maison après les travaux, pas
              avant. Un poêle choisi pour la maison d&apos;aujourd&apos;hui tournerait au ralenti
              toute l&apos;année, et s&apos;encrasserait.
            </p>
          </div>
        </div>
      </section>

      {/* TVA 6 % */}
      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            La TVA à 6 % ne bouge pas
          </h2>
          <div className="mp-measure space-y-4 text-mp-ink leading-relaxed text-lg">
            <p>
              C&apos;est l&apos;aide qui joue sur presque tous nos chantiers, et elle est fédérale :
              la réforme wallonne n&apos;y touche pas. Quand nous fournissons et posons le poêle dans
              un logement privé de plus de 10 ans, toute la facture passe à 6 % au lieu de 21 %,
              poêle compris. Sur un projet à 6 000 € hors TVA, ça fait 900 € de différence.
            </p>
            <p>
              Les conditions du SPF Finances : après les travaux, le logement sert d&apos;habitation
              privée pour plus de la moitié ; sa première occupation remonte à au moins dix ans avant
              la première facture ; et c&apos;est l&apos;entrepreneur qui fournit et facture les
              travaux au particulier qui l&apos;occupe, propriétaire ou locataire. Il n&apos;y a plus
              d&apos;attestation à signer depuis le 1er juillet 2022 : la facture porte une mention
              légale, et vous avez un mois pour la contester par écrit si elle est inexacte.
            </p>
            <p>
              Depuis le 29 juillet 2025, les appareils au gaz, au mazout ou au charbon sont repassés
              à 21 %. Ceux qui brûlent uniquement du bois ou des pellets gardent le 6 %. Un poêle
              livré sans pose, lui, reste à 21 %.{" "}
              <a href={AIDES_SOURCES.tva} target="_blank" rel="noopener noreferrer" className={LINK}>
                Les règles sur fin.belgium.be
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* MEBAR */}
      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            MEBAR : l&apos;aide des revenus modestes
          </h2>
          <div className="mp-measure space-y-4 text-mp-ink leading-relaxed text-lg">
            <p>
              La subvention MEBAR reste ouverte aux ménages dont les revenus ne dépassent pas le
              revenu d&apos;intégration sociale majoré de 30 %. Elle finance des travaux qui font
              baisser la facture d&apos;énergie, dont l&apos;installation d&apos;un poêle,
              jusqu&apos;à {MEBAR_MAX}.
            </p>
            <p>
              La demande passe par le CPAS de votre commune, avant tout achat et avant les travaux.
              Il faut ensuite attendre cinq ans avant une nouvelle demande, pour un autre
              investissement.{" "}
              <a href={AIDES_SOURCES.mebar} target="_blank" rel="noopener noreferrer" className={LINK}>
                La démarche sur wallonie.be
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Contacts officiels */}
      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-2xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Contacts officiels
          </h2>
          <ul className="mp-measure space-y-3 text-mp-ink leading-relaxed text-lg">
            <li>
              <strong className="text-mp-green-deep">Numéro gratuit du Service public de Wallonie :</strong>{" "}
              <a href="tel:1718" className={LINK}>1718</a>, les jours ouvrables de 8 h 30 à 17 h.
            </li>
            <li>
              <strong className="text-mp-green-deep">Guichets Énergie Wallonie :</strong> conseil
              gratuit près de chez vous,{" "}
              <a href={AIDES_SOURCES.guichets} target="_blank" rel="noopener noreferrer" className={LINK}>
                liste des guichets
              </a>
              .
            </li>
            <li>
              <strong className="text-mp-green-deep">Société wallonne du Crédit social :</strong>{" "}
              <a href="tel:+3278158008" className={LINK}>078 15 80 08</a>,{" "}
              <a href={AIDES_SOURCES.swcs} target="_blank" rel="noopener noreferrer" className={LINK}>
                réforme des aides et préinscription
              </a>
              .
            </li>
            <li>
              <strong className="text-mp-green-deep">Fonds du Logement de Wallonie :</strong>{" "}
              <a href="tel:+3271207700" className={LINK}>071 20 77 00</a>,{" "}
              <a href={AIDES_SOURCES.flw} target="_blank" rel="noopener noreferrer" className={LINK}>
                flw.be
              </a>
              .
            </li>
            <li>
              <strong className="text-mp-green-deep">MEBAR :</strong> le CPAS de votre commune.
            </li>
          </ul>
        </div>
      </section>

      <FAQAccordion tone="beige" title="Questions fréquentes sur les aides" items={FAQ_ITEMS} />

      {/* Avertissement légal */}
      <section className="bg-mp-cream mp-band-sm">
        <div className="mp-shell">
          <p className="mp-measure text-xs text-mp-ink-soft italic leading-relaxed">
            Informations vérifiées le {AIDES_VERIFIED_AT}{" "}
            sur wallonie.be, energie.wallonie.be,
            swcs.be, uvcw.be et fin.belgium.be. Les modalités pratiques des prêts (taux du Rénoprêt,
            durées, pièces à fournir) sont fixées par la SWCS et le Fonds du Logement de Wallonie et
            peuvent évoluer. Mister Pellets ne se substitue pas à l&apos;administration et ne
            garantit l&apos;octroi d&apos;aucune aide.
          </p>
        </div>
      </section>

      <CTAFinal
        title="Un devis net, TVA à 6 % comprise"
        description="On chiffre le poêle et la pose au taux de TVA qui s'applique chez vous, sans prime fantôme à déduire. Si un Rénopack est en vue, on cale le devis sur votre audit."
      />
    </>
  );
}
