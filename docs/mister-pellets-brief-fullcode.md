# Mister Pellets — Brief de réalisation full-code

> **Document de référence unique** pour la construction complète du site mister-pellets.be par Claude Code.
> Stack : **Next.js 15 + Payload CMS 3 + PostgreSQL + Combell**.
> Objectif : site e-commerce + blog + admin, 100 % codé, prévisualisable sur Vercel avant bascule.

---

## 0. Synthèse exécutive

Mister Pellets vend et installe des poêles à pellets en Wallonie. Après deux tentatives infructueuses (WordPress + Elementor, puis Wix Studio), la décision est prise de basculer sur une stack codée intégralement, où l'éditeur visuel n'existe plus : ce qui est dans le code est ce qui s'affiche, point.

**Ce que cette stack garantit :**
- Aucun bug de désynchro éditeur/rendu
- Performance native (LCP < 1.5s sur 4G mobile)
- SEO et GEO optimaux dès la première mise en ligne
- Édition de contenu via un panneau d'admin propre (Payload), sans toucher au code
- Hébergement belge (Combell, Bruxelles), pour la latence + RGPD
- Aucun lock-in : le code et les données restent la propriété de Mister Pellets

**Ce qui sera livré clé-en-main par Claude Code :**
- Site complet (toutes les pages publiques)
- Panneau d'admin Payload configuré (collections produits, articles, pages, médias)
- 61 produits pré-encodés avec descriptions, prix, attributs, schéma Google Merchant
- Système de blog éditorial
- Schemas SEO complets (LocalBusiness, Product, Article, FAQPage, BreadcrumbList)
- Sitemap dynamique, robots.txt, redirections 301 depuis l'ancien site
- Système d'envoi de devis par email
- Intégration Google Merchant Center (flux XML automatique)
- Configuration de déploiement (Vercel pour preview, Combell pour prod)

**Ce qu'il restera au client :**
- Uploader les photos produits (1 principale + 3-5 galerie par produit)
- Relire et personnaliser les descriptions où il le souhaite
- Activer chaque produit dans l'admin
- Ajouter de nouveaux produits / articles de blog selon les besoins

---

## 1. Stack technique & architecture

### 1.1 Frontend

- **Next.js 15** avec App Router
- **TypeScript** (typage strict)
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants de base (boutons, formulaires, modales)
- **Framer Motion** pour les animations subtiles
- **next/image** pour l'optimisation automatique des photos (WebP, AVIF, lazy loading)
- **next/font** pour les polices (chargement optimal, zéro layout shift)

### 1.2 Backend / CMS

- **Payload CMS 3** (intégré au même projet Next.js, un seul déploiement)
- **PostgreSQL** comme base de données (Combell propose du Postgres managé)
- **Sharp** pour le traitement d'images côté Payload
- **Resend** ou **SMTP Combell** pour l'envoi d'emails (devis, contact, confirmations commande)

### 1.3 Boutique

- **Stripe** pour les paiements (Bancontact, cartes, virements via Stripe)
- Module e-commerce intégré dans Payload (collection Products, Orders, Cart en session)
- Calcul TVA automatique : 21 % par défaut, 6 % sur produits "Service / Pose"
- Gestion stocks, commandes, factures PDF générées automatiquement

### 1.4 Hébergement

- **Production : Combell** (datacenter Bruxelles)
  - Plan VPS Linux ou Web Cloud Pro Node.js (autour de 25-40 €/mois selon trafic)
  - PostgreSQL managé inclus
  - SSL Let's Encrypt automatique
  - Backups quotidiens
- **Preview : Vercel** (plan Hobby gratuit)
  - URL de preview automatique à chaque commit Git
  - Pour la phase de construction et les tests visuels

### 1.5 Architecture du repo

```
mister-pellets/
├── app/                          # Next.js App Router
│   ├── (frontend)/              # Pages publiques
│   │   ├── page.tsx             # Accueil
│   │   ├── boutique/            # Catalogue + filtres
│   │   ├── produit/[slug]/      # Page produit dynamique
│   │   ├── nos-marques/[slug]/  # Page marque dynamique
│   │   ├── poeles-pellets-[ville]/  # Page locale dynamique
│   │   ├── blog/                # Liste articles
│   │   ├── blog/[slug]/         # Article dynamique
│   │   ├── guides/[slug]/       # Guides dynamiques
│   │   ├── primes-energie-wallonie-2026/
│   │   ├── demande-de-devis/
│   │   ├── prendre-rendez-vous/
│   │   ├── faq/
│   │   ├── contact/
│   │   ├── mentions-legales/
│   │   ├── cgv/
│   │   ├── politique-confidentialite/
│   │   └── politique-cookies/
│   ├── (payload)/admin/         # Panneau Payload (route /admin)
│   ├── api/                     # API routes (devis, contact, paiement)
│   ├── sitemap.ts               # Sitemap XML dynamique
│   ├── robots.ts                # robots.txt
│   └── layout.tsx               # Layout racine
├── components/
│   ├── layout/                  # Header, Footer, NavbarSticky
│   ├── sections/                # Hero, FAQ, Testimonials, etc.
│   ├── product/                 # ProductCard, ProductGallery, AddToCart
│   ├── ui/                      # shadcn primitives
│   └── seo/                     # JsonLd, MetaTags
├── payload.config.ts            # Config Payload (collections, globals)
├── collections/                 # Définitions des collections Payload
│   ├── Products.ts
│   ├── Categories.ts
│   ├── Brands.ts
│   ├── Cities.ts
│   ├── Articles.ts
│   ├── Pages.ts
│   ├── Testimonials.ts
│   ├── Media.ts
│   ├── Orders.ts
│   └── Users.ts
├── lib/
│   ├── stripe.ts
│   ├── email.ts
│   └── seo.ts
├── public/
│   ├── logo-mister-pellets.svg
│   ├── logo-mp-mascotte.svg
│   ├── favicon.ico
│   └── og-image.jpg
└── tailwind.config.ts
```

---

## 2. Identité visuelle (charte officielle)

### 2.1 Logos (déjà disponibles dans le projet)

- `logo-mister-pellets-wordmark.svg` — logo texte horizontal (header)
- `logo-mister-pellets-mascotte.svg` — pellet humanisé avec flamme (illustrations)
- `logo-mister-pellets-full.svg` — wordmark + mascotte (footer, OG image)

### 2.2 Palette officielle (extraite des logos)

```css
:root {
  /* === VERTS === */
  --green-darkest: #102916;     /* Contours, texte sur beige */
  --green-deep: #174724;         /* Vert PRINCIPAL — H1, navbar, CTAs secondaires */
  --green-mid: #377038;          /* Vert moyen — accents */
  --green-light: #508943;        /* Vert clair — hover, badges écolo */

  /* === ORANGES === */
  --orange-flame: #F28A20;       /* Orange PRINCIPAL — flammes, CTAs primary */
  --orange-warm: #FDB842;        /* Orange chaud — gradients, halos */
  --orange-light: #FFE4D1;       /* Orange pâle — fonds doux, badges */

  /* === BEIGES (FOND DOMINANT) === */
  --cream: #FAF7F0;              /* Fond principal du site */
  --beige: #F4F1E8;              /* Fond sections alternées */
  --beige-warm: #EAE0CB;         /* Cards produits, accents */
  --sand: #C8B68F;               /* Bordures, séparateurs */

  /* === NEUTRES === */
  --ink: #14241B;                /* Texte principal */
  --ink-soft: #4A5A50;           /* Texte secondaire */
  --white: #FFFFFF;
  --bark: #2A1F15;               /* Brun espresso — accent RARE */

  /* === OMBRES === */
  --shadow-sm: 0 2px 8px rgba(20, 36, 27, 0.06);
  --shadow-md: 0 8px 24px rgba(20, 36, 27, 0.10);
  --shadow-lg: 0 16px 48px rgba(20, 36, 27, 0.16);
  --shadow-glow: 0 8px 32px rgba(242, 138, 32, 0.32);
}
```

**Règle d'application 60/30/10 :**
- 60 % beige/cream (fond dominant, ambiance premium chaleureuse)
- 30 % vert deep (titres, navbar, footer, CTAs structurants, sections à fort impact)
- 10 % orange flame (CTAs primary, flammes, accents de conversion)
- 1 % bark espresso (accents rares uniquement, jamais en surface large)

### 2.3 Typographie

- **Display (H1, H2, hero) : Fraunces** — serif moderne chaleureux
  - `font-family: 'Fraunces', Georgia, serif`
  - Variations utilisées : 400, 500, 600, italic
- **Body : Inter Tight** — sans-serif géométrique, lisibilité mobile maximale
  - `font-family: 'Inter Tight', -apple-system, sans-serif`
  - Variations : 400, 500, 600, 700

Chargement via `next/font/google` (optimisation automatique, pas de FOIT/FOUT).

### 2.4 Échelle typographique

```
H1 hero    → 48px mobile / 72px desktop, weight 600, line-height 1.05, letter-spacing -0.02em
H1 page    → 36px mobile / 56px desktop, weight 600
H2         → 28px mobile / 40px desktop, weight 600
H3         → 22px mobile / 28px desktop, weight 600
H4         → 18px mobile / 22px desktop, weight 500
Body lg    → 18px, line-height 1.6, weight 400
Body       → 16px, line-height 1.65, weight 400
Body sm    → 14px, line-height 1.55, weight 400
Caption    → 12px, weight 500, uppercase, letter-spacing 0.05em
```

### 2.5 Espacements (système 4px)

Échelle : 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px.
**Marges section :** 64px mobile / 96px desktop entre deux sections majeures.
**Padding container :** 16px mobile / 24px tablet / 32px desktop.
**Largeur max contenu :** 1280px (xl), 1440px (2xl) pour rares cas.

### 2.6 Border-radius

```
--radius-sm: 8px;    /* Inputs, petits badges */
--radius-md: 12px;   /* Boutons, cards petites */
--radius-lg: 20px;   /* Cards produits, sections */
--radius-xl: 28px;   /* Cards hero, blocs immersifs */
--radius-full: 9999px; /* Pills, avatars */
```

### 2.7 Animations

- Transitions par défaut : `200ms ease-out`
- Hover boutons : `transform: translateY(-2px)` + ombre augmentée
- Apparitions au scroll : `fade-in + translateY(20px → 0)` avec stagger 80ms
- **Pas d'animation lourde**, jamais de carrousels auto-play, jamais de parallax agressif
- `prefers-reduced-motion` respecté partout

---

## 3. Structure du site & pages

### 3.1 Arborescence complète

```
/                                          → Accueil
/boutique/                                 → Catalogue produits
/boutique/?marque=edilkamin               → Catalogue filtré par marque
/produit/[slug]/                           → Fiche produit (61 pages dynamiques)
/nos-marques/                              → Hub marques
/nos-marques/edilkamin/                    → Page marque Edilkamin
/nos-marques/ek63/                         → Page marque EK63
/nos-marques/dielle/                       → Page marque Dielle
/nos-marques/ferlux/                       → Page marque Ferlux
/guides/                                   → Hub guides
/guides/guide-achat-poele-pellets-wallonie/
/guides/poele-pellets-canalisable/
/guides/poele-pellets-hydro/
/guides/comment-entretenir-poele-pellets/
/guides/quelle-puissance-poele-pellets/
/blog/                                     → Liste articles
/blog/[slug]/                              → Article dynamique
/primes-energie-wallonie-2026/             → Page primes
/poeles-pellets-[ville]/                   → 10 pages locales dynamiques
/zones-d-intervention/                     → Hub zones
/installation-poele-pellets/
/entretien-poele-pellets/
/livraison-pellets-wallonie/
/demande-de-devis/                         → Formulaire devis 6 étapes
/prendre-rendez-vous/                      → Calendrier RDV
/faq/                                      → FAQ complète
/contact/
/mentions-legales/
/cgv/
/politique-confidentialite/
/politique-cookies/
/panier/
/checkout/
/commande/[orderId]/                       → Confirmation commande
/admin/                                    → Panneau Payload (protégé)
```

### 3.2 Page d'accueil — structure détaillée

La page d'accueil est la **charte de référence visuelle** pour toutes les autres pages. Elle reprend ce qui a été validé dans la maquette mobile-first précédente.

**Sections dans l'ordre :**

1. **Hero principal**
   - Eyebrow tag : "🔥 61 modèles · Wallonie · Pose en 1 jour"
   - H1 : "Le bon poêle à pellets, *installé chez vous* en Wallonie."
   - Sous-titre : "Edilkamin, EK63, Dielle, Ferlux. Conseils d'experts, pose soignée, primes incluses."
   - 2 CTA : "Devis en 60 sec" (orange) + "Voir la boutique" (vert outline)
   - 3 stats inline : "+400 installés · 4.9★ / 200 avis · Pose en 48h"
   - Halo orange flottant en arrière-plan

2. **Bandeau de réassurance** (4 icônes + label sur fond beige)
   - Pose certifiée RGIE
   - Garantie 5 ans
   - Primes calculées
   - Livraison Wallonie

3. **Section "3 façons d'avancer"** (3 grosses cartes côte à côte)
   - Carte 1 : "Acheter en boutique" (livraison 50km offerte) → CTA vers /boutique/
   - Carte 2 : "Demander un devis avec pose" → CTA vers /demande-de-devis/
   - Carte 3 : "Prendre rendez-vous showroom" → CTA vers /prendre-rendez-vous/

4. **Pourquoi un poêle à pellets ?** (4 stats en grid)
   - -40 % sur la facture vs mazout
   - 90 % de rendement
   - 1 750 € de primes Wallonie
   - -95 % d'émissions CO2 vs mazout

5. **Bestsellers** (carrousel horizontal de 6 produits)
   - Cards produits avec photo, marque, modèle, prix, badge "Best-seller"
   - CTA "Voir tous les modèles →"

6. **Nos marques** (4 cards de marques avec logo, accroche, tags techniques, CTA)

7. **Process en 4 étapes** (sur fond vert deep)
   - 1. Diagnostic gratuit (visite ou visio)
   - 2. Devis avec primes calculées
   - 3. Pose en 1 journée
   - 4. Mise en route + formation client

8. **Zone d'intervention Wallonie** (carte + liste des villes)
   - Checker code postal interactif
   - Liste des 30+ communes principales
   - Lien vers les 10 pages locales

9. **Primes énergie 2026** (bloc avec les 3 montants)
   - 1 500 € (revenus modestes)
   - 750 € (revenus moyens)
   - 375 € (revenus supérieurs)
   - +250 € bonus PEB F-G
   - CTA vers /primes-energie-wallonie-2026/

10. **Avis clients** (3 témoignages Google + note 4.9★)

11. **FAQ courte** (6 questions essentielles, accordéon)

12. **CTA final** (sur fond beige)
    - "Une question ? Un projet ?"
    - Bouton orange "Demander un devis" + numéro 0472 04 32 22 cliquable

13. **Footer complet**

### 3.3 Page produit (template dynamique)

Pour chacun des 61 produits, la page reprend :

- **Breadcrumb** : Accueil > Boutique > {Marque} > {Modèle}
- **Galerie photos** (1 principale + 3-5 vignettes, zoom au clic, swipe mobile)
- **Bloc info produit** :
  - Marque (lien vers page marque)
  - Modèle + référence
  - Prix TTC en gros (avec mention "TVA 21 % incluse")
  - Tags techniques (puissance kW, surface, étanche, hydro, canalisable)
  - Stock (En stock / Sur commande / Délai 4-6 sem.)
  - Bouton "Ajouter au panier" (orange) + "Demander un devis sur ce modèle" (outline vert)
- **Onglets de contenu** :
  - Description (texte rich, écrit en 100 % humain)
  - Caractéristiques techniques (tableau)
  - Installation & garantie
  - Livraison & retrait
- **Bloc "Pourquoi ce modèle ?"** (3 arguments forts, encadré orange-light)
- **Section "Modèles similaires"** (3 produits de la même gamme)
- **FAQ produit** (3-5 questions spécifiques au modèle)
- **CTA final** : "Pose incluse possible, devis gratuit"

### 3.4 Page marque (template dynamique × 4)

- Hero avec le logo de la marque, accroche, pays + année
- Histoire de la marque (3-4 paragraphes humains)
- Spécialités techniques (cartes : Premium, Hydro, Connecté, etc.)
- Liste des modèles disponibles (filtrés par marque, depuis la collection Products)
- Témoignages clients spécifiques à cette marque
- FAQ marque
- CTA final

### 3.5 Page locale (template dynamique × 10)

Une seule template alimentée par la collection Cities, qui génère 10+ pages :
`/poeles-pellets-namur/`, `/poeles-pellets-charleroi/`, `/poeles-pellets-liege/`, etc.

Contenu pour chaque ville :
- H1 : "Poêle à pellets à {Ville} — Vente, pose et entretien"
- Intro localisée (3-4 phrases, avec mentions distance Fernelmont, particularités locales)
- Bloc "Nos installations à {Ville}" (témoignage local + photo si disponible)
- 3-4 modèles recommandés pour cette ville (sélection éditoriale)
- Primes locales (province, communales si applicable)
- Process de pose à {Ville}
- FAQ locale (3-5 questions)
- Schema LocalBusiness avec areaServed = ville
- CTA devis localisé

### 3.6 Page boutique (catalogue)

- Filtres latéraux (desktop) ou drawer (mobile) :
  - Marque (4 checkbox)
  - Type (Air, Canalisable, Hydro, Hybride, Insert)
  - Puissance (8-10 kW, 10-14 kW, 14 kW+)
  - Surface (jusqu'à 80m², 80-120m², 120-180m², 180m²+)
  - Prix (slider)
  - Étanche oui/non
  - Connecté oui/non
- Tri : Best-sellers, Prix croissant, Prix décroissant, Nouveautés
- Affichage cards produits (3 colonnes desktop, 2 tablette, 1 mobile)
- Pagination ou scroll infini

### 3.7 Page devis (formulaire 6 étapes)

Formulaire progressif avec barre de progression, sauvegarde locale en cas d'abandon :

1. Surface à chauffer (4 tranches)
2. PEB du logement (A → G)
3. Cheminée existante (Ø 80 / 100 / non)
4. Style esthétique (5 visuels : moderne, classique, rustique, design, scandinave)
5. Fourchette de budget (4 tranches)
6. Code postal + délai souhaité + coordonnées

Validation en temps réel, envoi par API route Next.js qui :
- Sauvegarde le devis dans Payload (collection Quotes)
- Envoie un email à info@awlest.com avec récap structuré
- Envoie un email de confirmation au client
- Affiche page de confirmation avec récap des choix

---

## 4. Bibliothèque de composants

Tous les composants sont créés une seule fois et réutilisés partout. Aucune duplication.

### 4.1 Layout

- `<Header />` — Logo + nav desktop + hamburger mobile + indicateur scroll
- `<Footer />` — 4 colonnes (Boutique / Marques / Aide / Légal) + mentions Awlest discrètes
- `<NavbarSticky />` — Barre flottante mobile (4 actions : Accueil / Devis / Boutique / RDV)

### 4.2 Sections (éditables via Payload)

- `<HeroPrimary />` — Hero accueil
- `<HeroSecondary />` — Hero pages internes (plus compact)
- `<TripleChoice />` — 3 cartes "façons d'avancer"
- `<StatsGrid />` — 4 stats en grid
- `<BestsellersCarousel />`
- `<BrandsGrid />` — 4 cards marques
- `<ProcessSteps />` — 4 étapes numérotées
- `<CitiesMap />` — Carte Wallonie + liste villes + checker CP
- `<PrimesBlock />` — Les 3 montants primes
- `<TestimonialsCarousel />`
- `<FAQAccordion />`
- `<CTAFinal />` — Bloc CTA orange

### 4.3 Produit

- `<ProductCard />` — Card best-seller (utilisée partout)
- `<ProductGallery />` — Galerie photos avec zoom + swipe
- `<ProductInfo />` — Bloc prix + tags + boutons
- `<ProductTabs />` — Description / Specs / Install / Livraison
- `<RelatedProducts />` — Modèles similaires
- `<AddToCartButton />`

### 4.4 UI primitives (shadcn)

Button, Input, Textarea, Select, Checkbox, RadioGroup, Tabs, Accordion, Dialog, Sheet, Toast, Badge, Card, Progress.

### 4.5 SEO

- `<JsonLd />` — Composant pour injecter du Schema.org typé
- `<MetaTags />` — Title, description, OG, Twitter, canonical
- `<Breadcrumb />` — Fil d'Ariane visuel + Schema BreadcrumbList

---

## 5. Navbar flottante + sticky bottom mobile

### 5.1 Header desktop

```
[Logo Mister Pellets]   Accueil  Boutique  Nos Marques▾  Guides▾  Blog  Contact   [Panier]  [Devis →]
```

- Hauteur initiale : 96px
- Au scroll > 100px : réduit à 64px, fond `rgba(250, 247, 240, 0.92)` + `backdrop-filter: blur(8px)`
- Mega menu sur "Nos Marques" (4 cards avec logo + 1 ligne) et "Guides" (5 liens avec preview)
- Bouton "Devis" en orange flame, pill rounded-full

### 5.2 Header mobile

```
[Logo]                                                              [Hamburger ☰]
```

- Hauteur fixe 64px
- Hamburger ouvre un menu plein écran avec :
  - Liens principaux (gros, espacés)
  - Section "Nos Marques" repliable
  - Section "Guides" repliable
  - CTA "Demander un devis" en bas
  - Coordonnées (téléphone cliquable, email)

### 5.3 Sticky bottom nav (mobile uniquement)

Apparaît après 200px de scroll (sinon doublon avec hero CTAs).

```
┌────────────────────────────────────────────────────────┐
│  🏠      🛒          🔥          📅                    │
│ Accueil Boutique  [DEVIS]      RDV                    │
└────────────────────────────────────────────────────────┘
```

- Position fixed bottom
- Hauteur 72px
- Fond beige/cream avec ombre vers le haut
- Bouton **Devis central surélevé** (orange, plus gros, ressort visuellement type apps Revolut/Uber)
- Item actif souligné en vert deep
- Icônes Lucide React (Home, ShoppingBag, Flame, Calendar)
- Safe-area iOS respectée (`padding-bottom: env(safe-area-inset-bottom)`)

### 5.4 Comportement responsive

- < 768px : sticky bottom nav active, header minimaliste
- 768-1024px : header complet sans mega menu (dropdowns simples)
- > 1024px : header complet avec mega menus

---

## 6. Stratégie de contenu (SEO + GEO + 100 % humain)

### 6.1 Règles de rédaction "100 % humain"

Tout le texte du site doit passer le test du lecteur humain expérimenté. Les marqueurs "AI-generated" doivent être absents.

**À bannir absolument :**
- Tournures pompeuses : "il est important de noter", "dans le paysage actuel", "à l'heure où"
- Mots fourre-tout : "essentiel", "crucial", "indispensable", "primordial" en abus
- Listes à puces partout — préférer les paragraphes courts et concrets
- Em-dashes systématiques — préférer la virgule, le point, ou la parenthèse
- Phrases en miroir (X mais aussi Y, à la fois X et Y, non seulement X mais Y)
- "Délivrer", "challenge", "tapestry", "delve" et autres anglicismes pédants
- Conclusions en "En résumé" ou "Pour conclure"
- "N'hésitez pas à" (cliché)
- Adjectifs vagues empilés ("solution complète, performante et fiable")

**À privilégier :**
- Phrases courtes et directes (15-25 mots en moyenne)
- Variations de longueur (alternance courtes/longues, comme un humain qui parle)
- Détails concrets : prix exact, délai exact, nom de ville, marque précise
- Première personne du pluriel ("chez Mister Pellets, on installe...")
- Données chiffrées ancrées dans le réel
- Ton direct, parfois conversationnel ("vous vous demandez peut-être...")
- Références locales fréquentes (Fernelmont, Namur, Wallonie, hiver belge)
- Rythme et oralité (lire à haute voix : ça doit sonner naturel)
- Idées qui s'enchaînent par causalité, pas par juxtaposition

**Exemples concrets :**

❌ Mauvais (typique IA) :
> "Le poêle à pellets représente une solution de chauffage moderne et écologique qui s'inscrit pleinement dans la transition énergétique actuelle. Il offre une multitude d'avantages tant sur le plan économique qu'environnemental."

✅ Bon (humain) :
> "Un poêle à pellets divise votre facture de chauffage par deux par rapport au mazout, et émet 95 % de CO2 en moins. C'est aujourd'hui le mode de chauffage le plus rentable en Wallonie pour une maison de 100 à 200 m²."

### 6.2 Stratégie SEO

**Mots-clés prioritaires (à intégrer naturellement dans titles, H1, body) :**

- **Génériques transactionnels :** poêle à pellets Wallonie, poêle à pellets Belgique, achat poêle pellets, prix poêle pellets
- **Locaux :** poêle pellets {ville} (Namur, Charleroi, Liège, Wavre, Mons, Arlon, Tournai, Verviers, Gembloux, Dinant)
- **Marques :** Edilkamin Belgique, EK63 Wallonie, Dielle hydro, Ferlux pellets
- **Techniques :** poêle pellets canalisable, poêle pellets hydro, insert pellets, poêle pellets étanche, poêle pellets connecté
- **Aides :** primes pellets Wallonie 2026, prime SPW poêle pellets, aide chauffage pellets
- **Long tail :** quelle puissance poêle pellets pour 100m², meilleur poêle pellets pour grande maison, poêle pellets silencieux, poêle pellets remplacement chaudière mazout

**Structure title / meta-description par type de page :**

```
Page d'accueil :
Title : Poêle à pellets en Wallonie — Vente & pose | Mister Pellets
Meta : 61 modèles Edilkamin, EK63, Dielle, Ferlux. Pose en 1 jour, primes incluses, livraison gratuite 50km. Devis en 60 secondes.

Page produit :
Title : {Marque} {Modèle} — Poêle pellets {Puissance}kW | Mister Pellets
Meta : {Modèle} de {Marque} : {puissance}kW pour {surface}m², {USP principal}. Pose pro en Wallonie, garantie 5 ans, primes calculées.

Page marque :
Title : {Marque} en Belgique — Tous les modèles | Mister Pellets
Meta : Découvrez la gamme {Marque} en Wallonie : {N} modèles, {USP marque}. Conseil expert, pose en 1 jour, garantie 5 ans.

Page locale :
Title : Poêle à pellets à {Ville} — Vente & pose | Mister Pellets
Meta : Poêle à pellets à {Ville} : conseil, vente et pose en 1 jour. {N} modèles, primes Wallonie incluses, à {distance}km de Fernelmont.

Page guide :
Title : {Sujet du guide} — Le guide complet 2026 | Mister Pellets
Meta : Tout savoir sur {sujet} : {résumé clé}. Guide rédigé par les experts Mister Pellets, mis à jour {mois année}.
```

### 6.3 Stratégie GEO (Generative Engine Optimization)

Le GEO vise à optimiser le contenu pour les moteurs génératifs (ChatGPT, Perplexity, Claude, Gemini) qui répondent directement aux utilisateurs sans clic. Les règles diffèrent du SEO traditionnel.

**Principes GEO appliqués :**

1. **Réponses directes en début de section** : chaque H2 doit pouvoir être cité comme réponse autonome. La première phrase répond, le reste détaille.

2. **Données quantifiées et sourcées** : "1 500 €" est mieux que "des aides importantes". "À 23 km de Fernelmont" est mieux que "proche de notre zone".

3. **Citations d'experts internes** : insérer des phrases de type "Selon les techniciens Mister Pellets, ..." ou "D'après nos 400 installations en Wallonie, ...". Les LLM citent volontiers ces formulations.

4. **Tableaux comparatifs structurés** : les LLM les lisent et les restituent. Tableaux puissance/surface, marque/positionnement, type/usage.

5. **FAQ riches** sur chaque page : 5-10 questions concrètes par page, réponses de 50-150 mots. Format optimal pour les featured snippets ET les LLM.

6. **Structured data exhaustif** (voir section 9) : les LLM s'appuient sur les schemas pour comprendre le contexte.

7. **Maillage sémantique cohérent** : toujours lier les concepts entre eux (poêle pellets → primes → pose → marques → villes), pour que le LLM comprenne l'écosystème de la marque.

8. **Mention explicite de la marque + zone** dans chaque page : "Mister Pellets, installateur agréé en Wallonie depuis 2018" — pour que le LLM associe la marque à la requête locale.

9. **Pages "réponse"** dédiées aux questions fréquentes : `/quelle-puissance-poele-pellets/`, `/poele-pellets-ou-mazout/`, etc. Une question = une page = une réponse complète.

10. **E-E-A-T affiché** : Experience, Expertise, Authoritativeness, Trustworthiness. Bio des techniciens, certifications RGIE affichées, années d'expérience, photos d'installations réelles.

### 6.4 Maillage interne (règles systématiques)

À chaque page, appliquer :
- Toute mention d'une marque → lien vers `/nos-marques/{marque}/`
- Toute mention d'une ville → lien vers `/poeles-pellets-{ville}/`
- Toute mention de "primes" → lien vers `/primes-energie-wallonie-2026/`
- Toute mention de "devis" → lien vers `/demande-de-devis/`
- Toute mention d'un type technique (canalisable, hydro) → lien vers le guide correspondant
- Minimum 3 liens internes contextuels par page (hors menu/footer)

### 6.5 Plan éditorial blog (10 articles prioritaires Phase 1)

1. "Poêle à pellets ou poêle à bois : lequel choisir en 2026 ?"
2. "Comment dimensionner son poêle à pellets selon la surface"
3. "Poêle à pellets canalisable : le guide complet"
4. "Pellets ENplus A1 vs DINplus : que choisir ?"
5. "Entretien annuel d'un poêle à pellets : la check-list complète"
6. "Primes Wallonie 2026 : combien pouvez-vous récupérer ?"
7. "Remplacer sa chaudière mazout par un poêle hydro : étapes et coûts"
8. "Pourquoi mon poêle à pellets s'éteint tout seul ? 7 causes courantes"
9. "Poêle à pellets : air pulsé, convection ou rayonnement ?"
10. "Acheter son poêle à pellets en ligne : les 5 vérifications avant d'acheter"

Chaque article : 1 200 à 1 800 mots, ton humain, exemples concrets wallons, photos réelles, schemas Article + FAQPage, CTA contextualisé.

---

## 7. Pré-encodage de la boutique (61 produits)

### 7.1 Source des données

Les 61 produits sont actuellement sur le Wix existant (ancienne version mister-pellets.be). Workflow de pré-encodage :

1. **Export CSV** depuis Wix Stores (titre, description, prix, marque, attributs, images URLs)
2. **Script Node.js** d'import dans Payload CMS (transforme le CSV en records)
3. **Vérification manuelle** des données critiques (marque, GTIN, dimensions, classe énergétique)
4. **Enrichissement automatique** :
   - Génération des slugs SEO (`edilkamin-blade-9kw-air` plutôt que `prod-2847`)
   - Génération des meta-titles et meta-descriptions (template + variables)
   - Génération du Schema.org Product complet
   - Création des associations marque ↔ produit, catégorie ↔ produit

### 7.2 Schéma de données Product (Payload collection)

```typescript
{
  // Identifiants
  sku: string,                    // Référence interne unique
  slug: string,                   // URL : /produit/{slug}/
  
  // Identité produit
  name: string,                   // Nom commercial : "Edilkamin Blade 9kW"
  brand: relation('Brands'),      // Lien vers Edilkamin / EK63 / Dielle / Ferlux
  model: string,                  // "Blade"
  productType: select,            // air | canalisable | hydro | hybride | insert
  category: relation('Categories'),
  
  // Prix
  price: number,                  // Prix HTVA
  priceTTC: number,              // Calculé : price × 1.21
  installationPrice: number,      // Prix pose (TVA 6%)
  promoPrice: number?,            // Prix promo si applicable
  
  // Caractéristiques techniques
  power: number,                  // kW
  recommendedSurface: {
    min: number,                  // m²
    max: number
  },
  efficiency: number,             // % rendement
  energyClass: string,            // "A++" / "A+" / "A"
  emissions: number,              // mg/m³ CO
  
  // Attributs booléens
  isAirtight: boolean,            // Étanche
  isConnected: boolean,           // WiFi / Smart
  isCanalizable: boolean,
  isHydro: boolean,
  
  // Dimensions
  dimensions: {
    width: number,                // cm
    height: number,
    depth: number,
    weight: number                // kg
  },
  hopperCapacity: number,         // kg de pellets
  
  // Pour Google Merchant
  gtin: string?,                  // Code-barres EAN
  mpn: string,                    // Référence fabricant
  googleProductCategory: string,  // "Home & Garden > ... > Stoves"
  
  // Médias
  mainImage: relation('Media'),
  galleryImages: array(relation('Media')),
  
  // Contenu rédactionnel
  shortDescription: string,       // 1-2 lignes pour les cards
  description: richText,          // Description longue éditable
  features: array({              // Points forts
    title: string,
    description: string
  }),
  technicalSheet: relation('Media'),  // PDF fiche technique
  
  // SEO
  metaTitle: string,
  metaDescription: string,
  
  // Stock & disponibilité
  stock: number,
  stockStatus: select,            // in_stock | on_order | discontinued
  deliveryDelay: string,          // "48h" / "Sur commande - 4-6 sem."
  
  // Marketing
  isBestseller: boolean,
  isFeatured: boolean,
  isNew: boolean,
  
  // Relations
  relatedProducts: array(relation('Products')),
  faqItems: array(relation('FAQ')),
  
  // Système
  publishedAt: date,
  updatedAt: date
}
```

### 7.3 Pré-remplissage automatique

Pour chaque produit importé, Claude Code génère automatiquement :

**Slug** (sans accents, kebab-case) :
```
"Edilkamin Blade 9kW Air" → "edilkamin-blade-9kw-air"
```

**Meta-title** (template) :
```
{Marque} {Modèle} — Poêle pellets {puissance}kW {Type} | Mister Pellets
```

**Meta-description** (template humain) :
```
{Modèle} de {Marque}, poêle à pellets {puissance}kW pour {surface min}-{surface max}m². 
{USP principal de la marque}. Pose en Wallonie en 1 jour, primes incluses, livraison gratuite 50km autour de Fernelmont.
```

**Description courte** (template humain enrichi) :
```
Le {Modèle} de {Marque} chauffe efficacement {surface}m² avec {puissance}kW. 
{1 phrase USP technique}. {1 phrase usage typique}.
```

**Description longue** (markdown structuré, à enrichir manuellement ensuite) :
```markdown
## Le {Modèle} en bref

{Paragraphe 1 : qui c'est, à qui ça s'adresse}

## Pourquoi le choisir

- **{Argument 1}** — {explication concrète}
- **{Argument 2}** — {explication concrète}
- **{Argument 3}** — {explication concrète}

## Caractéristiques principales

{tableau auto-généré depuis les specs}

## Installation et mise en route

Mister Pellets installe le {Modèle} chez vous en une journée. {Spécificité installation : conduit existant, étanche, etc.}.
La mise en route et la formation utilisateur sont incluses.

## Garantie

5 ans pièces et main d'œuvre, prolongée par notre service entretien annuel.
```

**Features (3 points forts auto-générés depuis les attributs) :**
```
Si isHydro: { title: "Hydro intégré", description: "Connectable au circuit de chauffage central pour remplacer une chaudière." }
Si isCanalizable: { title: "Canalisable jusqu'à 8m", description: "Diffuse la chaleur dans plusieurs pièces via un réseau de gaines." }
Si isAirtight: { title: "Étanche RT2012", description: "Compatible avec les maisons basse consommation et les VMC double-flux." }
Si isConnected: { title: "Pilotage smartphone", description: "Application iOS/Android pour démarrer, programmer et surveiller." }
Si efficiency > 92: { title: "Haut rendement", description: "{efficiency}% de rendement, classe {energyClass}, émissions ultra-basses." }
```

**Schema Product (auto-injecté) :**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Edilkamin Blade 9kW",
  "image": ["https://mister-pellets.be/...", "..."],
  "description": "...",
  "sku": "EDIL-BLADE-9",
  "mpn": "EDIL-BLADE-9-AIR",
  "gtin13": "8033000000000",
  "brand": { "@type": "Brand", "name": "Edilkamin" },
  "category": "Home & Garden > Household Appliances > Heating > Pellet Stoves",
  "offers": {
    "@type": "Offer",
    "url": "https://mister-pellets.be/produit/edilkamin-blade-9kw-air/",
    "priceCurrency": "EUR",
    "price": "2890",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "Organization", "name": "Mister Pellets" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "200"
  }
}
```

### 7.4 Configuration Google Merchant Center

Dès la mise en ligne, le flux XML de produits est exposé à `/api/merchant-feed.xml`.

Champs livrés dans le flux pour chaque produit :
```
id, title, description, link, image_link, additional_image_link (×4),
availability, price, sale_price (si promo), brand, gtin (si dispo) ou mpn,
condition (new), google_product_category (Stoves & Ovens), 
product_type (custom : "Poêles à pellets > {Type} > {puissance}kW"),
shipping (Belgique : 0€ si <50km, sinon tarif), 
identifier_exists (yes/no selon GTIN), 
energy_efficiency_class, min_energy_efficiency_class, max_energy_efficiency_class
```

Mise à jour automatique du flux à chaque modification produit dans l'admin Payload (webhook + revalidation Next.js).

### 7.5 Ce qu'il restera au client après pré-encodage

Pour chaque produit, dans l'admin Payload :
1. **Uploader les photos** (1 principale + 3-5 galerie)
2. **Relire et personnaliser la description** (les templates donnent une base, mais une touche humaine sur chaque produit fait la différence)
3. **Vérifier le prix et le stock**
4. **Activer le produit** (`publishedAt` non null)

Estimation : 5-10 minutes par produit pour le client = ~5-10 heures pour les 61 produits, étalable.

### 7.6 Catégories à créer dans Payload

```
Par marque :
- Edilkamin
- EK63
- Dielle
- Ferlux

Par type :
- Poêles à pellets air
- Poêles à pellets canalisables
- Poêles à pellets hydro
- Poêles à pellets hybrides
- Inserts à pellets

Par usage :
- Maisons basse consommation
- Remplacement chaudière mazout
- Maisons anciennes
- Appartements

Par puissance :
- Compacts (6-9 kW)
- Standards (9-12 kW)
- Puissants (12-18 kW)
- Hydros (18-30 kW)
```

Un produit peut appartenir à plusieurs catégories (relation many-to-many).

---

## 8. Configuration Payload CMS

### 8.1 Collections à créer

**Products** (61 entrées pré-encodées) — voir section 7.2

**Brands** (4 entrées)
```typescript
{
  name: string,
  slug: string,
  logo: relation('Media'),
  country: string,
  foundedYear: number,
  positioning: string,           // "Premium", "Budget", etc.
  shortDescription: string,
  longDescription: richText,
  technicalSpecialties: array,   // Tags techniques
  warranty: string,
  metaTitle: string,
  metaDescription: string
}
```

**Categories** (arborescence) — pour le filtrage boutique

**Cities** (10+ entrées pour les pages locales)
```typescript
{
  name: string,                  // "Namur"
  slug: string,                  // "namur"
  province: string,              // "Namur"
  postalCodes: array(string),    // ["5000", "5001", "5002", ...]
  distanceFromFernelmont: number, // km
  population: number,
  introText: richText,           // 100% humain, spécifique à la ville
  localTestimonial: string?,     // Témoignage client local
  recommendedProducts: array(relation('Products')), // 3-4 modèles
  localPrimes: richText,         // Primes communales si applicable
  localFAQ: array({question, answer}),
  metaTitle: string,
  metaDescription: string
}
```

**Articles** (blog)
```typescript
{
  title: string,
  slug: string,
  excerpt: string,
  content: richText,
  coverImage: relation('Media'),
  author: relation('Users'),
  category: select,              // Guides, Actualités, Astuces, Comparatifs
  tags: array(string),
  publishedAt: date,
  metaTitle: string,
  metaDescription: string,
  faqItems: array({question, answer}),
  relatedArticles: array(relation('Articles'))
}
```

**Pages** (pages éditoriales : guides, primes, services)
```typescript
{
  title: string,
  slug: string,
  pageBuilder: blocks([           // Système de blocs flexibles
    HeroBlock,
    TextBlock,
    StatsBlock,
    CTABlock,
    FAQBlock,
    TestimonialsBlock,
    TableBlock,
    ImageBlock,
    BrandsBlock,
    ProductsCarouselBlock
  ]),
  metaTitle: string,
  metaDescription: string
}
```

**Testimonials**
```typescript
{
  customerName: string,
  city: string,
  rating: number,                // 1-5
  quote: string,
  date: date,
  productConcerned: relation('Products')?,
  brandConcerned: relation('Brands')?,
  isHighlighted: boolean
}
```

**FAQ** (questions globales et liées)
```typescript
{
  question: string,
  answer: richText,
  category: select,              // Général, Primes, Installation, Entretien, Marques
  brandRelated: relation('Brands')?,
  productRelated: relation('Products')?,
  order: number
}
```

**Quotes** (devis reçus)
```typescript
{
  surfaceRange: select,
  pebClass: select,
  hasChimney: boolean,
  chimneyDiameter: number?,
  style: select,
  budgetRange: select,
  postalCode: string,
  city: string?,
  delay: select,
  contactName: string,
  contactPhone: string,
  contactEmail: string,
  message: text?,
  status: select,                // new, contacted, quoted, won, lost
  notes: richText?,
  createdAt: date
}
```

**Orders** (commandes boutique)
```typescript
{
  orderNumber: string,
  customer: { name, email, phone, address },
  items: array({
    product: relation('Products'),
    quantity: number,
    priceAtPurchase: number
  }),
  subtotal: number,
  vat: number,
  shipping: number,
  total: number,
  paymentStatus: select,         // pending, paid, refunded
  fulfillmentStatus: select,     // new, processing, shipped, delivered
  stripePaymentIntentId: string,
  createdAt: date
}
```

**Media** (gestion centralisée des images/PDFs)
- Upload via Payload, stockage S3-compatible (Cellar OVH ou Combell Object Storage)
- Génération automatique des variantes : thumbnail (200px), card (400px), display (800px), full (1600px)
- Format WebP automatique pour le web

**Users** (admins du panneau)
- Rôles : admin (tout), editor (contenu uniquement), viewer (lecture seule)

### 8.2 Globals (paramètres uniques)

- **SiteSettings** : nom du site, baseUrl, logos, contact, horaires, réseaux sociaux
- **Header** : items de menu (édifiables sans toucher au code)
- **Footer** : 4 colonnes éditables
- **HomePage** : configuration de la page d'accueil par blocs
- **EmailTemplates** : templates email pour devis, confirmation commande, etc.

### 8.3 Permissions

- `/admin` accessible uniquement aux users authentifiés
- Public peut lire les collections Products, Brands, Cities, Articles, Pages, Testimonials, FAQ
- Public peut créer Quotes (via API publique avec rate limiting)
- Public peut créer Orders (via Stripe checkout)
- Reste : authentification requise

### 8.4 Workflow de publication

- Brouillon par défaut sur Articles, Pages, Products
- Bouton "Prévisualiser" qui ouvre le rendu Next.js en mode draft
- "Publier" rend public + déclenche revalidation ISR
- Historique des versions sur tous les contenus éditoriaux

---

## 9. SEO technique

### 9.1 Schemas Schema.org à implémenter

**Sur toutes les pages :**
- `Organization` (en global, dans layout racine) avec logo, contact, sameAs (Google Business, Facebook)
- `WebSite` avec `SearchAction` pointant vers `/recherche?q={search_term}`
- `BreadcrumbList` (sur toutes les pages sauf accueil)

**Page d'accueil :**
- `LocalBusiness` (sous-type `HomeAndConstructionBusiness`)
  ```json
  {
    "@type": "HomeAndConstructionBusiness",
    "name": "Mister Pellets",
    "image": "...",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rue des Fagotis 3A",
      "postalCode": "5380",
      "addressLocality": "Fernelmont",
      "addressCountry": "BE"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 50.5500, "longitude": 5.0167 },
    "url": "https://mister-pellets.be",
    "telephone": "+32472043222",
    "openingHoursSpecification": [...],
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Wallonie" }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200"
    }
  }
  ```

**Pages produits :**
- `Product` complet avec offers, aggregateRating, brand (voir 7.3)
- Si avis spécifiques : `Review` individuels

**Pages locales :**
- `LocalBusiness` ciblé avec `areaServed` = ville
- `Service` pour "Installation poêle pellets {Ville}"

**Pages FAQ :**
- `FAQPage` avec `mainEntity` array de Question/Answer

**Articles blog :**
- `Article` ou `BlogPosting` avec `author`, `datePublished`, `image`, `headline`

**Pages services (Installation, Entretien, Livraison) :**
- `Service` avec `provider`, `areaServed`, `offers`

### 9.2 Sitemap

`app/sitemap.ts` génère automatiquement :
- Toutes les pages statiques (priorité 0.8)
- Toutes les pages produits depuis Payload (priorité 0.7)
- Toutes les pages marques (priorité 0.7)
- Toutes les pages villes (priorité 0.6)
- Tous les guides (priorité 0.6)
- Tous les articles blog (priorité 0.5)
- `lastmod` mis à jour automatiquement depuis `updatedAt` Payload

Soumis à Google Search Console + Bing Webmaster + IndexNow.

### 9.3 robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /panier/
Disallow: /checkout/

Sitemap: https://mister-pellets.be/sitemap.xml
```

### 9.4 Redirections 301

Audit complet des URLs de l'ancien WordPress + ancien Wix à rediriger.

Fichier `redirects.ts` dans `next.config.js` ou table dans Payload (édition non-tech).

Cas connus :
- `/edilkamin/` → `/nos-marques/edilkamin/`
- `/produit/{slug}/` (Wix) → `/produit/{slug}/` (slug renormalisé si différent)
- Anciennes URLs de blog WP → nouvelles URLs Next.js
- Vérifier dans Search Console qu'aucune URL indexée ne se retrouve en 404

### 9.5 Performance — objectifs Core Web Vitals

- **LCP** (Largest Contentful Paint) < 1.5s sur 4G mobile (Lighthouse score 95+)
- **CLS** (Cumulative Layout Shift) < 0.05
- **INP** (Interaction to Next Paint) < 200ms
- **Bundle JS** initial < 100 KB gzipped
- **Images** : WebP/AVIF auto via next/image, lazy loading par défaut
- **Polices** : `display: swap`, sous-ensembles latin uniquement
- **CSS critique** inliné, reste différé
- **ISR** (Incremental Static Regeneration) sur toutes les pages dynamiques (revalidate 60s)

### 9.6 Analytics & monitoring

- **Google Analytics 4** (consent mode v2)
- **Google Search Console** + **Bing Webmaster**
- **Microsoft Clarity** (heatmaps + recordings, gratuit)
- **Sentry** pour le monitoring d'erreurs (plan gratuit)
- **Bandeau cookies RGPD-compliant** (consentement granulaire FR/EN)

---

## 10. Hébergement & déploiement

### 10.1 Production : Combell

**Plan recommandé : Combell Web Cloud Pro**
- VPS avec accès root
- Node.js 20+ supporté
- PostgreSQL managé en option
- Datacenter Bruxelles (latence < 10ms partout en Belgique)
- SSL Let's Encrypt automatique
- Backups quotidiens inclus
- Support FR/NL

**Alternative : Combell Linux VPS** (plus de contrôle, légèrement moins cher)

**Configuration serveur :**
- Nginx en reverse proxy devant Next.js (port 3000)
- PM2 ou systemd pour la gestion du process Node
- PostgreSQL local ou managé
- Stockage objets pour les médias (Cellar OVH compatible S3, ou Combell Object Storage)
- Cron pour la regen sitemap, le cleanup, les sauvegardes app

### 10.2 Preview : Vercel

**Plan Hobby (gratuit) :**
- Déploiement automatique à chaque push Git
- URL de preview unique par branche
- Environnements `preview` et `production`
- Edge functions, ISR, image optimization inclus
- Suffisant pour la phase de construction et les tests visuels

**Limitation à noter :** Vercel Hobby est gratuit pour usage non-commercial. Pour la prod, on utilise Combell. Vercel reste sur les branches de preview uniquement (zone grise tolérée tant que la prod n'est pas chez eux).

### 10.3 Workflow Git

```
main           → branche prod, déploie sur Combell
develop        → branche staging, déploie sur Vercel preview
feature/*      → branches feature, preview Vercel auto
```

Workflow type :
1. Claude Code travaille sur `feature/page-accueil`
2. Push → Vercel génère `https://mister-pellets-page-accueil-xxx.vercel.app`
3. Le client valide visuellement
4. Merge dans `develop` → preview staging globale
5. Validation finale → merge dans `main` → déploiement Combell

### 10.4 Variables d'environnement

```
# Base
NEXT_PUBLIC_SITE_URL=https://mister-pellets.be
PAYLOAD_SECRET=<générée>
DATABASE_URI=postgres://...

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=info@awlest.com
EMAIL_TO_QUOTES=info@awlest.com

# Storage
S3_ENDPOINT=
S3_BUCKET=mister-pellets-media
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=
```

### 10.5 Domaine & DNS

- Domaine `mister-pellets.be` (déjà possédé)
- DNS chez OVH ou Combell (prendre Combell pour simplifier)
- Sous-domaines :
  - `mister-pellets.be` → site principal
  - `www.mister-pellets.be` → 301 vers domaine apex
  - `staging.mister-pellets.be` → optionnel, environnement de staging

### 10.6 Sauvegardes

- **Base de données** : backup quotidien Combell + dump hebdomadaire vers Cellar OVH (rétention 90 jours)
- **Médias** : versioning S3 activé
- **Code** : Git (GitHub privé)
- **Test de restauration** trimestriel

---

## 11. Workflow de prévisualisation

### 11.1 Phases de preview

**Phase A — Preview de base (semaine 1)**
- Site déployé sur Vercel
- Accueil + 1 page produit + 1 page marque + boutique
- URL temporaire `mister-pellets-preview.vercel.app`
- Le client valide visuellement la direction

**Phase B — Preview enrichie (semaines 2-3)**
- Toutes les pages publiques en place
- Admin Payload accessible
- Le client teste l'ajout d'un produit, d'un article
- Itérations sur design et UX

**Phase C — Preview pré-prod (semaine 4)**
- 61 produits importés
- Tous les schemas SEO en place
- Tests Lighthouse, PageSpeed, validateurs Schema.org
- Tests parcours achat avec Stripe en mode test

**Phase D — Bascule prod (jour J)**
- Déploiement sur Combell
- Tests post-déploiement sur le vrai domaine staging
- Bascule DNS de `mister-pellets.be` → IP Combell
- Surveillance Search Console + Analytics les 14 jours suivants

### 11.2 Mot de passe sur la preview

Pendant les phases A-B-C, la preview est protégée par mot de passe Vercel pour éviter que Google n'indexe le site preview avant la mise en ligne définitive.

### 11.3 Pas de bascule en pic saisonnier

Éviter septembre, octobre, novembre (pic du chauffage). Idéalement bascule en juin-juillet ou janvier-février.

---

## 12. Phases de build & timeline

### Phase 1 — Setup & infra (1 jour)
- Init repo Next.js + Payload
- Config Tailwind, fonts, Tailwind tokens
- Connexion PostgreSQL local + déploiement Vercel preview
- Configuration des collections Payload de base

### Phase 2 — Design system & composants (2 jours)
- Tous les composants UI primitives (shadcn customisés aux couleurs Mister Pellets)
- Header, Footer, NavbarSticky
- Composants sections (Hero, FAQ, Testimonials, etc.)
- Storybook ou page `/styleguide` pour visualiser tous les composants

### Phase 3 — Pages principales (3 jours)
1. Accueil (priorité absolue, charte de référence)
2. Boutique (catalogue + filtres)
3. Page produit (template dynamique)
4. Pages marques (4)
5. Page Primes 2026
6. Page Devis (formulaire 6 étapes)
7. Page Contact + RDV

### Phase 4 — Pages locales et guides (2 jours)
- Template page-ville dynamique alimenté par Payload Cities
- Génération des 10 pages villes avec contenu humain
- 5 guides initiaux (canalisable, hydro, puissance, primes, entretien)
- Page hub `/zones-d-intervention/`

### Phase 5 — Boutique & paiement (2 jours)
- Import des 61 produits (script Node + données Wix)
- Pré-encodage automatique (slug, meta, schema)
- Système de panier (state global + persistance localStorage)
- Checkout Stripe (Bancontact + cartes)
- Pages confirmation + emails transactionnels

### Phase 6 — SEO & performance (1 jour)
- Tous les schemas Schema.org
- Sitemap dynamique
- robots.txt, redirections 301
- Optimisations Core Web Vitals
- Tests Lighthouse 95+ sur toutes les pages

### Phase 7 — Blog & contenu éditorial (1 jour)
- Système de blog complet
- 3-5 articles initiaux (rédaction humaine)
- Templates email transactionnels
- Bandeau cookies RGPD

### Phase 8 — Google Merchant + Analytics (1/2 jour)
- Flux XML produits exposé
- Connexion Google Merchant Center
- GA4 + Search Console + Clarity
- Sentry monitoring

### Phase 9 — Recette & bascule (1 jour)
- Tests complets desktop + mobile + tablet (BrowserStack)
- Tests formulaires (devis, contact, achat boutique)
- Vérification redirections 301
- Bascule DNS → Combell
- Resoumission sitemap dans GSC

**Total estimé : 14 jours-homme** sur un cycle de 3-4 semaines réelles avec validations entre chaque phase.

---

## 13. Checklist qualité avant production

### 13.1 Visuel

- [ ] Logo s'affiche correctement à toutes les tailles
- [ ] Palette respectée (60 % beige / 30 % vert / 10 % orange)
- [ ] Polices Fraunces + Inter Tight chargées sans FOIT
- [ ] Navbar sticky bottom visible et fonctionnelle sur mobile
- [ ] Animations subtiles, jamais agressives
- [ ] Aucune image non optimisée (toutes en WebP)

### 13.2 Contenu

- [ ] Toutes les pages ont un title et une meta-description uniques
- [ ] Tous les textes passent le test du "lecteur humain"
- [ ] Aucune mention parasite d'Awlest hors mentions légales
- [ ] Coordonnées correctes partout (0472 04 32 22, info@awlest.com)
- [ ] Adresse Fernelmont correcte
- [ ] Note Google 4.9★ / 200 avis affichée
- [ ] Liens internes cohérents (3+ par page minimum)
- [ ] Aucune faute d'orthographe (relecture humaine obligatoire)

### 13.3 SEO

- [ ] Sitemap.xml accessible et soumis
- [ ] Tous les schemas Schema.org valides (testeur Google)
- [ ] Open Graph + Twitter cards sur toutes les pages
- [ ] Canonical URLs configurées
- [ ] Pas d'URLs en double (paramètres de tri, filtres normalisés)
- [ ] hreflang `fr-BE` configuré
- [ ] Pas de Disallow accidentel sur des pages importantes

### 13.4 Performance

- [ ] Lighthouse mobile : 95+ Performance / 95+ SEO / 100 Accessibility / 95+ Best Practices
- [ ] LCP < 1.5s sur 4G
- [ ] Aucune erreur console
- [ ] Aucune ressource bloquante sur le critical path

### 13.5 Boutique

- [ ] Stripe en mode production avec vraies clés
- [ ] TVA correctement calculée (21 % vs 6 % pose)
- [ ] Email de confirmation commande envoyé
- [ ] Email notification interne (info@awlest.com)
- [ ] Stocks décrémentés à la commande
- [ ] Flux Google Merchant validé sans erreur

### 13.6 RGPD & légal

- [ ] Bandeau cookies fonctionnel (consentement granulaire)
- [ ] Pas de tracking avant consentement
- [ ] Mentions légales complètes (Awlest SRL, TVA, adresse)
- [ ] CGV en ligne et acceptation au checkout
- [ ] Politique de confidentialité conforme RGPD
- [ ] Politique cookies détaillée
- [ ] Formulaires : opt-in clair, pas d'opt-in pré-coché

### 13.7 Accessibilité

- [ ] Contraste texte/fond ≥ 4.5:1 partout
- [ ] Tous les boutons et liens accessibles au clavier
- [ ] Tous les formulaires labellisés correctement
- [ ] Tous les images ont un alt pertinent
- [ ] aria-labels sur les icônes seules
- [ ] Skip-to-content link en début de page

---

## 14. Ce qui est attendu de Claude Code

Claude Code reçoit ce document et exécute la construction complète, avec autonomie sur les choix d'implémentation tant qu'ils respectent ce brief. Décisions à prendre par Claude Code librement :

- Structure exacte des fichiers et noms (tant que cohérent)
- Choix exact des librairies (utilitaires, helpers)
- Patterns React (hooks custom, contexts, server components vs client components)
- Style exact des animations (tant que sobre)
- Gestion d'état (Zustand, Context API, ou autre)
- Détails d'implémentation des formulaires (React Hook Form recommandé)

Décisions à valider avec le client (ne pas trancher seul) :
- Toute modification de la palette ou des polices
- Tout ajout de section non listée dans ce brief
- Toute suppression de fonctionnalité listée
- Choix de la version exacte de Combell (Web Cloud Pro vs VPS)
- Politique de remboursement exacte (CGV)

Livrables attendus à chaque phase :
- Code committé avec messages clairs
- README à jour avec instructions de dev local
- Captures d'écran ou screen recording de la fonctionnalité livrée
- URL de preview Vercel à jour

---

## Annexes

### A1. Coordonnées & infos légales

- **Nom commercial** : Mister Pellets
- **Société** : Awlest SRL
- **TVA** : BE 0656.514.212
- **Adresse** : Rue des Fagotis 3A, 5380 Fernelmont
- **Téléphone** : 0472 04 32 22
- **Email** : info@awlest.com
- **Avis Google** : 4.9★ / 200 avis (g.page/r/mister-pellets)
- **Site actuel à remplacer** : mister-pellets.be (Wix avec 61 produits — source des données)

### A2. Zone géographique

Provinces couvertes : Namur, Liège, Hainaut (Charleroi, Mons, Tournai), Brabant wallon (Wavre, Gembloux), Luxembourg (Arlon).

10 villes pour pages locales : Namur, Charleroi, Liège, Wavre, Mons, Arlon, Tournai, Verviers, Gembloux, Dinant.

Livraison gratuite : 50 km autour de Fernelmont (Namur, Liège, Huy, Andenne et environs).

### A3. Marques distribuées

| Marque | Pays | Année | Positionnement | USP |
|---|---|---|---|---|
| Edilkamin | Italie | 1963 | Premium | Durabilité 15-20 ans, technologie Leonardo® de combustion intelligente |
| EK63 | Italie | 2010 | Connecté | Smart Fire WiFi, rapport qualité/prix imbattable |
| Dielle | Italie | 1989 | Hydro | 100 % hydro, remplacement chaudière mazout |
| Ferlux | Espagne | 1995 | Budget | Mécanique simple, fiable, accessible |

### A4. Primes Wallonie 2026

- 1 500 € (revenus modestes)
- 750 € (revenus moyens)
- 375 € (revenus supérieurs)
- +250 € bonus PEB F-G

Conditions techniques : poêle pellets ≥ 87 % de rendement, émissions CO ≤ 250 mg/m³, certification écodesign 2022.

### A5. Comptes & accès à fournir au démarrage

Pour démarrer la construction, le client doit fournir :
1. Accès au compte Wix actuel (export CSV des 61 produits)
2. Accès aux logos SVG (déjà dans le projet Claude)
3. Accès au compte Google Business Profile (pour les avis)
4. Création ou accès Google Search Console + Google Merchant Center
5. Compte Stripe activé (mode prod)
6. Compte Combell créé
7. Compte Resend pour l'email transactionnel (ou SMTP Combell)
8. Domaine `mister-pellets.be` en gestion

### A6. Glossaire technique

- **ISR** : Incremental Static Regeneration. Pages statiques mais régénérées à intervalle régulier ou à la demande.
- **SSG** : Static Site Generation. Pages générées au build, ultra-rapides.
- **SSR** : Server-Side Rendering. Pages générées à chaque requête.
- **Edge** : Code exécuté au plus près de l'utilisateur (CDN).
- **GEO** : Generative Engine Optimization. SEO pour les LLM.
- **Schema.org** : Vocabulaire de balises structurées pour aider les moteurs à comprendre le contenu.
- **Core Web Vitals** : Métriques Google de performance (LCP, INP, CLS).
- **Payload CMS** : CMS open-source code-first basé sur Node.js et React.
- **TypeScript strict** : Typage fort, zéro `any` toléré.

---

**Fin du brief.**

*Document à valider intégralement avant lancement de la construction. Toute modification ultérieure doit être tracée et versionnée.*

*Version 1.0 — Mai 2026.*
