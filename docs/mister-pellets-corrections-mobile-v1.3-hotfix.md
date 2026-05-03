# Mister Pellets — HOTFIX V1.3 Mobile

> **Document de réparation destiné à Claude Code.**
> Suite directe des hotfixes V1.1 et V1.2. Six nouveaux points de correction à traiter.
> Workflow et règles de protection identiques aux hotfixes précédents (commits isolés, validation visuelle entre chaque commit, `/humanizer` sur tout texte rédactionnel, `/impeccable` sur la présentation, `grep '—'` zéro em-dash avant chaque commit).
> Date : mai 2026.

---

## 0. Résumé des 6 points à traiter

| # | Point | Sévérité |
|---|---|---|
| P1 | Footer : contraste insuffisant texte/icônes + nettoyage du contenu (logo + sociaux + mentions légales uniquement) | 🔴 BLOQUANTE |
| P2 | Page FAQ : enrichissement complet (toutes les FAQ du site + extension SEO/GEO) | 🟠 Haute |
| P3+P4 | Boutique : refonte taxonomie filtres (Type / Diffusion / Couleur regroupée) | 🟠 Haute |
| P5 | Pages guides : audit complet débordements + correction bouton page Primes | 🔴 BLOQUANTE |
| P6 | Page À propos : correction +800 installations, suppression avis Google, refonte textes humains | 🔴 BLOQUANTE |
| P7 | Page d'accueil : doubler taille du logo central, espacement vertical 35 px max | 🟠 Haute |

**Workflow imposé — 6 commits isolés** :
1. `fix: improve footer contrast and minimize content` (P1)
2. `feat: enrich FAQ page with all site FAQs + SEO/GEO optimization` (P2)
3. `fix: refactor shop filter taxonomy (Type / Diffusion / Color grouping)` (P3+P4)
4. `fix: audit guide pages for mobile overflow + fix button overflow on Primes page` (P5)
5. `fix: rectify About page (800 installations, remove Google reviews mentions, humanize text)` (P6)
6. `fix: double homepage central logo size with tight vertical spacing` (P7)

Validation visuelle exigée entre chaque commit (capture avant/après + URL preview Vercel).

---

## P1. Footer : contraste insuffisant + nettoyage strict du contenu

### P1.1 Constat

Suite au hotfix V1.2, le footer mobile a la bonne taille (compact). Mais :

1. **Bug de contraste** : à côté de certains logos/icônes, soit il n'y a pas de texte, soit le texte est de la **même couleur que le fond** (donc invisible)
2. **Liens sociaux** (TikTok, Instagram, YouTube) : **trop discrets** visuellement, pas assez visibles
3. **Le contenu actuel inclut des éléments non strictement nécessaires** — à nettoyer

### P1.2 Action — contraste renforcé

**Règle absolue** : tout texte et toute icône du footer doit ressortir avec un contraste **WCAG AA minimum (ratio 4.5:1)**, idéalement **AAA (7:1)** pour les liens sociaux qui sont actuellement trop discrets.

**Couleurs corrigées** :

| Élément | Couleur fond | Couleur élément | Ratio |
|---|---|---|---|
| Fond footer | Vert deep `#174724` | — | — |
| Logo Mister Pellets (couleur) | — | Couleurs propres du logo (orange flame + vert deep + beige) | Logo en couleurs naturelles |
| Texte des mentions légales (liens) | `#174724` | **Beige `#FAF7F0`** (pleine opacité, **PAS d'opacity 80%**) | 11.8:1 ✅ |
| Séparateurs "·" | `#174724` | Beige `#FAF7F0` opacité 60% | 7.1:1 ✅ |
| Icônes réseaux sociaux | `#174724` | **Beige `#FAF7F0`** (pleine opacité) | 11.8:1 ✅ |
| Hover icônes/liens | `#174724` | **Orange flame `#F28A20`** | 4.6:1 ✅ |
| Texte légal en bas (Awlest, copyright) | `#174724` | Beige `#FAF7F0` opacité 75% (au lieu de 60%) | 8.8:1 ✅ |

**Vérification automatique** :
- Outil : extension Chrome **WAVE** ou **axe DevTools**
- Cible : 0 erreur de contraste sur le footer
- Tester en conditions réelles (luminosité écran modérée, pas en mode sombre forcé)

### P1.3 Action — contenu strict du footer minimaliste

**Annule et remplace** la spécification du V1.2 sur le contenu du footer.

**Nouveau contenu autorisé — UNIQUEMENT** :

```
┌─────────────────────────────────────┐
│ [LOGO MISTER PELLETS COULEUR]       │  ← centré, taille 60-70 px de hauteur
│                                     │
│ ─── Suivez-nous ───                 │  ← (optionnel) titre simple
│                                     │
│ [TikTok] [Instagram] [YouTube]      │  ← 3 icônes, beige pleine opacité
│                                     │
│ Mentions légales · CGV · Confiden-  │  ← liens bien visibles
│ tialité · Cookies                   │
│                                     │
│ Awlest SRL · TVA BE 0656.514.212    │  ← petit, mais lisible
│ © 2026 Mister Pellets               │
└─────────────────────────────────────┘
```

### P1.4 Éléments retirés du footer

❌ **Téléphone** (0472 04 32 22) — déjà accessible via la page Contact et la navbar
❌ **Email** (info@awlest.com) — idem
❌ **Adresse** (Rue des Fagotis 3A, Fernelmont) — idem
❌ **Tagline** descriptive
❌ **Liens de navigation** (Boutique, Marques, etc.) — déjà dans la navbar flottante
❌ **Tout autre élément non listé** ci-dessus

**Justification du retrait des coordonnées** : la navbar flottante donne accès à la page Contact en 1 clic. Le footer doit rester un strict minimum légal + identité + sociaux. Pas de doublons.

### P1.5 Pseudo-structure recommandée (mise à jour V1.3)

```tsx
<footer className="bg-[#174724] text-[#FAF7F0] w-full max-w-[100vw] overflow-x-clip">
  <div className="px-4 pt-8 pb-[calc(96px+env(safe-area-inset-bottom))] flex flex-col items-center text-center gap-6">
    
    {/* Logo */}
    <Image 
      src="/logo-mister-pellets-couleur.svg" 
      alt="Mister Pellets" 
      width={180} 
      height={64}
    />
    
    {/* Réseaux sociaux — BIEN VISIBLES */}
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-wider text-[#FAF7F0]/75">Suivez-nous</p>
      <div className="flex items-center gap-6">
        <a 
          href="#tiktok" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Mister Pellets sur TikTok" 
          className="text-[#FAF7F0] hover:text-[#F28A20] transition-colors"
        >
          <TikTokIcon size={32} />
        </a>
        <a 
          href="#instagram" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Mister Pellets sur Instagram" 
          className="text-[#FAF7F0] hover:text-[#F28A20] transition-colors"
        >
          <Instagram size={32} />
        </a>
        <a 
          href="#youtube" 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Mister Pellets sur YouTube" 
          className="text-[#FAF7F0] hover:text-[#F28A20] transition-colors"
        >
          <Youtube size={32} />
        </a>
      </div>
    </div>
    
    {/* Liens légaux — pleine opacité pour la lisibilité */}
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-[#FAF7F0] pt-4 border-t border-[#FAF7F0]/25 w-full">
      <Link href="/mentions-legales/" className="hover:text-[#F28A20] transition-colors">Mentions légales</Link>
      <span className="text-[#FAF7F0]/60">·</span>
      <Link href="/cgv/" className="hover:text-[#F28A20] transition-colors">CGV</Link>
      <span className="text-[#FAF7F0]/60">·</span>
      <Link href="/politique-confidentialite/" className="hover:text-[#F28A20] transition-colors">Confidentialité</Link>
      <span className="text-[#FAF7F0]/60">·</span>
      <Link href="/politique-cookies/" className="hover:text-[#F28A20] transition-colors">Cookies</Link>
    </div>
    
    {/* Copyright */}
    <div className="text-xs text-[#FAF7F0]/75 leading-relaxed">
      <p>Awlest SRL · TVA BE 0656.514.212</p>
      <p>© 2026 Mister Pellets</p>
    </div>
    
  </div>
</footer>
```

### P1.6 Tests obligatoires

- [ ] Tout le contenu lisible sans plisser les yeux
- [ ] Les 3 icônes sociales ressortent clairement (vérifier sur écran luminosité 50%)
- [ ] Aucun texte invisible
- [ ] Aucune icône avec contour invisible
- [ ] Liens légaux clairement cliquables et visibles
- [ ] Test WAVE / axe : 0 erreur de contraste

---

## P2. Page FAQ : enrichissement complet

### P2.1 Constat

La page FAQ actuelle est trop légère. Elle doit devenir **la page de référence** du site pour les questions clients, avec un fort impact SEO + GEO.

### P2.2 Action — structure et contenu

**À conserver** :
- ✅ La partie **"Contact"** actuelle de la page FAQ (formulaire ou bloc CTA vers la page Contact)

**À ajouter** :
1. **100 % des FAQ déjà rédigées sur le site** (compilation complète)
2. **Nouvelles questions** complémentaires pour étoffer (cible : 40-60 questions, idéalement 60+)

### P2.3 Sources des questions à compiler

Récupérer toutes les FAQ existantes depuis Payload CMS :
- FAQ des **pages produits** (questions liées à chaque modèle)
- FAQ des **pages marques** (questions par marque : Edilkamin, EK63, Dielle, Ferlux)
- FAQ des **pages villes** (questions locales : zone de service, distance, primes communales)
- FAQ de la **page Primes 2026**
- FAQ de la **page Devis**
- FAQ de la **page Prendre rendez-vous** (services, showroom, entretien, dépannage, ramonage)
- FAQ générales déjà sur la page FAQ actuelle

### P2.4 Catégorisation recommandée

Pour qu'une FAQ de 60+ questions reste navigable sur mobile, structurer par **catégories thématiques**, avec un **filtre/onglets en haut** :

| Catégorie | Volume cible | Contenu type |
|---|---|---|
| **Général** | 5-8 | Qui est Mister Pellets, zone de service, délais types, garanties |
| **Choisir son poêle** | 8-12 | Puissance/surface, types (canalisable vs hydro vs standard), différences techniques |
| **Marques** | 6-10 | Spécificités Edilkamin / EK63 / Dielle / Ferlux, comparatifs |
| **Pellets (combustible)** | 5-8 | Qualité ENplus, consommation annuelle, stockage, prix |
| **Installation** | 6-10 | Conduit, étanchéité, durée pose, prérequis, configurations possibles |
| **Primes & aides** | 5-8 | Régime 2026, montants R1-R4, audit logement, procédure, cumul TVA 6% |
| **Entretien & SAV** | 5-8 | Fréquence, ramonage, entretien annuel, dépannage, coût |
| **Boutique en ligne** | 4-6 | Livraison, paiement, retour, garantie, montage |
| **Showroom & RDV** | 3-5 | Horaires, modèles exposés, RDV, visite |

**Total cible : 47-75 questions**.

### P2.5 Exemples de questions complémentaires à ajouter (combler les angles morts)

**Général** :
- Mister Pellets installe-t-il en dehors de la Wallonie ?
- Quelle est la différence entre Mister Pellets et Awlest ?
- Combien de temps faut-il entre la demande de devis et la pose ?

**Choisir son poêle** :
- Quelle puissance pour 100 m² bien isolés ? Pour 150 m² mal isolés ?
- Quelle différence entre un poêle à pellets et une chaudière à pellets ?
- Mon poêle peut-il fonctionner pendant une coupure de courant ?
- Peut-on installer un poêle à pellets sans cheminée existante ?
- Quelle différence entre un poêle étanche et un poêle non étanche ?

**Pellets** :
- Combien de pellets consomme un poêle de 10 kW par an ?
- Quelle différence entre les pellets ENplus A1 et DINplus ?
- Combien coûte une tonne de pellets en Wallonie en 2026 ?
- Comment stocker les pellets correctement ?

**Installation** :
- Quelle hauteur de plafond minimum est requise ?
- Faut-il une arrivée d'air dédiée ?
- Quelle distance entre le poêle et un mur en bois ?
- Peut-on poser un poêle dans un appartement ?

**Primes** :
- Comment savoir si mon poêle est sur la liste officielle SPW ?
- Combien de temps prend le traitement du dossier en 2026 ?
- Puis-je cumuler la prime poêle pellets avec la prime audit ?

**Entretien & SAV** :
- À quelle fréquence dois-je faire ramoner mon poêle ?
- Mon poêle s'éteint tout seul, que faire ?
- Quel est le coût moyen d'un entretien annuel ?

**Boutique** :
- Livrez-vous au-delà de 50 km de Fernelmont ?
- Puis-je acheter le poêle en ligne et le faire poser par Mister Pellets ?
- Quels moyens de paiement acceptez-vous ?

→ **Toutes les questions/réponses doivent passer par `/humanizer`**, aucun em-dash, ton naturel.

### P2.6 Implémentation technique

**Structure UI mobile** :

```
┌─────────────────────────────────┐
│ FAQ                             │
│ Trouvez vite la réponse à votre │
│ question                        │
├─────────────────────────────────┤
│ [🔍 Rechercher dans la FAQ...]  │  ← search input simple
├─────────────────────────────────┤
│ Toutes · Général · Choisir ·    │  ← onglets/pills horizontaux scrollables
│ Marques · Pellets · Installa... │
├─────────────────────────────────┤
│ ▶ Quelle puissance pour 100m² ? │
│ ▶ Edilkamin ou Ferlux ?         │
│ ▶ Combien de primes en 2026 ?   │
│ ▼ Comment se passe la pose ?    │  ← accordéon ouvert
│   La pose se déroule en une...  │
│ ▶ Délai de livraison ?          │
└─────────────────────────────────┘
                                   ← Espace navbar (96px)
```

**Comportement** :
- Filtres par catégorie : pills horizontales scrollables sur mobile
- Recherche : input texte qui filtre les questions en temps réel (`fuse.js` ou simple `String.includes`)
- Accordéons : un seul ouvert à la fois (UX mobile)
- Lazy rendering : si > 60 questions, virtualiser ou afficher par catégorie avec "Voir plus"

**Schema.org** :
- **`FAQPage`** sur toute la page avec `mainEntity` = array de Question/Answer
- Bénéfice GEO majeur : les LLM citent volontiers les FAQPage structurées

### P2.7 SEO + GEO — règles d'or

- **Première phrase de chaque réponse = la réponse complète** (principe GEO)
- Le reste détaille
- Réponses : 50 à 200 mots par question
- Ajouter des **liens internes contextuels** dans les réponses (vers pages produits, marques, primes, etc.)
- Mention de la marque/zone naturelle ("Chez Mister Pellets, en Wallonie, ...") sur certaines réponses

### P2.8 Tests

- [ ] 100 % des FAQ existantes du site présentes sur cette page centrale
- [ ] 40+ questions au total (cible 60+)
- [ ] Recherche fonctionnelle
- [ ] Filtres par catégorie fonctionnels
- [ ] Schema FAQPage valide (Google Rich Results test)
- [ ] Toutes les réponses passées par `/humanizer`
- [ ] 0 em-dash dans le contenu
- [ ] Bloc Contact conservé en bas de page

---

## P3 + P4. Boutique : refonte de la taxonomie des filtres

### P3.1 Constat

Les filtres actuels de la boutique présentent des incohérences :
- Le filtre **"Type"** mélange des notions qui n'appartiennent pas à la même catégorie ("Air + C" / "ventilation forcée" sont des modes de **diffusion**, pas des **types** de poêle)
- Le filtre **Couleur** est trop granulaire (8+ valeurs) → trop précis pour un usage utile

### P3.2 Refonte du filtre "Type" — VALEURS CORRIGÉES

**Annule et remplace** les valeurs précédentes du V1.

**Nouveau filtre "Type"** (5 valeurs uniquement) :

| Valeur | Définition |
|---|---|
| **Standard** | Poêle classique chauffant la pièce d'installation, sans canalisation ni hydro |
| **Canalisable** | Diffusion vers plusieurs pièces via réseau de gaines |
| **Hydro** | Connecté au circuit de chauffage central (radiateurs ou plancher chauffant) |
| **Hybride** | Fonctionnement bois + pellets (ex : Dielle Ghibli Hybrid Idro) |
| **Insert** | À encastrer dans une cheminée existante |

**Suppression** :
- ❌ "Air + C" (incohérent)
- ❌ "Ventilation forcée" en tant que Type (c'est un mode de diffusion, ailleurs)

→ Champ Payload `productType` : `select` avec ces 5 options.

### P3.3 Filtre "Diffusion de chaleur" — séparé du Type

**Filtre distinct** (à ne pas confondre avec Type) :

| Valeur | Définition |
|---|---|
| **Ventilation forcée** | Avec ventilateur intégré, diffusion rapide et puissante |
| **Convection naturelle** | Sans ventilateur, chaleur douce par rayonnement et convection naturelle (silencieux) |

→ Champ Payload `heatDistribution` : `select` avec ces 2 options.

### P3.4 Refonte du filtre "Couleur / Finition" — REGROUPÉ

**Annule et remplace** les 8+ valeurs précédentes.

**Nouveau filtre "Couleur"** (3 catégories simples et inclusives) :

| Valeur | Comprend |
|---|---|
| **Tons clairs** | Blanc, crème, ivoire, beige clair, gris clair |
| **Tons foncés** | Noir, gris anthracite, bordeaux, brun foncé |
| **Tons naturels** | Acier brossé, fonte naturelle, terracotta, couleurs bois/pierre |

**Règle** : chaque produit du catalogue est rangé dans **une seule** des 3 catégories.

**Bénéfices** :
- Plus simple côté UX (3 vs 8 cases à cocher)
- Plus inclusif (un poêle "rouge bordeaux foncé" = Tons foncés, "blanc cassé crème" = Tons clairs)
- Aide le client à filtrer rapidement par ambiance

→ Champ Payload `colorCategory` : `select` avec 3 options (`light` / `dark` / `natural`).

### P3.5 Récapitulatif final des filtres boutique (consolidé V1.3)

| Filtre | Valeurs |
|---|---|
| **Marque** | Edilkamin · EK63 · Dielle · Ferlux |
| **Type** | Standard · Canalisable · Hydro · Hybride · Insert |
| **Diffusion** | Ventilation forcée · Convection naturelle |
| **Puissance** | 6-9 kW · 9-12 kW · 12-18 kW · 18 kW+ |
| **Couleur** | Tons clairs · Tons foncés · Tons naturels |
| **Surface chauffée** | jusqu'à 80 m² · 80-120 m² · 120-180 m² · 180 m²+ |
| **Étanche** | Oui / Non |
| **Connecté (Wi-Fi)** | Oui / Non |
| **Prix** | Slider |
| **Tri** | Best-sellers · Prix ↑ · Prix ↓ · Nouveautés |

### P3.6 Migration des produits existants

Pour les 61 produits déjà encodés dans Payload :
- **Script de migration** automatique pour reclasser chaque produit selon les nouvelles taxonomies
- Vérification manuelle ensuite produit par produit (5-10 minutes max sur l'ensemble)

### P3.7 Tests

- [ ] Les 5 nouvelles valeurs de Type fonctionnent
- [ ] Les 2 valeurs de Diffusion sont distinctes du Type
- [ ] Les 3 catégories de couleur regroupent correctement les produits
- [ ] Aucune valeur "Air + C" ou "ventilation forcée" ne reste dans le filtre Type
- [ ] Tous les produits ont une valeur dans chaque filtre obligatoire
- [ ] Filtres combinables (ex : "Edilkamin + Hydro + Tons foncés") retournent les bons résultats

---

## P5. Pages guides : audit débordements + correction Primes

### P5.1 Constat

Sur la page **Primes** (qui fait partie des guides), un **bouton dépasse de sa zone d'image** sur mobile. C'est probablement le symptôme d'un problème plus large sur l'ensemble des pages guides.

### P5.2 Action — audit systématique

**Étape 1 — Pages à auditer** :
- `/primes-energie-wallonie-2026/`
- `/guides/guide-achat-poele-pellets-wallonie/`
- `/guides/poele-pellets-canalisable/`
- `/guides/poele-pellets-hydro/`
- `/guides/comment-entretenir-poele-pellets/`
- `/guides/quelle-puissance-poele-pellets/`
- Toute autre page de la collection guide

**Étape 2 — Tester chaque page sur 3 résolutions mobiles** :
- iPhone SE (375 px) — résolution la plus contraignante
- iPhone 14 (390 px)
- Pixel 7 (412 px)

**Étape 3 — Vérifications par page** :

1. ✅ Pas de scroll horizontal sur la page entière
2. ✅ Aucun bouton, image, vidéo, embed ne dépasse de son conteneur
3. ✅ Padding latéral cohérent (16 px sur mobile)
4. ✅ Largeurs : tous les éléments en `width: 100%` ou `max-width: 100%`
5. ✅ Boutons CTA centrés, jamais collés à un bord
6. ✅ Boutons en overlay sur images : positionnement en `%` ou `rem`, pas en `px` fixes
7. ✅ Tableaux : cards mobile / tableau desktop (cf. H5 du V1.2)
8. ✅ Cards et grids : `min-width: 0` sur les enfants

### P5.3 Snippet de diagnostic (rappel V1.1)

Snippet console à exécuter sur chaque page :

```javascript
[...document.querySelectorAll('*')].forEach(el => {
  if (el.offsetWidth > document.documentElement.offsetWidth) {
    console.log('OVERFLOW:', el, 'width:', el.offsetWidth, 'vs viewport:', document.documentElement.offsetWidth);
  }
});
```

### P5.4 Cas spécifique : bouton page Primes

**Causes les plus probables** :
- Bouton positionné en `absolute` sur une image avec coordonnées trop larges (`right: -10px`, `width: calc(100% + 20px)`)
- Bouton avec `width` en pixels qui dépasse l'image sur mobile
- Image avec overlay flex/grid mal géré

**Solution attendue** :
- Bouton **contenu dans la zone de l'image** sur toutes les résolutions
- Si overlay : utiliser `inset` ou positionnement relatif (`%` ou `rem`)
- Si bouton sous l'image : utiliser `width: 100%` du parent qui a déjà le bon padding

### P5.5 Règle CSS de protection préventive

Ajouter dans `globals.css`, en complément des règles V1.1 :

```css
/* Protection contre les dépassements de boutons et images */
button, a[role="button"], .btn {
  max-width: 100%;
  word-wrap: break-word;
}

img, video, picture {
  max-width: 100%;
  height: auto;
}

section, article {
  max-width: 100vw;
  overflow-x: clip;
}

/* Boutons en overlay sur image : éviter les coordonnées négatives */
.image-overlay-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 32px);
}
```

### P5.6 Livrable de l'audit

Mini-rapport markdown listant **page par page** :
- ✅ Pages OK (aucun problème)
- ⚠️ Pages avec problème détecté + nature du problème + correction appliquée

À inclure dans `docs/audits/audit-guides-mobile-vYYYYMMDD.md`.

### P5.7 Tests finaux

- [ ] Toutes les pages guides : aucun débordement sur iPhone SE / 14 / Pixel 7
- [ ] Page Primes : bouton bien contenu dans la zone d'image
- [ ] Snippet console retourne 0 élément débordant sur chaque page guide
- [ ] Padding cohérent (16 px latéral) partout

---

## P6. Page À propos : corrections factuelles + nettoyage textes

### P6.1 Année de création — confirmée

✅ **2016** (déjà rectifié dans V1, à laisser tel quel).

### P6.2 Volume d'installations — précision à ajouter

**Indiquer clairement** : **plus de 800 poêles à pellets vendus et installés** depuis 2016.

**Formulation à utiliser** (rester factuel et non équivoque) :
> "Depuis 2016, plus de 800 poêles à pellets vendus et installés en Wallonie."

→ Garder **"vendus et installés"** ensemble, ne pas séparer les deux notions (cohérent avec l'activité réelle).

→ Mettre à jour ce chiffre **partout où il apparaît** :
- Page À propos
- Bandeau de réassurance / stats page d'accueil (remplacer l'ancien "+400 installés" par **"+800 poêles vendus et installés depuis 2016"**)
- Pages locales si la statistique y figure
- Schema.org `LocalBusiness` (champ description, pas dans aggregateRating)

### P6.3 Audit complet des textes — phrases creuses à éliminer

**Constat** : présence de phrases vides de sens ou typiques de génération IA. Exemple cité : **"ce qui nous fait rentrer le matin"** — formulation maladroite, sans signification claire.

**Action** :

1. **Relecture intégrale** de la page À propos
2. **Identifier toutes les phrases creuses** ou typiques IA
3. **Réécrire** en formulations naturelles et concrètes, ou **supprimer** si elles n'apportent rien
4. Cible : **0 phrase générique**, **0 tournure IA**, **0 em-dash**, **100 % humain**, **100 % cohérent**

**Test obligatoire** : lecture à voix haute. Si ça sonne faux ou creux, on reformule.

**Workflow** : passer **l'intégralité de la page À propos** par `/humanizer` après corrections factuelles.

### P6.4 Avis clients — minimisation et clarification

**Constat critique** : le site mentionne actuellement **les avis Google** comme étant ceux de Mister Pellets. C'est **inexact** :
- La note Google **4.9★ / 200 avis** existe, mais elle concerne **Awlest** (la maison mère)
- Mister Pellets en tant que marque commerciale est **récent** : pas encore d'avis dédiés à cette marque
- **Ne pas mentir** au visiteur : transparence obligatoire

### P6.5 Action — refonte du traitement des avis sur tout le site

**À RETIRER** :

❌ Mentions "**4.9★ / 200 avis Google**" comme étant des avis Mister Pellets, sur :
- Page d'accueil (bandeau de réassurance, hero stats)
- Pages locales
- Pages produits (sauf avis individuels produits si existants)
- Footer / mentions globales
- Schema.org `LocalBusiness` → **retirer `aggregateRating`** tant qu'on ne peut pas justifier la note pour la marque Mister Pellets

❌ Carrousel "**Avis Google**" présenté comme vérifié alors qu'il ne l'est pas

❌ Toute mention "**avis Google vérifiés**" / "**Google Reviews**"

**À REMPLACER PAR** :

✅ Formulations générales et honnêtes :
- "Plus de 800 installations réussies en Wallonie depuis 2016."
- "La satisfaction de nos clients est notre meilleure publicité."
- "Une expérience de presque 10 ans dans le poêle à pellets."

→ Mettre l'accent sur **l'expérience** et le **volume d'installations**, pas sur des avis chiffrés non vérifiables au nom de Mister Pellets.

### P6.6 Sur la page À propos UNIQUEMENT — mention nuancée autorisée

Puisque la mention Awlest est autorisée sur cette page (cf. V1 point 19), on peut formuler quelque chose comme :

> "L'activité d'Awlest, la société qui porte Mister Pellets, est notée 4.9/5 sur Google par les clients depuis 2016."

→ Cette nuance permet d'utiliser le crédit des avis existants **sans tromper** sur la marque évaluée.

→ **Passage obligatoire par `/humanizer`** pour reformulation naturelle.

### P6.7 Schema.org `LocalBusiness` — mise à jour

**Avant (problématique)** :
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "200"
}
```

**Après — option recommandée** : retirer le champ `aggregateRating` jusqu'à ce qu'on ait des avis vérifiables sur Mister Pellets en tant que tel.

**Après — option avancée** : préciser dans le schema le rattachement à Awlest via `parentOrganization`. Plus complexe, à réserver pour une phase ultérieure (validation juridique recommandée).

→ **Pour le lancement** : option recommandée (retirer).

### P6.8 Récapitulatif des modifications

| Élément actuel | Action |
|---|---|
| "+400 installés" (ancien chiffre) | → "+800 poêles vendus et installés depuis 2016" |
| "4.9★ / 200 avis Google" pages publiques | → Retirer, formule générale à la place |
| `aggregateRating` Schema LocalBusiness | → Retirer pour le lancement |
| Phrases creuses ("ce qui nous fait rentrer le matin") | → Supprimer ou réécrire |
| Mention "avis Google vérifiés" | → Retirer |
| Texte intégral page À propos | → Relecture complète + `/humanizer` |
| Témoignages Google présentés comme Mister Pellets | → Retirer |

### P6.9 Pour les futurs vrais témoignages Mister Pellets

- Collection Payload `Testimonials` reste en place
- Au fur et à mesure des vrais avis collectés, les ajouter avec mention claire de la source
- Format : "Témoignage client recueilli après installation à {Ville}, {Mois Année}"
- Encourager les clients à laisser un avis Google sur la fiche **Awlest** (mention dans email post-installation)

---

## P7. Page d'accueil : logo central — taille doublée + espacement réduit

### P7.1 Constat

Le logo Mister Pellets situé au centre de la page d'accueil est **trop petit** et entouré de **trop d'espace blanc**.

### P7.2 Action

**Doubler la taille du logo** central :
- Si actuellement ~80 px de hauteur → passer à **~160 px de hauteur**
- Si actuellement plus petit → adapter le facteur ×2
- À ajuster visuellement pour que le logo ait une présence forte sans écraser le reste

**Réduire l'espacement vertical** autour du logo :
- **Maximum 35 px au-dessus** du logo (margin-top ou padding-top du conteneur)
- **Maximum 35 px en-dessous** du logo (margin-bottom ou padding-bottom du conteneur)
- Enchaîner directement avec le texte/contenu suivant

**Effet recherché** : le logo devient un **marqueur de bienvenue fort**, l'utilisateur identifie immédiatement la marque et entre dans le contenu sans temps mort visuel.

### P7.3 Implémentation

```tsx
{/* Bloc logo central de l'accueil — sur la page d'accueil uniquement */}
<div className="flex flex-col items-center" style={{ paddingTop: '35px', paddingBottom: '35px' }}>
  <Image 
    src="/logo-mister-pellets-full.svg"  // ou le bon fichier "couleur" si différent
    alt="Mister Pellets"
    width={320}    // ajuster selon ratio réel du logo pour atteindre ~160px de haut
    height={160}
    priority
    className="w-auto h-[160px]"
  />
</div>
```

**Notes** :
- `priority` car c'est dans le viewport initial (LCP)
- `width` et `height` à adapter selon le ratio exact du SVG (calcul : si le SVG fait 320×100 nativement, garder ce ratio en hauteur cible 160 → width 512)
- Le bloc parent a un padding fixe de 35 px haut/bas, pas plus
- Pas de margin externe en plus

### P7.4 Si le logo paraît encore disproportionné après doublement

- Tester d'abord à 160 px de hauteur en preview
- Si trop gros visuellement : redescendre à 140 px
- Si pas assez : monter à 180 px
- **Le client tranchera visuellement** — Claude Code doit fournir 2-3 captures d'écran avec différentes tailles si doute

### P7.5 Tests

- [ ] Logo bien visible et imposant en haut de page
- [ ] Espacement vertical maximal de 35 px autour
- [ ] Texte/contenu suivant immédiatement enchaîné
- [ ] Aucun débordement horizontal
- [ ] LCP < 1.5s sur 4G mobile (priorité respectée)
- [ ] Image optimisée (WebP/AVIF via next/image)

---

## 1. Workflow imposé pour ce hotfix V1.3

### 1.1 Ordre d'exécution OBLIGATOIRE

1. **Commit 1** — `fix: improve footer contrast and minimize content` (P1)
2. **Commit 2** — `feat: enrich FAQ page with all site FAQs + SEO/GEO optimization` (P2)
3. **Commit 3** — `fix: refactor shop filter taxonomy (Type / Diffusion / Color grouping)` (P3+P4)
4. **Commit 4** — `fix: audit guide pages for mobile overflow + fix Primes button` (P5)
5. **Commit 5** — `fix: rectify About page content (800 installations, no Google reviews, humanize)` (P6)
6. **Commit 6** — `fix: double homepage central logo size with tight 35px vertical spacing` (P7)

**Validation visuelle entre chaque commit** : capture avant/après + URL preview Vercel + tests sur iPhone SE / 14 / Pixel 7.

### 1.2 Skills à utiliser

| Skill | Application |
|---|---|
| **`/humanizer`** | Sur **chaque texte** modifié : nouvelles FAQ (P2), texte page À propos (P6), formulations sur les avis (P6), nouveaux libellés filtres si textuels (P3) |
| **`/impeccable`** | Sur **chaque modification de présentation** : footer (P1), filtres boutique (P3), correction layout pages guides (P5), logo accueil (P7) |
| **`grep '—'`** | Avant **chaque commit** — zéro em-dash toléré dans les diffs touchant du contenu rédactionnel |

### 1.3 Validations client à demander

Avant fusion finale, Claude Code doit demander au client :

1. **URLs réelles** des profils TikTok / Instagram / YouTube (pour P1)
2. **Validation de la nouvelle page FAQ enrichie** (P2) — le client peut souhaiter ajuster certaines réponses
3. **Validation des textes refondus** de la page À propos (P6) — sensible
4. **Validation visuelle** de la taille finale du logo accueil (P7) — fournir 2-3 captures avec différentes tailles si hésitation

### 1.4 Mise à jour HANDOVER.md

Après ce hotfix :
> **[YYYY-MM-DD]** Hotfix V1.3 appliqué : footer contrasté et minimal, FAQ enrichie, taxonomie boutique refondue, audit pages guides, page À propos rectifiée (800 installations, retrait avis Google), logo accueil agrandi. Validation client effectuée.

---

## 2. Récapitulatif des règles consolidées (V1 → V1.3)

### 2.1 Footer (état final V1.3)

- Contenu strict : **logo couleur + 3 sociaux + 4 liens légaux + copyright légal**
- Pas de coordonnées (téléphone/email/adresse retirés)
- Pas de navigation (doublon avec navbar)
- Contraste WCAG AA renforcé : beige `#FAF7F0` pleine opacité sur vert deep `#174724`
- Hauteur cible : 280-350 px hors padding navbar
- Logo Mister Pellets en couleur, hauteur 60-70 px

### 2.2 Filtres boutique (état final V1.3)

| Filtre | Valeurs |
|---|---|
| Marque | Edilkamin · EK63 · Dielle · Ferlux |
| Type | Standard · Canalisable · Hydro · Hybride · Insert |
| Diffusion | Ventilation forcée · Convection naturelle |
| Puissance | 6-9 kW · 9-12 kW · 12-18 kW · 18 kW+ |
| Couleur | Tons clairs · Tons foncés · Tons naturels |
| Surface | <80 · 80-120 · 120-180 · >180 m² |
| Étanche | Oui/Non |
| Connecté | Oui/Non |
| Prix | Slider |

### 2.3 Page À propos (faits validés V1.3)

- Année de création : **2016**
- Volume : **800+ poêles vendus et installés**
- Certifications : **PAS de RGIE** (à supprimer définitivement)
- Avis Google : **NE PAS mentionner** comme avis Mister Pellets (sauf nuance Awlest sur À propos)
- `aggregateRating` Schema : **retiré** pour le lancement

### 2.4 Page d'accueil (état final V1.3)

- Logo central : **~160 px de hauteur** (×2 vs version précédente)
- Espacement vertical autour : **35 px max** haut et bas
- Stats : **+800 poêles** (au lieu de +400), **plus de mention "avis Google" chiffrée**
- Tableau comparatif : cards mobile / tableau desktop (V1.2)
- Pas de header mobile, navbar flottante unique

### 2.5 Page FAQ (état final V1.3)

- 40-75 questions au total
- Catégorisation : Général · Choisir · Marques · Pellets · Installation · Primes · Entretien · Boutique · Showroom
- Filtres + recherche
- Schema FAQPage complet
- Bloc Contact conservé en bas

---

## 3. Audit complet du site — à programmer ensuite

Le client a confirmé qu'**après ces corrections, un audit complet du site sera réalisé** (ce sera la prochaine étape).

L'audit suivra les **12 axes** définis dans le V1 (section 11.2) :
1. Cohérence visuelle
2. SEO technique
3. GEO
4. Performance
5. Accessibilité
6. Cohérence éditoriale
7. CMS Payload
8. E-commerce
9. Formulaires
10. Liens et redirections
11. Mobile-first
12. RGPD & légal

→ Cet audit sera lancé sur instruction du client, **après** validation des 6 commits du V1.3.

---

## 4. Annexes

### 4.1 Documents de référence du projet

- `HANDOVER.md` (à la racine du repo)
- `docs/mister-pellets-brief-fullcode.md` — brief technique complet (V1.0)
- `docs/mister-pellets-corrections-mobile-v1.md` — corrections V1 (23 points)
- `docs/mister-pellets-corrections-mobile-v1.1-hotfix.md` — hotfix navbar/layout/footer/logo
- `docs/mister-pellets-corrections-mobile-v1.2-hotfix.md` — hotfix tableau/footer minimaliste/marques
- `docs/mister-pellets-corrections-mobile-v1.3-hotfix.md` — **ce document** (footer contrast / FAQ / filtres / guides / À propos / logo accueil)
- `docs/mister-pellets-corrections-desktop-v2.md` — à venir (corrections desktop)

### 4.2 Coordonnées projet (rappel)

- **Nom commercial** : Mister Pellets
- **Société** : Awlest SRL
- **TVA** : BE 0656.514.212
- **Adresse** : Rue des Fagotis 3A, 5380 Fernelmont
- **Téléphone** : 0472 04 32 22
- **Email** : info@awlest.com
- **Année de création** : 2016
- **Volume installations** : 800+ depuis 2016
- **Avis Google Awlest** : 4.9/5 (NE PAS attribuer à Mister Pellets directement)

### 4.3 Palette officielle

```
Verts    : #102916 (darkest) · #174724 (deep, principal) · #377038 (mid) · #508943 (light)
Oranges  : #F28A20 (flame, principal) · #FDB842 (warm) · #FFE4D1 (light)
Beiges   : #FAF7F0 (cream, fond dominant) · #F4F1E8 (beige) · #EAE0CB (warm) · #C8B68F (sand)
Neutres  : #14241B (ink) · #4A5A50 (ink-soft) · #2A1F15 (bark, accent rare)
```

---

**Fin du document V1.3 (hotfix mobile).**

*À traiter en 6 commits isolés dans l'ordre indiqué, avec validation visuelle entre chaque.*

*Audit complet du site programmé après validation client de ce hotfix.*

*Version 1.3 — Mai 2026.*
