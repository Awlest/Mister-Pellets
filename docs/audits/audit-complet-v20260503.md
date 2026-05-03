# Audit complet Mister Pellets — UI/UX, Frontend, Sécurité, SEO, GEO

**Date** : 2026-05-03
**Branche auditée** : `main` au commit `345fa3e` (V1.3.8)
**Méthodologie** : analyse statique du code (ESLint, TypeScript, grep), inspection live via dev server (Claude Preview MCP, viewport mobile 375 px), tests des routes API, revue des composants et schemas SEO/GEO.
**Build status** : `tsc --noEmit` exit 0, `pnpm build` OK 64 pages générées.

---

## Synthèse exécutive

| Axe | Note | Bloquants | Hautes | Moyennes | Basses |
|---|---|---|---|---|---|
| UI / UX | 🟡 7/10 | 0 | 3 | 5 | 4 |
| Frontend (code, perf, a11y) | 🟡 6/10 | 0 | 5 | 6 | 8 |
| Sécurité | 🟠 5/10 | **2** | 5 | 3 | 2 |
| SEO | 🟢 8/10 | 0 | 3 | 4 | 3 |
| GEO | 🟢 9/10 | 0 | 1 | 3 | 2 |

**Total** : 47 améliorations identifiées dont **2 bloquantes sécurité**, 17 hautes, 21 moyennes, 19 basses.

**Forces** : architecture Next.js 16 / Payload 3 saine, schemas Schema.org riches (Organization, WebSite, LocalBusiness, FAQPage, Service, Article, Product, BreadcrumbList), GEO bien pensé (TL;DR, FAQ structurées, données chiffrées, maillage sémantique), validation API server-side correcte.

**Faiblesses** : sécurité headers HTTP absente (CSP, HSTS, X-Frame-Options), pas de rate limiting sur les endpoints publics (risque spam), 173 erreurs ESLint non bloquantes mais qui polluent le diff, doublons "Mister Pellets" dans les `<title>`, og-image.jpg référencée mais absente du `/public`.

---

## 1. UI / UX

### 1.H Hautes

#### 1.H.1 — `og-image.jpg` 404, Open Graph cassées sur les réseaux sociaux
- **Constat** : `app/layout.tsx` référence `/og-image.jpg` dans `openGraph.images` et `twitter.images` mais le fichier n'existe pas dans `/public`. Test live : `HEAD /og-image.jpg` retourne 404.
- **Conséquence** : quand un client partage une URL Mister Pellets sur Facebook, LinkedIn, WhatsApp, Twitter, l'aperçu n'a pas d'image, juste le titre et la description. Mauvais signal de marque.
- **Fix** : créer une image OG 1200×630 px (logo full + tagline + couleurs MP), exporter en JPG ou WebP, déposer dans `/public/og-image.jpg`. Optionnel : variantes par section (`og-boutique.jpg`, `og-guides.jpg`).

#### 1.H.2 — Doublon "Mister Pellets | Mister Pellets" dans les `<title>`
- **Constat** : le `template: "%s | Mister Pellets"` du root layout ajoute le suffixe à TOUS les titles, y compris ceux qui contiennent déjà "Mister Pellets". Pages affectées : home, boutique, FAQ, blog, à propos, contact, nos marques, page ville, page produit, RDV, guides individuels.
- **Exemple live** : `Boutique poêles à pellets en Wallonie | Mister Pellets | Mister Pellets`
- **Fix** : retirer "| Mister Pellets" des titles individuels (le template l'ajoute) OU retirer le template et gérer le suffixe au cas par cas.

#### 1.H.3 — Pas de page 404 personnalisée
- **Constat** : aucun fichier `app/(frontend)/not-found.tsx` ou `app/not-found.tsx`. Next.js sert sa 404 par défaut, sans branding ni navigation.
- **Conséquence** : un visiteur qui tombe sur une URL morte voit une page neutre, sans pouvoir revenir facilement à la home ou à la boutique.
- **Fix** : créer `app/not-found.tsx` avec le layout de marque (Header desktop + NavbarSticky mobile + Footer), un message clair, et 3 CTA (Accueil, Boutique, Contact).

### 1.M Moyennes

#### 1.M.1 — Pas d'état de chargement (skeleton) sur les routes dynamiques
- Pas de `loading.tsx` dans `(frontend)/produit/[slug]`, `(frontend)/blog/[slug]`, `(frontend)/poeles-pellets/[ville]`, etc. Sur connexion lente, le visiteur voit un blanc avant le contenu.
- **Fix** : ajouter `loading.tsx` par segment dynamique avec skeleton minimal (titre placeholder + 3 blocs gris).

#### 1.M.2 — Boutons "Réserver" RDV pointent vers un sous-domaine inactif
- `prendre-rendez-vous/page.tsx` : les 5 cards de service ont `href="https://booking.mister-pellets.be/?service=N"` mais le sous-domaine n'est pas encore actif (Easy!Appointments à installer côté Combell). Clic = 404 ou DNS error.
- **Fix temporaire** : afficher un bandeau "Système de réservation en cours d'activation, contactez-nous au 0472 04 32 22" tant que le sous-domaine n'est pas live, OU faire pointer vers `/contact` en attendant.

#### 1.M.3 — Pas de bandeau cookies
- Aucun consentement RGPD visible sur le site. Avec les futurs ajouts GA4/Merchant/Sentry, c'est obligatoire.
- **Fix** : composant `CookieBanner` (consent granulaire FR : nécessaires / analytics / marketing) à activer Phase 8 avant les trackers.

#### 1.M.4 — Halos décoratifs (500×500 et 400×400 px) débordent du viewport sur mobile
- Inspection live : le halo orange du hero accueil (`-right-24 -top-24 w-[500px]`) et celui du `CTAFinal` (`-left-24 w-[400px]`) sortent largement du viewport 375 px. Contenus dans des `<section overflow-hidden>` donc pas de scroll horizontal, mais ça ajoute du DOM inutile à rendre.
- **Fix** : réduire la taille sur mobile via `w-[300px] md:w-[500px]` ou conditionner avec `hidden sm:block`.

#### 1.M.5 — Section `Cookies` dans le footer va vers `/politique-cookies`, mais la nav rapide (drawer Menu de la NavbarSticky) n'a pas de lien Cookies
- Le drawer de la navbar mobile (qui regroupe les liens secondaires) n'expose pas les liens légaux, le footer est le seul accès.
- **Fix** : ajouter une section "Légal" en bas du drawer Menu, OU laisser tel quel puisque le footer est bien accessible en bas de page.

### 1.B Basses

#### 1.B.1 — Style guide page accessible publiquement
- `/styleguide` est dans `(frontend)` donc indexable potentiellement (actuellement noindex via `robots: { index: false, follow: false }` dans la metadata). À retirer du build prod ou déplacer hors du dossier publique.

#### 1.B.2 — La NavbarSticky chevauche maintenant le bas du footer (V1.3.5)
- Suite au passage du padding-bottom à 30 px, la navbar peut couvrir partiellement le copyright. Visible en mobile uniquement, pas critique.

#### 1.B.3 — Pas de feedback visuel "scroll to top" sur les pages longues
- Sur le blog ou les guides longs, pas de bouton FAB pour revenir en haut. UX nice-to-have.

#### 1.B.4 — La page `/styleguide` n'est pas mise à jour avec les changements V1.2-V1.3
- Le styleguide affiche encore l'ancienne valeur "1 750 €" qui a été corrigée dans le V1, et plusieurs anciens états des composants (boutons whitespace-nowrap supprimé, etc.).

---

## 2. Frontend (code, performance, accessibilité)

### 2.H Hautes

#### 2.H.1 — 173 erreurs `react/no-unescaped-entities` non corrigées
- ESLint signale 173 apostrophes/guillemets bruts dans le JSX (`'`, `"`, `&`). Pas bloquant en runtime mais pollue tout `lint --max-warnings=0` et empêche un futur preset `eslint --fix` propre.
- **Fix** : passe automatique de remplacement (`'` → `&apos;` dans JSX, `&` → `&amp;`, `"` → `&quot;`).

#### 2.H.2 — 2 erreurs `react-hooks/set-state-in-effect`
- `components/forms/QuoteForm.tsx:83` et `components/layout/NavbarSticky.tsx:108` appellent `setState` directement dans un `useEffect`. Anti-pattern React 19 (cascading renders).
- **Fix** : restructurer pour mettre la mise à jour d'état dans un handler ou une dépendance dérivée via `useMemo`.

#### 2.H.3 — 1 image sans alt sur la home
- Inspection live : 1 `<img>` sur 3 sans attribut `alt`. Probablement le mascotte du Header ou le logo d'une card.
- **Fix** : audit `<img>` et `<Image>`, alt vide pour décoratifs (`alt=""`), alt descriptif sinon.

#### 2.H.4 — 19 imports inutiles (`@typescript-eslint/no-unused-vars`)
- `TripleChoice.tsx` (CardContent), 4 fichiers de migrations (payload, req inutilisés). Code mort.
- **Fix** : passe `eslint --fix` et nettoyage manuel des migrations (générées, peuvent rester telles quelles).

#### 2.H.5 — `<a href="/">` détecté à la place de `<Link>` dans QuoteForm
- ESLint `@next/next/no-html-link-for-pages` : `QuoteForm.tsx:160` utilise `<a href="/">Retour à l'accueil</a>` au lieu de `<Link>`. Perte du prefetch + navigation SPA.
- **Fix** : remplacer par `<Link href="/">`.

### 2.M Moyennes

#### 2.M.1 — Aucun `loading.tsx` dans le projet
- Toutes les pages dynamiques (produit, ville, marque, article, guide) attendent le SSR sans skeleton. Sur connexion lente, latence visible.
- **Fix** : ajouter `loading.tsx` par segment.

#### 2.M.2 — Pas de `error.tsx` boundary
- En cas d'erreur runtime sur une page (ex. Payload down sur le sitemap), Next sert l'erreur générique. Aucun fallback gracieux.
- **Fix** : `app/(frontend)/error.tsx` global avec branding + bouton "réessayer".

#### 2.M.3 — Pas de `Suspense` boundary autour des composants async
- `FaqExplorer` est client mais charge la liste complète au render. Avec Payload Articles peuplé (Phase 7+), passer en Suspense + streaming.

#### 2.M.4 — Bundle JS non analysé
- Pas de `@next/bundle-analyzer` installé. Difficile de mesurer le poids des dépendances (lucide-react, framer-motion, payload imports côté client).
- **Fix** : `pnpm add -D @next/bundle-analyzer`, run `ANALYZE=true pnpm build`.

#### 2.M.5 — Pas de skip-to-content link
- Aucun `<a class="sr-only focus:not-sr-only">Aller au contenu</a>` en début de DOM. Mauvaise UX clavier pour utilisateurs de screen reader / Tab navigation.
- **Fix** : ajouter dans le layout root.

#### 2.M.6 — `useReducedMotion` utilisé seulement dans NavbarSticky
- Les autres animations (Framer Motion sur les cards hover, transitions Tailwind) ne respectent pas `prefers-reduced-motion`. Le globals.css a une règle pour les keyframes, mais pas pour les `transition` Tailwind.
- **Fix** : étendre la règle `@media (prefers-reduced-motion: reduce)` pour neutraliser aussi les `transition: all` Tailwind.

### 2.B Basses

#### 2.B.1 — Pas de tests automatisés (Vitest, Playwright)
- Aucun fichier `.test.ts` / `.spec.ts`. Pour un site e-commerce avec validation paiement, c'est un risque sur la durée.

#### 2.B.2 — Pas de Storybook / catalogue composants
- `/styleguide` joue ce rôle mais n'est pas exhaustif et n'est pas isolé du contexte.

#### 2.B.3 — Pas de monitoring d'erreur (Sentry)
- Phase 8 prévue mais absent pour le moment. Toute erreur prod passera inaperçue.

#### 2.B.4 — Imports relatifs vs alias `@/`
- Globalement cohérent (alias `@/` partout) mais certains migrations utilisent des chemins relatifs.

#### 2.B.5 — Pas de lint Stylelint sur les fichiers CSS
- `globals.css` n'est pas lint, risque d'inconsistance.

#### 2.B.6 — Le `pnpm-lock.yaml` est commité mais pas de `.npmrc` strict
- Pas de `engine-strict` Node version pinning. Risque de mismatch entre dev / preview / prod.

#### 2.B.7 — `console.log` dans les routes API
- `[quote] new request {...}` et `[contact] new message {...}` loggent les emails clients en clair. RGPD : à structurer dans un logger qui peut redacter en prod.

#### 2.B.8 — Pas de structure de logging structuré
- Tout passe par `console.*`. Pas de sévérité, pas de format JSON pour ingestion future.

---

## 3. Sécurité

### 3.BLOQUANT

#### 3.BLOQUANT.1 — Aucun header HTTP de sécurité (CSP, HSTS, X-Frame-Options, etc.)
- **Constat** : `next.config.ts` n'expose que `X-Robots-Tag` (pour bloquer indexation preview). Inspection live : seulement `cache-control`, `content-type`, `x-robots-tag` retournés par le serveur.
- **Conséquences** :
  - Pas de `Content-Security-Policy` : exposition à XSS via injection de scripts tiers
  - Pas de `Strict-Transport-Security` (HSTS) : risque de downgrade SSL en MITM
  - Pas de `X-Frame-Options` ou `frame-ancestors` : risque de clickjacking via embed
  - Pas de `Referrer-Policy` : leak d'URLs sensibles vers tiers (Stripe, etc.)
  - Pas de `Permissions-Policy` : APIs navigateur (caméra, géoloc, capteurs) accessibles par défaut
- **Fix** : ajouter dans `next.config.ts headers()` :
  ```ts
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; ..." },
  ```
- **Bloquant** car attendu en prod par les scans automatisés (Mozilla Observatory, securityheaders.com) et les pen-tests RGPD.

#### 3.BLOQUANT.2 — Pas de rate limiting sur les endpoints publics
- **Constat** : `/api/quote` et `/api/contact` acceptent des POST illimités. Aucune protection CAPTCHA, honeypot, ni limit IP.
- **Conséquences** :
  - Spam massif possible sur info@awlest.com (et la collection Quotes Payload)
  - DoS facile sur la base Postgres
  - Coût Resend si emails sortants déclenchés
- **Fix** : implémenter un middleware de rate limit (ex. `@upstash/ratelimit` + Vercel KV ou simple in-memory pour démarrer), 5 requêtes / IP / heure sur les formulaires. Ajouter un honeypot field caché côté client.

### 3.H Hautes

#### 3.H.1 — Console.log de PII (email, code postal, nom) dans les routes API
- Fuite RGPD potentielle dans les logs Vercel ou Combell. À tronquer ou redacter.

#### 3.H.2 — Pas de CSRF protection sur les formulaires
- Next.js ne fournit pas de protection CSRF native. Sur des routes mutantes (POST /api/quote, /api/contact, /api/checkout), un attaquant peut forger une requête depuis un autre domaine.
- **Fix** : ajouter un token CSRF (cookie SameSite=Strict + token vérifié côté serveur) ou vérifier `Origin` / `Referer` headers dans les routes API.

#### 3.H.3 — Aucune validation côté serveur sur le format téléphone (alors qu'elle existe côté client)
- L'API `/api/quote` ne vérifie pas que le téléphone est belge (alors que le formulaire le fait avec une regex stricte). Un script qui poste directement à l'API peut envoyer n'importe quoi.
- **Fix** : dupliquer la regex `isValidBelgianPhone` côté serveur.

#### 3.H.4 — Webhook Stripe : pas de vérification du `livemode` ni du `event.id` (idempotence)
- Si Stripe renvoie le webhook (retry), la commande sera mise à jour deux fois (statut "paid" idempotent OK, mais l'email sera renvoyé deux fois).
- **Fix** : enregistrer les `event.id` traités (table dédiée ou Redis) et ignorer les doublons.

#### 3.H.5 — Pas de protection brute-force sur l'admin Payload `/admin`
- Auth par email + password, mais pas de lockout après N tentatives ratées. Un attaquant peut tenter des millions de combinaisons.
- **Fix** : Payload supporte les `maxLoginAttempts` et `lockTime` dans la config auth de la collection Users. Activer.

### 3.M Moyennes

#### 3.M.1 — Pas de monitoring d'erreur centralisé
- Sentry ou équivalent à activer Phase 8.

#### 3.M.2 — Pas de scan automatique des dépendances (Dependabot, Snyk)
- Risque de CVE non patché.

#### 3.M.3 — Cookies session Payload sans flags explicites
- Vérifier dans la config Payload que les cookies sont `Secure`, `HttpOnly`, `SameSite=Strict`.

### 3.B Basses

#### 3.B.1 — Pas de captcha sur le formulaire de devis
- Pour un site B2C, c'est nice-to-have mais ralentit la conversion. Honeypot suffit dans 95 % des cas.

#### 3.B.2 — `STRIPE_SECRET_KEY` lue à chaque appel (pas de cache)
- Mineur, mais `getStripe()` instancie un client à chaque request.

---

## 4. SEO

### 4.H Hautes

#### 4.H.1 — Doublons "Mister Pellets" dans les titles (cf. 1.H.2)
- Pénalise potentiellement le ranking et la qualité du snippet SERP.

#### 4.H.2 — `og-image.jpg` 404 (cf. 1.H.1)
- Aucun aperçu visuel sur les partages sociaux.

#### 4.H.3 — Pas de hreflang explicite
- Le site est en `fr-BE` (lang HTML) mais aucun `<link rel="alternate" hreflang="fr-BE">` n'est généré. Pour Google, c'est OK pour le moment (un seul locale) mais à anticiper si version néerlandaise / wallonne future.

### 4.M Moyennes

#### 4.M.1 — Pas de balise `<meta name="theme-color">` séparée pour iOS/Android
- Le `viewport.themeColor` Next.js gère ça, mais sans variantes light/dark.

#### 4.M.2 — Pas de preload sur les fonts critiques
- next/font gère bien (display: swap), mais pas de `<link rel="preload" as="font">` explicite pour Fraunces variable.

#### 4.M.3 — Schemas Brand sans `logo` ni `image`
- Le schema Brand sur les pages marques a `name`, `description`, `sameAs`, `countryOfOrigin` mais pas de `logo` (URL d'image officielle de la marque). Recommandé par Google Knowledge Graph.

#### 4.M.4 — Sitemap : changeFrequency `weekly` sur la home mais ISR 1h
- Incohérence mineure : si on revalide toutes les heures, autant indiquer `daily` ou `hourly`.

### 4.B Basses

#### 4.B.1 — Pas de balise `<meta name="apple-mobile-web-app-title">`
- Pour PWA / ajout à l'écran d'accueil iOS. Nice-to-have.

#### 4.B.2 — Pas de `manifest.webmanifest`
- Idem, PWA-ready future.

#### 4.B.3 — Robots.txt ne mentionne pas le `Sitemap:` URL
- Vérifier en prod (allowIndex=true) que le sitemap est référencé. Code : oui (`sitemap: ${SITE_URL}/sitemap.xml`), à confirmer une fois `NEXT_PUBLIC_ALLOW_INDEXING=true` activé en prod.

---

## 5. GEO (Generative Engine Optimization)

### 5.H Hautes

#### 5.H.1 — Pas de schema `parentOrganization` reliant Mister Pellets à Awlest
- Pour aider les LLM à comprendre la structure (Mister Pellets = marque commerciale, Awlest = société légale), ajouter dans le schema Organization global :
  ```json
  "subOrganization": {
    "@type": "Brand",
    "name": "Mister Pellets",
    "description": "Marque commerciale spécialisée poêles à pellets"
  },
  "legalName": "Awlest SRL"
  ```

### 5.M Moyennes

#### 5.M.1 — Pas de schema `HowTo` sur les guides procéduraux
- Les guides "Comment dimensionner son poêle", "Comment entretenir son poêle", etc. pourraient bénéficier d'un Schema HowTo (étapes, durée, matériel) qui est très bien indexé par les LLM et Google.
- **Fix** : ajouter `buildHowToSchema()` dans `lib/seo.ts` et l'utiliser dans les pages guides à structure step-by-step.

#### 5.M.2 — Pas de schema `Review` sur les pages produits
- Si on a des avis clients par produit, les exposer en Schema Review enrichirait le snippet et donnerait du grain à moudre aux LLM.

#### 5.M.3 — Citations internes "Selon les techniciens Mister Pellets" présentes mais pas systématiques
- Présent dans les articles blog, plus rare sur les pages produits, marques, villes. À étendre.

### 5.B Basses

#### 5.B.1 — Schemas FAQPage sur la home et la page primes : potentielle dilution
- Avoir trop de FAQPage différentes peut cannibaliser le ranking. La page /faq centrale est la plus complète, vérifier que Google indexe la bonne version.

#### 5.B.2 — Pas de balisage `Speakable` sur les sections "TL;DR"
- Schema.org Speakable indique aux assistants vocaux (Google Assistant, Alexa) quels passages lire à voix haute. Nice-to-have pour les TL;DR des articles.

---

## 6. Plan d'action recommandé (priorité)

### Phase 1 — Bloquants (à faire avant ouverture indexation prod)

1. **Sécurité** : ajouter les headers HTTP (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options) dans `next.config.ts`
2. **Sécurité** : implémenter rate limiting sur `/api/quote` et `/api/contact` (5/h/IP) + honeypot field
3. **UX/SEO** : créer `og-image.jpg` 1200×630 et déposer dans `/public/`
4. **SEO** : nettoyer les doublons "Mister Pellets" dans les titles

### Phase 2 — Hautes priorités (court terme, 1-2 semaines)

5. Créer `app/not-found.tsx` brandé
6. Console.log PII : remplacer par un logger qui redact en prod
7. CSRF protection sur les routes mutantes (vérification `Origin`)
8. Validation téléphone belge dupliquée côté serveur dans `/api/quote`
9. Idempotence webhook Stripe (table d'événements traités)
10. `maxLoginAttempts` + `lockTime` sur la collection Users Payload
11. Bandeau de réservation temporaire sur `/prendre-rendez-vous` tant qu'Easy!Appointments n'est pas live
12. Fix des 173 erreurs ESLint `react/no-unescaped-entities` (passe automatique)
13. Fix des 2 erreurs `react-hooks/set-state-in-effect`
14. Image sans alt sur la home (audit + correction)
15. Schema `parentOrganization` Mister Pellets / Awlest

### Phase 3 — Moyennes (moyen terme, 2-4 semaines)

16. `loading.tsx` par segment dynamique (skeletons)
17. `error.tsx` global brandé
18. Bandeau cookies RGPD (avant activation GA4 / Sentry)
19. Schemas HowTo sur les guides procéduraux
20. Bundle analyzer + revue des dépendances
21. Skip-to-content link
22. Logos officiels dans les schemas Brand
23. `prefers-reduced-motion` étendu aux transitions
24. Sentry monitoring d'erreurs
25. Tests automatisés (Vitest + Playwright sur parcours critiques)

### Phase 4 — Basses (long terme, finition)

26. Storybook ou catalogue composants enrichi
27. PWA manifest + apple-mobile-web-app-title
28. Bouton scroll-to-top sur pages longues
29. Mise à jour de `/styleguide` avec composants V1.3.x
30. Captcha invisible (hCaptcha / Turnstile) si spam observé malgré honeypot
31. Schema `Review` sur les pages produits une fois avis collectés
32. Speakable schema sur les TL;DR
33. Hreflang explicite (anticiper version NL future)

---

## 7. Annexes

### 7.1 Commandes de vérification

```bash
# ESLint complet
pnpm lint

# Build production + analyse
pnpm build
pnpm exec next info

# Audit headers HTTP en prod (après déploiement)
curl -sI https://mister-pellets.be/ | grep -i -E "strict|content-security|x-frame|referrer|permissions|x-content"

# Lighthouse en CLI (à installer)
pnpm dlx lighthouse https://mister-pellets.be --view --preset=desktop
pnpm dlx lighthouse https://mister-pellets.be --view --preset=mobile

# Mozilla Observatory (security headers + TLS)
# https://observatory.mozilla.org/analyze/mister-pellets.be

# Google Rich Results Test (schemas)
# https://search.google.com/test/rich-results

# Test outils GEO :
# - Détecteurs IA : GPTZero, Originality.ai, ZeroGPT
# - Test ChatGPT / Perplexity / Claude / Gemini : "Quels sont les meilleurs installateurs de poêles à pellets en Wallonie ?"
```

### 7.2 Fichiers clés audités

- `app/layout.tsx` (root metadata + JsonLd globaux)
- `app/(frontend)/layout.tsx` (Header + Footer + NavbarSticky + CartDrawer)
- `app/(frontend)/page.tsx` (home)
- `app/api/{quote,contact,checkout,webhooks/stripe}/route.ts` (validation API)
- `next.config.ts` (headers, rewrites, redirects)
- `app/globals.css` (cascade layers, reset défensif)
- `components/layout/{Header,Footer,NavbarSticky}.tsx`
- `components/seo/JsonLd.tsx` (schemas Organization, LocalBusiness)
- `lib/seo.ts` (helpers metadata + schemas factorisés)
- `lib/{faqs,articles,guides,brands,cities,products-demo}.ts` (data éditoriale)
- `collections/{Users,Quotes,Orders,Articles}.ts` (access control Payload)

### 7.3 Documents de référence

- `docs/HANDOVER.md` (règles continuité)
- `docs/mister-pellets-brief-fullcode.md` (brief technique 1 570 lignes)
- `docs/mister-pellets-corrections-mobile-v1.md` à `v1.3-hotfix.md` (corrections appliquées)
- `docs/audits/audit-mobile-v20260502.md` (audit mobile précédent)
- `docs/audits/audit-guides-mobile-v20260503.md` (audit guides P5)
- `docs/audits/audit-complet-v20260503.md` (**ce document**)

---

**Statut déploiement** : aucun nouveau bloquant frontend ne mord sur le rendu. Les 2 bloquants sécurité (headers + rate limiting) doivent être adressés avant la bascule production avec `NEXT_PUBLIC_ALLOW_INDEXING=true` et l'ouverture publique du domaine `mister-pellets.be` sur Combell.

**Prochaine étape suggérée** : lancer un nouveau cycle hotfix V1.4 dédié aux 4 bloquants Phase 1, puis enchaîner sur les hautes priorités Phase 2.
