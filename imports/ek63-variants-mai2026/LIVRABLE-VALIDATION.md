# Livrable de validation — Import variantes EK63

> **Phase 4 du brief `mister-pellets-variants-import-ek63.md`.**
> Aucune écriture en base n'a été faite. Ce fichier attend la relecture et le GO de Dorian.
> Généré le 2026-05-18. Révision 2 : structure uniforme à 3 axes pour les 19 modèles.

---

## 1. Source utilisée

| Champ | Valeur |
|---|---|
| Fichier | `Tarif Public_Prijslijst - Mai_Mei 2026_EK63 FR-NL.pdf` (fourni par Dorian) |
| Millésime | Mai 2026 |
| `tariffSource` (écrit sur chaque variante) | `EK63 Mai 2026 (945904 0,7.05.2026/A)` |
| Vérification d'identité | OK — `IL FUOCO 5.0`, `TARIF PUBLIC PRIJSLIJST MAI MEI`, `edilkamin.com` présents |
| Tous les prix | **hors TVA** |

Dataset tarif faisant foi : table inline du script `scripts/ek63-variants-build-proposal.ts` (déterministe, relisible, régénère le CSV).

---

## 2. Structure retenue — 3 axes uniformes

À la demande de Dorian, **tous les modèles** suivent la même structure de variantes, à 3 axes :

**Sortie des fumées** (Top / Back / Coax) × **Finition** (Acier / Céramique / Verre …) × **Couleur**

Ces 3 axes correspondent aux types d'options du brief v2 déjà en base (`Sortie des fumées`, `Matériau`, `Couleur`) → portés par la relation `optionValues`. Aucun champ `fumeOutlet`/`color` séparé n'est nécessaire (voir A9).

---

## 3. Prérequis (section 3 du brief)

| # | Vérification | État |
|---|---|---|
| 1 | `payload.config.ts` lu | OK — `postgresAdapter`, collection `products`, marque = champ `select` `brand` |
| 2 | Stack Node + Vercel + Supabase + Payload 3 | OK |
| 3 | Collections `variant-option-types` / `variant-option-values` | OK |
| 4 | Sous-champs additifs section 5 | **NON présents** — migration additive proposée (§6), non appliquée |
| 5 | Fichier source confirmé | OK |

`hasVariants` = checkbox `has_variants`. Tableau `variants` = sous-table `products_variants` (sous-champs actuels : `sku`, `gtin`, `mpn`, `price`, `salePrice`, `stockStatus`, `leadTimeDays`, `image` + relation `optionValues`).

---

## 4. Journal de classification A / B (Phase 2)

19 modèles pellet. Critère : codes couleur `81xxxx` (6 ch.) → **A** ; code structure `81xxxx` + série `11xxxxx` (7 ch.) → **B**.

**A (6)** : Metro 110+ Evo, Tweed 90+ Evo, Gotha 70 Evo, Cell 80+ Evo, Entity 90+ Evo, Spot100 H Evo.
**B (13)** : Zone 80, Berry 90+, Daily 130++, Monday 130++, Like 80, Like 90+, Spy 110+, Yung 130++, Dub 100++, Pellek 80, Pellek 100+, Monday H 190, Monday H 230.

(Détail codes/prix : table inline du script ; journal par modèle ci-dessous.)

---

## 5. Variantes proposées (Phase 3) — 110 variantes

Fichier complet : **`variantes-proposees.csv`** (une ligne par déclinaison, 16 colonnes).
`mpn` = `manufacturerStructureSku` (défaut brief §8). `sku` interne = `EK63-{MODELE}-{SORTIE}-{FINITION}-{COULEUR}`.

| Modèle | Produit Payload | id | `hasVariants` | Syst. | Sorties | Finitions | Variantes |
|---|---|---|---|---|---|---|---|
| Zone 80 Evo | ek63-zone-80 | 13 | false | B | Back | Acier | 4 |
| Berry 90+ Evo | ek63-berry-90 | 16 | false | B | Back | Céramique | 3 |
| Daily 130++ Evo | ek63-daily-130 | 22 | false | B | Back | Céramique | 3 |
| Monday 130++ Evo | ek63-monday-130 | 24 | false | B | Back | Acier-Céramique | 3 |
| Like 80 Evo | ek63-like-80 | 12 | false | B | Top/Back/Coax | Acier, Céramique | 21 |
| Like 90+ Evo | ek63-like-90 | 17 | false | B | Top/Back/Coax | Acier, Céramique | 21 |
| **Spy 110+ Evo** | ek63-spy-110 | 6 | **true** | B | Back/Top | Acier, Verre | 10 |
| Yung 130++ Evo | ek63-yung-130 | 23 | false | B | Back | Céramique | 4 |
| Dub 100++ Evo | ek63-dub-100 | 21 | false | B | Top | Céramique | 4 |
| Pellek 80 Evo² | ek63-pellek-80 | 25 | false | B | Top | *kit (voir A11)* | 3 |
| Pellek 100+ Evo² | ek63-pellek-110 | 26 | false | B | Top | *kit (voir A11)* | 3 |
| Monday H 190 Evo | ek63-monday-190h | 28 | false | B | Back | Acier-Céramique | 3 |
| Monday H 230 Evo | ek63-monday-230h | 29 | false | B | Back | Acier-Céramique | 3 |
| Metro 110+ Evo | ek63-metro-110 | 20 | false | A | Back | Acier | 4 |
| **Tweed 90+ Evo** | ek63-tweed-90 | 4 | **true** | A | Top/Back | Acier | 5 |
| Gotha 70 Evo | ek63-gotha-70 | 11 | false | A | Top | Acier | 4 |
| Cell 80+ Evo | ek63-cell-80 | 15 | false | A | Top/Coax | Acier | 6 |
| Entity 90+ Evo | ek63-entity-90 | 19 | false | A | Top | Acier | 3 |
| Spot100 H Evo | ek63-spot-100h | 27 | false | A | Back | Céramique | 3 |

**Calcul du prix** — A : `computedPriceHT` = prix tarif final. B : `computedPriceHT` = prix structure + prix série. Exemples vérifiés : Zone 80 Back Acier = 1530+210 = **1740** ; Like 80 Coax Céramique = 2420+560 = **2980** ; Spy Back Verre = 2520+560 = **3080**.

### 5.1 — Produits écrivables en Phase 5 (`hasVariants=true`)

Seuls **Spy 110+ Evo** et **Tweed 90+ Evo** seraient écrits (15 variantes). Les 95 autres variantes (17 produits) sont une **proposition à relire** : leur produit a `hasVariants=false`, le script ne les écrira pas tant que le flag n'est pas coché manuellement.

### 5.2 — Conflit avec les variantes existantes

Les 2 produits `hasVariants=true` ont **déjà des variantes**, encodées avec une structure d'axes différente de la structure 3-axes retenue :

| Produit | Variantes existantes | Axes existants | Problème |
|---|---|---|---|
| Tweed 90+ Evo | 5 | Sortie + Couleur (**pas de Finition**) | structure à 2 axes ; 1 variante au code erroné (A5) |
| Spy 110+ Evo | 2 | Matériau + Couleur (**pas de Sortie**) | structure à 2 axes ; ne couvre que Verre Blanc / Verre Noir (A7) |

Conséquence : avec la structure 3-axes uniforme, les variantes existantes de ces 2 produits sont **obsolètes**. Le brief interdit l'écrasement et la suppression → l'import additif ne peut pas, seul, les remplacer. **Décision Dorian requise** (voir §9).

---

## 6. Sous-champs additifs manquants

À ajouter par migration additive avant toute écriture : `manufacturerStructureSku`, `manufacturerColorSku`, `codingSystem`, `computedPriceHT`, `priceSource`, `tariffSource`, `importBatchId` (7 champs neufs). `mpn`/`gtin` existent déjà. `fumeOutlet`/`color` **non créés** (réutilisation de `optionValues`, voir A9).

Migration prête mais **non appliquée** : `03-migration-additive-PROPOSEE.ts` (placée hors de `migrations/`).

---

## 7. Anomalies

| # | Anomalie | Détail / action attendue |
|---|---|---|
| A1 | 17 produits EK63 sans `hasVariants=true` | Variantes proposées mais non écrites. Cocher `hasVariants` produit par produit pour les activer. |
| A2 | `ek63-pellek-110` rapprochement incertain | Produit Payload « Pellek 110+ Evo² » (110) ; tarif « Pellek 100+ Evo² » (100, code `817960`). Erreur de saisie probable — à confirmer. |
| A3 | Modèles tarif sans produit Payload | Bois (Fancy/Decor/Decor C/Firek) et chaudières (Kappa 200/240/270) — hors périmètre, signalés seulement. |
| A4 | Spy 110+ Evo — prix structure Top illisible | `817930` non lisible dans le PDF → 5 variantes Top en `computedPriceHT=null`, `priceSource=a verifier`. À compléter. |
| A5 | Tweed — variante existante au code divergent | Variante « Haute + Tourterelle » : `sku=817570` en base, tarif = `817580`. Non corrigée. |
| A6 | Conventions `sku` incompatibles | Variantes existantes = code fabricant en `sku` (`817570`, `1193910`…), pas la convention `EK63-…`. Dédup à faire aussi par combinaison d'options, sinon doublons. |
| A7 | Spy — axes incompatibles | Existant = Matériau+Couleur sans Sortie. Cible = Sortie+Finition+Couleur. Réalignement requis. |
| A8 | Code carton ≠ code tarif | Carton `817620` (Tweed Top VT.Nero) vs tarif Tweed Top Noire `817600`. Non fusionnés. À clarifier fournisseur. |
| A9 | `fumeOutlet`/`color` redondants | `optionValues` (v2) porte déjà les 3 axes. Recommandation : ne pas créer ces champs. |
| A10 | Entity 90+ Evo — couleur manquante | Code `817300` (Bordeaux ?) non extrait → 3 couleurs sur 4 probables. À vérifier. |
| A11 | Pellek 80/100+ — axe « Finition » = kit | Pas de couleur/finition au tarif ; la série est un kit de chargement obligatoire. Représenté en finition « Kit … » + couleur « Standard ». Axe à arbitrer. |
| A12 | Valeurs d'options à seeder | La structure 3-axes nécessite des valeurs absentes en base : Sortie « Coax » ; Matériau « Acier/Céramique/Verre » ; couleurs « Blanc perle, Blanc opaque, Blanc crème, Noire opaque, Gris foncé, Tourterelle ». À seeder avant Phase 5. |

---

## 8. Récapitulatif chiffré

| Indicateur | Valeur |
|---|---|
| Modèles EK63 pellet lus | 19 (A=6, B=13) |
| Produits EK63 en base | 19 |
| Produits `hasVariants=true` | 2 (Spy, Tweed) |
| Variantes candidates générées | **110** |
| dont sur produits écrivables (`hasVariants=true`) | 15 |
| dont prix `a verifier` | 5 (Spy Top) |
| Insertions nettes réalisables **en l'état** | **0** — bloquées par A5/A6/A7 |
| Anomalies | 12 |

---

## 9. Décisions attendues avant le GO

1. **Spy & Tweed (A7, A5)** : leurs variantes 2-axes existantes sont obsolètes face à la structure 3-axes. Comment procéder ? Option recommandée : en Phase 5, après snapshot, **supprimer puis recréer** les variantes de ces 2 produits (sortie du strict additif → autorisation explicite nécessaire), `importBatchId` dédié pour annulation propre.
2. **A4** : fournir le prix structure Spy Top (`817930`).
3. **A12** : valider le seed des valeurs d'options manquantes.
4. **A6/A9** : valider la migration additive (7 champs) et la convention `sku` interne.
5. **A1** : lister les produits EK63 à passer en `hasVariants=true` (au-delà de Spy/Tweed).
6. **A2/A11** : trancher le cas Pellek (nom 100/110, axe kit).

Une fois ces points tranchés, je préparerai la Phase 5 : snapshot Supabase → migration additive → seed options → écriture dans `variants` sur staging → diff → rollback si anomalie.

**Rien n'a été écrit en base. Le script s'arrête ici et attend le GO.**
