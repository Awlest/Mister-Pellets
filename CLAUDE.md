@AGENTS.md

## Design des pages (DESIGN.md)

Toute nouvelle page ou section suit `DESIGN.md` : jetons de couleur du site uniquement (aucune couleur en dur), composants partagés listés, interdits (dégradé, halo, flou, superposition de blocs, animation lourde). `pnpm run check:design` doit passer.

## Périmètre du catalogue (pellets uniquement)

Mister Pellets ne vend pas d'appareil à bois bûche : ces fiches vivent sur mister-bois.be. Ne lisez jamais la collection `products` hors de `lib/products.ts` et `lib/estimate-catalog.ts`, qui écartent le bois (`lib/catalog-scope.ts`). Un texte qui cite un poêle, un insert ou un foyer à bois renvoie vers mister-bois.be dans la même phrase. Les hybrides bois + pellets restent affichés, avec un canonical vers Mister Bois (`config/mister-bois.ts`). `pnpm run check:catalogue` doit passer.

## Mesure Google : après accord seulement

Décision du 11/11/2026 : GA4 et Google Ads ne se chargent qu'après un clic sur « Accepter » (ou un accord déjà mémorisé). Avant, aucune requête vers googletagmanager.com, google-analytics.com, googleadservices.com ni doubleclick.net. L'amorce du `<head>` (`GA_BOOTSTRAP`, `lib/analytics.ts`) ne fait que remplir `dataLayer` ; `gtag.js` n'est chargé que par `components/layout/Analytics.tsx`, en `lazyOnload`, quand le choix vaut `granted`. `trackEvent` n'envoie rien sans accord. Ne remettez ni préchargement de gtag, ni chargement anticipé, ni mode consentement « avancé » : les conversions modélisées des visiteurs qui refusent sont abandonnées. La politique de cookies (`lib/legal/site.ts`) décrit ce fonctionnement.
