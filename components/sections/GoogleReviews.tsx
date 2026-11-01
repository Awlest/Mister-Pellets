import Link from "next/link";
import { ArrowRight, ExternalLink, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toneClass, type SectionTone } from "@/lib/section-tone";
import { ROUTES } from "@/config/navigation";
import { formatCheckedAt, formatRating, getGoogleReviews } from "@/lib/google-reviews";

interface GoogleReviewsProps {
  /** Fond de la section. La page décide de l'alternance crème / beige. */
  tone?: SectionTone;
  /** Nombre d'avis montrés. Sans limite sur /avis-clients. */
  limit?: number;
  title?: string;
  /** Lien vers /avis-clients (tous les avis et la politique d'avis). */
  showPolicyLink?: boolean;
}

/**
 * Espace insécable avant « ! ? : ; » : sans elle, le « ! » d'un avis passe
 * seul à la ligne sur mobile. Seule l'espace change, pas un mot de l'avis.
 */
function withFrenchSpaces(text: string): string {
  return text.replace(/ (?=[!?:;])/g, " ");
}

const LINK_CLASS =
  "inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-mp-orange-ink underline-offset-4 hover:underline";

/**
 * Avis Google de la fiche Awlest, saisis dans l'admin (« Avis Google » et
 * « Note Google »). Les avis sont recopiés tels quels ; la note, le nombre
 * d'avis et la date du relevé sont affichés comme du contenu, avec le lien
 * vers la fiche pour qu'ils restent vérifiables.
 *
 * Pas de balisage `AggregateRating` ni `Review` : Google refuse les avis
 * qu'une entreprise publie sur elle-même ou reprend d'une autre plateforme.
 * Ne jamais ajouter ici un avis qui n'est pas sur Google.
 */
export async function GoogleReviews({
  tone = "beige",
  limit = 3,
  title = "L'avis de ceux qui se chauffent déjà",
  showPolicyLink = true,
}: GoogleReviewsProps) {
  const data = await getGoogleReviews();
  if (!data || data.reviews.length === 0) return null;

  const total = data.reviews.length;
  const shown = data.reviews.slice(0, limit);

  return (
    <section className={cn("mp-band", toneClass(tone))}>
      <div className="mp-shell">
        <div className="mp-measure mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">{title}</h2>
          <p className="text-lg text-mp-ink-soft leading-relaxed">
            <span className="font-semibold text-mp-green-deep">
              {formatRating(data.rating)}&nbsp;sur&nbsp;5
            </span>
            {" "}
            pour {data.reviewCount} avis Google, relevés le {formatCheckedAt(data.checkedAt)}. Ils
            sont publiés sur la fiche d&apos;Awlest : Mister Pellets est une marque d&apos;Awlest
            SRL, et c&apos;est la même équipe qui vient poser votre poêle.
          </p>
        </div>

        {/* Trois colonnes dès 768 px : avec 3 ou 9 avis, aucune carte seule sur sa ligne. */}
        <ul
          className={cn(
            "grid grid-cols-1 gap-6",
            shown.length >= 3 ? "md:grid-cols-3" : shown.length === 2 ? "md:grid-cols-2" : "mx-auto max-w-xl",
          )}
        >
          {shown.map((review) => (
            <li key={review.id} className="min-w-0">
              <Card className="flex h-full flex-col gap-4 p-6">
                <div
                  className="flex gap-0.5"
                  role="img"
                  aria-label={`${review.rating} étoile${review.rating > 1 ? "s" : ""} sur 5`}
                >
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4",
                        k < review.rating
                          ? "fill-mp-orange-flame text-mp-orange-flame"
                          : "text-mp-sand",
                      )}
                    />
                  ))}
                </div>

                <blockquote className="whitespace-pre-line text-mp-ink leading-relaxed">
                  {`« ${withFrenchSpaces(review.quote)} »`}
                </blockquote>

                <p className="mt-auto flex items-center justify-between gap-3 border-t border-mp-sand/40 pt-3 text-sm">
                  <span className="font-semibold text-mp-green-deep">{review.authorName}</span>
                  <span className="text-xs text-mp-ink-soft">Avis Google</span>
                </p>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mp-measure mt-8 text-center">
          <p className="text-sm text-mp-ink-soft leading-relaxed">
            {shown.length < total
              ? `Nous montrons ici ${shown.length} des ${total} avis de la fiche qui parlent de poêles à pellets, recopiés mot pour mot.`
              : `Voici les ${total} avis de la fiche qui parlent de poêles à pellets, recopiés mot pour mot.`}{" "}
            Google ne vérifie pas les avis qu&apos;il publie.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4">
            {showPolicyLink ? (
              <Link href={ROUTES.reviews} className={LINK_CLASS}>
                {`Les ${total} avis et notre politique d'avis`}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
            <a href={data.placeUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {`Les ${data.reviewCount} avis sur Google`}
              <ExternalLink aria-hidden className="h-4 w-4" />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Encart des fiches produit : la note de la fiche Google d'Awlest, avec un
 * lien vers /avis-clients. Ce n'est pas une note du produit : rien dans les
 * données structurées de la fiche.
 */
export async function GoogleRatingNote({ className }: { className?: string }) {
  const data = await getGoogleReviews();
  if (!data) return null;

  return (
    <Link
      href={ROUTES.reviews}
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-2xl border border-mp-sand/40 bg-mp-cream px-4 py-3 transition-colors hover:border-mp-orange-flame",
        className,
      )}
    >
      <Star aria-hidden className="h-5 w-5 shrink-0 fill-mp-orange-flame text-mp-orange-flame" />
      <span className="min-w-0 flex-1 text-sm leading-snug">
        <span className="block font-semibold text-mp-green-deep">
          {formatRating(data.rating)}&nbsp;sur&nbsp;5 pour {data.reviewCount} avis Google
        </span>
        <span className="block text-mp-ink-soft">
          Sur la fiche d&apos;Awlest, l&apos;entreprise qui pose nos poêles
        </span>
      </span>
      <ArrowRight
        aria-hidden
        className="h-4 w-4 shrink-0 text-mp-orange-ink transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}
