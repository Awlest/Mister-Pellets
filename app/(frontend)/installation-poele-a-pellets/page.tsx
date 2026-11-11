import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { DiscountedPrice } from "@/components/forms/DiscountedPrice";
import { JsonLd } from "@/components/seo/JsonLd";
import { InlineText } from "@/components/ui/inline-text";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/navigation";
import { CATEGORIES } from "@/lib/categories";
import { eur } from "@/lib/estimate";
import { getInstallPrices, heightNote } from "@/lib/price-examples";
import { OPTIONS, VAT, formatEur, withVat } from "@/lib/pose/moteur";
import { TARIFS } from "@/lib/pose/tarifs";
import { getService } from "@/lib/services";
import { ORGANIZATION_ID, SITE_URL, buildFAQSchema, buildPageMetadata } from "@/lib/seo";
import { typo } from "@/lib/typo";

const PATH = ROUTES.installation;
/** Dernière modification du texte (AAAA-MM-JJ), à reporter dans CONTENT_DATES (app/sitemap.ts). */
const INSTALLATION_PAGE_DATE = "2026-11-11";

export const metadata = buildPageMetadata({
  title: "Installation de poêle à pellets en Wallonie",
  description:
    "Installation d'un poêle à pellets en Wallonie : visite technique gratuite, prix de pose selon l'évacuation, TVA à 6 %, mise en service. Le déroulé complet.",
  path: PATH,
});

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const htTtc = (ht: number) => `${formatEur(ht)} HTVA, soit ${formatEur(withVat(ht, VAT.reduced).total)} TVAC à 6 %`;

const LINK =
  "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mp-green-deep underline underline-offset-4 decoration-mp-sand hover:text-mp-orange-ink";

/**
 * Page de service « installation, placement, pose d'un poêle à pellets ».
 * Les forfaits viennent de lib/pose/tarifs.ts par getInstallPrices (mêmes
 * prix et remises que /estimation et /prix-poele-pellets) : rien n'est écrit
 * à la main. Durées et délais : réponses de la FAQ (lib/faqs.ts) et fiche
 * « Devis sur place » (lib/services.ts). Les étages, encore « à calibrer »
 * dans les tarifs, ne sont pas affichés.
 */
export default function InstallationPage() {
  const installs = getInstallPrices();
  const visit = getService("devis-sur-place");
  const labor = installs.map((it) => it.laborTTC);
  const minLabor = Math.min(...labor);
  const maxLabor = Math.max(...labor);
  const ventouse = installs.find((it) => it.key === "ventouse-facade");
  const discounted = installs.some((it) => it.discountPct > 0);

  const directAnswer = `Nous installons votre poêle à pellets en quatre temps : visite technique gratuite chez vous, devis ferme sous 48 heures, pose en une journée sur une cheminée en bon état, puis mise en service avec vous. La pose coûte de ${eur(minLabor)} à ${eur(maxLabor)} TVAC à 6 % selon l'évacuation des fumées${discounted ? ", remises en cours comprises" : ""}, poêle en plus.`;

  const options = (Object.keys(OPTIONS) as (keyof typeof OPTIONS)[]).filter((k) =>
    TARIFS.optionsProposees.includes(k),
  );

  const faq = [
    {
      question: "Combien coûte l'installation d'un poêle à pellets ?",
      answer: `La pose seule va de ${eur(minLabor)} à ${eur(maxLabor)} TVAC à 6 % selon l'évacuation des fumées${discounted ? ", remises en cours comprises" : ""}. Le poêle s'y ajoute, au prix de sa fiche. Avec un poêle, les exemples complets sont sur la page [prix d'un poêle à pellets posé](/prix-poele-pellets).`,
    },
    {
      question: "Combien de temps dure la pose d'un poêle à pellets ?",
      answer:
        "Une journée pour une pose sur un conduit existant, du démontage de l'ancien appareil au premier feu avec vous en fin d'après-midi. Un canalisable avec des gaines vers d'autres pièces prend un jour et demi en moyenne, un hydro raccordé aux radiateurs deux à trois jours.",
    },
    {
      question: "Peut-on installer un poêle à pellets sans cheminée ?",
      answer: `Oui. Un conduit double paroi isolé monte au-dessus du toit, le long de la façade ou par l'intérieur. Avec un poêle étanche dont la notice la prévoit, une ventouse concentrique en façade suffit${ventouse ? ` (${eur(ventouse.laborTTC)} TVAC chez nous)` : ""}, mais jamais avec Edilkamin ni EK63. Une sortie murale simple n'est pas admise.`,
    },
    {
      question: "Quelle TVA pour la pose d'un poêle à pellets ?",
      answer:
        "6 % au lieu de 21 % quand nous fournissons et posons le poêle dans un logement privé de plus de 10 ans : le taux réduit s'applique sur le poêle comme sur la pose. Dans un logement de moins de 10 ans ou une construction neuve, c'est 21 %.",
    },
    {
      question: "Quel délai entre la demande et la pose ?",
      answer:
        "Comptez 3 à 6 semaines en saison normale, plus de septembre à décembre. La visite technique se planifie dans la semaine qui suit votre demande et le devis arrive sous 48 heures ouvrées. Une fois le devis signé, les modèles courants sont disponibles en 5 à 10 jours.",
    },
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Installation de poêle à pellets",
      name: "Installation et pose de poêle à pellets",
      description: directAnswer,
      url: `${SITE_URL}${PATH}`,
      provider: { "@id": ORGANIZATION_ID },
      areaServed: { "@type": "AdministrativeArea", name: "Wallonie" },
    },
    buildFAQSchema(faq),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <HeroSecondary
        eyebrow="Installation et pose"
        title={
          <>
            Installer un poêle à pellets, <span className="mp-italic">de la visite au premier feu</span>
          </>
        }
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Installation d'un poêle à pellets" }]}
        compact
      />

      <section className="bg-mp-cream pb-10 md:pb-14">
        <div className="mp-shell">
          <div className="mp-measure">
            <p className="mb-4 text-lg leading-relaxed text-mp-ink md:text-xl">{typo(directAnswer)}</p>
            <p className="mb-6 text-sm text-mp-ink-soft">
              Prix calculés sur nos tarifs de pose du jour. Texte mis à jour le{" "}
              <time dateTime={INSTALLATION_PAGE_DATE}>{formatDate(INSTALLATION_PAGE_DATE)}</time>.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
                <Link href={ROUTES.visit}>
                  <CalendarCheck aria-hidden />
                  Réserver la visite technique
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href={ROUTES.configurator}>Estimer mon installation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ProcessSteps
        title="Le déroulé, étape par étape"
        steps={[
          {
            title: "Visite technique gratuite",
            description: `${visit?.durationLabel ?? "Une heure"} chez vous : la pièce, le conduit existant, l'isolation, l'arrivée d'air et la ventilation. C'est là que se choisissent le modèle, la puissance et l'évacuation.`,
          },
          {
            title: "Devis ferme sous 48 heures",
            description:
              "Le modèle adapté, l'évacuation, les options, la pose au bon taux de TVA et le délai. Rien ne change ensuite, sauf si vous modifiez le projet.",
          },
          {
            title: "Pose en une journée",
            description:
              "Sur un conduit existant : l'équipe arrive entre 8 h et 9 h, protège la pièce, pose le poêle, le raccorde et rend le conduit étanche. Un canalisable ou un hydro demande plus de temps.",
          },
          {
            title: "Mise en service avec vous",
            description:
              "Premier feu avec vous en fin d'après-midi, et vos questions sur l'usage du poêle réglées sur place. La garantie légale couvre le poêle et la pose pendant deux ans.",
          },
        ]}
      />

      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure">
            <h2 className="mb-4 text-3xl font-semibold text-mp-green-deep md:text-4xl">
              Le prix de la pose, selon l&apos;évacuation des fumées
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-mp-ink">
              <InlineText
                text={`Ce qui fait le prix de la pose, c'est surtout la sortie des fumées. Avec une cheminée déjà tubée, il n'y a qu'à raccorder. Sinon, on tube la cheminée, ou on crée un conduit. La ventouse concentrique est réservée aux poêles étanches dont la notice la prévoit, et jamais avec Edilkamin ni EK63 : leurs notices interdisent toute sortie murale. Le détail des règles est dans notre article sur [l'évacuation des fumées](/blog/evacuation-fumees-poele-pellets).`}
              />
            </p>
          </div>
          <div className="mp-measure overflow-x-auto rounded-[20px] border border-mp-sand/40 bg-white">
            <table className="w-full text-left">
              <caption className="caption-bottom px-4 py-3 text-left text-xs text-mp-ink-soft md:px-5">
                {typo(
                  `Forfaits de pose, matériel et main d'œuvre compris, mise en service comprise, TVA à 6 % comprise (logement de plus de 10 ans), poêle non compris${discounted ? ", remises en cours déduites" : ""}.`,
                )}
              </caption>
              <thead>
                <tr className="border-b border-mp-sand/40 text-mp-green-deep">
                  <th scope="col" className="p-4 font-semibold md:p-5">Évacuation</th>
                  <th scope="col" className="p-4 text-right font-semibold md:p-5">Pose TVAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mp-sand/40">
                {installs.map((it) => (
                  <tr key={it.key}>
                    <th scope="row" className="min-w-0 p-4 align-top font-normal md:p-5">
                      <span className="block font-semibold text-mp-green-deep">{it.label}</span>
                      <span className="block text-sm text-mp-ink-soft">
                        {it.desc}
                        {it.percements > 0 ? `, ${it.percements} percements renforcés compris` : ""}.
                        {it.heightM > 0 ? ` ${heightNote(it)}` : ""}
                        {it.key === "ventouse-facade" ? " Poêle étanche seulement, hors Edilkamin et EK63." : ""}
                      </span>
                    </th>
                    <td className="p-4 text-right align-top font-semibold text-mp-ink md:p-5">
                      <DiscountedPrice
                        amount={it.laborTTC}
                        full={it.fullTTC}
                        pct={it.discountPct}
                        showStrike={it.showStrike}
                        format={eur}
                        className="max-w-36"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <div className="mp-measure">
            <h2 className="mb-4 text-3xl font-semibold text-mp-green-deep md:text-4xl">
              Ce qui est compris, ce qui s&apos;ajoute
            </h2>
            <p className="mb-4 text-lg leading-relaxed text-mp-ink">
              {typo(
                "Chaque forfait comprend le matériel de pose, la main d'œuvre, le raccordement du poêle et sa mise en service. Le poêle lui-même s'ajoute, au prix affiché sur sa fiche. Selon la maison, quelques prestations s'ajoutent aussi, au même tarif que dans l'estimation en ligne :",
              )}
            </p>
            <ul className="mb-6 divide-y divide-mp-sand/40 rounded-[20px] border border-mp-sand/40 bg-mp-cream">
              <li className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:justify-between">
                <span className="min-w-0">
                  <span className="block font-semibold text-mp-green-deep">Canalisation vers une autre pièce</span>
                  <span className="block text-sm text-mp-ink-soft">
                    {typo(`Par pièce desservie, ${TARIFS.canalisationPiecesMax} pièces au plus`)}
                  </span>
                </span>
                <span className="whitespace-nowrap text-sm font-semibold text-mp-ink">{typo(htTtc(TARIFS.canalisationParPieceHT))}</span>
              </li>
              {options.map((key) => (
                <li key={key} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:justify-between">
                  <span className="min-w-0">
                    <span className="block font-semibold text-mp-green-deep">{OPTIONS[key].label}</span>
                    <span className="block text-sm text-mp-ink-soft">{OPTIONS[key].desc}</span>
                  </span>
                  <span className="whitespace-nowrap text-sm font-semibold text-mp-ink">{typo(htTtc(TARIFS.options[key]))}</span>
                </li>
              ))}
            </ul>
            <h3 className="mb-3 text-xl font-semibold text-mp-green-deep">La TVA à 6 %</h3>
            <p className="mb-4 text-lg leading-relaxed text-mp-ink">
              {typo(
                "Quand nous fournissons et posons le poêle dans un logement privé de plus de 10 ans, toute la facture passe à 6 % au lieu de 21 % : le poêle, la pose, l'évacuation et les options. Dans un logement de moins de 10 ans ou une construction neuve, c'est 21 %. Il n'y a plus de prime régionale pour un poêle depuis le 1er octobre 2026.",
              )}{" "}
              <Link href={ROUTES.grants} className="text-mp-orange-ink underline hover:no-underline">
                Ce qui reste comme aides
              </Link>
              .
            </p>
            <h3 className="mb-3 text-xl font-semibold text-mp-green-deep">Ce que nous vérifions à la visite</h3>
            <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed text-mp-ink">
              <li>{typo("La cheminée existante : état, section, aucun autre appareil raccordé, accès pour le ramonage.")}</li>
              <li>{typo("La hauteur jusqu'au faîte et le débouché du conduit au-dessus du toit.")}</li>
              <li>{typo("Le passage du mur ou des planchers, et les distances aux matériaux combustibles.")}</li>
              <li>{typo("La ventilation de la maison (VMC, hotte, autre appareil à combustion), qui décide d'un poêle étanche.")}</li>
              <li>{typo("La surface et l'isolation, qui fixent la puissance, et le trajet des gaines d'un canalisable.")}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure">
            <h2 className="mb-6 text-3xl font-semibold text-mp-green-deep md:text-4xl">Choisir l&apos;appareil à installer</h2>
            <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={c.path} className={LINK}>
                    {c.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={ROUTES.shop} className={LINK}>
                  Tous nos poêles à pellets
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
              <li>
                <Link href={ROUTES.zones} className={LINK}>
                  Les communes où nous posons
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <FAQAccordion tone="beige" title="Questions sur l'installation" items={faq} />

      <CTAFinal
        tone="cream"
        title="On regarde votre maison ensemble ?"
        description="La visite technique est gratuite et dure une heure. Le devis ferme suit sous 48 heures, pose et TVA comprises."
      />
    </>
  );
}
