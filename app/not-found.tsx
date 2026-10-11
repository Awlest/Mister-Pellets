import FrontendLayout from "./(frontend)/layout";
import FrontendNotFound from "./(frontend)/not-found";

export { metadata } from "./(frontend)/not-found";

/**
 * 404 des adresses qu'aucune route ne sert (/page-inexistante, /a/b/c) et des
 * slugs inconnus des routes fermées par `dynamicParams = false` (/guides,
 * /blog, /nos-marques, /poeles-pellets-*). Next y servait sa page anglaise
 * générique, sans en-tête ni barre du bas (constaté le 11/10/2026).
 *
 * La mise en page racine ne porte pas l'habillage du site, qui vit dans
 * app/(frontend) parce que l'admin Payload partage la racine : cette page
 * reprend donc à l'identique la mise en page et la page 404 de (frontend).
 *
 * Plutôt qu'une route attrape-tout dans (frontend) : celle-ci rendrait chaque
 * adresse inconnue à la demande, alors que cette page est construite une fois
 * et que Vercel la sert depuis son cache (/404) quelle que soit l'adresse. Et
 * un notFound() levé dans une page renvoie un HTML vide (coquille d'erreur de
 * Next) que seul le navigateur complète (constaté sur /produit/n-existe-pas).
 * Et pas app/global-not-found.tsx (expérimental) : importer app/layout.tsx y
 * casse le build Turbopack sur les polices next/font (Next 16.2.4).
 *
 * Coût : Next sérialise ce not-found dans la charge RSC de chaque page, soit
 * environ 20 Ko de plus avant compression, rien une fois compressé en brotli
 * (mesuré le 11/10/2026).
 */
export default function NotFound() {
  return (
    <FrontendLayout>
      <FrontendNotFound />
    </FrontendLayout>
  );
}
