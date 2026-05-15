# Rapport final — Migration variantes produits

**Date :** 2026-05-15
**Périmètre :** brief « Mister Pellets — Variantes Produits v2 »
**Base concernée :** Supabase prod (projet `bvgdwinhrxelsicnubnu`)

---

## 1. Résultat

Système de variantes produits multi-axes livré, **100 % additif**. Aucune
donnée produit existante modifiée — vérifié par double contrôle (introspection
SQL + diff snapshot : 123 produits / 147 médias strictement identiques).

## 2. Écart de protocole survenu et traité

Lors du premier script de diagnostic exécuté via `tsx` (mode dev), l'adapter
Postgres de Payload — dont `push` est activé par défaut hors production — a
**poussé automatiquement le schéma variantes dans la base prod**.

- **Impact :** nul sur les données (push purement additif : 4 tables + 1
  colonne + 2 enums créés, rien d'altéré).
- **Correctifs appliqués :**
  - `push: false` ajouté à l'adapter (`payload.config.ts`) — l'auto-push ne
    peut plus se reproduire.
  - Migration `20260515_180000_products_variants.ts` écrite, calquée à
    l'identique sur le schéma réel introspecté, idempotente (`IF NOT EXISTS`).
  - Journal `payload_migrations` réconcilié (ligne parasite `dev` retirée,
    migration enregistrée en batch 6).

## 3. Schéma ajouté

| Objet | Détail |
|---|---|
| Collection `variant-option-types` | axes de variation (label, slug, displayMode, sortOrder) |
| Collection `variant-option-values` | valeurs (label, slug, optionType, colorHex, icon) |
| `products.has_variants` | booléen — interrupteur du mode variantes |
| `products_variant_options` | array : axes activés par produit |
| `products_variants` | array : combinaisons réelles (sku/gtin/mpn/prix/stock/image) |
| `products_rels` | jointure des relations hasMany (values, optionValues) |

`colorVariants` (déclinaisons de couleur simples) reste **intact et indépendant**.

## 4. Seed

6 axes / 34 valeurs créés (matériau, couleur, type de chauffe, sortie des
fumées, alimentation, puissance) — script idempotent `seed-variant-options.ts`.

## 5. Icônes (§3)

9 icônes SVG outline (#174724, 64×64) générées dans `public/icones-variantes/`.
Servies en statique par Vercel — pas de dépendance à la médiathèque Payload
(le storage Blob n'étant pas accessible hors de l'environnement Vercel). Le
champ `icon` (Media) reste disponible pour un override manuel par produit.

## 6. Frontend (§4)

`ProductVariantPanel` (client) : sélecteurs par axe (texte / pastille couleur /
icône), grisage des combinaisons indisponibles, résolution de la variante
exacte, prix/SKU/stock/image dynamiques, ajout au panier. Affiché uniquement
si `hasVariants` — sinon comportement historique strictement inchangé.
Schema.org enrichi (AggregateOffer multi-variantes).

## 7. Feed Google Merchant (§5)

Route `GET /api/feed/google-merchant` — RSS 2.0, une ligne par variante
(`item_group_id` de regroupement) ou une ligne par produit simple. N'expose
que les produits visibles en boutique.

## 8. Reste à faire

- **Test fonctionnel (§13)** : créer un produit fictif `test-variantes` dans
  l'admin avec `hasVariants` coché, configurer 2-3 axes et quelques
  combinaisons, vérifier les sélecteurs sur `/produit/test-variantes`.
- **Déploiement** : `git commit` + push (déclenche le build Vercel). La base
  prod a déjà le schéma ; le déploiement aligne le code applicatif.
- **Google Merchant** : déclarer le flux `/api/feed/google-merchant` dans
  Merchant Center.

## 9. Outils livrés (dossier scripts/)

`snapshot-before.ts`, `snapshot-after.ts` (diff d'intégrité), `db-inspect.ts`
(introspection lecture seule), `reconcile-migrations.ts`, `seed-variant-options.ts`,
`generate-variant-icons.mjs`.
