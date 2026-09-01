import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Testimonial {
  /** Prénom + initiale, tels que publiés sur la fiche Google. */
  name: string;
  /** Ancienneté affichée par Google au moment du relevé. */
  when: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  /** true si l'avis est tronqué, comme Google le tronque lui-même. */
  excerpt?: boolean;
}

/** Fiche Google d'Awlest SRL, société derrière Mister Pellets. */
const GOOGLE_REVIEWS_URL = "https://www.google.com/maps?cid=18162453141568513927";

/**
 * Note et nombre d'avis relevés sur la fiche Google le 1er septembre 2026.
 * À réactualiser à la main quand le compteur bouge : mieux vaut un chiffre un
 * peu daté qu'un chiffre inventé.
 */
const GOOGLE_RATING = "5,0";
const GOOGLE_REVIEW_COUNT = 67;

/**
 * Avis réellement publiés sur la fiche Google d'Awlest et sur celle de
 * Mister Pellets, relevés le 01/09/2026.
 *
 * ⚠️ Cette liste ne contient QUE des avis authentiques, recopiés tels quels et
 * attribuables. Elle remplace trois témoignages fabriqués (« Sophie L. »,
 * « Jean-Marc D. », « Claire V. ») qui figuraient ici : inventer un avis client
 * est une pratique commerciale déloyale interdite (art. VI.100 CDE, directive
 * Omnibus) et un motif de sanction chez Google Merchant. Ne rien ajouter ici
 * qui ne soit pas vérifiable sur la fiche Google.
 *
 * Les noms sont réduits au prénom et à l'initiale : ils sont publics sur
 * Google, le lien vers la fiche permet de les retrouver, et il n'y a pas de
 * raison d'en republier davantage.
 */
const GOOGLE_TESTIMONIALS: Testimonial[] = [
  {
    name: "Olivier P.",
    when: "il y a 7 mois",
    rating: 5,
    quote:
      "Nous avons fait appel à Awlest pour l'installation d'un poêle à pellet. Très professionnel, devis et placement rapide. Équipe très sympa et à l'écoute nous sommes 100% satisfait. Je recommande !",
  },
  {
    name: "Yves G.",
    when: "il y a 3 mois",
    rating: 5,
    quote:
      "Réception du chantier et contrôle, tout est en ordre et merci à toute l'équipe. À ceux qui lisent ce message signez les yeux fermés ! C'est une équipe au top !",
    excerpt: true,
  },
  {
    name: "Oli",
    when: "il y a 6 mois",
    rating: 5,
    quote:
      "Après avoir pris directement rdv en ligne (pratique & rapide), un commercial (Dorian) s'est rendu sur place prodiguant de bons conseils avec une approche technique",
    excerpt: true,
  },
];

interface TestimonialsProps {
  title?: string;
  description?: string;
  items?: Testimonial[];
}

/**
 * Avis clients, repris de la fiche Google.
 *
 * Pas de balisage `AggregateRating` volontairement : Google interdit le
 * balisage d'avis auto-attribués ou repris d'une plateforme tierce pour
 * obtenir des résultats enrichis. La note est donc affichée comme du contenu,
 * avec un lien vers la source pour qu'elle reste vérifiable.
 */
export function Testimonials({
  title = "Ce que disent nos clients",
  description,
  items = GOOGLE_TESTIMONIALS,
}: TestimonialsProps) {
  return (
    <section className="py-16 md:py-24 bg-mp-beige">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
            {title}
          </h2>
          {description ? (
            <p className="text-lg text-mp-ink-soft leading-relaxed">{description}</p>
          ) : (
            <p className="text-lg text-mp-ink-soft leading-relaxed">
              <span className="font-semibold text-mp-green-deep">
                {GOOGLE_RATING} sur 5
              </span>{" "}
              sur {GOOGLE_REVIEW_COUNT} avis Google.{" "}
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mp-orange-flame underline hover:no-underline"
              >
                Lire les avis
              </a>
              .
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <Card key={i} className="p-6 flex flex-col gap-4">
              <div className="flex gap-0.5" aria-label={`${t.rating} étoiles sur 5`}>
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star
                    key={k}
                    aria-hidden="true"
                    className="h-4 w-4 text-mp-orange-warm fill-mp-orange-warm"
                  />
                ))}
              </div>

              <blockquote className="text-mp-ink leading-relaxed italic">
                « {t.quote}
                {t.excerpt ? " […]" : ""} »
              </blockquote>

              <div className="mt-auto pt-2 border-t border-mp-sand/40 flex items-center justify-between text-sm">
                <span className="font-semibold text-mp-green-deep">{t.name}</span>
                <span className="text-xs text-mp-ink-soft">{t.when} · Google</span>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-sm text-mp-ink-soft">
          Avis publiés par nos clients sur notre fiche Google, repris ici sans
          modification.{" "}
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mp-orange-flame underline hover:no-underline"
          >
            Voir les {GOOGLE_REVIEW_COUNT} avis sur Google
          </a>
          .
        </p>
      </div>
    </section>
  );
}
