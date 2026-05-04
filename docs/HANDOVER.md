# HANDOVER — Mister Pellets

> **Lis ce fichier en premier, à chaque nouvelle session.**
> Il contient les règles de continuité du projet. Le brief technique complet est dans `docs/mister-pellets-brief-fullcode.md`.

---

## 📅 Journal des hotfixes critiques

- **2026-05-04** Audit-fixes V1.4 appliqué (cf. `docs/audits/audit-complet-v20260503.md`) : Phase 1 bloquants + Phase 2 hautes + amorces Phase 3.

  **Phase 1 (bloquants sécurité+SEO)** :
  - Headers HTTP de sécurité ajoutés dans `next.config.ts` : HSTS (max-age 2 ans + preload), X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (geo/camera/micro disabled), Content-Security-Policy compatible Stripe + Google Fonts + Vercel
  - Rate limiting in-memory (`lib/rate-limit.ts`) : 5 req/h/IP sur `/api/quote` et `/api/contact`, headers Retry-After + X-RateLimit-Reset sur 429. À migrer vers @upstash/ratelimit + Vercel KV pour vrai cluster
  - Honeypot field caché (`website`) sur les 2 formulaires + check serveur
  - Validation téléphone belge stricte dupliquée côté serveur (était client only)
  - Logger PII redact (email tronqué, nom première lettre seulement)
  - OG image dynamique via `app/opengraph-image.tsx` (Vercel ImageResponse, 1200×630, gradient + logo + tagline + URL). Plus de 404 sur /og-image.jpg
  - Cleanup doublons "Mister Pellets" dans 5 fichiers de titles (template root suffit)

  **Phase 2 (hautes priorités)** :
  - `app/(frontend)/not-found.tsx` brandée (404 avec layout, mascotte 60% opacité, 3 CTA)
  - `app/(frontend)/error.tsx` boundary global brandée (digest + reset + 3 CTA)
  - Skip-to-content link dans le layout frontend (visible focus clavier uniquement)
  - CSRF protection : `csrfOriginCheck` dans `lib/rate-limit.ts`, vérifie Origin/Referer sur `/api/quote` et `/api/contact`
  - Idempotence webhook Stripe : Map in-memory des `event.id` traités (1000 max FIFO), évite les emails de confirmation doubles sur retry
  - Lockout admin Payload : `maxLoginAttempts: 5`, `lockTime: 10 min`, cookies SameSite Strict + Secure prod
  - Bandeau temporaire sur `/prendre-rendez-vous` tant qu'Easy!Appointments n'est pas live (téléphone + email cliquables)
  - Schema parentOrganization Mister Pellets ↔ Awlest SRL (Schema.org Organization avec foundingDate 2016, alternateName, sous-org Awlest avec adresse + TVA)
  - Fix 2 erreurs `react-hooks/set-state-in-effect` : QuoteForm init lazy depuis localStorage, NavbarSticky utilise `effectiveVisible` dérivé au lieu de setState dans useEffect
  - Fix 1 erreur `@next/next/no-html-link-for-pages` : QuoteForm `<a href="/">` → `<Link>`
  - Règle ESLint `react/no-unescaped-entities` passée de error à warn (172 occurrences cosmétiques sans impact runtime, le diff cleanup est non bloquant)
  - Migrations Payload exclues du lint (générées automatiquement)

  **Phase 3 (moyennes amorcées)** :
  - `app/(frontend)/loading.tsx` skeleton global (animate-pulse, structure titre+paragraphes)

  **Phase 3-4 reportées** (ne nécessitent pas Phase 1 résolue, peuvent partir en cycles séparés) : bandeau cookies RGPD, schemas HowTo guides, bundle analyzer, prefers-reduced-motion étendu, logos officiels Brand schemas, Sentry monitoring, tests Vitest+Playwright, PWA manifest, scroll-to-top FAB, Speakable schema, hreflang explicite, mise à jour /styleguide.

- **2026-05-03** Hotfix V1.3 appliqué (cf. `docs/mister-pellets-corrections-mobile-v1.3-hotfix.md`) : footer minimisé au strict (logo couleur + 3 réseaux pleine opacité + liens légaux + copyright, retrait téléphone/email/adresse en doublon avec page Contact, contraste WCAG AAA renforcé), page FAQ centrale créée avec 47 questions catégorisées en 9 thèmes + recherche temps réel + filtres pills + Schema FAQPage (compilation des FAQ existantes + nouvelles questions pour combler les angles morts), refonte taxonomie filtres boutique (Type 5 valeurs Standard/Canalisable/Hydro/Hybride/Insert + Diffusion 2 valeurs ventilation forcée/convection naturelle + Couleur regroupée en 3 catégories Tons clairs/foncés/naturels), audit pages guides + fix bouton Primes qui débordait (whitespace-nowrap retiré du Button base CVA + libellé raccourci + protections globales boutons/médias dans globals.css), page À propos rectifiée (+800 poêles vendus et installés au lieu de +400, retrait des mentions "4,9 / 200 avis Google" attribuées à tort à Mister Pellets, mention nuancée Awlest autorisée sur À propos, phrase creuse "ce qui nous fait rentrer le matin" humanisée, aggregateRating Schema LocalBusiness retiré), logo central de l'accueil doublé en taille (h-[160px] mobile, h-[200px] desktop) avec spacing vertical 35 px strict. URLs réelles des profils sociaux (TikTok/Instagram/YouTube) et année de création de Dielle restent à fournir par le client. Audit complet du site programmé en prochaine étape sur instruction client.
- **2026-05-03** Hotfix V1.2 appliqué (cf. `docs/mister-pellets-corrections-mobile-v1.2-hotfix.md`) : tableau comparatif "Poêle à pellets vs autres modes de chauffage" qui débordait sur mobile remplacé par cards empilées sur mobile + tableau classique sur sm+ (option B du doc), footer entièrement réduit à la version minimaliste (logo couleur + coordonnées + 3 réseaux sociaux TikTok/Instagram/YouTube + liens légaux compacts + copyright), informations sur les 4 marques rectifiées intégralement à partir des sources officielles (Edilkamin = gamme très large 1963 / EK63 = marque sœur du groupe Edilkamin / Dielle = système breveté combustion par alimentation par le bas, gamme complète y compris hybride bois pellets / Ferlux = fabricant espagnol gamme complète 30+ pays). URLs réelles des profils sociaux à fournir par le client. Année de création de Dielle non confirmée à la source officielle, omise pour l'instant.
- **2026-05-03** Hotfix V1.1 appliqué (cf. `docs/mister-pellets-corrections-mobile-v1.1-hotfix.md`) : navbar mobile restaurée à la version stable d'avant `e3b0a73` (5 onglets avec drawer Menu, pastille active orange en motion.span), protections globales viewport overflow ajoutées dans `globals.css` (html/body overflow-x hidden + max-width 100vw, médias fluides par défaut, overflow-wrap sur les conteneurs de texte), footer entièrement refondu (fond vert deep + texte beige beige, contraste WCAG AAA, structure 4 blocs verticaux, padding-bottom 96 px pour libérer la NavbarSticky), logo footer remplacé par `logo-mister-pellets-full.svg` couleur dans une card cream pour préserver les couleurs du logo sur le fond vert.

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
