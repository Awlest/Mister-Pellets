import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { EMAIL } from "@/config/site";
import { formatCheckedAt, formatRating, getGoogleReviews } from "@/lib/google-reviews";
import { buildPageMetadata } from "@/lib/seo";

const LINK = "text-mp-orange-ink underline hover:no-underline";

// Les avis et la note se changent dans l'admin ; les hooks rafraîchissent la
// page, et elle se régénère au plus tard toutes les heures.
export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: "Avis clients Google et politique d'avis",
  description:
    "Les avis Google de nos clients poêles à pellets, repris de la fiche d'Awlest, l'entreprise qui pose nos poêles, et la façon dont nous les choisissons.",
  path: "/avis-clients",
});

/**
 * Politique d'avis publiée (lignes directrices du SPF Économie sur les avis en
 * ligne) : d'où viennent les avis, lesquels sont repris, ce qui est vérifié ou
 * non, et comment signaler un faux avis. Toute règle changée ici doit l'être
 * aussi dans la description de la collection « Avis Google »
 * (collections/GoogleReviews.ts), et inversement.
 */
export default async function AvisClientsPage() {
  const data = await getGoogleReviews();

  return (
    <>
      <HeroSecondary
        eyebrow="Avis Google"
        title={
          <>
            Avis de nos <span className="mp-italic">clients</span>
          </>
        }
        description="Les avis de la fiche Google d'Awlest qui parlent de poêles à pellets, et la façon dont nous les choisissons."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Avis clients" }]}
      />

      <GoogleReviews tone="beige" limit={100} title="Les avis sur nos poêles" showPolicyLink={false} />

      <section id="politique" className="bg-mp-cream mp-band scroll-mt-16">
        <div className="mp-shell">
          <h2 className="mp-measure text-center text-2xl md:text-4xl font-semibold text-mp-green-deep mb-8">
            Notre politique d&apos;avis
          </h2>
          <div className="mp-measure space-y-8 text-mp-ink leading-relaxed">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-mp-green-deep">D&apos;où ils viennent</h3>
              <p>
                De la fiche Google d&apos;Awlest SRL, à Fernelmont. Mister Pellets est une marque
                d&apos;Awlest : la même équipe vend, pose et entretient votre poêle. La fiche couvre
                aussi nos autres métiers, la climatisation, les panneaux solaires et la ventilation
                {data ? `, d'où ses ${data.reviewCount} avis` : ""}.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-mp-green-deep">Ce que nous reprenons</h3>
              <p>
                Chaque avis de la fiche qui parle d&apos;un poêle à pellets, quelle que soit sa
                note. Les autres parlent d&apos;un autre métier ou ne nomment pas l&apos;appareil :
                ils restent sur Google, à un clic.
              </p>
              <p>
                Le texte est recopié mot pour mot, sans coupe. Seul le nom est raccourci au prénom
                et à l&apos;initiale. La note moyenne et le nombre d&apos;avis sont ceux que Google
                affiche, avec la date du relevé
                {data
                  ? ` : ${formatRating(data.rating)} sur 5 et ${data.reviewCount} avis au ${formatCheckedAt(data.checkedAt)}`
                  : ""}
                .
              </p>
              <p>
                Un avis défavorable qui parle d&apos;un poêle est repris ici comme les autres. Nous
                n&apos;en écartons aucun parce qu&apos;il ne nous plaît pas.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-mp-green-deep">Ce qui est vérifié</h3>
              <p>
                Google ne vérifie pas les avis : il cherche les faux et les retire quand il en
                trouve. Nous ne pouvons pas non plus prouver que chaque auteur est un client. Nous
                n&apos;écrivons aucun avis nous-mêmes, et nous ne pouvons pas en effacer un sur
                Google.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-mp-green-deep">Aucune contrepartie</h3>
              <p>
                Nous ne payons pas d&apos;avis et n&apos;offrons rien en échange, ni remise ni
                cadeau.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-mp-green-deep">Signaler un avis</h3>
              <p>
                Un avis vous paraît faux ? Signalez-le à Google depuis la fiche, avec « Signaler
                l&apos;avis » dans le menu de l&apos;avis, ou écrivez-nous à{" "}
                <a href={`mailto:${EMAIL}`} className={LINK}>
                  {EMAIL}
                </a>
                . Nous le retirons de cette page le temps de vérifier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTAFinal
        tone="beige"
        title="Votre poêle chiffré en 2 minutes"
        description="Surface, usage, conduit : le configurateur donne un prix tout compris. Le prix ferme est confirmé après la visite technique, sans engagement."
        secondaryCta={{ label: "Choisir mon créneau", href: "/prendre-rendez-vous#reserver" }}
      />
    </>
  );
}
