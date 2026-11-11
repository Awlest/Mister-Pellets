@AGENTS.md

## Design des pages (DESIGN.md)

Toute nouvelle page ou section suit `DESIGN.md` : jetons de couleur du site uniquement (aucune couleur en dur), composants partagés listés, interdits (dégradé, halo, flou, superposition de blocs, animation lourde). `pnpm run check:design` doit passer.

## Périmètre du catalogue (pellets uniquement)

Mister Pellets ne vend pas d'appareil à bois bûche : ces fiches vivent sur mister-bois.be. Ne lisez jamais la collection `products` hors de `lib/products.ts` et `lib/estimate-catalog.ts`, qui écartent le bois (`lib/catalog-scope.ts`). Un texte qui cite un poêle, un insert ou un foyer à bois renvoie vers mister-bois.be dans la même phrase. Les hybrides bois + pellets restent affichés, avec un canonical vers Mister Bois (`config/mister-bois.ts`). `pnpm run check:catalogue` doit passer.
