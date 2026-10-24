import type { Metadata } from "next";
import FrontendLayout, { metadata as siteMetadata } from "./(frontend)/layout";
import FrontendNotFound, { metadata as notFoundMetadata } from "./(frontend)/not-found";
import { SITE_NAME } from "@/lib/seo";

export { viewport } from "./(frontend)/layout";

// Aucun layout ne s'applique à cette page, donc pas non plus le template de
// titre du site : le suffixe est écrit ici.
export const metadata: Metadata = {
  ...siteMetadata,
  ...notFoundMetadata,
  title: `${notFoundMetadata.title} | ${SITE_NAME}`,
};

/**
 * 404 des adresses qu'aucune route ne sert (/page-inexistante, /a/b/c) et des
 * slugs inconnus des routes fermées par `dynamicParams = false` (/guides,
 * /blog, /nos-marques, /poeles-pellets-*, /installation, /produit). Next y
 * servait sa page anglaise générique, sans en-tête ni barre du bas (constaté
 * le 11/10/2026). Activée par `experimental.globalNotFound` (next.config.ts).
 *
 * Pas d'app/not-found.tsx : sans mise en page racine (voir
 * app/(frontend)/layout.tsx), Next l'enveloppe dans sa mise en page par
 * défaut, qui rend déjà <html> et <body>. La 404 sortait alors avec deux
 * balises <html>, comme sur mister-clim.be (constaté le 24/10/2026). Cette
 * page rend la mise en page et la 404 de (frontend), reprises à l'identique.
 *
 * Plutôt qu'une route attrape-tout dans (frontend) : celle-ci rendrait chaque
 * adresse inconnue à la demande, alors que cette page est construite une fois
 * et que Vercel la sert depuis son cache (/404) quelle que soit l'adresse. Et
 * un notFound() levé dans une page renvoie un HTML vide (coquille d'erreur de
 * Next) que seul le navigateur complète (constaté sur /produit/n-existe-pas).
 */
export default function GlobalNotFound() {
  return (
    <FrontendLayout>
      <FrontendNotFound />
    </FrontendLayout>
  );
}
