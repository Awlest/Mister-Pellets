# HANDOVER — Mister Pellets

> **Lis ce fichier en premier, à chaque nouvelle session.**
> Il contient les règles de continuité du projet. Le brief technique complet est dans `docs/mister-pellets-brief-fullcode.md`.

---

## ⚡ État du projet

**Stack figée — ne pas remettre en question :**
- Next.js 15 (App Router, TypeScript strict)
- Payload CMS 3 (intégré au même projet, route `/admin`)
- PostgreSQL
- Tailwind CSS + shadcn/ui
- **Production** : Combell (datacenter Bruxelles)
- **Preview** : Vercel (Hobby, mot de passe activé pour bloquer l'indexation)

**Statut** : repo en cours de construction. Avant de coder quoi que ce soit, lis intégralement le brief de référence (`docs/mister-pellets-brief-fullcode.md`, 1 570 lignes, 14 sections).

---

## 🚫 Ce qui a été abandonné (ne pas y revenir)

Le projet a connu deux tentatives infructueuses avant cette stack :

1. **WordPress + Elementor** — abandonné (problèmes de désynchro éditeur/rendu, plugins qui cassent)
2. **Wix Studio** — abandonné (même type de problèmes, fatigue d'édition)

**Ne propose jamais de revenir à ces solutions.** Si une difficulté survient, on cherche une réponse dans la stack actuelle, pas en changeant d'outil.

Tout code, toute config, toute structure de fichier liée à WordPress ou Wix présent dans des sessions précédentes est à ignorer. On part d'un repo neuf.

---

## ✅ Ce qui est conservé des sessions précédentes

Ces éléments sont validés et stables. Ne les modifie pas sans validation explicite du client.

### Identité visuelle

**Logos** (dans `public/` du repo) :
- `logo-mister-pellets-wordmark.svg` (header)
- `logo-mister-pellets-mascotte.svg` (illustrations, pellet humanisé avec flamme)
- `logo-mister-pellets-full.svg` (footer, OG image)

**Palette officielle** :
```
Verts    : #102916 (darkest) · #174724 (deep, principal) · #377038 (mid) · #508943 (light)
Oranges  : #F28A20 (flame, principal) · #FDB842 (warm) · #FFE4D1 (light)
Beiges   : #FAF7F0 (cream, fond dominant) · #F4F1E8 (beige) · #EAE0CB (warm) · #C8B68F (sand)
Neutres  : #14241B (ink) · #4A5A50 (ink-soft) · #2A1F15 (bark, accent rare)
```

Règle 60/30/10 : 60 % beige, 30 % vert deep, 10 % orange flame, < 1 % bark.

**Polices** : Fraunces (display, serif chaleureux) + Inter Tight (body, sans-serif). Chargées via `next/font/google`.

### Données métier

- **Société** : Awlest SRL · TVA BE 0656.514.212
- **Adresse** : Rue des Fagotis 3A, 5380 Fernelmont
- **Téléphone** : 0472 04 32 22
- **Email** : info@awlest.com
- **Avis Google** : 4.9★ / 200 avis (g.page/r/mister-pellets)
- **4 marques** distribuées : Edilkamin (IT, premium), EK63 (IT, connecté), Dielle (IT, hydro), Ferlux (ES, budget)
- **10 villes** pour pages locales : Namur, Charleroi, Liège, Wavre, Mons, Arlon, Tournai, Verviers, Gembloux, Dinant
- **Livraison gratuite** : 50 km autour de Fernelmont
- **Mention Awlest** : nulle part visible sur le site, sauf dans les mentions légales / CGV / vie privée / cookies

---

## 🔐 Accès à demander au client

Demande chaque accès au moment où tu en as besoin, pas avant. Le client les fournira directement dans la conversation.

| Accès | Quand le demander |
|---|---|
| Compte Wix actuel | Phase 5 — pour exporter le CSV des 61 produits (puis on n'y retourne plus) |
| Compte Vercel | Phase 1 — premier déploiement preview |
| Compte Combell | Phase 9 — bascule production |
| Domaine mister-pellets.be | Phase 9 — bascule DNS |
| Compte Stripe | Phase 5 — paiements (clés test puis prod) |
| Compte Resend ou SMTP Combell | Phase 5 — emails transactionnels |
| Google Search Console + Merchant Center | Phase 8 |
| Google Business Profile | Phase 8 — pour les avis |

**N'invente rien, ne suppose aucune valeur.** Si tu as besoin d'une info qui n'est pas dans le brief, demande-la.

---

## 📋 Phases de build (référence rapide)

1. Setup repo + design tokens + déploiement Vercel preview
2. Design system + composants UI
3. Pages principales (accueil, boutique, produit, marques, primes, devis, contact)
4. Pages locales + guides
5. Boutique + import 61 produits + paiement Stripe
6. SEO technique + schemas Schema.org
7. Blog + contenu éditorial
8. Google Merchant + Analytics + Sentry
9. Recette + bascule DNS vers Combell

Détail complet : section 12 du brief.

---

## 🎯 Principes non-négociables

- **Mobile-first absolu** — design pensé pour 375px d'abord, puis adapté
- **Navbar flottante sticky bottom mobile** (4 actions : Accueil / Devis / Boutique / RDV) — voir section 5 du brief
- **Textes 100 % humains** — relire la section 6.1 du brief avant chaque session de rédaction. Aucun marqueur IA toléré.
- **SEO + GEO** optimisés dès le départ — sections 6.2 et 6.3 du brief
- **Lighthouse 95+** sur Performance / SEO / Accessibility / Best Practices
- **Aucun lock-in** — le code et les données restent propriété du client
- **Aucune action destructive sans confirmation** — pas de `rm -rf`, pas de drop de table, pas de force-push sans demander

---

## 🚦 Première action attendue à chaque session

1. Lis ce HANDOVER.md
2. Lis le brief complet (`docs/mister-pellets-brief-fullcode.md`) si c'est ta première session sur le projet
3. Vérifie l'état du repo (`git status`, dernière phase complétée, todos en cours)
4. Confirme au client la phase sur laquelle tu travailles, et demande l'accès dont tu as besoin
5. **Ensuite seulement** commence à coder

---

## 📝 Règles de commit & PR

- Branches : `feature/<phase>-<description>` (ex. `feature/3-page-accueil`)
- Commits : conventionnels (`feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`)
- Une PR par phase, mergée dans `develop`, qui se déploie en preview Vercel
- `main` uniquement pour la prod Combell, jamais de commit direct

---

## 🆘 En cas de doute

- **Ambiguïté technique** : tranche selon le brief, ou demande au client
- **Ambiguïté de design** : reviens à la règle 60/30/10 et à la maquette mobile validée
- **Ambiguïté de contenu** : applique les règles de la section 6.1 (textes humains)
- **Bug ou erreur** : remonte immédiatement, ne masque jamais une erreur silencieusement

---

*Document maintenu à jour à chaque pivot majeur du projet. Version 1.0 — Mai 2026.*
